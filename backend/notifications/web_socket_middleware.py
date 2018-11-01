from channels.auth import AuthMiddlewareStack
from django.db import close_old_connections
from django.utils import timezone
from django.contrib.auth.models import AnonymousUser
from accounts.models import Doctor


class CustomAuthMiddleware:

    def __init__(self, inner):
        # Store the ASGI application we were passed
        self.inner = inner

    def __call__(self, scope):
        token = None
        try:
            # we use subprotocols value to transfer Token
            token = scope.get('subprotocols')[0]
            user = Doctor.objects.get(auth_token__key=token, auth_token__expires__gte=timezone.now())
        except:
            user = AnonymousUser()
        close_old_connections()
        # Return the inner application directly and let it run everything else
        return self.inner(dict(scope, user=user, subprotocol=token))


CustomAuthMiddlewareStack = lambda inner: AuthMiddlewareStack(CustomAuthMiddleware(inner))
