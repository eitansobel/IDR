import {environment} from '../../../environments/environment';
import {ApiFactory} from '../../services/api.factory';
import {Injectable} from '@angular/core';

@Injectable()
export class StaffService {
    private BASE_URL: string = environment.settings.backend1 + 'api/';
    constructor(private af: ApiFactory) {}

    getStaffList() {
        return this.af.sendGet(`${this.BASE_URL}v1/stufflist/`);
    }

    getAllMembers() {
        return this.af.sendGet(`${this.BASE_URL}v1/doctor/`);
    }

    getAllMembers2() {
        return this.af.sendGet(`${environment.settings.backend2}api/v2/doctor/`);
    }

    createList(data) {
        return this.af.sendPost(`${this.BASE_URL}v1/stufflist/`, data);
    }
    
    multyUpload(fileData) {
        return this.af.sendFilePost(`${this.BASE_URL}v1/doctor/import_csv/`, fileData);
    }

    removeList(id: number) {
        return this.af.sendDelete(`${this.BASE_URL}v1/stufflist/${id}/`);
    }

    getSingleList(id: number) {
        return this.af.sendGet(`${this.BASE_URL}v1/stufflist/${id}/`);
    }

    updateSingleList(data, id) {
        return this.af.sendPatch(`${this.BASE_URL}v1/stufflist/${id}/`, data);
    }

    getMemberPermissions(id) {
        return this.af.sendGet(`${this.BASE_URL}v1/doctor/${id}/permissions/`);
    }

    setMemberPermissions(data, id) {
        return this.af.sendPost(`${this.BASE_URL}v1/doctor/${id}/permissions/`, data);
    }

    deleteUser(id) {
        return this.af.sendDelete(`${this.BASE_URL}v1/doctor/${id}/`);
    }

    deleteSelf(id) {
        return this.af.sendPost(`${this.BASE_URL}v1/stufflist/${id}/delete_myself/`, '');
    }
}
