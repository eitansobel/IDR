import {environment} from '../../../environments/environment';
import {ApiFactory} from '../../services/api.factory';
import {Injectable} from '@angular/core';

@Injectable()
export class PatientsService {
    private BASE_URL: string = environment.settings.backend1 + 'api/';

    constructor(private af: ApiFactory) {
    }

    getPatList() {
        return this.af.sendGet(`${this.BASE_URL}v1/patientlist/`);
    }

    getAllPatients() {
        return this.af.sendGet(`${this.BASE_URL}v1/patient/`);
    }

    getMypatients() {
        return this.af.sendGet(`${this.BASE_URL}v1/doctorpatient/`);
    }

    createList(data) {
        return this.af.sendPost(`${this.BASE_URL}v1/patientlist/`, data);
    }

    //
    removeList(id: number) {
        return this.af.sendDelete(`${this.BASE_URL}v1/patientlist/${id}/`);
    }

    getSingleList(id: number) {
        return this.af.sendGet(`${this.BASE_URL}v1/patientlist/${id}/`);
    }

    changeMyPatients(data) {
        const id = localStorage.getItem('idrUserId');
        return this.af.sendPost(`${this.BASE_URL}v1/doctor/${id}/my_patients/`, data);
    }

    updateSingleList(data, id) {
        return this.af.sendPatch(`${this.BASE_URL}v1/patientlist/${id}/`, data);
    }

    patientShow(value: boolean, id) {
        return this.af.sendPatch(`${this.BASE_URL}v1/doctorpatient/${id}/`, {show: value});
    }

    setMyPatientList(values) {
        const id = localStorage.getItem('idrUserId');
        return this.af.sendPost(`${this.BASE_URL}v1/doctor/${id}/my_patients/`, {my_patients_list_participants: values});
    }

    getSinglePatient(id) {
        return this.af.sendGet(`${this.BASE_URL}v1/patient/${id}/`);
    }

    createPatient(data) {
        return this.af.sendPost(`${this.BASE_URL}v1/patient/`, data);
    }

    updatePatient(id, data) {
        return this.af.sendPatch(`${this.BASE_URL}v1/patient/${id}/`, data);
    }

    deletePatient(id) {
        return this.af.sendDelete(`${this.BASE_URL}v1/patient/${id}/`);
    }

    multyUpload(fileData) {
        return this.af.sendFilePost(`${this.BASE_URL}v1/patient/import_csv/`, fileData);
    }
}
