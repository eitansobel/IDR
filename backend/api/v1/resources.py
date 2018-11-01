from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .forms import MyPasswordResetForm

from django.contrib.auth.forms import SetPasswordForm
from django.contrib.auth.tokens import default_token_generator

from django.conf import settings
from django.utils.http import urlsafe_base64_decode

from django.contrib.auth.models import User
import requests
from django.utils.translation import ugettext_lazy as _
import json
from notifications.models import NotificationTemplate
from notifications.tasks import send_emails_by_notification_template


class ForgotPasswordAPIView(APIView):
    permission_classes = AllowAny,

    def post(self, request, *args, **kwargs):
        form = MyPasswordResetForm(request.data)
        domain_override = request.data.get('domain_override')

        if domain_override and domain_override not in settings.CORS_ORIGIN_WHITELIST:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if form.is_valid():
            opts = {
                'use_https': request.is_secure(),
                'token_generator': default_token_generator,
                'email_template_name': 'registration/password_reset_email.html',
                'subject_template_name': 'registration/password_reset_subject.txt',
                'request': request,
                'domain_override': domain_override or settings.BASE_URL,
                'from_email': settings.FROM_EMAIL,
            }
            form.save(**opts)
            return Response(status=status.HTTP_200_OK)
        else:
            return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordAPIView(APIView):
    permission_classes = AllowAny,

    def post(self, request, *args, **kwargs):
        """
        Form fields:
            uidb64
            token
            new_password1
            new_password2
        """
        uid = request.data.get('uidb64')
        token = request.data.get('token')

        if not uid or not token:
            return Response({
                'non_field_error': 'This password reset link is invalid or expired, please reset your password again.'},
                status=status.HTTP_400_BAD_REQUEST)

        try:
            uid = urlsafe_base64_decode(uid)
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if hasattr(user, 'doctor'):
            user = user.doctor

        if user and default_token_generator.check_token(user, token):
            form = SetPasswordForm(user, request.data)
            if form.is_valid():
                admin_credentials = {
                    "username": user.hospital.clinic_remote_admin_username,
                    "password": user.hospital.clinic_remote_admin_password
                }
                response = requests.post(settings.IDR_AUTH_URL, data=admin_credentials)
                if response.status_code != 200:
                    msg = _('Unable to authenticate with create doctor credentials on IDR AUTH server.')
                    return Response({'authorization': msg}, status=status.HTTP_400_BAD_REQUEST)
                data = response.json()
                token = data.get('token')
                response = requests.post("%s%d/set_password/" % (settings.IDR_AUTH_DOCTOR_URL, user.remote_id),
                                         data={"exclude_old_password": True,
                                               "password": request.data.get('new_password2')},
                                         headers={'Authorization': 'Token ' + token}
                                         )
                if response.status_code != 200:
                    return Response(json.loads(response.content.decode()), status=status.HTTP_400_BAD_REQUEST)
                form.save()
                email_context = {
                    'user': user.doctor.username,
                    'domain_name': settings.IDR_DOMAIN_NAME,
                    'domain': settings.IDR_SITE_URL,
                }
                send_emails_by_notification_template.delay(
                    NotificationTemplate.PASSWORD_CHANGED,
                    user.doctor.email,
                    email_context
                )
                return Response(status=status.HTTP_200_OK)
            else:
                return Response(form.errors, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({
                'non_field_error': 'This password reset link is invalid or expired, please reset your password again.'},
                status=status.HTTP_400_BAD_REQUEST)
