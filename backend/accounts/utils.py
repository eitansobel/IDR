import pycountry
import csv
import codecs
import requests
import json
import re
import datetime

from collections import OrderedDict
from io import StringIO
from django.core import validators
from django.utils import timezone
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _
from django.conf import settings
from django.core.cache import cache


@deconstructible
class SsnValidator(validators.RegexValidator):
    regex = r'^\d{3}-\d{2}-\d{4}$'
    message = _(
        'Enter a valid ssn. This value may be in format XXX-XX-XXXX'
    )
    flags = 0


class Locations:
    @staticmethod
    def get_all_countries():
        # TODO add caching
        return {'{} - {}'.format(country.alpha_2, country.name): Locations.get_states_by_country_code(country.alpha_2)
                for country in pycountry.countries}

    @staticmethod
    def get_states_by_country_code(country_code):
        return {st.name: st.code for st in pycountry.subdivisions.get(country_code=country_code)}

    @staticmethod
    def get_state_by_code(code):
        return pycountry.subdivisions.get(code=code)

    @staticmethod
    def get_state_name_by_code(code):
        st = Locations.get_state_by_code(code=code)
        return '{} - {}'.format(st.code, st.name)

    @staticmethod
    def get_country_by_state_code(code):
        return Locations.get_state_by_code(code).country.name


def clean_date(date_str):
    try:
        date = timezone.datetime.strptime(date_str, '%m/%d/%Y').date()
        return date.strftime('%Y-%m-%d')
    except ValueError:
        return


def map_remote_records(local_list, remote_list):
    result = [{**r, **l} for l in local_list for r in remote_list if
              l.get('remote_id') is not None and l.get('remote_id') == r.get('id')]
    # if any(len(x) != len(result) for x in (local_list, remote_list)):
    #     raise ValueError('Records are not synchronized')
    return result


def map_records_by_slug(first_list, second_list, slug):
    return [{**r, **l} for l in first_list for r in second_list if
            l.get(slug) is not None and l.get(slug).lower() == r.get(slug).lower()]


def get_unavailable_email(email_list, request):
    token = request.META.get('HTTP_AUTHORIZATION')
    response = requests.post(settings.IDR_AUTH_CHECK_EMAIL + '?list=true',
                             data=json.dumps({'email_list': email_list}),
                             headers={'Authorization': token,
                                      'Content-Type': 'application/json'}).json()
    return response.get('not_available')


def get_unavailable_username(username_list, request):
    token = request.META.get('HTTP_AUTHORIZATION')
    response = requests.post(settings.IDR_AUTH_CHECK_USERNAME + '?list=true',
                             data=json.dumps({'username_list': username_list}),
                             headers={'Authorization': token,
                                      'Content-Type': 'application/json'}).json()
    return response.get('not_available')


def generate_doctor_login(email, request, not_available_username):
    username = email[:30]
    if username not in not_available_username:
        return username

    utcnow = datetime.datetime.utcnow()
    midnight_utc = datetime.datetime.combine(utcnow.date(), datetime.time(0))
    delta = utcnow - midnight_utc
    identifier = str(delta.days * 24 * 60 * 60 + delta.seconds + delta.microseconds / 1e6)
    return "{}{}".format(email[:30 - len(identifier)], identifier)


