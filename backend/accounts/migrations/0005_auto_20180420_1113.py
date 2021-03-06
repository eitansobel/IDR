# Generated by Django 2.0.3 on 2018-04-20 16:13

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0004_auto_20180418_0934'),
    ]

    operations = [
        migrations.AlterField(
            model_name='doctor',
            name='hospital_department',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='accounts.HospitalDepartment'),
        ),
        migrations.AlterField(
            model_name='doctor',
            name='hospital_role',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='accounts.HospitalRole'),
        ),
    ]
