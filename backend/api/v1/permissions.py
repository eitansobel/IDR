from rest_framework import permissions

from accounts.models import Doctor, Patient, AlertMethod, DoctorAlertSetting, StuffList, \
    EmergencyContact, Guarantor, PatientsList, DoctorPatient, CsvImportLog
from home.models import DoctorHomeColumn, DoctorHomeCell, DoctorHomeCellField


class AllowAnonCreate(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in ["POST", 'OPTIONS'] and not request.user.is_authenticated:
            return True
        elif not request.user.is_authenticated:
            return False
        return True

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        return True


class DoctorPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'doctor')

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, Doctor):
            return obj.hospital == request.user.hospital
        elif isinstance(obj, StuffList):
            return obj.hospital == request.user.hospital
        elif isinstance(obj, AlertMethod):
            return obj.doctor.hospital == request.user.hospital
        elif isinstance(obj, DoctorAlertSetting):
            return obj.doctor.hospital == request.user.hospital
        elif isinstance(obj, Patient):
            return obj.hospital
        elif isinstance(obj, PatientsList):
            return obj.hospital == request.user.hospital
        elif isinstance(obj, EmergencyContact):
            return obj.patient.hospital == request.user.hospital
        elif isinstance(obj, Guarantor):
            return obj.patient.hospital == request.user.hospital
        elif isinstance(obj, DoctorPatient):
            return obj.doctor.hospital == request.user.hospital
        elif isinstance(obj, CsvImportLog):
            return obj.author.hospital == request.user.hospital
        elif isinstance(obj, DoctorHomeColumn):
            return obj.author.hospital == request.user.hospital
        elif isinstance(obj, DoctorHomeCell):
            return obj.author.hospital == request.user.hospital
        elif isinstance(obj, DoctorHomeCellField):
            return obj.author.hospital == request.user.hospital


class HospitalAdminPermission(DoctorPermission):
    def has_permission(self, request, view):
        return super(HospitalAdminPermission, self).has_permission(request, view) and \
               request.user.hospital_role.remote_role == 1


class AllowPermission(DoctorPermission):
    def has_object_permission(self, request, view, obj):
        is_admin = request.user.is_admin
        myself = obj == request.user
        if request.method == 'GET':
            return is_admin or myself
        elif request.method == 'POST':
            return is_admin


class ActionsPatientPermission(DoctorPermission):
    def has_permission(self, request, view):
        return super(ActionsPatientPermission, self).has_permission(request, view) and request.user.patient_permission


class ActionsDoctorPermission(DoctorPermission):
    def has_object_permission(self, request, view, obj):
        return super(ActionsDoctorPermission, self).has_object_permission(request, view, obj) and (
                request.user.doctor_permission or obj == request.user)


class MyselfPermission(DoctorPermission):
    def has_object_permission(self, request, view, obj):
        return super(MyselfPermission, self).has_object_permission(request, view, obj) and obj == request.user


class ExportPermission(DoctorPermission):
    def has_permission(self, request, view):
        return super(ExportPermission, self).has_permission(request, view) and \
               (request.user.is_admin or request.user.export_permission)


class MessagePermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'doctor')

    def has_object_permission(self, request, view, obj):
        return obj.sender == request.user


class ChatPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'doctor')

    def has_object_permission(self, request, view, obj):
        return request.user in obj.participants.all()


class CreateColumnPermission(DoctorPermission):
    def has_permission(self, request, view):
        return super(CreateColumnPermission, self).has_permission(request, view) and \
               (request.user.is_admin or request.user.create_data_cell_permission)


class LockPermission(DoctorPermission):
    def has_object_permission(self, request, view, obj):
        return super(LockPermission, self).has_object_permission(request, view, obj) and \
               (request.user.is_admin or request.user == obj.author)


class ManageHomeDataPermission(DoctorPermission):
    def has_permission(self, request, view):
        return super(ManageHomeDataPermission, self).has_permission(request, view) and \
               (request.user.is_admin or request.user.edit_data_cell_permission)

    def has_object_permission(self, request, view, obj):
        return super(ManageHomeDataPermission, self).has_object_permission(request, view, obj) and \
               (request.user.is_admin or request.user.edit_data_cell_permission or request.user == obj.author)


class EditHomeCellPermission(ManageHomeDataPermission):
    def has_object_permission(self, request, view, obj):
        not_private = super(EditHomeCellPermission, self).has_permission(request, view) and not obj.is_private
        can_edit_private = obj.is_private and (request.user.is_admin or request.user == obj.author)
        return not_private or can_edit_private
