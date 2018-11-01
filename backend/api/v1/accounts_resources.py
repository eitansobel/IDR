import requests
import json

from django.conf import settings
from django.utils.translation import ugettext_lazy as _
from django.core.files.base import ContentFile
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from api.decorators import viewset_permissions
from collections import OrderedDict

from accounts.models import Doctor, AlertMethod, DoctorAlertSetting, Patient, Hospital, StuffList, PatientsList, \
    DoctorPatient, CsvImportLog
from accounts.utils import Locations, parse_doctor_csv, map_records_by_slug, parse_patient_csv
from api.v1.accounts_serializer import DoctorSerializer, PatientSerializer, CreateRemoteDoctorSerializer, \
    AlertMethodSerializer, HospitalStructureSerializer, DoctorCreateOrUpdateSerializer, StuffListSerializer, \
    UpdateRemoteDoctorSerializer, DoctorPermissionSerializer, CreateRemotePatientSerializer, PatientUpdateSerializer, \
    PatientsListSerializer, PatientsGetListSerializer, DoctorPatientUpdateSerializer, MyPatientsListUpdateSerializer, \
    CsvImportLogSerializer, PatientHeadersSerializer, PatientOrderSerializer, MyPatientListParticipantSerializer
from api.v1.permissions import AllowAnonCreate, HospitalAdminPermission, ActionsDoctorPermission, \
    ActionsPatientPermission, AllowPermission, MyselfPermission, DoctorPermission
from api.v1.authentication import get_authorization_header
from notifications.tasks import send_emails_by_notification_template
from notifications.models import NotificationTemplate, Chat
from accounts.utils import reset_patients_cache, get_patients_cache, update_cached_doctor_data
from accounts.tasks import async_refresh_doctors_cache


