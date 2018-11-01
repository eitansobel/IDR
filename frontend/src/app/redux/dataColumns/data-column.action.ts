import {Action} from '@ngrx/store';
import {DataColumn} from '../../models/data-columns';

export namespace DOCTOR_COLUMNS_ACTION {
    export const GET_COLUMNS = 'GET_DATA_COLUMNS';
    export const CREATE_COLUMN = 'CREATE_DATA_COLUMN';
    export const COPY_COLUMN = 'COPY_DATA_COLUMN';
    export const UPDATE_COLUMN = 'UPDATE_DATA_COLUMN';
    export const DELETE_COLUMN = 'DELETE_DATA_COLUMN';
}

export class GetColumns implements Action {
    readonly type = DOCTOR_COLUMNS_ACTION.GET_COLUMNS;

    constructor(public payload: DataColumn[]) {
    }
}

export class CreateColumn implements Action {
    readonly type = DOCTOR_COLUMNS_ACTION.CREATE_COLUMN;

    constructor(public payload: DataColumn) {
    }
}

export class CopyColumn implements Action {
    readonly type = DOCTOR_COLUMNS_ACTION.COPY_COLUMN;

    constructor(public payload: DataColumn) {
    }
}


export class UpdateColumn implements Action {
    readonly type = DOCTOR_COLUMNS_ACTION.UPDATE_COLUMN;

    constructor(public payload: DataColumn) {
    }
}

export class DeleteColumn implements Action {
    readonly type = DOCTOR_COLUMNS_ACTION.DELETE_COLUMN;

    constructor(public payload: DataColumn) {
    }
}


export type ColumnsAction =
    GetColumns | CreateColumn | CopyColumn | UpdateColumn | DeleteColumn;
