# Generated by Django 2.0.3 on 2018-09-07 17:34

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0049_remove_patient_responsible_doctor'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='emergencycontact',
            options={'ordering': ['id']},
        ),
        migrations.AlterModelOptions(
            name='guarantor',
            options={'ordering': ['id']},
        ),
    ]
