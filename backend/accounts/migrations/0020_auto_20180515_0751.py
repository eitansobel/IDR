# Generated by Django 2.0.3 on 2018-05-15 12:51

import django.contrib.postgres.fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0019_doctor_last_update'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='alertmethod',
            name='index_number',
        ),
        migrations.AddField(
            model_name='alertmethod',
            name='list_index',
            field=django.contrib.postgres.fields.ArrayField(base_field=models.SmallIntegerField(), blank=True, null=True, size=None),
        ),
    ]
