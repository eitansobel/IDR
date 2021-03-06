# Generated by Django 2.0.3 on 2018-06-20 13:06

import accounts.utils
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0031_auto_20180614_0851'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmergencyContact',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(blank=True, max_length=30, null=True, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=50, null=True, verbose_name='last name')),
                ('relation_to_patient', models.CharField(blank=True, max_length=50, null=True, verbose_name='relation')),
                ('home_phone', models.CharField(blank=True, max_length=12, null=True, verbose_name='home_phone')),
                ('mobile_phone', models.CharField(blank=True, max_length=12, null=True, verbose_name='mobile_phone')),
                ('work_phone', models.CharField(blank=True, max_length=12, null=True, verbose_name='work_phone')),
                ('address', models.TextField(blank=True, null=True, verbose_name='address')),
                ('city', models.CharField(blank=True, max_length=50, null=True, verbose_name='state')),
                ('state', models.CharField(blank=True, max_length=50, null=True, verbose_name='state')),
                ('country', models.CharField(blank=True, max_length=50, null=True, verbose_name='country')),
                ('zip_code', models.CharField(blank=True, max_length=32, null=True)),
                ('next_of_kin', models.BooleanField(default=False)),
            ],
        ),
        migrations.CreateModel(
            name='Guarantor',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('first_name', models.CharField(blank=True, max_length=30, null=True, verbose_name='first name')),
                ('middle_name', models.CharField(blank=True, max_length=150, null=True, verbose_name='middle_name')),
                ('last_name', models.CharField(blank=True, max_length=150, null=True, verbose_name='last name')),
                ('date_of_birth', models.DateField(blank=True, null=True)),
                ('ssn', models.CharField(error_messages={'unique': 'A patient with that ssn already exists.'}, help_text='format XXX-XX-XXXX where X - number', max_length=150, null=True, unique=True, validators=[accounts.utils.SsnValidator()], verbose_name='ssn')),
                ('sex', models.PositiveSmallIntegerField(choices=[(1, 'Female'), (2, 'Male'), (3, 'Unknown')], default=3)),
                ('home_phone', models.CharField(blank=True, max_length=12, null=True, verbose_name='home_phone')),
                ('mobile_phone', models.CharField(blank=True, max_length=12, null=True, verbose_name='mobile_phone')),
                ('work_phone', models.CharField(blank=True, max_length=12, null=True, verbose_name='work_phone')),
                ('relation_to_patient', models.CharField(blank=True, max_length=50, null=True, verbose_name='relation')),
                ('employer', models.TextField(blank=True, null=True, verbose_name='employer')),
            ],
        ),
        migrations.RemoveField(
            model_name='patient',
            name='encounter_number',
        ),
        migrations.RemoveField(
            model_name='patient',
            name='fax',
        ),
        migrations.RemoveField(
            model_name='patient',
            name='guarantor',
        ),
        migrations.RemoveField(
            model_name='patient',
            name='insurance',
        ),
        migrations.RemoveField(
            model_name='patient',
            name='pager',
        ),
        migrations.RemoveField(
            model_name='patient',
            name='power_of_attorney',
        ),
        migrations.RemoveField(
            model_name='patient',
            name='room_number',
        ),
        migrations.RemoveField(
            model_name='patient',
            name='title',
        ),
        migrations.AddField(
            model_name='patient',
            name='city',
            field=models.CharField(blank=True, max_length=50, null=True, verbose_name='state'),
        ),
        migrations.AddField(
            model_name='patient',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='patient',
            name='ethnicity',
            field=models.CharField(blank=True, max_length=24, null=True, verbose_name='ethnicity'),
        ),
        migrations.AddField(
            model_name='patient',
            name='home_phone',
            field=models.CharField(blank=True, max_length=12, null=True, verbose_name='home_phone'),
        ),
        migrations.AddField(
            model_name='patient',
            name='middle_name',
            field=models.CharField(blank=True, max_length=150, null=True, verbose_name='middle_name'),
        ),
        migrations.AddField(
            model_name='patient',
            name='mobile_phone',
            field=models.CharField(blank=True, max_length=12, null=True, verbose_name='mobile_phone'),
        ),
        migrations.AddField(
            model_name='patient',
            name='mother_maiden_name',
            field=models.CharField(blank=True, max_length=150, null=True, verbose_name='mother_maiden_name'),
        ),
        migrations.AddField(
            model_name='patient',
            name='mrn',
            field=models.CharField(max_length=50, null=True, verbose_name='mrn'),
        ),
        migrations.AddField(
            model_name='patient',
            name='preferred_communication',
            field=models.PositiveSmallIntegerField(choices=[(1, 'No Preference'), (2, 'Phone'), (3, 'Mail'), (4, 'Email')], default=1),
        ),
        migrations.AddField(
            model_name='patient',
            name='preferred_language',
            field=models.CharField(blank=True, max_length=24, null=True, verbose_name='preferred_language'),
        ),
        migrations.AddField(
            model_name='patient',
            name='previous_last_name',
            field=models.CharField(blank=True, max_length=30, null=True, verbose_name='previous_last_name'),
        ),
        migrations.AddField(
            model_name='patient',
            name='primary_payor',
            field=models.TextField(blank=True, null=True, verbose_name='primary_payor'),
        ),
        migrations.AddField(
            model_name='patient',
            name='secondary_payor',
            field=models.TextField(blank=True, null=True, verbose_name='secondary_payor'),
        ),
        migrations.AddField(
            model_name='patient',
            name='sex',
            field=models.PositiveSmallIntegerField(choices=[(1, 'Female'), (2, 'Male'), (3, 'Unknown')], default=3),
        ),
        migrations.AddField(
            model_name='patient',
            name='ssn',
            field=models.CharField(error_messages={'unique': 'A patient with that ssn already exists.'}, help_text='format XXX-XX-XXXX where X - number', max_length=150, null=True, unique=True, validators=[accounts.utils.SsnValidator()], verbose_name='ssn'),
        ),
        migrations.AddField(
            model_name='patient',
            name='work_phone',
            field=models.CharField(blank=True, max_length=12, null=True, verbose_name='work_phone'),
        ),
        migrations.AlterField(
            model_name='patient',
            name='address',
            field=models.TextField(blank=True, null=True, verbose_name='address'),
        ),
        migrations.AlterField(
            model_name='patient',
            name='preferred_name',
            field=models.CharField(blank=True, max_length=24, null=True, verbose_name='preferred_name'),
        ),
        migrations.AddField(
            model_name='guarantor',
            name='patient',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='accounts.Patient'),
        ),
        migrations.AddField(
            model_name='emergencycontact',
            name='patient',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='accounts.Patient'),
        ),
    ]
