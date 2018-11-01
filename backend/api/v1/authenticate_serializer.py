import requests

from django.conf import settings
from django.utils.translation import ugettext_lazy as _
from rest_framework import serializers


class RemoteAuthTokenSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=30)
    password = serializers.CharField(max_length=128)

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username and password:
            response = requests.post(settings.IDR_AUTH_URL, data={'username': username, 'password': password})
            if response.status_code != 200:
                msg = _('Unable to authenticate with provided credentials.')
                raise serializers.ValidationError(msg, code='authorization')
            data = response.json()
            token_key = data.get('token')
            remote_id = data.get('user').get('id') if data.get('user') else None
            if not (token_key and remote_id):
                msg = _('Got incorrect response data from IDR AUTH server on authenticate')
                raise serializers.ValidationError(msg, code='authorization')
        else:
            msg = _('Must include "username" and "password".')
            raise serializers.ValidationError(msg, code='authorization')

        self.context['auth_data'] = data
        attrs['token_key'] = token_key
        attrs['remote_id'] = remote_id
        return attrs
