# Generated by Django 2.0.3 on 2018-07-12 14:27
from django.db import migrations
from notifications.models import NotificationTemplate as NotificationModel

subject_message = \
    """Your account was declined!"""

html_message = \
    """

    Hi {{ user }}!

    Sorry but your account was declined!

    {{ domain }}/

    Regards,
    The {{ domain_name }} Team
    """


def add_email_template(apps, schema_editor):
    NotificationTemplate = apps.get_model('notifications', 'NotificationTemplate')
    obj, _ = NotificationTemplate.objects.get_or_create(event=NotificationModel.DECLINE_REGISTRATION)
    obj.subject_message = subject_message
    obj.html_message = html_message
    obj.save()


def reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('notifications', '0010_auto_20180712_0926'),
    ]

    operations = [
        migrations.RunPython(add_email_template, reverse),
    ]
