# Generated by Django 2.0.3 on 2018-07-10 11:23

from django.db import migrations
from notifications.models import NotificationTemplate as NotificationModel

subject_message = \
    """Your {{ domain_name }} password is ready."""

html_message = \
    """
    Dear {{ user }},
    
    {{ admin }} created an account on {{ domain_name }} for you. Your temporary password is below. You can login from {{ site_url }} now.
    
    Your temporary password is {{ password }}
    
    When you log in for the first time, please change your password to something that you will remember. Also, passwords are CASE Sensitive.
    
    Regards,
    The {{ domain_name }} Team
    """


def add_email_template(apps, schema_editor):
    NotificationTemplate = apps.get_model('notifications', 'NotificationTemplate')
    obj, _ = NotificationTemplate.objects.get_or_create(event=NotificationModel.NEW_USER_ACCOUNT_IS_READY)
    obj.subject_message = subject_message
    obj.html_message = html_message
    obj.save()


def reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('notifications', '0005_notificationtemplate'),
    ]

    operations = [
        migrations.RunPython(add_email_template, reverse),
    ]
