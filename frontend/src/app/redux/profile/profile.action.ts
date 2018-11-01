import {Action} from '@ngrx/store';
import {Profile} from '../../models/profile';
import {PatientRecordInChosenPatientList} from "../../models/patients-list";

export namespace PROFILE_ACTION {
    export const ADD_PROFILE = 'ADD_PROFILE';
    export const EDIT_PROFILE = 'EDITD_PROFILE';
    export const CHANGE_PHOTO = 'CHANGE_PHOTO';
    export const LOGOUT = 'LOGOUT';
    export const TOGGLE_PATIENT_STATUS = 'TOGGLE_PATIENT_STATUS';
    export const UPDATE_PATIENT_ORDER = 'UPDATE_PATIENT_ORDER';
    export const UPDATE_USER_PARTICIPANT_LIST = 'UPDATE_USER_PARTICIPANT_LIST';
    export const REMOVE_PATIENT_FROM_USER_PARTICIPANT_LIST = 'REMOVE_PATIENT_FROM_USER_PARTICIPANT_LIST';
    export const UPDATE_PROFILE_PATIENT = 'UPDATE_PROFILE_PATIENT';
}

export class AddProfile implements Action {
    readonly type = PROFILE_ACTION.ADD_PROFILE;

    constructor(public payload: Profile) {
    }
}

export class TogglePatientStatus implements Action {
    readonly type = PROFILE_ACTION.TOGGLE_PATIENT_STATUS;

    constructor(public payload: Profile) {
    }
}

export class UpdatePatientOrder implements Action {
    readonly type = PROFILE_ACTION.UPDATE_PATIENT_ORDER;

    constructor(public payload) {
    }
}

export class UpdateUserParticipantList implements Action {
    readonly type = PROFILE_ACTION.UPDATE_USER_PARTICIPANT_LIST;

    constructor(public payload: PatientRecordInChosenPatientList[]) {
    }
}

export class RemovePatientFromParticipantList implements Action {
    readonly type = PROFILE_ACTION.REMOVE_PATIENT_FROM_USER_PARTICIPANT_LIST;

    constructor(public payload: number) {
    }
}

export class UpdatePatientProfile implements Action {
    readonly type = PROFILE_ACTION.UPDATE_PROFILE_PATIENT;

    constructor(public payload) {
    }
}

export class Logout implements Action {
    readonly type = PROFILE_ACTION.LOGOUT;
}

export class ChangePhoto implements Action {
    readonly type = PROFILE_ACTION.CHANGE_PHOTO;

    constructor(public payload) {
    }
}

export type ProfileAction = AddProfile | ChangePhoto | UpdateUserParticipantList | RemovePatientFromParticipantList |
    UpdatePatientProfile | TogglePatientStatus | UpdatePatientOrder | Logout;
