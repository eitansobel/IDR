import datetime
import requests

from django.utils import timezone
from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.views import APIView

from api.v1.authenticate_serializer import RemoteAuthTokenSerializer
from api.models import Token
from accounts.models import Doctor, SignOutLog
from api.v1.accounts_serializer import SignOutDatetimeSerializer


class DoctorObtainAuthToken(ObtainAuthToken):
    serializer_class = RemoteAuthTokenSerializer
    allowed_methods = ('POST',)

    def post(self, request, *args, **kwargs):
        sign_serializer = SignOutDatetimeSerializer(data=request.data)
        serializer = self.serializer_class(data=request.data)
        if sign_serializer.is_valid(raise_exception=True):
            if serializer.is_valid(raise_exception=True):
                doctor = get_object_or_404(Doctor, remote_id=serializer.validated_data['remote_id'],
                                           username=serializer.data.get('username').lower())
                Token.objects.create(user=doctor,
                                     key=serializer.validated_data['token_key'],
                                     expires=timezone.now() + datetime.timedelta(seconds=settings.API_TOKEN_EXPIRE))

                sign, _ = SignOutLog.objects.get_or_create(doctor=doctor, **sign_serializer.data)
                return Response(serializer.context.get('auth_data'))
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(sign_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogOutAPIView(APIView):
    allowed_methods = ('POST',)

    def post(self, request, *args, **kwargs):
        logout_all = request.data.get('delete_all_tokens')
        token = request.META.get('HTTP_AUTHORIZATION')
        response = requests.post(settings.IDR_AUTH_LOGOUT_URL,
                                 data={'delete_all_tokens': logout_all},
                                 headers={'Authorization': token})

        if logout_all and response.status_code == 200:
            queryset = Token.objects.filter(user=self.request.user)
            queryset.delete()
            return Response({'tokens_deleted': response.json().get('tokens_deleted')})

        elif response.status_code in [200, 204]:
            token = Token.objects.get(key=token.split()[1])
            token.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response({'IDR auth': response.content}, status.HTTP_400_BAD_REQUEST)
