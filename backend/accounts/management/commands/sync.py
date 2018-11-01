from django.core.management.base import BaseCommand
from accounts.models import Doctor, Hospital, Patient
import requests
from django.conf import settings
from django.utils.translation import ugettext_lazy as _
from datetime import date
from django.db.models import Q


class Command(BaseCommand):
    help = 'synchronization RxPhoto/IDR doctors'

    def handle(self, *args, **options):
        print("Report from %s" % date.today().strftime("%Y-%m-%d"))
        hospitals = Hospital.objects.all()
        empty_doctors = Doctor.objects.filter(Q(hospital=None) | Q(hospital_role=None) | Q(hospital_department=None))
        print('%d empty doctors was deleted' % len(empty_doctors))
        [d.delete() for d in empty_doctors]
        for hospital in hospitals:
            print("info from hospital - %s" % hospital.title)
            counter = 0
            doctors = Doctor.objects.filter(hospital=hospital)
            patients = Patient.objects.filter(hospital=hospital)
            token = self.get_auth_token(hospital)
            if token == 'fail':
                print(_('Unable to authenticate with create doctor credentials on IDR AUTH server.'))
                continue
            response = requests.get(settings.IDR_AUTH_DOCTOR_URL, headers={'Authorization': 'Token ' + token})
            for doctor in sorted(response.json(), key=lambda k: k['clinic']['id']):
                if doctor['id'] not in [local_doctor.remote_id for local_doctor in doctors]:
                    delete_response = requests.delete(settings.IDR_AUTH_DOCTOR_URL + str(doctor['id']) + '/',
                                                      headers={'Authorization': 'Token ' + token})
                    if delete_response.status_code != 204:
                        print("Don't delete " + str(doctor['id']))
                    else:
                        counter += 1
            print("%d doctors delete in auth server" % counter)
            counter = 0
            for doctor in doctors:
                if doctor.remote_id not in [item['id'] for item in response.json()]:
                    counter += 1
                    doctor.delete()
            print("%d doctors was deleted in idr server" % counter)
            counter = 0
            response = requests.get(settings.IDR_AUTH_PATIENT_URL, headers={'Authorization': 'Token ' + token})
            for patient in response.json():
                if patient['id'] not in [local_patient.remote_id for local_patient in patients]:
                    delete_response = requests.delete(settings.IDR_AUTH_PATIENT_URL + str(patient['id']) + '/',
                                                      headers={'Authorization': 'Token ' + token})
                    if delete_response.status_code != 204:
                        print("Can't delete patient " + str(patient['id']))
                    else:
                        counter += 1
            print("%d patients delete in auth server" % counter)
            counter = 0
            for patient in patients:
                if patient.remote_id not in [item['id'] for item in response.json()]:
                    counter += 1
                    patient.delete()
            print("%d patients was deleted in idr server" % counter)

    @staticmethod
    def get_auth_token(hospital):
        credentials = {
            "username": hospital.clinic_remote_admin_username,
            "password": hospital.clinic_remote_admin_password
        }
        response = requests.post(settings.IDR_AUTH_URL, data=credentials)
        if response.status_code != 200:
            return 'fail'
        data = response.json()
        return data.get('token')
