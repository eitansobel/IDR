import {environment} from '../../../environments/environment';
import {ApiFactory} from '../../services/api.factory';
import {Injectable} from '@angular/core';

@Injectable()
export class ProfileService {
    private BASE_URL: string = environment.settings.backend1 + 'api/';
    constructor(private af: ApiFactory) {}

    getProfile() {
        const id = localStorage.getItem('idrUserId');
        return this.af.sendGet(`${this.BASE_URL}v1/doctor/${id}/`);
    }

    getProfile2() {
        const id = localStorage.getItem('idrUserId');
        return this.af.sendGet(`${environment.settings.backend2}api/v2/doctor/${id}/`);
    }

    updatePhoto(data) {
        const id = localStorage.getItem('idrUserId');
        return this.af.sendImagePost(`${environment.settings.backend2}api/v2/doctor/${id}/set_photo/`, data);
    }
    updateMemberPhoto(data, id) {
        return this.af.sendImagePost(`${environment.settings.backend2}api/v2/doctor/${id}/set_photo/`, data);
    }

    deletePhoto() {
        const id = localStorage.getItem('idrUserId');
        return this.af.sendImageDelete(`${environment.settings.backend2}/api/v2/doctor/${id}/clear_photo/`);
    }

    updateProfileServer1(data) {
        const id = localStorage.getItem('idrUserId');
        return this.af.sendPatch(`${this.BASE_URL}v1/doctor/${id}/`, data);
    }

    updateMemberServer1(data, id) {
        return this.af.sendPatch(`${this.BASE_URL}v1/doctor/${id}/`, data);
    }

    changePass(data) {
        const id = localStorage.getItem('idrUserId');
        return this.af.sendPost(`${environment.settings.backend2}api/v2/doctor/${id}/set_password/`, data);
    }

    getPermissions() {
        const id = localStorage.getItem('idrUserId');
        return this.af.sendGet(`${this.BASE_URL}v1/doctor/${id}/permissions/`);
    }
    makeEmptyRequests() {
        const id = localStorage.getItem('idrUserId');
        this.af.sendHead(`${this.BASE_URL}v1/doctor/${id}/`).subscribe();
        this.af.sendHead(`${environment.settings.backend2}api/v2/doctor/${id}/`).subscribe();
    }

    invalidateDoctorCache() {
        const id = localStorage.getItem('idrUserId');
        return this.af.sendPost(`${this.BASE_URL}v1/doctor/${id}/invalidate_doctor_cache/`, {}).subscribe();
    }
}
