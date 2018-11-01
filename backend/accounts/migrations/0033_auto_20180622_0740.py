# Generated by Django 2.0.3 on 2018-06-22 12:40

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0032_auto_20180620_0806'),
    ]

    operations = [
        migrations.RenameField(
            model_name='patient',
            old_name='date_of_birth',
            new_name='birth_date',
        ),
        migrations.AddField(
            model_name='patient',
            name='doctor_fk',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='patients', to='accounts.Doctor'),
        ),
    ]
