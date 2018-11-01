import datetime

from django.db import models
from django.contrib.auth.models import User, UserManager, AbstractUser
from django.utils.translation import ugettext_lazy as _
from .utils import SsnValidator
from django.core.exceptions import ValidationError
from django.utils import timezone
from accounts.utils import get_patients_cache, get_doctors_cache
from dateutil import relativedelta


class UserSoftDeleteModelManager(UserManager):
    def get_queryset(self):
        return super(UserSoftDeleteModelManager, self).get_queryset().filter(is_active=True)


class Hospital(models.Model):
    clinic_remote_id = models.PositiveIntegerField(_('clinic remote ID'), null=True, blank=True)
    title = models.CharField(_('title'), max_length=50, null=True, blank=True)
    clinic_remote_admin_username = models.CharField(max_length=255, default='')
    clinic_remote_admin_password = models.CharField(max_length=255, default='')

    def __str__(self):
        return self.title if self.title else " "


class HospitalRole(models.Model):
    REMOTE_ROLE = (
        (1, _('Hospital Admin')),
        (2, _('Doctor')),
        (3, _('Nurse'))
    )

    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE)
    title = models.CharField(_('title'), max_length=50, null=True, blank=True)
    remote_role = models.PositiveIntegerField(choices=REMOTE_ROLE, default=3)

    def __str__(self):
        return self.title


class HospitalDepartment(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE)
    title = models.CharField(_('title'), max_length=50, null=True, blank=True)

    def __str__(self):
        return self.title


