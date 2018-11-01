import {LogoutAction, LOGOUT_ACTION} from './logout.action';

const initialState = {};

export function logoutReducer(state = initialState, action: LogoutAction) {

    switch (action.type) {
        case LOGOUT_ACTION.LOGOUT:
             return state;
    }
}