def parse_patient_csv(csv_file, remote_clinic_patients, request):
    from api.v1.accounts_serializer import CreateRemotePatientSerializer, PatientSerializer
    from accounts.models import Patient

    fields_map = OrderedDict([
        ('First Name', 'first_name'),
        ('Middle Name', 'middle_name'),
        ('Last Name', 'last_name'),
        ('Preferred Name', 'preferred_name'),
        ('Prefix', 'prefix'),
        ('Suffix', 'suffix'),
        ('Email Address', 'email'),
        ('Date of Birth', 'birth_date'),
        ('Sex', 'sex'),
        ('Home Phone', 'home_phone'),
        ('Mobile Phone', 'mobile_phone'),
        ('Work Phone', 'work_phone'),
        ('MRN', 'mrn'),
        ('Country', 'country'),
        ('City', 'city'),
        ('Address1', 'address1'),
        ('Address2', 'address2'),
        ('Address3', 'address3'),
        ('State', 'state'),
        ('Post Code', 'zip_code'),
        ('SSN', 'ssn'),  # format (XXX-XX-XXXX) where X - is unique number,
        ('Previous Last Name', 'previous_last_name'),
        ('Mother Maiden Name', 'mother_maiden_name'),
        ('Preferred Language', 'preferred_language'),
        ('Ethnicity', 'ethnicity'),
        ('Preferred Communication', 'preferred_communication'),
        ('Preferred Pharmacy', 'preferred_pharmacy'),
        ('PCP', 'pcp'),
        ('Primary Payor', 'primary_payor'),
        ('Secondary Payor', 'secondary_payor'),
    ])

    error_field = 'Error Reason Code'
    required_field_names = ['First Name', 'Last Name', 'Email Address', 'MRN', 'Preferred Name', 'Date of Birth',
                            'SSN', 'Country', 'State', 'City', 'Address1', 'Sex', 'Post Code']
    patients = []
    row_found = None
    current_email = None
    email_list = []
    count = 0
    err_count = 0
    add_count = 0
    sheet = StringIO()
    reader = csv.DictReader(codecs.iterdecode(csv_file, 'utf-8'))

    # check unique emails
    def get_email(key, value):
        if key == 'Email Address':
            email_list.append(value)

    [get_email(k, v) for row in reader for k, v in row.items()]

    not_available_email = get_unavailable_email(email_list, request) or []

    # re-read csv
    reader = csv.DictReader(codecs.iterdecode(csv_file, 'utf-8'))
    # check extraneous field in csv
    extraneous_column_list = set(reader.fieldnames).difference(fields_map.keys())
    absent_column_list = set(required_field_names).difference(reader.fieldnames)
    if extraneous_column_list:
        escaped_fields_text = ", ".join(extraneous_column_list)
        if len(extraneous_column_list) > 1:
            extraneous_column_error = 'CSV columns "{}" were ignored on patient import process'.format(
                escaped_fields_text)
        else:
            extraneous_column_error = 'CSV column "{}" was ignored on patient import process'.format(
                escaped_fields_text)
        writer = csv.DictWriter(sheet, fieldnames=list(fields_map.keys()) + [error_field] + [extraneous_column_error])
    else:
        writer = csv.DictWriter(sheet, fieldnames=list(fields_map.keys()) + [error_field])
    writer.writeheader()

    for row in reader:
        patient = {}
        one_of_three_phone = []
        count += 1
        error = None

        for key, value in row.items():
            field = fields_map.get(key)
            if field is None:
                continue
            row_found = True
            value = value.lower()
            if absent_column_list:
                if len(absent_column_list) > 1:
                    error = '"{}" fields are required and cannot be empty'.format(", ".join(absent_column_list))
                else:
                    error = '"{}" field is required and cannot be empty'.format(list(absent_column_list)[0])
                err_count -= 1
                break
            if field in required_field_names and not value:
                error = '{} field is required and cannot be empty'.format(key)
                break

            if field == 'birth_date':
                value = clean_date(value)
                if value is None:
                    error = 'Invalid date format'
                    break

            if field == 'email':
                if value:
                    if value in not_available_email:
                        error = 'All email addresses must be unique. Please use alternate email address.'
                        break
                    else:
                        current_email = value

            if field == 'preferred_communication':
                if value:
                    communication_id = [pc[0] for pc in Patient.PREFERRED_COMMUNICATION
                                        if pc[1].lower() == value.lower()]
                    if communication_id:
                        value = communication_id[0]
                    else:
                        error = 'Preferred communication field has incorrect value'

            if field == 'sex':
                sex_id = [s[0] for s in Patient.SEX if s[1].lower() == value.lower()]
                if sex_id:
                    value = sex_id[0]
                else:
                    error = 'Sex field has incorrect value'

            if field == 'ssn':
                if not re.match(r'^\d{3}-\d{2}-\d{4}$', value):
                    error = 'Enter a valid SSN field. This value should have format XXX-XX-XXXX'
            if field in ["mobile_phone", "home_phone", "work_phone"]:
                if value:
                    if not re.match(r'^\(\d{3}\) \d{3}-\d{4}$', value):
                        error = '{} field has incorrect value. ' \
                                'This value should have format "(XXX) XXX-XXXX"'.format(key)
                    else:
                        one_of_three_phone.append(True)
                        value = ''.join([str(s) for s in value if s.isdigit()])
                        patient['phone_number'] = value
                else:
                    one_of_three_phone.append(False)
                if len(one_of_three_phone) == 3 and not any(one_of_three_phone):
                    error = 'One of "mobile_phone", "home_phone", "work_phone" fields is required'
            patient[field] = value

        if error is None:

            def patient_is_same(exist_patient, new_patient):
                field_to_check = ['first_name', 'middle_name', 'last_name', 'birth_date']
                same_field_counter = 0
                for field in field_to_check:
                    if exist_patient.get(field) == new_patient.get(field):
                        same_field_counter += 1
                return same_field_counter == len(field_to_check)

            duplicate = [p for p in remote_clinic_patients if patient_is_same(p, patient)]

            if duplicate:
                error = 'Duplicate Entry'

        if error is None and patient:
            patient.update(hospital=request.user.hospital)
            remote_serializer = CreateRemotePatientSerializer(data=patient)
            if not remote_serializer.is_valid():
                error = remote_serializer.errors
            local_serializer = PatientSerializer(data=patient)
            if not local_serializer.is_valid():
                error = local_serializer.errors

        if error:
            err_count += 1
            result_row = {f: row.get(f) for f in row if f in fields_map.keys()}
            result_row.update({error_field: error})
            writer.writerow(result_row)
            continue

        if patient:
            add_count += 1
            patients.append(patient)
            not_available_email.append(current_email)

    if extraneous_column_list:
        err_count += 1

    if absent_column_list:
        err_count += 1

    if not row_found:
        writer.writerow({error_field: '"{}" columns are required'.format(", ".join(required_field_names))})

    return {
        'patients': patients,
        'processed': count,
        'added': add_count,
        'errors': err_count,
        'sheet': sheet
    }


