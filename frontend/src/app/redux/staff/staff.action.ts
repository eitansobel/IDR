import {Action} from '@ngrx/store';
import {StaffList} from '../../models/staff-list';

export namespace STAFF_ACTION {
    export const GET_STAFFLISTS = 'GET_STAFFLISTS';
    export const SET_LOADEDSTAFFLIST = 'SET_LOADEDSTAFFLIST';
    export const UPDATE_LOADEDSTAFFLIST = 'UPDATE_LOADEDSTAFFLIST';
    export const DELETE_LIST = 'DELETE_LIST';
    export const ADD_LIST = 'ADD_LIST';
    export const CHOOSED_MEMBER = 'CHOOSED_MEMBER';
    export const UPDATE_LOADED_LIST = 'UPDATE_LOADED_LIST';
    export const UPDATE_PHOTOIN_LIST = 'UPDATE_PHOTOIN_LIST';
    export const CLEAR_LIST = 'CLEAR_LIST';
    export const DELETE_PENDED_MEMBER = 'DELETE_PENDED_MEMBER';
    export const APPROVE_USER = 'APPROVE_USER';
    export const DELETE_FROM_LIST = 'DELETE_FROM_LIST';
}

export class GetStaffLists implements Action {
    readonly type = STAFF_ACTION.GET_STAFFLISTS;

    constructor(public payload: StaffList[]) {}
}

export class SetLoadedStafflist implements Action {
    readonly type = STAFF_ACTION.SET_LOADEDSTAFFLIST;

    constructor(public payload) {}
}

export class UpdateLoadedStafflist implements Action {
    readonly type = STAFF_ACTION.UPDATE_LOADEDSTAFFLIST;

    constructor(public payload) {}
}

export class AddStafflist implements Action {
    readonly type = STAFF_ACTION.ADD_LIST;

    constructor(public payload: StaffList[]) {}
}

export class DeleteStafflist implements Action {
    readonly type = STAFF_ACTION.DELETE_LIST;

    constructor(public payload) {}
}

export class DeletePendedMember implements Action {
    readonly type = STAFF_ACTION.DELETE_PENDED_MEMBER;

    constructor(public payload) {}
}

export class UpdateLoadedList implements Action {
    readonly type = STAFF_ACTION.UPDATE_LOADED_LIST;

    constructor(public payload) {}
}

export class DeleteFromList implements Action {
    readonly type = STAFF_ACTION.DELETE_FROM_LIST;

    constructor(public payload) {}
}

export class UpdatePhotoinList implements Action {
    readonly type = STAFF_ACTION.UPDATE_PHOTOIN_LIST;

    constructor(public payload) {}
}

export class ApproveUser implements Action {
    readonly type = STAFF_ACTION.APPROVE_USER;

    constructor(public payload) {}
}

export class ClearLists implements Action {
    readonly type = STAFF_ACTION.CLEAR_LIST;
}

export type StaffAction = GetStaffLists | ApproveUser | DeleteFromList
                         | SetLoadedStafflist | DeleteStafflist | AddStafflist | UpdateLoadedList | UpdatePhotoinList | ClearLists
                         | UpdateLoadedStafflist | DeletePendedMember;
