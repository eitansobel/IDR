import {ColumnsAction, DOCTOR_COLUMNS_ACTION} from './data-column.action';
import * as _ from 'lodash';

const initialState = {
    columns: []
};

export function dataColumnsReducer(state = initialState, action: ColumnsAction) {

    switch (action.type) {

        case DOCTOR_COLUMNS_ACTION.GET_COLUMNS:
            state.columns = _.orderBy(action.payload, 'order', ['asc']);
            return {
                ...state,
                columns: [
                    ...state.columns
                ]
            };
        case DOCTOR_COLUMNS_ACTION.CREATE_COLUMN:
            return {
                ...state,
                columns: [...state.columns, action.payload]
            };
        case DOCTOR_COLUMNS_ACTION.COPY_COLUMN:
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
        case DOCTOR_COLUMNS_ACTION.UPDATE_COLUMN:
            const columns = state.columns.filter(e => e.id !== action.payload.id);
            const updatedColumnIndex = state.columns.findIndex(e => e.id === action.payload.id);
            columns.splice(updatedColumnIndex, 0, action.payload);
            state.columns = columns;

            return {
                ...state,
                columns: [...state.columns]
            };
        case DOCTOR_COLUMNS_ACTION.DELETE_COLUMN:
            if (action.payload.author.id === Number(localStorage.getItem('idrUserId'))) {
                state.columns.forEach(item => {
                    if (item.group_id === action.payload.group_id) {
                       item.authors_in_group = item.authors_in_group.filter(author => {
                           return author !== (Number(localStorage.getItem('idrUserId')));
                       });
                    }
                });
            }
            return {
                ...state,
                columns: [...state.columns.filter(e => e.id !== action.payload.id)]
            };

        default:
            return state;
    }
}
