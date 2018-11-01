import {Action} from '@ngrx/store';
import {Departament} from '../../models/hospital-departments';
export namespace DEPARTMENT_ACTION {
    export const ADD_DEPARTMENT = 'ADD_DEPARTMENT';
}

export class AddDepartment implements Action {
    readonly type = DEPARTMENT_ACTION.ADD_DEPARTMENT;

    constructor(public payload: Departament) {}
}

export type DepartmentAction = AddDepartment;