def parse_doctor_csv(csv_file, remote_clinic_doctors, request):
    """
    Expected file format:
    Header:
        Email, First Name, Middle Name, Last Name, Job, Prefix, Suffix, Preferred Name, Phone, Cell, Pager, Fax,
        Hospital Department, Hospital Role, Date of Birth, DEA #, User ID #, NPI #, State License #.

    Rows:
        some@email.com, FirstN, MiddleN, 123456, LastName, Job, Prefix, Suffix, 'Somename', 1234567890, 1234567890,
        1234567890, 1234567890, 'some_department', some_role, 12/25/1955, 15235252, 123123, 12421412, 236366423.
    ...

    """
    from accounts.models import Doctor, HospitalRole, HospitalDepartment
    from api.v1.accounts_serializer import CreateRemoteDoctorSerializer, DoctorCreateOrUpdateSerializer

    idr_doctors = Doctor.objects.filter(hospital=request.user.hospital).values()
    current_clinic_doctors = map_remote_records(idr_doctors, remote_clinic_doctors)

    fields_map = OrderedDict([

        ('Email', 'email'),

        ('First Name', 'first_name'),
        ('Middle Name', 'middle_name'),
        ('Last Name', 'last_name'),

        ('Job', 'title'),
        ('Prefix', 'prefix'),
        ('Suffix', 'suffix'),
        ('Preferred Name', 'preferred_name'),

        ('Phone', 'phone'),
        ('Cell', 'cell'),
        ('Pager', 'pager'),
        ('Fax', 'fax'),

        ('Hospital Department', 'hospital_department'),
        ('Hospital Role', 'hospital_role'),
        ('Date of Birth', 'birthday'),
        ('DEA #', 'dea_number'),
        ('User ID #', 'user_id'),
        ('NPI #', 'npi_number'),
        ('State License #', 'state_license'),

    ])

    error_field = 'Error Reason Code'
    required_field_names = ['First Name', 'Last Name', 'Job', 'Phone', 'Date of Birth', 'Email', 'Hospital Department',
                            'Hospital Role']
    doctors = []
    row_found = None
    current_username = None
    username_list = []
    email_list = []
    current_email = None
    count = 0
    err_count = 0
    add_count = 0
    sheet = StringIO()
    reader = csv.DictReader(codecs.iterdecode(csv_file, 'utf-8'))

    # check unique username and emails
    def get_email_and_username(key, value):
        if key == 'Email':
            email_list.append(value)
            username_list.append(value[:30])

    [get_email_and_username(k, v) for row in reader for k, v in row.items()]
    not_available_email = get_unavailable_email(email_list, request) or []
    not_available_username = get_unavailable_username(username_list, request) or []

    hospital = request.user.hospital
    hospital_department_list = HospitalDepartment.objects.filter(hospital=hospital).values('title', 'id')
    hospital_role_list = HospitalRole.objects.filter(hospital=hospital).values('title', 'id')

    # re-read csv
    reader = csv.DictReader(codecs.iterdecode(csv_file, 'utf-8'))
    # check extraneous field in csv
    extraneous_column_list = set(reader.fieldnames).difference(fields_map.keys())
    absent_column_list = set(required_field_names).difference(reader.fieldnames)
    if extraneous_column_list:
        escaped_fields_text = ", ".join(extraneous_column_list)
        if len(extraneous_column_list) > 1:
            extraneous_column_error = 'CSV columns "{}" were ignored on patient import process'.format(
                escaped_fields_text)
        else:
            extraneous_column_error = 'CSV column "{}" was ignored on patient import process'.format(
                escaped_fields_text)
        writer = csv.DictWriter(sheet, fieldnames=list(fields_map.keys()) + [error_field] + [extraneous_column_error])
    else:
        writer = csv.DictWriter(sheet, fieldnames=list(fields_map.keys()) + [error_field])
    writer.writeheader()
    for row in reader:
        doctor = {}
        count += 1
        error = None

        for key, value in row.items():
            field = fields_map.get(key)
            if field is None:
                continue
            row_found = True
            value = value.title()
            if absent_column_list:
                if len(absent_column_list) > 1:
                    error = '"{}" fields are required and cannot be empty'.format(", ".join(absent_column_list))
                else:
                    error = '"{}" field is required and cannot be empty'.format(list(absent_column_list)[0])
                err_count -= 1
                break
            if key in required_field_names and not value:
                error = '{} field is required and cannot be empty'.format(key)
                break
            if field == 'birthday':
                value = clean_date(value)
                if value is None:
                    error = 'Invalid date format'
                    break
            if field == 'email':
                value = value.lower()
                if value in not_available_email:
                    error = 'All email addresses must be unique. Please use alternate email address.'
                    break
                else:
                    current_email = value
                    current_username = generate_doctor_login(value, request, not_available_username)
                    doctor['username'] = current_username
            if field == 'hospital_role':
                role_id = [role.get('id') for role in hospital_role_list if role.get('title').lower() == value.lower()]
                if role_id:
                    value = role_id[0]
                else:
                    error = 'Hospital Role field has incorrect value'

            if field == 'hospital_department':
                department_id = [dep.get('id') for dep in hospital_department_list if
                                 dep.get('title').lower() == value.lower()]
                if department_id:
                    value = department_id[0]
                else:
                    error = 'Hospital Department field has incorrect value'

            if field in ["phone", "cell", "pager", "fax"]:
                if value:
                    if not re.match(r'^\(\d{3}\) \d{3}-\d{4}$', value):
                        error = '{} field has incorrect value. ' \
                                'This value should have format "(XXX) XXX-XXXX"'.format(key)
                    else:
                        value = ''.join([str(s) for s in value if s.isdigit()])

            doctor[field] = value

        if error is None:

            def doctor_is_same(exist_doctor, new_doctor):
                field_to_check = ['first_name', 'middle_name', 'last_name', 'birth_date']
                same_field_counter = 0
                for field in field_to_check:
                    if exist_doctor.get(field) == new_doctor.get(field):
                        same_field_counter += 1
                return same_field_counter == len(field_to_check)

            duplicate = [d for d in current_clinic_doctors if doctor_is_same(d, doctor)]

            if duplicate:
                error = 'Duplicate Entry'

        if error is None and doctor:
            doctor.update(hospital=request.user.hospital.pk, password=Doctor.objects.make_random_password())
            remote_serializer = CreateRemoteDoctorSerializer(data=doctor)
            if not remote_serializer.is_valid():
                error = remote_serializer.errors
            local_serializer = DoctorCreateOrUpdateSerializer(data=doctor)
            if not local_serializer.is_valid():
                error = local_serializer.errors

        if error:
            err_count += 1
            result_row = {f: row.get(f) for f in row if f in fields_map.keys()}
            result_row.update({error_field: error})
            writer.writerow(result_row)
            continue

        if doctor:
            add_count += 1
            not_available_username.append(current_username)
            not_available_email.append(current_email)
            doctors.append(doctor)

    if extraneous_column_list:
        err_count += 1

    if absent_column_list:
        err_count += 1

    if not row_found:
        writer.writerow({error_field: '"{}" columns are required'.format(", ".join(required_field_names))})

    return {
        'doctors': doctors,
        'processed': count,
        'added': add_count,
        'errors': err_count,
        'sheet': sheet
    }


