import {Action} from '@ngrx/store';
import {Role} from '../../models/roles';
export namespace ROLES_ACTION {
    export const GET_ROLE = 'GET_ROLE';
}

export class GetRole implements Action {
    readonly type = ROLES_ACTION.GET_ROLE;

    constructor(public payload: Role[]) {

    }
}

export type RoleAction = GetRole;
