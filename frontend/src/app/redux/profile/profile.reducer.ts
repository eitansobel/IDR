import {ProfileAction, PROFILE_ACTION} from './profile.action';

const initialState = {
    profile: {},
    partialProfile: {}
};

export function profileReducer(state = initialState, action: ProfileAction) {

    switch (action.type) {
        case PROFILE_ACTION.ADD_PROFILE:
            const newProfile: any = {
                ...state.partialProfile,
                ...action.payload
            };
            const profileIsCombined = newProfile.alerts && newProfile.clinic;

            return {
                ...state,
                profile: profileIsCombined ? newProfile : {},
                partialProfile: newProfile
            };
        case PROFILE_ACTION.TOGGLE_PATIENT_STATUS:
            state.profile['my_patients_list_participants'].map(e => {
                if (e.id === action.payload) {
                    e.show = !e.show;
                }
                return e;
            });
            return {
                ...state,
                profile: {
                    ...state.profile
                }
            };
        case PROFILE_ACTION.UPDATE_USER_PARTICIPANT_LIST:
            state.profile['my_patients_list_participants'] = action.payload;
            return {
                ...state,
                profile: {
                    ...state.profile
                }
            };

        case PROFILE_ACTION.REMOVE_PATIENT_FROM_USER_PARTICIPANT_LIST:
            let patients = state.profile['my_patients_list_participants'].filter(x => x.patient.remote_id !== action.payload);
            state.profile['my_patients_list_participants'] = patients;
            return {
                ...state,
                profile: {
                    ...state.profile
                }
            };

        case PROFILE_ACTION.UPDATE_PROFILE_PATIENT:
            const index = state.profile['my_patients_list_participants'].findIndex(e => e.patient.remote_id === action.payload.remote_id);
            state.profile['my_patients_list_participants'][index].patient = action.payload;

            return {
                ...state,
                profile: {
                    ...state.profile
                }
            };

        case PROFILE_ACTION.UPDATE_PATIENT_ORDER:
            state.profile['patient_order'] = action.payload.patient_order;
            state.profile['patient_sort_by'] = action.payload.patient_sort_by;
            return {
                ...state,
                profile: {
                    ...state.profile
                }
            };

        case PROFILE_ACTION.CHANGE_PHOTO:
            return {
                ...state,
                profile: {
                    ...state.profile,
                    ...action.payload
                }
            };

        case PROFILE_ACTION.LOGOUT:
            return {
                profile: {}
            };

        default:
            return state;
    }
}

