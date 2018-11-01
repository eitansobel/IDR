import {PatAction, PATIENTSLIST_ACTION} from './patientsList.action';
import * as _ from "lodash";
import * as moment from "moment";

const initialState = {
    patientsLists: [],
    chosenList: []
};

function transformPatientList(patientLists) {
    const today = new Date();
    const yesterday = moment(today.setDate(today.getDate() - 1)).format('DD/MM/YYYY');
    const allPatientList: any[] = [];
    const datePat = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
    const customPatientLists = patientLists.filter(x => {
        if (x.hasOwnProperty('all_patients')) {
            allPatientList.push({
                'qty': x['all_patients'].length,
                'title': 'All Patients',
                'participants': x['all_patients']
            });
            return;

        } else {
            if (!x['participants']) return;
            x['qty'] = x['participants'].length;
            if (!x.update_time) return x;
            const updateTime = moment(x.update_time).format('X');
            if (!x.update_time.match(datePat) && x.update_time !== 'yesterday') {
                x.update_time = moment(updateTime, 'X').format('DD/MM/YYYY');
                if (yesterday === x.update_time) {
                    x.update_time = 'yesterday';
                }
            }
            return x;
        }
    });
    return [...customPatientLists, ...allPatientList];
}

export function patReducer(state = initialState, action: PatAction) {
    switch (action.type) {
        case PATIENTSLIST_ACTION.GET_PATIENTSLISTS:
            if (state.chosenList.length && state.chosenList[0].title === 'All Patients') {
                state.chosenList = [{
                    title: 'All Patients',
                    participants: action.payload[action.payload.length - 1]['all_patients']
                }];
            }

            return {
                ...state,
                patientsLists: transformPatientList(action.payload)
            };

        case PATIENTSLIST_ACTION.SET_CHOSEN_PATIENT_LIST:
            return {
                ...state,
                patientsLists: [
                    ...state.patientsLists
                ],
                chosenList: [
                    action.payload
                ]
            };

        case PATIENTSLIST_ACTION.UPDATE_CHOSEN_PATIENT_LIST:
            const updateList = transformPatientList([action.payload])[0];
            if (updateList.title !== 'My Patients') {
                const lists = state.patientsLists.filter(e => e.id !== updateList.id);
                const listIndex = state.patientsLists.findIndex(e => e.id === updateList.id);
                lists.splice(listIndex, 0, updateList);
                state.patientsLists = lists;

                state.chosenList = [{
                    title: updateList.title,
                    participants: updateList.participants
                }];
            } else {
                const lists = state.patientsLists.filter(e => e.title !== updateList.title);
                const listIndex = state.patientsLists.findIndex(e => e.title === updateList.title);
                lists.splice(listIndex, 0, updateList);
                state.patientsLists = lists;
                state.chosenList = updateList;
            }
            return {
                ...state,
                patientsLists: [
                    ...state.patientsLists
                ],
                chosenList: [
                    ...state.chosenList
                ]
            };

        case PATIENTSLIST_ACTION.ADD_LIST:
            const newList = transformPatientList([action.payload])[0];
            state.patientsLists.splice(-1, 0, newList);
            return {
                ...state,
                patientsLists: [...state.patientsLists],
            };

        case PATIENTSLIST_ACTION.UPDATE_MY_PATIENT_STATUS:
            state.patientsLists.forEach(e => {
                if (e.title === 'My Patients') {
                    e.participants.map(x => {
                        if (x.id === action.payload.id) {
                            x.show = !x.show;
                        }
                        return x;
                    });
                }
            });


            return {
                ...state,
                patientsLists: [
                    ...state.patientsLists
                ],
                chosenList: [
                    ...state.chosenList
                ]
            };

        case PATIENTSLIST_ACTION.DELETE_LIST:
            return {
                ...state,
                patientsLists: [
                    ...state.patientsLists.filter(e => e.id !== action.payload)
                ],
                chosenList: []
            };


        case PATIENTSLIST_ACTION.UPDATE_LOADED_ALL_LIST:
            if (!state.chosenList.length) {
                return state;
            }
            const members = state.chosenList[0].participants.filter(e => e.remote_id !== action.payload.id);
            const index = state.chosenList[0].participants.findIndex(e => e.remote_id === action.payload.id);
            const updatedPatientDoctor = action.payload;
            const oldPatientDoctor = state.chosenList[0].participants[index];
            updatedPatientDoctor.id = oldPatientDoctor.id;
            updatedPatientDoctor.show = oldPatientDoctor.show;
            members.splice(index, 0, updatedPatientDoctor);
            state.chosenList[0].participants = members;
            return {
                ...state,
                chosenList: [
                    ...state.chosenList
                ]
            };
        case PATIENTSLIST_ACTION.DELETE_PATIENT:
            let list = state.patientsLists.filter(e => e.title === action.payload.title);
            const membersAll = list[0]['All Patients']
                .filter(e => e.remote_id !== action.payload.user_id);

            let mylist = state.patientsLists.filter(e => e.title === 'My Patients');
            let mylistIndex = state.patientsLists.findIndex(e => e.title === 'My Patients');

            const membersMy = mylist[0]['participants']
                .filter(e => e.remote_id !== action.payload.user_id);
            state.patientsLists[state.patientsLists.length - 1]['all_patients'] = membersAll;
            state.patientsLists[mylistIndex]['participants'] = membersMy;

            return {
                ...state,
                patientsLists: [
                    ...state.patientsLists
                ],
                chosenList: [
                    ...state.chosenList
                ]
            };


        case PATIENTSLIST_ACTION.DELETE_FROM_PAT_LIST:
            return {
                ...state,
                patientsLists: [
                    ...state.patientsLists
                ],
                chosenList: [
                    ...state.chosenList
                ]
            };

        case PATIENTSLIST_ACTION.CLEAR_PATIENTS_LIST:

            return {
                patientsLists: [],
                chosenList: []
            };

        default:
            return state;
    }
}
