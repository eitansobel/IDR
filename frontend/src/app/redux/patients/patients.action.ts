import {Action} from '@ngrx/store';
import {Patient} from "../../models/patient";

export namespace PATIENTS_ACTION {
    export const GET_ALLPATIENTS = 'GET_ALLPATIENTS';
    export const ADD_NEWPATIENT = 'ADD_NEWPATIENT';
    export const DELETE_FROM_PATIENT = 'DELETE_FROM_PATIENT';
    export const UPDATE_PATIENTS = 'UPDATE_PATIENTS';
    export const CLEAR_PATIENTS = 'CLEAR_PATIENTS';
}

export class GetPatients implements Action {
    readonly type = PATIENTS_ACTION.GET_ALLPATIENTS;

    constructor(public payload: Patient[]) {}
}

export class AddPatient implements Action {
    readonly type = PATIENTS_ACTION.ADD_NEWPATIENT;

    constructor(public payload: Patient) {}
}

export class DeletePatientFromAll implements Action {
    readonly type = PATIENTS_ACTION.DELETE_FROM_PATIENT;

    constructor(public payload: number) {}
}

export class UpdatePatients implements Action {
    readonly type = PATIENTS_ACTION.UPDATE_PATIENTS;

    constructor(public payload: Patient) {}
}

export class ClearPatients implements Action {
    readonly type = PATIENTS_ACTION.CLEAR_PATIENTS;
}

export type PatientsAction = GetPatients | AddPatient | UpdatePatients | ClearPatients | DeletePatientFromAll;
