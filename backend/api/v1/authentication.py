import datetime

from django.conf import settings
from django.utils import timezone
from rest_framework import HTTP_HEADER_ENCODING
from rest_framework.authentication import BaseAuthentication
from rest_framework import exceptions

from api.models import Token

API_TOKEN_EXPIRE = getattr(settings, 'API_TOKEN_EXPIRE', 30 * 60)


def get_authorization_header(request):
    """
    Return request's 'Authorization:' header, as a bytestring.

    Hide some test client ickyness where the header can be unicode.
    """
    key = 'HTTP_AUTHORIZATION'

    # check HTTP header as default
    auth = request.META.get(key, None)

    if not auth:
        # check POST querydict
        token = request.POST.get(key, None)

        if not token:
            # check GET querydict
            token = request.GET.get(key, None)

        if token:
            auth = "Token %s" % token
        else:
            auth = b''

    if isinstance(auth, str):
        # Work around django test client oddness
        auth = auth.encode(HTTP_HEADER_ENCODING)
    return auth


class ExpiringTokenAuthentication(BaseAuthentication):
    """
    Simple token based authentication.

    Clients should authenticate by passing the token key in the "Authorization"
    HTTP header, prepended with the string "Token ".  For example:

        Authorization: Token 401f7ac837da42b97f613d789819ff93537bee6a
    """

    model = Token
    """
    A custom token model may be used, but must have the following properties.

    * key -- The string identifying the token
    * user -- The user to which the token belongs
    """

    def authenticate(self, request):
        auth = get_authorization_header(request).split()

        if not auth or auth[0].lower() != b'token':
            return None

        if len(auth) == 1:
            msg = 'Invalid token header. No credentials provided.'
            raise exceptions.AuthenticationFailed(msg)
        elif len(auth) > 2:
            msg = 'Invalid token header. Token string should not contain spaces.'
            raise exceptions.AuthenticationFailed(msg)

        return self.authenticate_credentials(auth[1], request)

    def authenticate_credentials(self, key, request=None):
        now = timezone.now()

        try:
            token = self.model.objects.get(key=str(key, 'utf-8'), expires__gte=now)
            if token.user and token.user.is_active is False:
                raise self.model.DoesNotExist()

        except self.model.DoesNotExist:
            raise exceptions.AuthenticationFailed('Invalid token')

        token.expires = now + datetime.timedelta(seconds=settings.API_TOKEN_EXPIRE)
        token.save(update_fields=['expires'])

        return token.user, token

    def authenticate_header(self, request):
        return 'Token'
