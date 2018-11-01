import {StaffAction, STAFF_ACTION} from './staff.action';

const initialState = {
    staffLists: [],
    loadedList: []
};

export function staffReducer(state = initialState, action: StaffAction) {
    switch (action.type) {
        case STAFF_ACTION.GET_STAFFLISTS:
            return {
                ...state,
                staffLists: [
                    ...action.payload
                ],
                loadedList: [
                    ...state.loadedList
                ]
            };

        case STAFF_ACTION.SET_LOADEDSTAFFLIST:
        console.log(2);
            return {
                ...state,
                staffLists: [
                    ...state.staffLists
                ],
                loadedList: [

                    action.payload
                ]
            };

        case STAFF_ACTION.UPDATE_LOADEDSTAFFLIST:
            const lists = state.staffLists.filter(e => e.id !== action.payload.id);
            const listIndex = state.staffLists.findIndex(e => e.id === action.payload.id);
            lists.splice(listIndex, 0, action.payload);
            state.staffLists = lists;

            return {
                ...state,
                staffLists: [
                    ...state.staffLists
                ],
                loadedList: [
                    action.payload
                ]
            };

        case STAFF_ACTION.ADD_LIST:
            return {
                ...state,
                staffLists: [
                    ...state.staffLists,
                    action.payload
                ],
                loadedList: [
                   ...state.loadedList,
                ]
            };

        case STAFF_ACTION.DELETE_LIST:
            return {
                ...state,
                staffLists: [
                    ...state.staffLists.filter(e => e.id !== action.payload)
                ],
                loadedList: []
            };

        case STAFF_ACTION.DELETE_PENDED_MEMBER:
            const membersPended = state.staffLists[state.staffLists.length - 1]['default']['pended_users']['participants']
                .filter(e => e !== action.payload.user_id);
            state.staffLists[state.staffLists.length - 1]['default']['pended_users']['participants'] = membersPended;

            return {
                ...state,
                staffLists: [
                    ...state.staffLists
                ],
                loadedList: [
                    ...state.loadedList
                ]
            };

        case STAFF_ACTION.UPDATE_LOADED_LIST:
            const members = state.loadedList[0].participants.filter(e => e.id !== action.payload.id);
            const index = state.loadedList[0].participants.findIndex(e => e.id === action.payload.id);

            members.splice(index, 0, action.payload);
            state.loadedList[0].participants = members;

            state.staffLists.forEach((x) => {
                if (x.participants) {
                    const members = x.participants.filter(e => e.id !== action.payload.id);
                    const index = x.participants.findIndex(e => e.id === action.payload.id);
                    members.splice(index, 0, action.payload);
                    x.participants = members;
                } else {
                    const members = x['default']['all_users'].participants.filter(e => e.id !== action.payload.id);
                    const index = x['default']['all_users'].participants.findIndex(e => e.id === action.payload.id);
                    members.splice(index, 0, action.payload);
                    x['default']['all_users'].participants = members;
                }
            });

            return {
                ...state,
                staffLists: [
                    ...state.staffLists
                ],
                loadedList: [
                    ...state.loadedList
                ]
            };

        case STAFF_ACTION.UPDATE_PHOTOIN_LIST:
            const index2 = state.loadedList[0].participants.findIndex(e => e.id !== action.payload.id);
            state.loadedList[0].participants[index2].full_photo = action.payload.full_photo;

            return {
                ...state,
                loadedList: [
                    ...state.loadedList
                ]
            };

        case STAFF_ACTION.APPROVE_USER:
            if (state.loadedList[0].title == 'Pended Users') {
                const membersNonApproved = state.staffLists[state.staffLists.length - 1]['default']['pended_users']['participants']
                    .filter(e => e !== action.payload.user_id);
                const approvedMember = state.staffLists[state.staffLists.length - 1]['default']['pended_users']['participants']
                    .find(e => e === action.payload.user_id);

                state.staffLists[state.staffLists.length - 1]['default']['pended_users']['participants'] = membersNonApproved;
                state.staffLists[state.staffLists.length - 1]['default']['all_users']['participants'].push(approvedMember);

                const memberLoadedList = state.loadedList[0].participants.filter((x) => x.remote_id !== action.payload.user_id);
                state.loadedList[0].participants = memberLoadedList;
            }
            return {
                ...state,
                staffLists: [
                    ...state.staffLists
                ],
                loadedList: [
                    ...state.loadedList
                ]
            };

        case STAFF_ACTION.DELETE_FROM_LIST:
            const listIndex2 = state.staffLists.findIndex((c) => c.id === action.payload.list_id);
            const updateList = state.staffLists[listIndex2]['participants'].filter((c) => c !== action.payload.user_id);
            state.staffLists[listIndex2]['participants'] = updateList;

            return {
                ...state,
                staffLists: [
                    ...state.staffLists
                ],
                loadedList: [
                    ...state.loadedList
                ]
            };

        case STAFF_ACTION.CLEAR_LIST:
            return {
                staffLists: [],
                loadedList: []
            };

        default:
            return state;
    }
}
