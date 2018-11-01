from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.models import Group

from accounts.models import Doctor, SignOutLog, AlertMethod, DoctorAlertSetting, Hospital, HospitalDepartment, \
    HospitalRole, Patient, StuffList, CsvImportLog, PatientsList, DoctorPatient, EmergencyContact, Guarantor

from api.models import Token


class DoctorAdmin(admin.ModelAdmin):
    class Meta:
        model = Doctor


admin.site.register(Hospital)
admin.site.register(HospitalRole)
admin.site.register(HospitalDepartment)
admin.site.register(Doctor)
admin.site.register(DoctorAlertSetting)
admin.site.register(AlertMethod)
admin.site.register(Token)
admin.site.register(SignOutLog)
admin.site.register(Patient)
admin.site.register(DoctorPatient)
admin.site.register(PatientsList)
admin.site.register(StuffList)
admin.site.register(CsvImportLog)
admin.site.register(EmergencyContact)
admin.site.register(Guarantor)

admin.site.unregister(User)
admin.site.unregister(Group)
