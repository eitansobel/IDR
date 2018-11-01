import {RoleAction, ROLES_ACTION} from './role.action';

const initialState = {
    roles: []
};

export function roleReducer(state = initialState, action: RoleAction) {
    switch (action.type) {
        case ROLES_ACTION.GET_ROLE:
            return {
                ...state,
                roles: [
                    ...action.payload
                ]
            };
        default:
            return state;
    }
}