def refresh_doctors_cache(hospital):
    credentials = {
        "username": hospital.clinic_remote_admin_username,
        "password": hospital.clinic_remote_admin_password
    }
    response = requests.post(settings.IDR_AUTH_URL, data=credentials)
    if response.status_code != 200:
        return {"connection": "error"}
    hospital_cache = {"doctors": {}}
    token = response.json().get('token')
    response = requests.get(settings.IDR_AUTH_DOCTOR_URL, headers={'Authorization': 'Token ' + token})
    for remote_doctor in response.json():
        hospital_cache['doctors'].update({
            remote_doctor.get('id'): {
                "full_name": remote_doctor.get("first_name", "") + ' ' + remote_doctor.get("last_name", ""),
                "full_photo": remote_doctor.get("full_photo", "")
            }
        })
    cache.set('hospital_doctors_' + str(hospital.clinic_remote_id), hospital_cache, None)


def update_cached_doctor_data(doctor_remote_id, hospital, deleted=None):
    hospital_cache = cache.get('hospital_doctors_' + str(hospital.clinic_remote_id))
    if not hospital_cache:
        refresh_doctors_cache(hospital)
        return

    if deleted:
        hospital_cache['doctors'].pop(doctor_remote_id, None)
        cache.set('hospital_doctors_{}'.format(hospital.clinic_remote_id), hospital_cache, None)
        return

    credentials = {
        "username": hospital.clinic_remote_admin_username,
        "password": hospital.clinic_remote_admin_password
    }
    response = requests.post(settings.IDR_AUTH_URL, data=credentials)
    if response.status_code != 200:
        return {"connection": "error"}
    hospital_cache = {"doctors": {}}
    token = response.json().get('token')
    updated_remote_doctor = requests.get('{}{}'.format(settings.IDR_AUTH_DOCTOR_URL, doctor_remote_id),
                                         headers={'Authorization': 'Token ' + token}).json()
    hospital_cache['doctors'][updated_remote_doctor.get('id')] = {
            "full_name": '{} {}'.format(
                updated_remote_doctor.get("first_name", ""), updated_remote_doctor.get("last_name", "")),
            "full_photo": updated_remote_doctor.get("full_photo", "")
        }
    cache.set('hospital_doctors_{}'.format(hospital.clinic_remote_id), hospital_cache, None)


