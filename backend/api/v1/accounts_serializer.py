import re

from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from accounts.models import Doctor, Patient, AlertMethod, DoctorAlertSetting, Hospital, HospitalDepartment, \
    HospitalRole, StuffList, EmergencyContact, Guarantor, PatientsList, DoctorPatient, CsvImportLog
from django.utils.translation import ugettext_lazy as _
import django.contrib.auth.password_validation as validators
from django.core import exceptions


class SignOutDatetimeSerializer(serializers.Serializer):
    sign_out = serializers.DateTimeField()
    # TODO add validation


class AlertMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlertMethod
        exclude = ('doctor',)


class DoctorAlertSettingSerializer(serializers.ModelSerializer):
    alert1 = AlertMethodSerializer()
    alert2 = AlertMethodSerializer()
    alert3 = AlertMethodSerializer()
    alert4 = AlertMethodSerializer()

    class Meta:
        model = DoctorAlertSetting
        exclude = ('id', 'doctor')


class HospitalDepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalDepartment
        fields = '__all__'


class HospitalRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = HospitalRole
        fields = '__all__'


class HospitalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = '__all__'


class GuarantorSerializer(serializers.ModelSerializer):
    birth_date = serializers.DateField(required=True)
    sex = serializers.IntegerField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    relation_to_patient = serializers.CharField(required=True)
    home_phone = serializers.CharField(max_length=25, required=False, allow_null=True, allow_blank=True)
    mobile_phone = serializers.CharField(max_length=25, required=False, allow_null=True, allow_blank=True)
    work_phone = serializers.CharField(max_length=25, required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = Guarantor
        fields = ('first_name', 'middle_name', 'last_name', 'birth_date', 'ssn', 'sex', 'home_phone', 'mobile_phone',
                  'work_phone', 'relation_to_patient', 'employer', 'address1', 'address2', 'address3',
                  'city', 'state', 'country', 'zip_code', 'id')

    def validate(self, attrs):
        if not [True for phone_type in ['home_phone', 'mobile_phone', 'work_phone'] if
                phone_type in attrs and attrs[phone_type]]:
            raise serializers.ValidationError(
                'home_phone, mobile_phone, work_phone one of this fields are requirements')
        if attrs['sex'] not in (1, 2, 3):
            raise serializers.ValidationError("Sex can be only 1 - Famale, 2 - Male, 3 - Unknown")
        if 'ssn' in attrs and attrs['ssn'] and re.match(r'^\d{3}-\d{2}-\d{4}$', attrs['ssn']) is None:
            raise serializers.ValidationError("ssn can be only in XXX-XX-XXXX format")
        return super(GuarantorSerializer, self).validate(attrs)


class EmergencyContactSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    relation_to_patient = serializers.CharField(required=True)
    next_of_kin = serializers.NullBooleanField(required=False)
    home_phone = serializers.CharField(max_length=25, required=False, allow_null=True, allow_blank=True)
    mobile_phone = serializers.CharField(max_length=25, required=False, allow_null=True, allow_blank=True)
    work_phone = serializers.CharField(max_length=25, required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = EmergencyContact
        fields = (
            'first_name', 'last_name', 'relation_to_patient', 'home_phone', 'mobile_phone', 'work_phone', 'address1',
            'address2', 'address3',
            'city', 'state', 'country', 'zip_code', 'next_of_kin', 'id')

    def validate(self, attrs):
        if not [True for phone_type in ['home_phone', 'mobile_phone', 'work_phone'] if
                phone_type in attrs and attrs[phone_type]]:
            raise serializers.ValidationError(
                'home_phone, mobile_phone, work_phone one of this fields are requirements')

        return super(EmergencyContactSerializer, self).validate(attrs)


class PatientSerializer(serializers.ModelSerializer):
    ssn = serializers.CharField(required=True)
    sex = serializers.IntegerField(required=True)
    address1 = serializers.CharField(required=True)
    city = serializers.CharField(required=True)
    state = serializers.CharField(required=True)
    zip_code = serializers.CharField(required=True)
    emergency_contacts = EmergencyContactSerializer(many=True, required=False, source='emergencycontact_set')
    guarantors = GuarantorSerializer(many=True, required=False, source='guarantor_set')
    home_phone = serializers.CharField(max_length=25, required=False, allow_null=True, allow_blank=True)
    mobile_phone = serializers.CharField(max_length=25, required=False, allow_null=True, allow_blank=True)
    work_phone = serializers.CharField(max_length=25, required=False, allow_null=True, allow_blank=True)
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = (
            'first_name', 'last_name', 'mrn', 'ssn', 'prefix', 'previous_last_name', 'mother_maiden_name', 'suffix',
            'preferred_name', 'birth_date', 'sex', 'preferred_language', 'ethnicity', 'home_phone', 'mobile_phone',
            'work_phone', 'preferred_communication', 'address1', 'address2', 'address3', 'city', 'state', 'country',
            'zip_code', 'primary_payor', 'secondary_payor', 'emergency_contacts', 'age', 'guarantors', 'remote_id',
            'pcp', 'preferred_pharmacy', 'email', 'middle_name', 'room')
        read_only_fields = ('remote_id',)

    def validate(self, attrs):
        if 'sex' in attrs and attrs['sex'] not in (1, 2, 3):
            raise serializers.ValidationError("Sex can be only 1 - Famale, 2 - Male, 3 - Unknown")
        if 'preferred_communication' in attrs and attrs['preferred_communication'] not in (1, 2, 3, 4):
            raise serializers.ValidationError(
                "preferred_communication can be only 1 - Not preferred, 2 - Phone, 3 - Mail, 4 - Email")
        if 'ssn' not in attrs:
            raise serializers.ValidationError("ssn is required")
        if 'ssn' in attrs and re.match(r'^\d{3}-\d{2}-\d{4}$', attrs['ssn']) is None:
            raise serializers.ValidationError("ssn can be only in XXX-XX-XXXX format")
        elif Patient.objects.filter(ssn=attrs['ssn']):
            raise serializers.ValidationError("Patient with this ssn already exists")
        if not [True for phone_type in ['home_phone', 'mobile_phone', 'work_phone'] if
                phone_type in attrs and attrs[phone_type]]:
            msg = _('at least one phone should have been filled in (home_phone, mobile_phone, work_phone)')
            raise serializers.ValidationError(msg, code='Registration')
        return super(PatientSerializer, self).validate(attrs)

    def create(self, validated_data):
        guarantors = validated_data.pop('guarantor_set', [])
        emergency_contacts = validated_data.pop('emergencycontact_set', [])
        patient = Patient.objects.create(**validated_data)
        for emergency_contact in emergency_contacts:
            emergency_contact_serializer = EmergencyContactSerializer(data=emergency_contact)
            if emergency_contact_serializer.is_valid(raise_exception=True):
                EmergencyContact.objects.create(patient=patient, **emergency_contact)
        for guarantor in guarantors:
            guarantor_serializer = GuarantorSerializer(data=guarantor)
            if guarantor_serializer.is_valid(raise_exception=True):
                Guarantor.objects.create(patient=patient, **guarantor)
        return patient

    def get_email(self, obj):
        return obj.remote_email

    def get_first_name(self, obj):
        return obj.remote_first_name

    def get_last_name(self, obj):
        return obj.remote_last_name


class PatientUpdateSerializer(PatientSerializer):
    ssn = serializers.CharField()
    sex = serializers.IntegerField()
    address1 = serializers.CharField()
    city = serializers.CharField()
    state = serializers.CharField()
    zip_code = serializers.CharField()
    emergency_contacts = EmergencyContactSerializer(many=True, required=False, source='emergencycontact_set')
    guarantors = GuarantorSerializer(many=True, required=False, source='guarantor_set')

    def validate(self, attrs):
        if 'sex' in attrs and attrs['sex'] not in (1, 2, 3):
            raise serializers.ValidationError("Sex can be only 1 - Famale, 2 - Male, 3 - Unknown")
        if 'preferred_communication' in attrs and attrs['preferred_communication'] not in (1, 2, 3, 4):
            raise serializers.ValidationError(
                "preferred_communication can be only 1 - Not preferred, 2 - Phone, 3 - Mail, 4 - Email")
        if 'ssn' not in attrs:
            raise serializers.ValidationError("ssn is required")
        if 'ssn' in attrs and re.match(r'^\d{3}-\d{2}-\d{4}$', attrs['ssn']) is None:
            raise serializers.ValidationError("ssn can be only in XXX-XX-XXXX format")
        elif attrs['ssn'] != self.instance.ssn and Patient.objects.filter(ssn=attrs['ssn']):
            raise serializers.ValidationError("Patient with this ssn already exists")
        if not [True for phone_type in ['home_phone', 'mobile_phone', 'work_phone'] if
                phone_type in attrs and attrs[phone_type]]:
            msg = _('at least one phone should have been filled in (home_phone, mobile_phone, work_phone)')
            raise serializers.ValidationError(msg, code='Registration')
        return attrs

    def update(self, instance, validated_data):
        guarantors = validated_data.pop('guarantor_set', [])
        emergency_contacts = validated_data.pop('emergencycontact_set', [])
        [guarantor.delete() for guarantor in instance.guarantor_set.all()]
        [emergency.delete() for emergency in instance.emergencycontact_set.all()]
        for emergency_contact in emergency_contacts:
            emergency_contact_serializer = EmergencyContactSerializer(data=emergency_contact)
            if emergency_contact_serializer.is_valid(raise_exception=True):
                EmergencyContact.objects.create(patient=instance, **emergency_contact)
        for guarantor in guarantors:
            guarantor_serializer = GuarantorSerializer(data=guarantor)
            if guarantor_serializer.is_valid(raise_exception=True):
                Guarantor.objects.create(patient=instance, **guarantor)
        return super(PatientUpdateSerializer, self).update(instance, validated_data)


class MyPatientListParticipantSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)

    class Meta:
        model = DoctorPatient
        fields = ('patient', 'show', 'id')


class DoctorSerializer(serializers.ModelSerializer):
    title = serializers.CharField(required=True)
    phone = serializers.CharField(required=True)
    alerts = DoctorAlertSettingSerializer(source='alert_settings', read_only=True)
    hospital = serializers.PrimaryKeyRelatedField(read_only=True)
    my_patients_list_participants = MyPatientListParticipantSerializer(read_only=True, many=True)
    patient_sort_by = serializers.IntegerField(read_only=True)
    patient_order = serializers.IntegerField(read_only=True)

    class Meta:
        model = Doctor
        fields = ('remote_id', 'middle_name', 'title', 'prefix', 'suffix', 'preferred_name', 'phone', 'cell',
                  'pager', 'fax', 'preferred_mode', 'hospital_department', 'hospital_role', 'alerts', 'hospital',
                  'is_approved', 'birthday', 'dea_number', 'user_id', 'npi_number', 'state_license', 'last_update',
                  'is_admin', 'my_patients_list_participants', 'patient_sort_by', 'patient_order', 'export_permission',
                  'patient_permission', 'doctor_permission', 'create_data_cell_permission', 'edit_data_cell_permission')
        read_only_fields = ('remote_id', 'is_approved', 'last_update', 'is_admin', 'export_permission',
                            'patient_permission', 'doctor_permission', 'create_data_cell_permission',
                            'edit_data_cell_permission')


class DoctorCreateOrUpdateSerializer(DoctorSerializer):
    hospital_department = serializers.PrimaryKeyRelatedField(queryset=HospitalDepartment.objects.all())
    hospital_role = serializers.PrimaryKeyRelatedField(queryset=HospitalRole.objects.all())
    hospital = serializers.PrimaryKeyRelatedField(queryset=Hospital.objects.all())


class PatientOrderSerializer(serializers.ModelSerializer):
    patient_sort_by = serializers.IntegerField(required=True)
    patient_order = serializers.IntegerField(required=True)

    class Meta:
        model = Doctor
        fields = ('patient_sort_by', 'patient_order')

    def validate(self, attrs):
        patient_sort_by = attrs.get('patient_sort_by')
        patient_order = attrs.get('patient_order')
        order_choices = [x[0] for x in Doctor.PATIENT_ORDER_CHOICES]
        sort_choices = [x[0] for x in Doctor.PATIENT_SORT_BY_CHOICES]
        if patient_order not in order_choices or patient_sort_by not in sort_choices:
            raise serializers.ValidationError('patient order can be only in {}, '
                                              'patient_sort_by can be only in {}'.format(order_choices, sort_choices))
        return super(PatientOrderSerializer, self).validate(attrs)


class CreateRemoteDoctorSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=30, validators=[UniqueValidator(queryset=Doctor.objects.all())])
    email = serializers.EmailField()
    password = serializers.CharField(max_length=128)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)

    def validate(self, attrs):
        password = attrs.get('password')
        try:
            # validate the password and catch the exception
            validators.validate_password(password=password, user=self.instance)

        except exceptions.ValidationError as e:
            raise serializers.ValidationError({'password': list(e.messages)})
        return super(CreateRemoteDoctorSerializer, self).validate(attrs)


class UpdateRemoteDoctorSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False)
    first_name = serializers.CharField(max_length=30, required=False)
    last_name = serializers.CharField(max_length=30, required=False)


class HospitalStructureSerializer(serializers.ModelSerializer):
    hospital_department = HospitalDepartmentSerializer(source='hospitaldepartment_set', many=True, read_only=True)
    hospital_role = HospitalRoleSerializer(source='hospitalrole_set', many=True, read_only=True)
    hospital_id = serializers.SerializerMethodField()

    class Meta:
        model = Hospital
        fields = ('hospital_id', 'hospital_department', 'hospital_role', 'clinic_remote_id', 'title')

    def get_hospital_id(self, hospital):
        return hospital.id


class CreateRemotePatientSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    mrn = serializers.CharField(max_length=255)
    birth_date = serializers.DateField()
    middle_name = serializers.CharField(max_length=30, required=False, allow_null=True, allow_blank=True)
    phone_number = serializers.CharField(max_length=25, required=False, allow_null=True)
    email = serializers.EmailField(required=True)


class StuffListSerializer(serializers.ModelSerializer):
    participants = serializers.SlugRelatedField(many=True, queryset=Doctor.objects.all(), slug_field='remote_id')

    class Meta:
        model = StuffList
        read_only_fields = ('update_time',)
        exclude = ('hospital',)


