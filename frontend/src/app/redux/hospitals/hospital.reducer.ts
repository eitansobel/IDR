import {HospitalAction, HOSPITAL_ACTION} from './hospital.action';

const initialState = {
    hospitals: []
};

export function hospitalReducer(state = initialState, action: HospitalAction) {

    switch (action.type) {
        case HOSPITAL_ACTION.LOAD_HOSPITALS:
            return {
                ...state,
                hospitals: [
                    ...action.payload
                ]
            };
        default:
            return state;
    }
}

