import {PatientsAction, PATIENTS_ACTION} from './patients.action';

const initialState = {
    patients: []
};

export function patientsReducer(state = initialState, action: PatientsAction) {

    switch (action.type) {

        case PATIENTS_ACTION.GET_ALLPATIENTS:
            return {
                ...state,
                patients: [
                    ...action.payload
                ]
            };

        case PATIENTS_ACTION.ADD_NEWPATIENT:
            return {
                ...state,
                patients: [
                    ...state.patients,
                    action.payload
                ]
            };

        case PATIENTS_ACTION.DELETE_FROM_PATIENT:
            let patients = state.patients.filter(x => x.remote_id !== action.payload);
            state.patients = patients;

            return {
                ...state,
                patients: [
                    ...state.patients
                ]
            };

        case PATIENTS_ACTION.UPDATE_PATIENTS:
            const members = state.patients.filter(e => e.remote_id !== action.payload.id);
            const index = state.patients.findIndex(e => e.remote_id === action.payload.id);

            members.splice(index, 0, action.payload);
            state.patients = members;
            return {
                ...state,
                patients: [
                    ...state.patients
                ]
            };


        case PATIENTS_ACTION.CLEAR_PATIENTS:
            return {
                patients: []
            };

        default:
            return state;
    }
}
