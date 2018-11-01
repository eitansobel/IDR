# Generated by Django 2.0.3 on 2018-05-07 06:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0015_merge_20180503_0316'),
    ]

    operations = [
        migrations.AddField(
            model_name='doctor',
            name='is_approved',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='alertmethod',
            name='index_number',
            field=models.PositiveSmallIntegerField(choices=[(0, 'Unset'), (1, 'Alert1'), (2, 'Alert2'), (3, 'Alert3'), (4, 'Alert4')], default=0),
        ),
    ]
