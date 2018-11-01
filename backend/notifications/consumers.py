import json

from channels.generic.websocket import JsonWebsocketConsumer
from asgiref.sync import async_to_sync

ws_msg_type = {
    1: 'message_created',
    2: 'message_updated',
    3: 'message_deleted',
    4: 'chat_created',
    5: 'chat_updated',
    6: 'chat_deleted',
    7: 'column_created',
    8: 'column_copied',
    9: 'column_updated',
    10: 'column_deleted',
    11: 'cell_created',
    12: 'cell_updated',
    13: 'cell_deleted',
    14: 'cell_field_created',
    15: 'cell_field_updated',
    16: 'cell_field_deleted',
}


class DoctorNotificationConsumer(JsonWebsocketConsumer):

    def connect(self):
        """
        Called when the websocket is handshaking as part of initial connection.
        """
        if self.scope["user"].is_anonymous:
            # Reject the connection
            self.close()
        else:
            # Add current connection to the unique group to send messages to all user devices
            self.user_group_name = 'user_group_{}'.format(self.scope["user"].id)
            self.hospital_group_name = 'hospital_group_{}'.format(self.scope["user"].hospital.id)
            async_to_sync(self.channel_layer.group_add)(self.user_group_name, self.channel_name)
            async_to_sync(self.channel_layer.group_add)(self.hospital_group_name, self.channel_name)
            # Accept the connection
            self.accept(self.scope.get('subprotocol'))

    def disconnect(self, close_code):
        # Leave user group
        if hasattr(self, 'user_group_name'):
            async_to_sync(self.channel_layer.group_discard)(
                self.user_group_name,
                self.channel_name
            )
        if hasattr(self, 'hospital_group_name'):
            async_to_sync(self.channel_layer.group_discard)(
                self.hospital_group_name,
                self.channel_name
            )

    def notify_message(self, event):

        # Send message by WebSocket
        self.send(text_data=json.dumps({
            'message': event['message']
        }))

    def notify_update(self, event):

        # Send data update by WebSocket
        self.send(text_data=json.dumps({
            'update': event['update'],
            'action': event['action'],
            'doctor_remote_id': event.get('doctor_remote_id', '')
        }))
