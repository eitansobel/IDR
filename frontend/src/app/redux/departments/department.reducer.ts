import {DepartmentAction, DEPARTMENT_ACTION} from './department.action';

const initialState = {
    departments: []
};

export function departmentReducer(state = initialState, action: DepartmentAction) {

    switch (action.type) {
        case DEPARTMENT_ACTION.ADD_DEPARTMENT:
            return {
                ...state,
                departments: [
                    ...state.departments,
                    action.payload
                ]
            };
        default:
            return state;
    }
}