class DoctorViewSet(viewsets.ModelViewSet):
    """
    ## Create New Doctor

    URL: `/api/v1/doctor/`

    Method: `POST`

    Required Fields:

    * `username` (str)
    * `password` (str)
    * `first_name` (str)
    * `last_name` (str)
    * `title` (str)
    * `phone` (str)

    Optional Fields:

    * `middle_name` (str)
    * `prefix` (str)
    * `suffix` (str)
    * `preferred_name` (str)
    * `cell` (str)
    * `pager` (str)
    * `fax` (str)
    * `prefix` (str)
    * `suffix` (str)
    * `preferred_mode` (int)  1 - Phone, 2 - Cell, 3 - Pager, 4 - Fax, 5 - Email
    * `hospital_department` (int) id of Hospital Department instance
    * `hospital_role` (int) id of Hospital Role instance
    ---

    ## Update Doctor

    URL: `/api/v1/doctor/:remote_id/`

    Method: `PATCH`

    Optional Fields:

    * `first_name` (str)
    * `last_name` (str)
    * `title` (str)
    * `phone` (str)
    * `middle_name` (str)
    * `prefix` (str)
    * `suffix` (str)
    * `preferred_name` (str)
    * `cell` (str)
    * `pager` (str)
    * `fax` (str)
    * `prefix` (str)
    * `suffix` (str)
    * `preferred_mode` (int)  1 - Phone, 2 - Cell, 3 - Pager, 4 - Fax, 5 - Email
    * `hospital_department` (int) id of Hospital Department instance
    * `hospital_role` (int) id of Hospital Role instance
    * `alerts` (dict) { "alert1": int,  "alert2": int , "alert3": int,  "alert4": int} where int is AlertMethod id
    ---

    ## Delete (disable) Doctor

    URL: `/api/v1/doctor/:remote_id`

    Method: `DELETE`

    ---

    """
    model = Doctor

    queryset = Doctor.objects.all()
    permission_classes = (AllowAnonCreate,)
    lookup_field = 'remote_id'

    def get_queryset(self):
        filters = {
            'hospital': self.request.user.hospital,
        }
        return self.model.objects.filter(**filters)

    def get_serializer_class(self):
        if self.action == 'create' or self.action == 'partial_update':
            return DoctorCreateOrUpdateSerializer
        elif self.action == 'permissions':
            return DoctorPermissionSerializer
        elif self.action == 'set_patient_order':
            return PatientOrderSerializer
        return DoctorSerializer

    def create(self, request, *args, **kwargs):
        remote_serializer = CreateRemoteDoctorSerializer(data=request.data)
        remote_serializer.is_valid(raise_exception=True)
        request.data['remote_id'] = 0
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            if 'hospital' not in serializer.validated_data:
                if not request.user.is_authenticated:
                    msg = _('hospital is required field')
                    return Response({'validation': msg}, status=status.HTTP_400_BAD_REQUEST)
                elif request.user.hospital_role.remote_role != 1:
                    msg = _("you don't have permissions to create new user")
                    return Response({'authorization': msg}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    hospital = request.user.hospital
            else:
                try:
                    hospital = serializer.validated_data.get('hospital')
                except Hospital.DoesNotExist:
                    msg = _('Hospital with id %d not found' % serializer.data['hospital'])
                    return Response({'validation': msg}, status=status.HTTP_400_BAD_REQUEST)
            admin_credentials = {
                "username": hospital.clinic_remote_admin_username,
                "password": hospital.clinic_remote_admin_password
            }
            response = requests.post(settings.IDR_AUTH_URL, data=admin_credentials)
            if response.status_code != 200:
                msg = _('Unable to authenticate with create doctor credentials on IDR AUTH server.')
                return Response({'authorization': msg}, status=status.HTTP_400_BAD_REQUEST)
            data = response.json()
            token = data.get('token')
            check_email = requests.post(settings.IDR_AUTH_CHECK_EMAIL,
                                        data={'email': remote_serializer.data['email']},
                                        headers={'Authorization': 'Token ' + token}).json()
            if 'available' in check_email and not check_email['available']:
                return Response({"email": ["This field must be unique"]}, status=status.HTTP_400_BAD_REQUEST)
            request_data = remote_serializer.data
            request_data['role'] = 2
            request_data['username'] = request_data['username'].lower()
            response = requests.post(settings.IDR_AUTH_DOCTOR_URL,
                                     data=request_data,
                                     headers={'Authorization': 'Token ' + token}
                                     )
            if response.status_code != 201:
                return Response(json.loads(response.content.decode()), status=status.HTTP_400_BAD_REQUEST)

            data = response.json()
            remote_id = data.get('id')
            if not remote_id:
                msg = _('Got incorrect response data from IDR AUTH server on doctor creating')
                return Response({"authorization": msg}, status=status.HTTP_400_BAD_REQUEST)
            request.data['remote_id'] = remote_id
            request.data['username'] = data.get('username').lower()

            for admin in Doctor.objects.filter(hospital=hospital, hospital_role__remote_role=1, is_approved=True):
                email_context = {
                    'user': admin.username,
                    'domain_name': settings.IDR_DOMAIN_NAME,
                    'domain': settings.IDR_SITE_URL,
                }
                send_emails_by_notification_template.delay(
                    NotificationTemplate.NEW_USER_ADMIN_INFORM,
                    admin.email,
                    email_context
                )
            update_cached_doctor_data(doctor_remote_id=remote_id, hospital=hospital)
            return super(DoctorViewSet, self).create(request, *args, **kwargs)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        data_list = {
            "username": self.request.data.get('username').lower() if self.request.data.get(
                'username') else self.request.data.get('email'),
            "email": self.request.data.get('email'),
            "remote_id": self.request.data.get('remote_id')
        }
        if self.request.user.is_authenticated and self.request.user.hospital_role.remote_role == 1:
            data_list['is_approved'] = True
            serializer.validated_data['hospital'] = self.request.user.hospital
        if serializer.validated_data['hospital_role'].remote_role == 1:
            data_list['patient_permission'] = True
            data_list['doctor_permission'] = True
            data_list['create_data_cell_permission'] = True
            data_list['edit_data_cell_permission'] = True
            data_list['export_permission'] = True
        serializer.save(**data_list)

    @viewset_permissions(ActionsDoctorPermission)
    def destroy(self, request, *args, **kwargs):
        obj = self.get_object()
        credentials = {
            "username": obj.hospital.clinic_remote_admin_username,
            "password": obj.hospital.clinic_remote_admin_password
        }
        response = requests.post(settings.IDR_AUTH_URL, data=credentials)
        if response.status_code != 200:
            return 'fail'
        data = response.json()
        response = requests.get(url=settings.IDR_AUTH_DOCTOR_URL + str(obj.remote_id) + '/',
                                headers={'Authorization': 'Token ' + data.get('token')})
        email_context = {
            'user': response.json().get('first_name') + ' ' + response.json().get('last_name'),
            'domain_name': settings.IDR_DOMAIN_NAME,
            'domain': settings.IDR_SITE_URL,
        }
        send_emails_by_notification_template.delay(
            NotificationTemplate.DECLINE_REGISTRATION,
            obj.email,
            email_context
        )
        response = requests.delete('{}{}/'.format(settings.IDR_AUTH_DOCTOR_URL, kwargs.get('remote_id')),
                                   headers={'Authorization': get_authorization_header(request)}
                                   )
        if response.status_code != 204:
            return Response(response.content, status=status.HTTP_400_BAD_REQUEST)
        update_cached_doctor_data(doctor_remote_id=obj.remote_id, hospital=obj.hospital, deleted=True)
        return super(DoctorViewSet, self).destroy(request, *args, **kwargs)

    @viewset_permissions(ActionsDoctorPermission)
    def update(self, request, *args, **kwargs):
        if self.request.query_params.get('alert_update') and 'alerts' in request.data:
            doctor = self.get_object()
            if not hasattr(doctor, 'alert_settings'):
                DoctorAlertSetting.objects.create(doctor=doctor)
            doctor_alerts = doctor.alert_settings
            alerts = request.data.get('alerts')
            for alert in ['alert1', 'alert2', 'alert3', 'alert4']:
                if alert in alerts and isinstance(alerts.get(alert), int):
                    try:
                        method = AlertMethod.objects.get(pk=alerts.get(alert), doctor=doctor)
                        setattr(doctor_alerts, alert, method)
                        method.save()
                    except AlertMethod.DoesNotExist:
                        msg = _('Got incorrect alertmethod id - ' + str(alerts.get(alert)))
                        return Response({"not_found": msg}, status=status.HTTP_400_BAD_REQUEST)
                if alert in alerts and alerts.get(alert) is None:
                    setattr(doctor_alerts, alert, None)
            doctor_alerts.save()
        else:
            admin_credentials = {
                "username": request.user.hospital.clinic_remote_admin_username,
                "password": request.user.hospital.clinic_remote_admin_password
            }
            remote_update = UpdateRemoteDoctorSerializer(data=request.data)
            if remote_update.is_valid(raise_exception=True):
                response = requests.post(settings.IDR_AUTH_URL, data=admin_credentials)
                if response.status_code != 200:
                    msg = _('Unable to authenticate with create doctor credentials on IDR AUTH server.')
                    return Response({'authorization': msg}, status=status.HTTP_400_BAD_REQUEST)
                data = response.json()
                token = data.get('token')
                response = requests.get(settings.IDR_AUTH_DOCTOR_URL + kwargs['remote_id'] + '/',
                                        headers={'Authorization': 'Token ' + token})
                if 'email' in remote_update.data and remote_update.data['email'] != response.json()['email']:
                    check_email = requests.post(settings.IDR_AUTH_CHECK_EMAIL,
                                                data={'email': remote_update.data['email']},
                                                headers={'Authorization': 'Token ' + token}).json()
                    if 'available' in check_email and not check_email['available']:
                        return Response({"email": ["This field must be unique"]}, status=status.HTTP_400_BAD_REQUEST)
                response = requests.patch(settings.IDR_AUTH_DOCTOR_URL + kwargs['remote_id'] + '/',
                                          data=remote_update.data,
                                          headers={'Authorization': 'Token ' + token}
                                          )
                if response.status_code != 200:
                    return Response(response.json(), status=status.HTTP_400_BAD_REQUEST)
                data = response.json()
                remote_id = data.get('id')
                obj = self.get_object()
                update_cached_doctor_data(doctor_remote_id=remote_id, hospital=obj.hospital)
                if not remote_id:
                    msg = _('Got incorrect response data from IDR AUTH server on doctor updating')
                    return Response({"authorization": msg}, status=status.HTTP_400_BAD_REQUEST)
        return super(DoctorViewSet, self).update(request, *args, **kwargs)

    @action(detail=True, methods=['POST', ])
    @viewset_permissions(HospitalAdminPermission)
    def set_approved(self, request, remote_id):
        """
        api endpoint to approve doctor (only admin)

        url: /api/v1/doctor/:pk/set_approved/

        method: post

        """
        obj = self.get_object()
        obj.is_approved = True
        obj.save()
        response = requests.get(url=settings.IDR_AUTH_DOCTOR_URL + remote_id + '/',
                                headers={'Authorization': request.META['HTTP_AUTHORIZATION']})
        email_context = {
            'user': response.json().get('first_name') + ' ' + response.json().get('last_name'),
            'domain_name': settings.IDR_DOMAIN_NAME,
            'domain': settings.IDR_SITE_URL,
        }
        send_emails_by_notification_template.delay(
            NotificationTemplate.APPROVE_REGISTRATION, obj.email, email_context
        )
        serializer = self.get_serializer(obj)
        return Response(serializer.data)

    @action(detail=True, methods=['GET', 'POST'])
    @viewset_permissions(AllowPermission)
    def permissions(self, request, remote_id):
        """
        api endpoint to change/get permissions
        get (get permissions) (admin or yourself)
         - No fields
        post (change permissions) (only admin)
        optional fields:
         'patient_permission' - boolean
         'doctor_permission' - boolean
         'create_data_cell_permission' - boolean
         'edit_data_cell_permission' - boolean
         'export_permission' - boolean
        url: /api/v1/doctor/:pk/permissions/
        """
        self.queryset = Doctor.objects.filter(hospital=request.user.hospital)
        obj = self.get_object()
        if request.method == 'POST':
            if obj.hospital_role.remote_role == 1:
                return Response({'permissions': "changing admin permissions denied"})
            serializer = self.get_serializer(obj, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            if not obj.is_approved:
                response = requests.get(url=settings.IDR_AUTH_DOCTOR_URL + remote_id + '/',
                                        headers={'Authorization': request.META['HTTP_AUTHORIZATION']})
                email_context = {
                    'user': response.json().get('first_name') + ' ' + response.json().get('last_name'),
                    'domain_name': settings.IDR_DOMAIN_NAME,
                    'domain': settings.IDR_SITE_URL,
                }
                send_emails_by_notification_template.delay(
                    NotificationTemplate.APPROVE_REGISTRATION, obj.email, email_context
                )
            obj.is_approved = True
            obj.save()
            return Response(serializer.data)
        if request.method == 'GET':
            serializer = self.get_serializer(obj)
            return Response(serializer.data)

    @action(detail=True, methods=['POST', ])
    @viewset_permissions(MyselfPermission)
    def my_patients(self, request, remote_id):
        """
                api endpoint to set patients in 'my patients' list
                post
                required fields:
                 'my_patients_list_participants' - list of remote_id of patients
                url: /api/v1/doctor/:pk/my_patients/
                """
        obj = self.get_object()
        serializer = MyPatientsListUpdateSerializer(data=request.data, context={'hospital': obj.hospital})
        serializer.is_valid(raise_exception=True)
        DoctorPatient.objects.bulk_create(
            [DoctorPatient(doctor=request.user, patient=patient) for patient in
             serializer.validated_data.get('my_patients_list_participants') if
             patient.remote_id not in
             DoctorPatient.objects.filter(
                 doctor=request.user,
                 patient__remote_id__in=serializer.data.get(
                     'my_patients_list_participants')).values_list('patient__remote_id', flat=True)
             ])
        obj.my_patients_list_participants.set(list(
            DoctorPatient.objects.filter(doctor=request.user,
                                         patient__remote_id__in=serializer.data.get(
                                             'my_patients_list_participants'))))
        response = {
            "my_patients_list_participants": MyPatientListParticipantSerializer(
                obj.my_patients_list_participants.all(), many=True).data
        }
        return Response(response)

    @action(detail=False, methods=['POST'])
    @viewset_permissions(ActionsDoctorPermission)
    def import_csv(self, request):
        response = requests.get(settings.IDR_AUTH_DOCTOR_URL,
                                headers={'Authorization': get_authorization_header(request)}
                                )
        if response.status_code != 200:
            return Response(response.content, status=status.HTTP_400_BAD_REQUEST)

        current_clinic_doctors = response.json()
        res = parse_doctor_csv(request.FILES['file'], current_clinic_doctors, self.request)
        doctors = res.pop('doctors')
        if doctors:
            remote_serializer = CreateRemoteDoctorSerializer(data=doctors, many=True)
            if remote_serializer.is_valid(raise_exception=True):
                response = requests.post(
                    '{}{}/create_from_list/'.format(settings.IDR_AUTH_DOCTOR_URL, request.user.remote_id),
                    data=json.dumps({"doctor_list": remote_serializer.data}),
                    headers={'Authorization': get_authorization_header(request),
                             'Content-Type': 'application/json'}
                )
                if response.status_code != 201:
                    return Response(response.content, status=status.HTTP_400_BAD_REQUEST)

                remote_data = response.json()
                for doctor in remote_data:
                    doctor['remote_id'] = doctor.pop('id')

                doctors = map_records_by_slug(doctors, remote_data, 'username')
                for doctor in doctors:
                    serializer = DoctorCreateOrUpdateSerializer(data=doctor)
                    if serializer.is_valid(raise_exception=True):
                        serializer.save(
                            remote_id=doctor.get('remote_id'),
                            username=doctor.get('username'),
                            is_approved=True,
                            patient_permission=False,
                            doctor_permission=False,
                            create_data_cell_permission=False,
                            edit_data_cell_permission=False,
                            export_permission=False
                        )
                        email_context = {
                            'admin': request.user.get_full_name(),
                            'domain_name': settings.IDR_DOMAIN_NAME,
                            'site_url': settings.IDR_SITE_URL,
                            'password': doctor.get('password'),
                            'user': '{} {}'.format(doctor.get('first_name'), doctor.get('last_name')).strip()
                        }

                        send_emails_by_notification_template.delay(
                            NotificationTemplate.NEW_USER_ACCOUNT_IS_READY,
                            doctor.get('email'),
                            email_context
                        )
                async_refresh_doctors_cache.delay(self.request.user.hospital.id)
        sheet = res.pop('sheet')
        sheet.seek(0)
        patient_import = CsvImportLog(author=request.user, import_type=2, **res)
        patient_import.sheet.save('sheet.csv', ContentFile(sheet.read()))
        patient_import.save()

        return Response(CsvImportLogSerializer(instance=patient_import).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['POST'])
    @viewset_permissions(MyselfPermission)
    def set_patient_order(self, request, remote_id):
        doctor = self.get_object()
        serializer = self.get_serializer(doctor, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    @viewset_permissions(DoctorPermission)
    def invalidate_doctor_cache(self, request, remote_id):
        doctor = self.get_object()
        update_cached_doctor_data(doctor_remote_id=doctor.remote_id, hospital=doctor.hospital)
        return Response(status=status.HTTP_200_OK)


class StuffListViewSet(viewsets.ModelViewSet):
    """
    Endpoint to CRUD stuff lists
    ## Create new stuff list
    Method: POST
    Url: /api/v1/stufflist/
    Required Fields:
        * `participants` (list with remote_id of doctors)
        * `title` (str)
    ---

    ## Update stuff list
    Method: PATCH
    Url: /api/v1/stufflist/:id/
    Optional Fields:
        * `participants` (list with remote_id of doctors)
        * `title` (str)
    ---

    ## Get all lists
    Method: GET
    Url: /api/v1/stufflist/
    ---

    ## Get info about one list
    Method: - GET
    Url: /api/v1/stufflist/:id/
    ---

    ## Delete list
    Method: DELETE
    Url: /api/v1/stufflist/:id/
    """
    model = StuffList
    queryset = StuffList.objects.all()
    serializer_class = StuffListSerializer

    def get_queryset(self):
        filters = {
            'hospital': self.request.user.hospital,
        }
        if self.request.user.hospital_role.remote_role != 1:
            filters['participants__in'] = [self.request.user]

        return StuffList.objects.filter(**filters)

    @viewset_permissions(HospitalAdminPermission)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid() and StuffList.objects.filter(hospital=self.request.user.hospital,
                                                              title=serializer.validated_data['title']).exists():
            return Response({"title": ["This field must be unique"]}, status=status.HTTP_400_BAD_REQUEST)
        return super(StuffListViewSet, self).create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(hospital=self.request.user.hospital)

    @viewset_permissions(HospitalAdminPermission)
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
        obj = self.get_object()
        if serializer.is_valid() and obj.title != serializer.validated_data.get('title') and self.get_queryset().filter(
                title=serializer.validated_data['title']).exists():
            return Response({"title": ["This field must be unique"]}, status=status.HTTP_400_BAD_REQUEST)
        return super(StuffListViewSet, self).update(request, *args, **kwargs)

    def list(self, request, *args, **kwargs):
        response = super(StuffListViewSet, self).list(request, *args, *kwargs)
        default_lists = OrderedDict({"default":
                                         {"all_users":
                                              {"participants": [doc.remote_id for doc in
                                                                Doctor.objects.filter(
                                                                    hospital=request.user.hospital,
                                                                    is_approved=True)]
                                               },
                                          }
                                     })
        if request.user.hospital_role.remote_role == 1:
            default_lists['default']["pended_users"] = {"participants": [doc.remote_id for doc in
                                                                         Doctor.objects.filter(
                                                                             hospital=request.user.hospital,
                                                                             is_approved=False)]}
        response.data.append(default_lists)
        return response

    @action(methods=['post'], detail=True)
    def delete_myself(self, request, pk):
        """
            api endpoint to delete doctor (from request) from list
            method -  POST
            url: /api/v1/stufflist/:pk/delete_myself/
        """
        obj = self.get_object()
        if request.user in obj.participants.all():
            obj.participants.set(obj.participants.exclude(remote_id=request.user.remote_id))
            obj.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_404_NOT_FOUND)


class PatientListViewSet(viewsets.ModelViewSet):
    """
    Endpoint to CRUD patient lists
    ## Create new patient list
    Method: POST
    Url: /api/v1/patientlist/
    Required Fields:
        * `participants` (list with remote_id of patients)
        * `title` (str)
    ---

    ## Update stuff list
    Method: PATCH
    Url: /api/v1/patientlist/:id/
    Optional Fields:
        * `participants` (list with remote_id of patients)
        * `title` (str)
    ---

    ## Get all lists
    Method: GET
    Url: /api/v1/patientlist/
    ---

    ## Get info about one list
    Method: - GET
    Url: /api/v1/patientlist/:id/
    ---

    ## Delete list
    Method: DELETE
    Url: /api/v1/patientlist/:id/
    """
    model = PatientsList
    queryset = PatientsList.objects.all()
    serializer_class = PatientsListSerializer

    def get_queryset(self):
        filters = {
            'hospital': self.request.user.hospital,
        }
        return PatientsList.objects.filter(**filters)

    @viewset_permissions(HospitalAdminPermission)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid() and self.get_queryset().filter(title=serializer.validated_data['title']).exists():
            return Response({"title": ["This field must be unique"]}, status=status.HTTP_400_BAD_REQUEST)
        return super(PatientListViewSet, self).create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(hospital=self.request.user.hospital)

    @viewset_permissions(HospitalAdminPermission)
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
        obj = self.get_object()
        if serializer.is_valid() and obj.title != serializer.validated_data.get('title') and self.get_queryset().filter(
                title=serializer.validated_data['title']).exists():
            return Response({"title": ["This field must be unique"]}, status=status.HTTP_400_BAD_REQUEST)
        response = super(PatientListViewSet, self).update(request, *args, **kwargs)
        response.data['participants'] = PatientSerializer(
            Patient.objects.filter(remote_id__in=response.data['participants']), many=True).data
        return response

    def list(self, request, *args, **kwargs):
        self.serializer_class = PatientsGetListSerializer
        response = super(PatientListViewSet, self).list(request, *args, *kwargs)
        all_patients = PatientSerializer(Patient.objects.filter(hospital=request.user.hospital),
                                         many=True)
        response.data.append({"all_patients": all_patients.data})
        return response

    @action(methods=['post'], detail=True)
    def delete_myself(self, request, pk):
        obj = self.get_object()
        if request.user in obj.participants.all():
            obj.participants.set(obj.participants.exclude(remote_id=request.user.remote_id))
            obj.save()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_404_NOT_FOUND)


class AlertMethodViewSet(viewsets.ModelViewSet):
    """
    ## Create New Alert Method

    URL: `/api/v1/alertmethod/`

    Method: `POST`

    Required Fields:

    * `alert_type` (int) 1 - Phone, 2 - Cell, 3 - Pager, 4 - Fax, 5 - Email
    * `title` (str) max_length=50
    * `value` (str)  max_length=128
    * 'index_number' (int) 1-4 ordering in history list (first, second, third, forth)

    ## Update Alert Method

    URL: `/api/v1/alertmethod/:id/`

    Method: `PATCH`

    Optional Fields:

    * `alert_type` (int) 1 - Phone, 2 - Cell, 3 - Pager, 4 - Fax, 5 - Email
    * `title` (str) max_length=50
    * `value` (str)  max_length=128
    * 'index_number' (int) 1-4 ordering in history list (first, second, third, forth)
    ---

    ## Delete (disable) Alert Method

    URL: `/api/v1/alertmethod/:id`

    Method: `DELETE`

    ---
    """

    serializer_class = AlertMethodSerializer
    queryset = AlertMethod.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid() and AlertMethod.objects.filter(doctor=self.request.user,
                                                                title=serializer.validated_data['title']).exists():
            return Response({"title": ["This field must be unique"]}, status=status.HTTP_400_BAD_REQUEST)
        return super(AlertMethodViewSet, self).create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=True)
        obj = self.get_object()
        if serializer.is_valid() and 'title' in serializer.validated_data and \
                obj.title != serializer.validated_data['title'] and \
                AlertMethod.objects.filter(doctor=self.request.user, title=serializer.validated_data['title']).exists():
            return Response({"title": ["This field must be unique"]}, status=status.HTTP_400_BAD_REQUEST)
        return super(AlertMethodViewSet, self).update(request, *args, **kwargs)

    def get_queryset(self):
        return AlertMethod.objects.filter(doctor=self.request.user)

    def perform_create(self, serializer):
        serializer.save(doctor=self.request.user)


