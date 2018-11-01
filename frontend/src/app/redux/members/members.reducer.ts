import {MembersAction, MEMBERS_ACTION} from './members.action';

const initialState = {
    members: []
};

export function membersReducer(state = initialState, action: MembersAction) {

    switch (action.type) {

        case MEMBERS_ACTION.GET_ALLMEMBERS:
            return {
                ...state,
                members: [
                    ...action.payload
                ]
            };

        case MEMBERS_ACTION.ADD_NEWMEMBERS:
             return {
                ...state,
                members: [
                    ...state.members,
                    action.payload
                ]
            };

        case MEMBERS_ACTION.UPDATE_NEWMEMBERS:
            const members = state.members.filter(e => e.id !== action.payload.id);
            const index = state.members.findIndex(e => e.id === action.payload.id);

            members.splice(index, 0, action.payload);
            state.members = members;
            return {
                ...state,
                members: [
                    ...state.members
                ]
            };

        case MEMBERS_ACTION.CLEAR_MEMBERS:
            return {};

        default:
            return state;
    }
}
