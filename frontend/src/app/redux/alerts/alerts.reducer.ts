import {AlertsAction, ALERT_ACTION} from './alerts.action';

const initialState = {
    alerts: [],
    setAlert: []
};

export function alertsReducer(state = initialState, action: AlertsAction) {

    switch (action.type) {
        case ALERT_ACTION.ADD_ALERT:
            return {
                ...state,
                alerts: [
                    ...state.alerts,
                    action.payload
                ],

            };

        case ALERT_ACTION.SET_ALERT:
            return {
                ...state,
                setAlert: [

                    action.payload
                ]
            };

        case ALERT_ACTION.EDIT_ALERT:
            Object.keys(state).forEach((f) => {
                const index = state[f].findIndex(el => el.id === action.payload.id);
                if (index >= 0) {
                    state[f][index] = action.payload;
                }
            });

            return {
                ...state,
                alerts: [
                    ...state.alerts
                ]
            };

        case ALERT_ACTION.GET_ALERTS:
            return {
                ...state,
                alerts: [
                    ...action.payload
                ]
            };

        case ALERT_ACTION.LOGOUT:
            return {
                ...state,
                alerts: []
            };

        case ALERT_ACTION.DELETE:
            return {
                ...state,
                alerts: [
                    ...state.alerts.filter(e => e.id !== action.payload)
                ]
            };

        default:
            return state;
    }
}
