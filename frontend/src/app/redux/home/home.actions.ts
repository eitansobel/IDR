import {Action} from '@ngrx/store';
import {HomePatient, NestedColumn, NestedHomeCell} from '../../models/home';
import {Chat, HistoryForSockets} from '../../models/chat';

export namespace NESTED_COLUMNS_ACTION {
    export const GET_COLUMNS = 'GET_COLUMNS';
    export const COPY_COLUMN = 'COPY_COLUMN';
    export const UPDATE_COLUMN = 'UPDATE_COLUMN';
    export const HIDE_COLUMN = 'HIDE_COLUMN';
    export const CREATE_CELL = 'CREATE_CELL';
    export const EDIT_CELL = 'EDIT_CELL';
    export const CREATE_COLUMN_FROM_SOCKET = 'CREATE_COLUMN_FROM_SOCKET';
    export const UPDATE_CHAT_FROM_SOCKET = 'UPDATE_CHAT_FROM_SOCKET';
    export const CHANGE_CHATS_READ_STATUS = 'CHANGE_CHATS_READ_STATUS';
}

export class GetNestedColumns implements Action {
    readonly type = NESTED_COLUMNS_ACTION.GET_COLUMNS;

    constructor(public payload: NestedColumn[]) {
    }
}

export class CopyNestedColumn implements Action {
    readonly type = NESTED_COLUMNS_ACTION.COPY_COLUMN;

    constructor(public payload: NestedColumn) {
    }
}

export class UpdateNestedColumn implements Action {
    readonly type = NESTED_COLUMNS_ACTION.UPDATE_COLUMN;

    constructor(public payload: NestedColumn) {
    }
}

export class HideNestedColumn implements Action {
    readonly type = NESTED_COLUMNS_ACTION.HIDE_COLUMN;

    constructor(public payload) {
    }
}

export class CreateCell implements Action {
    readonly type = NESTED_COLUMNS_ACTION.CREATE_CELL;

    constructor(public payload: NestedHomeCell) {
    }
}

export class EditNestedCell implements Action {
    readonly type = NESTED_COLUMNS_ACTION.EDIT_CELL;

    constructor(public payload: NestedHomeCell) {
    }
}

export class CreateColumnFromSocket implements Action {
    readonly type = NESTED_COLUMNS_ACTION.CREATE_COLUMN_FROM_SOCKET;

    constructor(public payload: [NestedHomeCell, NestedColumn[]]) {
    }
}

export class UpdateChatFromSocket implements Action {
    readonly type = NESTED_COLUMNS_ACTION.UPDATE_CHAT_FROM_SOCKET;

    constructor(public payload: HistoryForSockets) {
    }
}

export class ChangeChatsReadStatus implements Action {
    readonly type = NESTED_COLUMNS_ACTION.CHANGE_CHATS_READ_STATUS;

    constructor(public payload) {
    }
}

export type NestedColumnsAction = GetNestedColumns | CopyNestedColumn | UpdateNestedColumn | HideNestedColumn |
    CreateCell | EditNestedCell | CreateColumnFromSocket | UpdateChatFromSocket | ChangeChatsReadStatus;


export namespace HOME_PATIENT_ACTION {
    export const GET_HOME_PATIENTS = 'GET_HOME_PATIENTS';
    export const UPDATE_HOME_PATIENT = 'UPDATE_HOME_PATIENT';
}

export class GetHomePatients implements Action {
    readonly type = HOME_PATIENT_ACTION.GET_HOME_PATIENTS;

    constructor(public payload: HomePatient[]) {
    }
}

export class UpdateHomePatient implements Action {
    readonly type = HOME_PATIENT_ACTION.UPDATE_HOME_PATIENT;

    constructor(public payload: HomePatient) {
    }
}

export type HomePatientAction = GetHomePatients | UpdateHomePatient;