class Doctor(User):
    PREFERRED_MODE_CHOICES = (
        (1, _('Phone')),
        (2, _('Cell')),
        (3, _('Pager')),
        (4, _('Fax')),
        (5, _('Email'))
    )
    PATIENT_SORT_BY_CHOICES = (
        (1, _('SSN')),
        (2, _('First name')),
        (3, _('Last name')),
        (4, _('DOB')),
        (5, _('ROOM')),
    )
    PATIENT_ORDER_CHOICES = (
        (1, _('Ascending')),
        (2, _('Descending')),
    )

    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, blank=True, null=True)
    remote_id = models.IntegerField()  # ID from RxPhoto
    middle_name = models.CharField(_('middle name'), max_length=30, null=True, blank=True)
    title = models.CharField(_('title'), max_length=30, null=True)
    prefix = models.CharField(_('prefix'), max_length=24, blank=True, null=True)
    suffix = models.CharField(_('suffix'), max_length=24, blank=True, null=True)
    preferred_name = models.CharField(_('preferred name'), max_length=255, blank=True, null=True)
    phone = models.CharField(_('phone'), null=True, max_length=50)
    cell = models.CharField(_('cell'), blank=True, null=True, max_length=50)
    pager = models.CharField(_('pager'), blank=True, null=True, max_length=50)
    fax = models.CharField(_('fax'), blank=True, null=True, max_length=50)
    preferred_mode = models.PositiveIntegerField(choices=PREFERRED_MODE_CHOICES, blank=True, null=True)
    hospital_department = models.ForeignKey(HospitalDepartment, on_delete=models.CASCADE, blank=True, null=True)
    hospital_role = models.ForeignKey(HospitalRole, on_delete=models.CASCADE, blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    birthday = models.DateField(null=True, blank=True)
    last_update = models.DateTimeField(auto_now=True)
    my_patients_list_participants = models.ManyToManyField("accounts.DoctorPatient",
                                                           related_name='my_list_participants', blank=True)
    # additional data
    dea_number = models.CharField(_('DEA Number'), max_length=20, null=True, blank=True)
    user_id = models.CharField(_('User id'), max_length=20, null=True, blank=True)
    npi_number = models.CharField(_('NPI Number'), max_length=20, null=True, blank=True)
    state_license = models.CharField(_('State license'), max_length=20, null=True, blank=True)
    # permission data
    patient_permission = models.BooleanField(default=False)
    doctor_permission = models.BooleanField(default=False)
    create_data_cell_permission = models.BooleanField(default=False)
    edit_data_cell_permission = models.BooleanField(default=False)
    export_permission = models.BooleanField(default=False)
    hidden_doctor_home_column_list = models.ManyToManyField("home.DoctorHomeColumn", blank=True)
    patient_sort_by = models.PositiveSmallIntegerField(choices=PATIENT_SORT_BY_CHOICES, default=1)
    patient_order = models.PositiveSmallIntegerField(choices=PATIENT_ORDER_CHOICES, default=1)
    objects = UserSoftDeleteModelManager()

    @property
    def is_admin(self):
        return self.hospital_role is not None and self.hospital_role.remote_role == 1

    @property
    def full_name(self):  # Pay attention. This property can be slowly
        return get_doctors_cache(self.hospital).get('doctors', {}).get(self.remote_id)

    def delete(self, using=None, keep_parents=False):
        self.is_active = False
        self.save()

    def __str__(self):
        return 'remote_id {} {}'.format(self.remote_id, self.username)

    class Meta:
        verbose_name = _('doctor')
        verbose_name_plural = _('doctors')


class StuffList(models.Model):
    update_time = models.DateTimeField(auto_now=True)
    participants = models.ManyToManyField(Doctor, related_name='stuff_participants')
    title = models.CharField(max_length=100)
    hospital = models.ForeignKey(Hospital, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.title

    class Meta:
        unique_together = ('title', 'hospital')


class SignOutLog(models.Model):
    logged_at = models.DateTimeField(auto_now_add=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    sign_out = models.DateTimeField()

    class Meta:
        ordering = ['sign_out']

    def __str__(self):
        return 'doctorID_{}_{}'.format(self.doctor.remote_id, self.sign_out)


class AlertMethod(models.Model):
    ALERT_TYPE = (
        (1, _('Phone')),
        (2, _('Cell')),
        (3, _('Pager')),
        (4, _('Fax')),
        (5, _('Email'))
    )

    last_update = models.DateTimeField(null=True, blank=True, auto_now=True)
    title = models.CharField(_('title'), max_length=50)
    value = models.CharField(_('value'), max_length=128)
    alert_type = models.PositiveIntegerField(choices=ALERT_TYPE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)
    show = models.BooleanField(default=True)

    def __str__(self):
        return 'doctorID_{}_{}'.format(self.doctor.remote_id, self.title)

    class Meta:
        ordering = ['-last_update']
        unique_together = ('title', 'doctor')


class DoctorAlertSetting(models.Model):
    doctor = models.OneToOneField(Doctor, on_delete=models.SET_NULL, null=True, blank=True,
                                  related_name='alert_settings')
    alert1 = models.ForeignKey(AlertMethod, null=True, blank=True, on_delete=models.SET_NULL, related_name="alert1")
    alert2 = models.ForeignKey(AlertMethod, null=True, blank=True, on_delete=models.SET_NULL, related_name="alert2")
    alert3 = models.ForeignKey(AlertMethod, null=True, blank=True, on_delete=models.SET_NULL, related_name="alert3")
    alert4 = models.ForeignKey(AlertMethod, null=True, blank=True, on_delete=models.SET_NULL, related_name="alert4")

    def __str__(self):
        return self.doctor.username if self.doctor else "Doctor instance doesn't exist"

    def get_active_alerts(self):
        return [getattr(self, field.name) for field in self._meta.fields if
                field.name.startswith('alert') and getattr(self, field.name)]


class Patient(User):
    SEX = (
        (1, _('Female')),
        (2, _('Male')),
        (3, _('Unknown'))
    )

    PREFERRED_COMMUNICATION = (
        (1, _('Phone')),
        (2, _('Cell')),
        (3, _('Pager')),
        (4, _('Fax')),
        (5, _('Email'))
    )

    ssn_validator = SsnValidator()
    remote_id = models.IntegerField()
    ssn = models.CharField(
        _('ssn'),
        max_length=150,
        help_text=_('format XXX-XX-XXXX where X - number'),
        validators=[ssn_validator],
        error_messages={
            'unique': _("A patient with that ssn already exists."),
        },
        null=True
    )
    hospital = models.ForeignKey(Hospital, on_delete=models.PROTECT, related_name='patients', blank=True, null=True)
    prefix = models.CharField(_('prefix'), max_length=24, blank=True, null=True)
    previous_last_name = models.CharField(_('previous_last_name'), max_length=30, blank=True, null=True)
    mother_maiden_name = models.CharField(_('mother_maiden_name'), max_length=150, blank=True, null=True)
    suffix = models.CharField(_('suffix'), max_length=24, blank=True, null=True)
    preferred_name = models.CharField(_('preferred_name'), max_length=24, blank=True, null=True)
    sex = models.PositiveSmallIntegerField(choices=SEX, default=3)
    preferred_language = models.CharField(_('preferred_language'), max_length=24, blank=True, null=True)
    ethnicity = models.CharField(_('ethnicity'), max_length=24, blank=True, null=True)
    home_phone = models.CharField(_('home_phone'), max_length=12, blank=True, null=True)
    mobile_phone = models.CharField(_('mobile_phone'), max_length=12, blank=True, null=True)
    work_phone = models.CharField(_('work_phone'), max_length=12, blank=True, null=True)
    preferred_communication = models.PositiveSmallIntegerField(choices=PREFERRED_COMMUNICATION, default=1)
    address1 = models.TextField(_('address'), blank=True, null=True)
    address2 = models.TextField(_('address'), blank=True, null=True)
    address3 = models.TextField(_('address'), blank=True, null=True)
    city = models.CharField(_('city'), blank=True, null=True, max_length=50)
    state = models.CharField(_('state'), blank=True, null=True, max_length=50)
    country = models.CharField(_('country'), null=True, blank=True, max_length=50)
    zip_code = models.CharField(max_length=32, blank=True, null=True)
    preferred_pharmacy = models.TextField(_('preferred pharmacy'), blank=True, null=True)
    pcp = models.TextField(_('pcp'), blank=True, null=True)
    primary_payor = models.TextField(_('primary_payor'), blank=True, null=True)
    secondary_payor = models.TextField(_('secondary_payor'), blank=True, null=True)
    room = models.CharField(max_length=20, blank=True, null=True)

    objects = UserSoftDeleteModelManager()

    @property
    def _hospital_cache(self):
        return get_patients_cache(self.hospital)

    @property
    def age(self):
        today = timezone.now().today()
        if self.birth_date:
            years = today.year - self.birth_date.year - (
                (today.month, today.day) < (self.birth_date.month, self.birth_date.day))
            if years != 0:
                return '{} years'.format(years)
            else:
                months = relativedelta.relativedelta(today, self.birth_date).months
                if months is not None:
                    return '{} months'.format(months)
                else:
                    days = relativedelta.relativedelta(today, self.birth_date).days
                    if days is not None:
                        return '{} days'.format(days)
                    else:
                        return '0 days'
        else:
            return None

    @property
    def mrn(self):
        return self._hospital_cache.get('patients', {}).get(self.remote_id, {}).get('mrn', '')

    @property
    def birth_date(self):
        return self._hospital_cache.get('patients', {}).get(self.remote_id, {}).get('birth_date')

    @property
    def remote_first_name(self):
        return self._hospital_cache.get('patients', {}).get(self.remote_id, {}).get('first_name', '')

    @property
    def remote_last_name(self):
        return self._hospital_cache.get('patients', {}).get(self.remote_id, {}).get('last_name', '')

    @property
    def middle_name(self):
        return self._hospital_cache.get('patients', {}).get(self.remote_id, {}).get('middle_name', '')

    @property
    def remote_email(self):
        return self._hospital_cache.get('patients', {}).get(self.remote_id, {}).get('email', '')

    def save(self, *args, **kwargs):
        if not self.id:
            utcnow = datetime.datetime.utcnow()
            midnight_utc = datetime.datetime.combine(utcnow.date(), datetime.time(0))
            delta = utcnow - midnight_utc
            identifier = delta.days * 24 * 60 * 60 + delta.seconds + delta.microseconds / 1e6

            self.username = "{}{}{}".format(self.first_name and self.first_name[0],
                                            self.last_name and self.last_name[0], str(identifier))
        super(Patient, self).save(*args, **kwargs)

    def delete(self, using=None, keep_parents=False):
        self.is_active = False
        self.save()

    def validate_unique(self, exclude=None):
        super(Patient, self).validate_unique()
        qs = Patient.objects.filter(ssn=self.ssn)
        if qs.filter(hospital=self.hospital).exists():
            raise ValidationError('ssn must be unique')

    class Meta:
        verbose_name = _('patient')
        verbose_name_plural = _('patients')
        ordering = ('last_name', 'first_name')

    def __str__(self):
        return "remote_id {}".format(self.remote_id)


class EmergencyContact(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.DO_NOTHING)
    first_name = models.CharField(_('first name'), max_length=30, blank=True, null=True)
    last_name = models.CharField(_('last name'), max_length=50, blank=True, null=True)
    relation_to_patient = models.CharField(_('relation'), max_length=50, blank=True, null=True)
    home_phone = models.CharField(_('home_phone'), max_length=12, blank=True, null=True)
    mobile_phone = models.CharField(_('mobile_phone'), max_length=12, blank=True, null=True)
    work_phone = models.CharField(_('work_phone'), max_length=12, blank=True, null=True)
    address1 = models.TextField(_('address'), blank=True, null=True)
    address2 = models.TextField(_('address'), blank=True, null=True)
    address3 = models.TextField(_('address'), blank=True, null=True)
    city = models.CharField(_('city'), blank=True, max_length=50, null=True)
    state = models.CharField(_('state'), blank=True, max_length=50, null=True)
    country = models.CharField(_('country'), null=True, blank=True, max_length=50)
    zip_code = models.CharField(max_length=32, blank=True, null=True)
    next_of_kin = models.BooleanField(default=False)

    def __str__(self):
        return "%s %s" % (self.first_name, self.last_name)

    class Meta:
        ordering = ['id']


class Guarantor(models.Model):
    SEX = (
        (1, _('Female')),
        (2, _('Male')),
        (3, _('Unknown'))
    )

    ssn_validator = SsnValidator()

    patient = models.ForeignKey(Patient, on_delete=models.DO_NOTHING)
    first_name = models.CharField(_('first name'), max_length=30, blank=True, null=True)
    middle_name = models.CharField(_('middle_name'), max_length=150, blank=True, null=True)
    last_name = models.CharField(_('last name'), max_length=150, blank=True, null=True)
    birth_date = models.DateField(null=True, blank=True)
    ssn = models.CharField(
        _('ssn'),
        max_length=150,
        help_text=_('format XXX-XX-XXXX where X - number'),
        validators=[ssn_validator],
        error_messages={
            'unique': _("A patient with that ssn already exists."),
        },
        null=True,
    )
    sex = models.PositiveSmallIntegerField(choices=SEX, default=3)
    home_phone = models.CharField(_('home_phone'), max_length=12, blank=True, null=True)
    mobile_phone = models.CharField(_('mobile_phone'), max_length=12, blank=True, null=True)
    work_phone = models.CharField(_('work_phone'), max_length=12, blank=True, null=True)
    relation_to_patient = models.CharField(_('relation'), max_length=50, blank=True, null=True)
    employer = models.TextField(_('employer'), blank=True, null=True)
    address1 = models.TextField(_('address'), blank=True, null=True)
    address2 = models.TextField(_('address'), blank=True, null=True)
    address3 = models.TextField(_('address'), blank=True, null=True)
    city = models.CharField(_('city'), blank=True, max_length=50, null=True)
    state = models.CharField(_('state'), blank=True, max_length=50, null=True)
    country = models.CharField(_('country'), null=True, blank=True, max_length=50)
    zip_code = models.CharField(max_length=32, blank=True, null=True)

    class Meta:
        ordering = ['id']


class PatientsList(models.Model):
    update_time = models.DateTimeField(auto_now=True)
    participants = models.ManyToManyField(Patient, related_name='patient_participants')
    title = models.CharField(max_length=100)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.title

    class Meta:
        unique_together = ('title', 'hospital')


class DoctorPatientManager(models.Manager):
    def get_queryset(self):
        return super(DoctorPatientManager, self).get_queryset().filter(patient__is_active=True)


class DoctorPatient(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    show = models.BooleanField(default=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE)

    objects = DoctorPatientManager()

    class Meta:
        unique_together = ('patient', 'doctor')

    def __str__(self):
        return "%s %d" % (self.doctor.username, self.patient.remote_id)


class CsvImportLog(models.Model):
    TYPE = (
        (1, _('Patient')),
        (2, _('Doctor')),
    )
    import_type = models.PositiveSmallIntegerField(choices=TYPE)
    author = models.ForeignKey(Doctor, related_name='patient_imports', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    processed = models.SmallIntegerField()
    added = models.SmallIntegerField()
    errors = models.SmallIntegerField()
    sheet = models.FileField(upload_to="uploads/import/%Y-%m-%d/")

    class Meta:
        ordering = ['import_type', '-timestamp']

    def __str__(self):
        return "{s.author}, {s.timestamp:%Y-%m-%d}: processed {s.processed}".format(s=self)