class HospitalStructureViewSet(viewsets.ModelViewSet):
    """
    ## Get Hospitals Roles and Departments

    URL: `/api/v1/hospitalstructure/`

    Method: `GET`

    ## Get Hospital Roles and Departments

    URL: `/api/v1/hospitalstructure/:id/`

    Method: `GET`

    ---
    """
    allowed_methods = ('GET',)
    serializer_class = HospitalStructureSerializer
    queryset = Hospital.objects.all()
    permission_classes = (AllowAny,)


class PatientViewSet(viewsets.ModelViewSet):
    """
    Endpoint to CRUD patient
    ## Create new patient
    Method: POST
    Url: /api/v1/patient/
    Required Fields:
        * "first_name" (str)
        * "last_name" (str),
        * "email" (str),
        * "mrn" (str),
        * "birth_date" date, format (YYYY-MM-DD)",
        * "mobile_phone" (str),     One of three fields is required
        * "home_phone" (str),
        * "work_phone" (str),
        * "ssn" (str) format (XXX-XX-XXXX) where X - is number,
        * "country" (str),
        * "state" (str),
        * "city" (str),
        * "address1" (str),
        * "sex" (int) 1 - Female, 2 - Male, 3 - Unknown,
        * "zip_code" (str)
    Optional fields:
        * "prefix" (str),
        * "middle_name" (str),
        * "previous_last_name" (str),
        * "mother_maiden_name" (str),
        * "suffix" (str),
        * "preferred_name" (str),
        * "preferred_language" (str),
        * "ethnicity" (str),
        * "preferred_communication" (int) 1, 2, 3, 4,
        * "preferred_pharmacy" (str),
        * "pcp" (str),
        * "address2" (str),
        * "address3" (str),
        * "primary_payor" (str),
        * "secondary_payor" (str),
        * "room" (int)

        * "emergency_contacts" (list with required fields):
        Required fields:
            * "first_name" (str),
            * "last_name" (str),
            * "relation_to_patient" (str),
            * "mobile_phone" (str),   One of three fields is required
            * "home_phone" (str),
            * "work_phone" (str),
        Optional fields:

            * "country" (str),
            * "state" (str),
            * "city" (str),
            * "address1" (str),
            * "address2" (str),
            * "address3" (str),
            * "zip_code" (str),
            * "next_of_kin" (boolean)
        * "guarantors" (list with required fields):
        Required fields:
            * "first_name" (str),
            * "last_name" (str),
            * "sex" (int) 1 - Female, 2 - Male, 3 - Unknown,
            * "relation_to_patient" (str),
            * "birth_date" date, format (YYYY-MM-DD)
            * "mobile_phone" (str),   One of three fields is required
            * "home_phone" (str),
            * "work_phone" (str)
        Optional fields:
            * "middle_name" (str),
            * "ssn" str, format (XXX-XX-XXXX) where X - is number,
            * "country" (str) ,
            * "state" (str),
            * "city" (str),
            * "address1" (str),
            * "address2" (str),
            * "address3" (str),
            * "zip_code" (str),
            * "employer" (str),
    ---

    ## Update patient
    Method: PATCH
    Url: /api/v1/patient/:id/
    Optional fields:
        * "first_name" (str)
        * "last_name" (str),
        * "email" (str),
        * "mrn" (str),
        * "birth_date" date, format (YYYY-MM-DD)",
        * "mobile_phone" (str),     One of three fields is required
        * "home_phone" (str),
        * "work_phone" (str),
        * "ssn" (str) format (XXX-XX-XXXX) where X - is number,
        * "country" (str),
        * "state" (str),
        * "city" (str),
        * "address1" (str),
        * "sex" (int) 1 - Female, 2 - Male, 3 - Unknown,
        * "zip_code" (str)
        * "prefix" (str),
        * "middle_name" (str),
        * "previous_last_name" (str),
        * "mother_maiden_name" (str),
        * "suffix" (str),
        * "preferred_name" (str),
        * "preferred_language" (str),
        * "ethnicity" (str),
        * "preferred_communication" (int) 1, 2, 3, 4,
        * "preferred_pharmacy" (str),
        * "pcp" (str),
        * "address2" (str),
        * "address3" (str),
        * "primary_payor" (str),
        * "secondary_payor" (str),
        * "room" (int)

        * "emergency_contacts" (list):
        Optional fields:
            * "first_name" (str),
            * "last_name" (str),
            * "relation_to_patient" (str),
            * "mobile_phone" (str),   One of three fields is required
            * "home_phone" (str),
            * "work_phone" (str),
            * "country" (str),
            * "state" (str),
            * "city" (str),
            * "address1" (str),
            * "address2" (str),
            * "address3" (str),
            * "zip_code" (str),
            * "next_of_kin" (boolean)
        * "guarantors" (list with required fields):
        Optional fields:
            * "first_name" (str),
            * "last_name" (str),
            * "sex" (int) 1 - Female, 2 - Male, 3 - Unknown,
            * "relation_to_patient" (str),
            * "birth_date" date, format (YYYY-MM-DD)
            * "mobile_phone" (str),   One of three fields is required
            * "home_phone" (str),
            * "work_phone" (str)
            * "middle_name" (str),
            * "ssn" str, format (XXX-XX-XXXX) where X - is number,
            * "country" (str) ,
            * "state" (str),
            * "city" (str),
            * "address1" (str),
            * "address2" (str),
            * "address3" (str),
            * "zip_code" (str),
            * "employer" (str)
    ---

    ## Get all patients
    Method: GET
    Url: /api/v1/patient/
    ---

    ## Get info about one patient
    Method: - GET
    Url: /api/v1/patient/:id/
    ---

    ## Delete patient
    Method: DELETE
    Url: /api/v1/patient/:id/
    """
    model = Patient
    queryset = Patient.objects.all()
    lookup_field = 'remote_id'

    def get_serializer_class(self):
        if self.action == 'partial_update':
            return PatientUpdateSerializer
        return PatientSerializer

    @viewset_permissions(ActionsPatientPermission)
    def create(self, request, *args, **kwargs):
        remote_serializer = CreateRemotePatientSerializer(data=request.data)
        remote_serializer.is_valid(raise_exception=True)
        request.data['remote_id'] = 0
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            response = requests.post(settings.IDR_AUTH_PATIENT_URL,
                                     data=remote_serializer.data,
                                     headers={'Authorization': get_authorization_header(request)}
                                     )
            if response.status_code != 201:
                return Response(response.content, status=status.HTTP_400_BAD_REQUEST)

            remote_data = response.json()
            remote_id = remote_data.get('id')
            if not remote_id:
                msg = _('Got incorrect response data from IDR AUTH server on doctor creating')
                return Response({"authorization": msg}, status=status.HTTP_400_BAD_REQUEST)

            # we update request.data for perform_create
            reset_patients_cache(hospital=request.user.hospital)
            request.data['remote_id'] = remote_id
            return super(PatientViewSet, self).create(request, *args, **kwargs)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(remote_id=self.request.data.get('remote_id'), hospital=self.request.user.hospital)

    @viewset_permissions(ActionsPatientPermission)
    def update(self, request, *args, **kwargs):
        remote_serializer = CreateRemotePatientSerializer(data=request.data)
        remote_serializer.is_valid(raise_exception=True)
        obj = self.get_object()
        credentials = {
            "username": obj.hospital.clinic_remote_admin_username,
            "password": obj.hospital.clinic_remote_admin_password
        }
        response = requests.post(settings.IDR_AUTH_URL, data=credentials)
        if response.status_code != 200:
            return Response("Authorization fail", status=status.HTTP_400_BAD_REQUEST)
        data = response.json()
        requests.patch(url=settings.IDR_AUTH_PATIENT_URL + str(obj.remote_id) + '/',
                       headers={'Authorization': 'Token ' + data.get('token')},
                       data=remote_serializer.data)
        reset_patients_cache(hospital=request.user.hospital)
        patient_data = get_patients_cache(hospital=obj.hospital).get('patients', {}).get(obj.remote_id, {})
        patient_name = patient_data.get('first_name', '') + ' ' + patient_data.get('last_name', ' ')
        Chat.objects.filter(patient=obj).update(
            patient_name=patient_name)
        # TODO: uncomment location
        # if 'state' in request.data:
        #     obj.state = Locations.get_state_name_by_code(request.data.get('state'))
        #     obj.country = Locations.get_country_by_state_code(request.data.get('state'))
        #     obj.save()
        return super(PatientViewSet, self).update(request, *args, **kwargs)

    @viewset_permissions(ActionsPatientPermission)
    def destroy(self, request, *args, **kwargs):
        response = requests.delete('{}{}/'.format(settings.IDR_AUTH_PATIENT_URL, kwargs.get('remote_id')),
                                   headers={'Authorization': get_authorization_header(request)}
                                   )
        if response.status_code != 204:
            return Response(response.content, status=status.HTTP_400_BAD_REQUEST)
        return super(PatientViewSet, self).destroy(request, *args, **kwargs)

    def get_queryset(self):
        filters = {
            'hospital': self.request.user.hospital,
        }
        return self.model.objects.filter(**filters)

    @action(detail=False, methods=['POST'])
    @viewset_permissions(ActionsPatientPermission)
    def import_csv(self, request):
        response = requests.get(settings.IDR_AUTH_PATIENT_URL,
                                headers={'Authorization': get_authorization_header(request)}
                                )
        if response.status_code != 200:
            return Response(response.content, status=status.HTTP_400_BAD_REQUEST)

        remote_clinic_patients = response.json()
        res = parse_patient_csv(request.FILES['file'], remote_clinic_patients, request)
        patients = res.pop('patients')
        if patients:
            remote_serializer = CreateRemotePatientSerializer(data=patients, many=True)
            if remote_serializer.is_valid(raise_exception=True):
                response = requests.post(
                    '{}{}/create_patients_from_list/'.format(
                        settings.IDR_AUTH_DOCTOR_URL, request.user.remote_id),
                    data=json.dumps({"patient_list": remote_serializer.data}),
                    headers={'Authorization': get_authorization_header(request),
                             'Content-Type': 'application/json'}
                )
                if response.status_code != 201:
                    return Response(response.content, status=status.HTTP_400_BAD_REQUEST)

                remote_data = response.json()
                for l_p, r_p in zip(patients, remote_data):
                    remote_id = r_p.pop('id')
                    serializer = PatientSerializer(data={**l_p, **r_p})
                    if serializer.is_valid(raise_exception=True):
                        serializer.save(hospital=self.request.user.hospital, remote_id=remote_id)
                reset_patients_cache(self.request.user.hospital)
        sheet = res.pop('sheet')
        sheet.seek(0)
        patient_import = CsvImportLog(author=request.user, import_type=1, **res)
        patient_import.sheet.save('sheet.csv', ContentFile(sheet.read()))
        patient_import.save()

        return Response(CsvImportLogSerializer(instance=patient_import).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['GET'])
    def patient_headers(self, request):
        showed_patients = [obj.patient for obj in request.user.my_patients_list_participants.filter(show=True)]
        serializer = PatientHeadersSerializer(showed_patients, many=True)
        return Response(serializer.data)


class CountryViewSet(viewsets.ViewSet):
    """
    ## Get list of country with states

    URL: `/api/v1/country/`

    Method: `GET`
    """

    def list(self, request, format=None):
        return Response(Locations.get_all_countries())


class DoctorPatientViewSet(viewsets.ModelViewSet):
    """
        Endpoint to update patient show field in "my patients" list
        ---
        ## Update instance in "my patients" list
        Method: PATCH
        Url: /api/v1/mypatient/:id/
        Optional Field:
            * "show" (boolean)
        ---
    """
    model = DoctorPatient
    serializer_class = DoctorPatientUpdateSerializer
    queryset = DoctorPatient.objects.all()
    http_method_names = ['patch']

    # TODO: Add permission class when we find out all info about home-page
    # permission_classes = (MyPatientPermission,)

    def get_queryset(self):
        filters = {
            'doctor': self.request.user,
        }
        return self.model.objects.filter(**filters)
