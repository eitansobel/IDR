# Generated by Django 2.0.3 on 2018-08-20 17:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0003_auto_20180815_1338'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='doctorhomecellfield',
            options={'ordering': ['updated_at', 'id']},
        ),
        migrations.AddField(
            model_name='doctorhomecellfield',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]
