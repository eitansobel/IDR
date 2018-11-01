import {TokenAction, TOKEN_ACTION} from './token-status.action';

const initialState = {};

export function tokenStatusReducer(state = initialState, action: TokenAction) {

    switch (action.type) {

        case TOKEN_ACTION.TOKEN_GOING_TO_EXPIRE:
            state = {};
            return {...state};
    }
}

