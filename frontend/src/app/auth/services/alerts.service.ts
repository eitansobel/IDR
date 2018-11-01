import {environment} from '../../../environments/environment';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {ApiFactory} from '../../services/api.factory';

@Injectable()
export class AlertService {
    private BASE_URL: string = environment.settings.backend1 + 'api/v1/';

    constructor(private af: ApiFactory) {}

    getAlerts(): Observable<any> {
        return this.af.sendGet(`${this.BASE_URL}alertmethod/`);
    }

    createAlerts(alert): Observable<any> {
        return this.af.sendPost(`${this.BASE_URL}alertmethod/`, alert);
    }

    editAlerts(alert, id): Observable<any> {
        return this.af.sendPatch(`${this.BASE_URL}alertmethod/${id}/`, alert);
    }

    updateDoctorAlerts(data): Observable<any> {
        const id = localStorage.getItem('idrUserId');
        return this.af.sendPatch(`${this.BASE_URL}doctor/${id}/?alert_update=1`, data);
    }

    deleteContact(id): Observable<any> {
        return this.af.sendDelete(`${this.BASE_URL}alertmethod/${id}/`);
    }

}
