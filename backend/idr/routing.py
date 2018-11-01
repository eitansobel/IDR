from django.urls import path

from channels.routing import ProtocolTypeRouter, URLRouter

from notifications.consumers import DoctorNotificationConsumer
from notifications.web_socket_middleware import CustomAuthMiddlewareStack

application = ProtocolTypeRouter({
    "websocket": CustomAuthMiddlewareStack(
        URLRouter([
            path(r'notification/', DoctorNotificationConsumer),
        ]),
    ),
})
