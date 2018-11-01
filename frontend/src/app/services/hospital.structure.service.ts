import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class HospitalDepartmentService {
    private BASE_URL: string = environment.settings.backend1 + 'api/';
    private headers: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});

    constructor(private http: HttpClient) {}

    private handleError(error: HttpErrorResponse) {
        return Observable.throw(error.error || 'Server error'); // Observable.throw() is undefined at runtime using Webpack
    }

    getDepartments(): Observable<any> {
        const url: string = `${this.BASE_URL}v1/hospitalstructure/`;

        return this.http
            .get(url,
            {headers: this.headers})
            .catch(this.handleError);
    }

    getHospitals(id): Observable<any> {
        const url: string = `${this.BASE_URL}v1/hospitalstructure/${id}`;

        return this.http
            .get(url,
            {headers: this.headers})
            .catch(this.handleError);
    }

}
