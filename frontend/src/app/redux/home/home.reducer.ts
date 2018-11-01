import {NestedColumnsAction, NESTED_COLUMNS_ACTION, HomePatientAction, HOME_PATIENT_ACTION} from './home.actions';
import * as _ from 'lodash';

const initialState = {
    columns: []
};

export function nestedColumnsReducer(state = initialState, action: NestedColumnsAction) {

    switch (action.type) {

        case NESTED_COLUMNS_ACTION.GET_COLUMNS:
            state.columns = _.orderBy(action.payload, 'order', ['asc']);
            return {
                ...state,
                columns: [
                    ...state.columns
                ]
            };

        case NESTED_COLUMNS_ACTION.COPY_COLUMN:
            const groupIndex = state.columns.findIndex(e => e.group_id === action.payload.group_id);
            const groupLength = state.columns.filter(e => e.group_id === action.payload.group_id).length;
            state.columns.splice(groupIndex + groupLength, 0, action.payload);
            state.columns.forEach(item => {
                if (item.group_id === action.payload.group_id) {
                    item.authors_in_group.push(Number(localStorage.getItem('idrUserId')));
                }
            });
            return {
                ...state,
                columns: [...state.columns]
            };

        case NESTED_COLUMNS_ACTION.UPDATE_COLUMN:
            const columns = state.columns.filter(e => e.id !== action.payload.id);
            const updatedColumnIndex = state.columns.findIndex(e => e.id === action.payload.id);
            const initCells = state.columns[updatedColumnIndex].cells;
            columns.splice(updatedColumnIndex, 0, Object.assign(action.payload, {cells: initCells}));
            state.columns = columns.filter(e => !e.is_hidden);
            return {
                ...state,
                columns: [...state.columns]
            };

        case NESTED_COLUMNS_ACTION.HIDE_COLUMN:
            state.columns = state.columns.filter(e => e.id !== action.payload);
            return {
                ...state,
                columns: [...state.columns]
            };

        case NESTED_COLUMNS_ACTION.CREATE_CELL:
            state.columns.forEach(column => {
                if (column.group_id === action.payload.column_group_id) {
                    column.cells.push(action.payload);
                }
            });
            return {
                ...state,
                columns: [...state.columns]
            };

        case NESTED_COLUMNS_ACTION.EDIT_CELL:
            state.columns.forEach(column => {

                if (column.group_id === action.payload.column_group_id) {
                    const updatedCellIndex = column.cells.findIndex(cell => cell.id === action.payload.id);
                    column.cells.splice(updatedCellIndex, 1, action.payload);
                }
            });
            return {
                ...state,
                columns: [...state.columns]
            };

        case NESTED_COLUMNS_ACTION.CREATE_COLUMN_FROM_SOCKET:
            const newColumns = action.payload[1];
            newColumns.forEach(column => column.cells = [action.payload[0]]);
            state.columns.push(...newColumns);
            return {
                ...state,
                columns: [...state.columns]
            };

        case NESTED_COLUMNS_ACTION.UPDATE_CHAT_FROM_SOCKET:
            const chat_history = action.payload;
            state.columns.forEach(column => {
                column.cells.forEach(cell => {
                    if (!!cell && cell.chat && cell.chat.id === chat_history.id) {
                        cell.chat = chat_history;
                    }
                });
            });
            return {
                ...state,
                columns: [...state.columns]
            };
        case NESTED_COLUMNS_ACTION.CHANGE_CHATS_READ_STATUS:
            const chat = action.payload;
            state.columns.forEach(column => {
                column.cells.forEach(cell => {
                    if (!!cell && cell.chat && cell.chat.id === chat.id) {
                        cell.chat.count_of_unread_messages = 0;
                        cell.chat.top_urgency = 5;
                    }
                });
            });
            return {
                ...state,
                columns: [...state.columns]
            };
        default:
            return state;
    }
}


const homePatientInitialState = {
    homePatients: []
};

export function homePatientReducer(state = homePatientInitialState, action: HomePatientAction) {

    switch (action.type) {

        case HOME_PATIENT_ACTION.GET_HOME_PATIENTS:
            return {
                ...state,
                homePatients: [
                    ...action.payload
                ]
            };

        case HOME_PATIENT_ACTION.UPDATE_HOME_PATIENT:
            const updatedPatientIndex = state.homePatients.findIndex(patient => patient.id === action.payload.id);
            state.homePatients.splice(updatedPatientIndex, 1, action.payload);

            return {
                ...state,
                homePatients: [...state.homePatients]
            };

        default:
            return state;
    }
}
