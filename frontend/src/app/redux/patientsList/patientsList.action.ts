import {Action} from '@ngrx/store';
import {PatientsList, ChosenPatientList} from '../../models/patients-list';

export namespace PATIENTSLIST_ACTION {
    export const GET_PATIENTSLISTS = 'GET_PATIENTSLISTS';
    export const SET_CHOSEN_PATIENT_LIST = 'SET_CHOSEN_PATIENT_LIST';
    export const UPDATE_CHOSEN_PATIENT_LIST = 'UPDATE_CHOSEN_PATIENT_LIST';
    export const DELETE_LIST = 'DELETE_LIST';
    export const ADD_LIST = 'ADD_LIST';
    export const CHOOSED_PATIENTS = 'CHOOSED_PATIENTS';
    export const UPDATE_LOADED_ALL_LIST = 'UPDATE_LOADED_ALL_LIST';
    export const CLEAR_PATIENTS_LIST = 'CLEAR_PATIENTS_LIST';
    export const DELETE_FROM_PAT_LIST = 'DELETE_FROM_PAT_LIST';
    export const DELETE_PATIENT = 'DELETE_PATIENT';
    export const UPDATE_MY_PATIENT_STATUS = 'UPDATE_MY_PATIENT_STATUS';
}

export class GetPatientsLists implements Action {
    readonly type = PATIENTSLIST_ACTION.GET_PATIENTSLISTS;

    constructor(public payload: PatientsList[]) {}
}

export class SetChosenPatientList implements Action {
    readonly type = PATIENTSLIST_ACTION.SET_CHOSEN_PATIENT_LIST;

    constructor(public payload: ChosenPatientList) {}
}
export class UpdateMyPatientStatus implements Action {
    readonly type = PATIENTSLIST_ACTION.UPDATE_MY_PATIENT_STATUS;

    constructor(public payload: {id: number, status: boolean}) {}
}

export class UpdateChosenPatientList implements Action {
    readonly type = PATIENTSLIST_ACTION.UPDATE_CHOSEN_PATIENT_LIST;

    constructor(public payload: PatientsList) {}
}

export class AddPatlist implements Action {
    readonly type = PATIENTSLIST_ACTION.ADD_LIST;

    constructor(public payload: PatientsList[]) {}
}

export class DeletePatlist implements Action {
    readonly type = PATIENTSLIST_ACTION.DELETE_LIST;

    constructor(public payload) {}
}

export class UpdateLoadedAllList implements Action {
    readonly type = PATIENTSLIST_ACTION.UPDATE_LOADED_ALL_LIST;

    constructor(public payload) {}
}

export class DeleteFromPatList implements Action {
    readonly type = PATIENTSLIST_ACTION.DELETE_FROM_PAT_LIST;

    constructor(public payload) {}
}

export class DeletePatient implements Action {
    readonly type = PATIENTSLIST_ACTION.DELETE_PATIENT;

    constructor(public payload) {}
}

export class ClearPatLists implements Action {
    readonly type = PATIENTSLIST_ACTION.CLEAR_PATIENTS_LIST;
}

export type PatAction = GetPatientsLists | DeleteFromPatList | SetChosenPatientList | DeletePatlist | AddPatlist |
    UpdateLoadedAllList | ClearPatLists | DeletePatient | UpdateChosenPatientList | UpdateMyPatientStatus;