def get_doctors_cache(hospital):
    hospital_cache = cache.get('hospital_doctors_{}'.format(hospital.clinic_remote_id))
    if not hospital_cache:
        refresh_doctors_cache(hospital)
        hospital_cache = cache.get('hospital_doctors_{}'.format(hospital.clinic_remote_id))
    return hospital_cache


def reset_patients_cache(hospital):
    credentials = {
        "username": hospital.clinic_remote_admin_username,
        "password": hospital.clinic_remote_admin_password
    }
    response = requests.post(settings.IDR_AUTH_URL, data=credentials)
    if response.status_code != 200:
        return {"connection": "error"}
    hospital_cache = {"patients": {}}
    token = response.json().get('token')
    response = requests.get(settings.IDR_AUTH_PATIENT_URL, headers={'Authorization': 'Token ' + token})
    for remote_patient in response.json():
        hospital_cache['patients'].update({
            remote_patient.get('id'): {
                'email': remote_patient.get('email', ''),
                'first_name': remote_patient.get("first_name", ""),
                'last_name': remote_patient.get("last_name", ""),
                'middle_name': remote_patient.get('middle_name', ''),
                'mrn': remote_patient.get('mrn', ''),
                'birth_date': timezone.datetime.strptime(
                    remote_patient.get('birth_date'), settings.DATE_INPUT_FORMATS[1]
                ).date() if remote_patient.get('birth_date') else '',
                'city': remote_patient.get('city', '')
            }})
        cache.set('hospital_patients_' + str(hospital.clinic_remote_id), hospital_cache, None)


def get_patients_cache(hospital):
    hospital_cache = cache.get('hospital_patients_' + str(hospital.clinic_remote_id))
    if not hospital_cache:
        reset_patients_cache(hospital)
        hospital_cache = cache.get('hospital_patients_' + str(hospital.clinic_remote_id))
    return hospital_cache
