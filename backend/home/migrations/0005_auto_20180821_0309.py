# Generated by Django 2.0.3 on 2018-08-21 08:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0004_auto_20180820_1234'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='doctorhomecellfield',
            options={'ordering': ['-updated_at', 'id']},
        ),
    ]
