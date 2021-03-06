# Generated by Django 2.0.3 on 2018-04-24 06:03

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_alertmethod_created_time'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='alertmethod',
            options={'ordering': ['-created_time']},
        ),
        migrations.AddField(
            model_name='alertmethod',
            name='bind_field',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='alertmethod',
            name='created_time',
            field=models.DateTimeField(default=datetime.datetime(2018, 4, 24, 6, 3, 45, 295676, tzinfo=utc)),
        ),
    ]