class PatientsListSerializer(serializers.ModelSerializer):
    participants = serializers.SlugRelatedField(many=True, queryset=Patient.objects.all(), slug_field='remote_id')

    class Meta:
        model = PatientsList
        read_only_fields = ('update_time',)
        exclude = ('hospital',)

    def validate(self, attrs):
        wrong_patients_list = [patient.remote_id for patient in attrs['participants'] if
                               patient.hospital != self.context.get('request').user.doctor.hospital]
        if wrong_patients_list:
            raise serializers.ValidationError({"not found": wrong_patients_list})
        return super(PatientsListSerializer, self).validate(attrs)


class PatientsGetListSerializer(PatientsListSerializer):
    participants = PatientSerializer(many=True)


class DoctorPatientUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorPatient
        fields = ('show',)


class DoctorPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Doctor
        fields = ('patient_permission', 'doctor_permission', 'create_data_cell_permission', 'edit_data_cell_permission',
                  'export_permission')


class MyPatientsListUpdateSerializer(serializers.Serializer):
    my_patients_list_participants = serializers.SlugRelatedField(queryset=Patient.objects.all(), slug_field='remote_id',
                                                                 many=True)

    def validate(self, attrs):
        attrs['my_patients_list_participants'] = list(set(attrs.get('my_patients_list_participants')))
        wrong_patients = [patient.remote_id for patient in attrs.get('my_patients_list_participants') if
                          patient.hospital != self.context.get('hospital')]
        if wrong_patients:
            raise serializers.ValidationError({"Not found": wrong_patients})
        return super(MyPatientsListUpdateSerializer, self).validate(attrs)


class CsvImportLogSerializer(serializers.ModelSerializer):
    author = DoctorSerializer()
    sheet_url = serializers.SerializerMethodField()

    class Meta:
        model = CsvImportLog
        exclude = ['id', 'sheet', 'import_type']

    def get_sheet_url(self, obj):
        return obj.sheet.url


class PatientHeadersSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = ('ssn', 'mrn', 'birth_date', 'id', 'first_name', 'last_name', 'age', 'room')

    def get_first_name(self, obj):
        return obj.remote_first_name

    def get_last_name(self, obj):
        return obj.remote_last_name

    def get_id(self, obj):
        return obj.remote_id
