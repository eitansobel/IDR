from django.db import models
from django.contrib.auth.models import User
from django.utils.translation import ugettext_lazy as _
from django.db.models import Min
from accounts.models import Doctor, Patient
from rest_framework import serializers


class LastMessageTimeSerializer(serializers.Serializer):
    last_message_time = serializers.DateTimeField(format='iso-8601')


class Chat(models.Model):
    participants = models.ManyToManyField(Doctor, related_name='chat_participants')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, null=True)
    title = models.CharField(max_length=100, null=True, blank=True)
    creator = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='chat_creator')
    patient_name = models.CharField(max_length=100, null=True, blank=True)

    def get_unread_messages(self, doctor):
        messages_instances = self.message_set.filter(is_read=False).exclude(sender=doctor)
        last_message = self.message_set.first()
        if last_message:
            if last_message.attachment:
                last_message_text = last_message.attachment.name.split('/')[-1]
                last_message_time = last_message.created_at
                serializer = LastMessageTimeSerializer(data={'last_message_time': last_message_time})
                last_message_time = serializer.validated_data[
                    'last_message_time'] if serializer.is_valid() else None
            elif last_message.text:
                last_message_text = last_message.text[:67] + '...' if last_message.text[
                                                                      :67] != last_message.text else last_message.text
                last_message_time = last_message.created_at
                serializer = LastMessageTimeSerializer(data={'last_message_time': last_message_time})
                last_message_time = serializer.validated_data[
                    'last_message_time'] if serializer.is_valid() else None
            else:
                last_message_time = None
                last_message_text = 'No messages in this chat'
        else:
            last_message_time = None
            last_message_text = 'No messages in this chat'
        data = {'count_of_unread_messages': len(messages_instances),
                'last_message': last_message_text,
                'top_urgency': messages_instances.aggregate(Min('urgency')).get(
                    'urgency__min') if messages_instances.aggregate(Min('urgency')).get('urgency__min') else 5,
                'last_message_time': str(last_message_time.isoformat()) if last_message_time else None,
                'id': self.id
                }
        return data

    @property
    def recipient_id_list(self):
        return self.participants.all().values_list('id', flat=True)


class Message(models.Model):
    URGENCY_CHOICES = (
        (1, _('Immediate')),
        (2, _('30 minutes')),
        (3, _('1hr')),
        (4, _('2hr')),
        (5, _('FYI - No Alert'))
    )
    text = models.CharField(max_length=1000, blank=True, null=True)
    attachment = models.FileField(upload_to="uploads/notification_attachments/%Y-%m-%d/",
                                  max_length=200, blank=True, null=True)
    sender = models.ForeignKey(Doctor, related_name='sender', on_delete=models.CASCADE)
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    urgency = models.PositiveIntegerField(choices=URGENCY_CHOICES, default=5)
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_edit = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def set_is_read(self):
        self.is_read = True
        self.save()


class MessageIsDelete(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)


class ChatIsDelete(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)


class NotificationTemplate(models.Model):
    NEW_USER_ACCOUNT_IS_READY = 1
    NEW_MESSAGE = 2
    NEW_USER_ADMIN_INFORM = 3
    APPROVE_REGISTRATION = 4
    DECLINE_REGISTRATION = 5
    PASSWORD_CHANGED = 6
    EVENT_CHOICES = (
        (NEW_USER_ACCOUNT_IS_READY, _('New User Account Is Ready')),
        (NEW_MESSAGE, _('New Message In IDR')),
        (NEW_USER_ADMIN_INFORM, _('New User Was Registered')),
        (APPROVE_REGISTRATION, _('Account Was Activated')),
        (DECLINE_REGISTRATION, _('Account Was Declined')),
        (PASSWORD_CHANGED, _('Your Password Was Changed')),
    )

    event = models.PositiveSmallIntegerField(choices=EVENT_CHOICES, unique=True)
    subject_message = models.CharField(max_length=255)
    html_message = models.TextField()

    def __str__(self):
        return self.get_event_display()
