from __future__ import absolute_import, unicode_literals
from .utils import send_sms, voice_call
from celery import shared_task
from accounts.models import Doctor
from django.conf import settings
from django.core.mail import send_mail
from notifications.models import NotificationTemplate, Message
from notifications.utils import get_email_message


@shared_task
def alert(doctor, message_id):
    try:
        alert_text = "You have an unread message_id. Please log into the IDR Application to view additional information."
        current_alert = Doctor.objects.get(pk=doctor).alert_settings.alert1
        send_alert(current_alert=current_alert, doctor=doctor, message_id=message_id, alert_text=alert_text, step=1)
    except Exception as e:
        print(e)


@shared_task
def check_is_read(doctor, alert_text, message_id, step):
    if step == 4:
        return
    try:
        doc = Doctor.objects.get(pk=doctor)
        message = Message.objects.get(id=message_id)
        if not message.is_read:
            next_step = str(int(step) + 1)
            current_alert = getattr(doc.alert_settings, 'alert' + next_step)
            send_alert(current_alert=current_alert, doctor=doctor, message_id=message_id, alert_text=alert_text,
                       step=next_step)
    except Exception as e:
        print(e)


def send_alert(current_alert, doctor, message_id, alert_text, step):
    try:
        if current_alert.alert_type == 1:
            send_sms(to=current_alert.value, body=alert_text)
            check_is_read.apply_async(kwargs={'doctor': doctor, 'alert_text': alert_text,
                                              'message_id': message_id, 'step': step},
                                      countdown=settings.TEN_MINUTES)
        elif current_alert.alert_type == 2:
            voice_call(to=current_alert.value)
            check_is_read.apply_async(kwargs={'doctor': doctor, 'alert_text': alert_text,
                                              'message_id': message_id, 'step': step},
                                      countdown=settings.TEN_MINUTES)
        elif current_alert.alert_type == 3:
            pass
            check_is_read.apply_async(kwargs={'doctor': doctor, 'alert_text': alert_text,
                                              'message_id': message_id, 'step': step},
                                      countdown=settings.TEN_MINUTES)
        elif current_alert.alert_type == 4:
            pass
            check_is_read.apply_async(kwargs={'doctor': doctor, 'alert_text': alert_text,
                                              'message_id': message_id, 'step': step},
                                      countdown=settings.TEN_MINUTES)
        elif current_alert.alert_type == 5:
            pass
            check_is_read.apply_async(kwargs={'doctor': doctor, 'alert_text': alert_text,
                                              'message_id': message_id, 'step': step},
                                      countdown=settings.TEN_MINUTES)
    except AttributeError:
        pass


@shared_task
def send_emails_by_notification_template(event, receiver, context, from_email=settings.FROM_EMAIL):
    try:
        template = NotificationTemplate.objects.get(event=event)
    except NotificationTemplate.DoesNotExist:
        return
    subject, message_id = get_email_message(template, context)
    send_mail(subject, message_id, from_email, [receiver])
