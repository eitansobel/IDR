import {Action} from '@ngrx/store';
import {Alert} from '../../models/alert';

export namespace ALERT_ACTION {
    export const ADD_ALERT = 'ADD_ALERT';
    export const SET_ALERT = 'SET_ALERT';
    export const EDIT_ALERT = 'EDIT_ALERT';
    export const GET_ALERTS = 'GET_ALERTS';
    export const DELETE = 'DELETE';
    export const LOGOUT = 'LOGOUT';
}

export class AddAlert implements Action {
    readonly type = ALERT_ACTION.ADD_ALERT;

    constructor(public payload: Alert) {

    }
}
export class SetAlert implements Action {
    readonly type = ALERT_ACTION.SET_ALERT;

    constructor(public payload: Alert) {

    }
}

export class GetAlerts implements Action {
    readonly type = ALERT_ACTION.GET_ALERTS;

    constructor(public payload: Alert[]) {
    }
}

export class ClearAlert implements Action {
    readonly type = ALERT_ACTION.LOGOUT;
}

export class EditAlert implements Action {
    readonly type = ALERT_ACTION.EDIT_ALERT;
    constructor(public payload) {
    }
}

export class DeletAlert implements Action {
    readonly type = ALERT_ACTION.DELETE;

    constructor(public payload) {
    }
}

export type AlertsAction = GetAlerts | AddAlert | ClearAlert | DeletAlert | EditAlert | SetAlert;
