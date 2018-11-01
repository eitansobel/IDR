import {Patient} from "./patient";

export class PatientsList {
    id?: number;
    title: string;
    qty: number;
    update_time?: string;
    participants?;

    constructor(list) {
        [this.id, this.title, this.update_time] = list;
        this.qty = list.participants.length;
    }
}

export interface PatientsLists {
    patientsLists: PatientsList[];
}

export class PatientRecordInChosenPatientList {
    id: number;
    show: boolean;
    patient: Patient[];
}

export class ChosenPatientList {
    participants: PatientRecordInChosenPatientList[];
    title: string;
}
