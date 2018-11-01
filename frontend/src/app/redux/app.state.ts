import {Alert} from '../models/alert';
import {Departament} from '../models/hospital-departments';
import {Role} from '../models/roles';
import {Hospital} from '../models/hospital';
import {Profile} from '../models/profile';
import {StaffList} from '../models/staff-list';
import {PatientsList} from '../models/patients-list';
import {Patient} from '../models/patient';
import {DataColumn} from '../models/data-columns';
import {NestedColumn, HomePatient} from '../models/home';

export interface AppState {
    alertPage: {
        alerts: Alert[]
    };
    alertSingle: {
        setAlert: any[]
    };
    departmentPage: {
        departments: Departament[]
    };
    rolesPage: {
        roles: Role[]
    };
    hospitalsPage: {
        hospitals: Hospital[]
    };
    profilePage: {
        profile: Profile,
        partialProfile: Profile
    };
     patListPage: {
        patientsLists: PatientsList[]
    };
    staffPage: {
        staffLists: StaffList[]
    };
    dataColumnPage: {
        dataColumns: DataColumn[]
    };
    nestedColumnsPage: {
        nestedColumns: NestedColumn[]
    };
    homePatientsPage: {
        homePatients: HomePatient[]
    };
    loadedStaffListPage: {
        staffLists: any[]
    };
    membersPage: {
        members: Profile[]
    };
    patientsPage: {
        patients: Patient[]
    };
    membersPhoto: {
        photo
    };
    tokenStatus: {
        tokenStatus
    };
}
