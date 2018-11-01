import {Action} from '@ngrx/store';

export namespace MEMBERS_ACTION {
    export const GET_ALLMEMBERS = 'GET_ALLMEMBERS';
    export const ADD_NEWMEMBERS = 'ADD_NEWMEMBERS';
    export const UPDATE_NEWMEMBERS = 'UPDATE_NEWMEMBERS';
    export const CLEAR_MEMBERS = 'CLEAR_MEMBERS';
}

export class GetMembers implements Action {
    readonly type = MEMBERS_ACTION.GET_ALLMEMBERS;

    constructor(public payload) {

    }
}

export class AddMember implements Action {
    readonly type = MEMBERS_ACTION.ADD_NEWMEMBERS;

    constructor(public payload) {

    }
}

export class UpdateMember implements Action {
    readonly type = MEMBERS_ACTION.UPDATE_NEWMEMBERS;

    constructor(public payload) {

    }
}

export class ClearMembers implements Action {
    readonly type = MEMBERS_ACTION.CLEAR_MEMBERS;
}

export type MembersAction = GetMembers | AddMember | ClearMembers | UpdateMember;
