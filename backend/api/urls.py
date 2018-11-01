from django.urls import path, include


urlpatterns = [
    path(r'v1/', include('api.v1.urls')),
]