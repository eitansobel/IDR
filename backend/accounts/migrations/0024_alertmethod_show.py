# Generated by Django 2.0.3 on 2018-06-06 07:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0023_remove_alertmethod_list_index'),
    ]

    operations = [
        migrations.AddField(
            model_name='alertmethod',
            name='show',
            field=models.BooleanField(default=True),
        ),
    ]
