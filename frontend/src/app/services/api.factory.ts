import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpErrorResponse} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

@Injectable()
export class ApiFactory {
    private token: string;
    private headers: HttpHeaders;

    constructor(private http: HttpClient) {
    }

    private handleError(error: HttpErrorResponse) {
        return Observable.throw(error.error || 'Server error'); // Observable.throw() is undefined at runtime using Webpack
    }

    sendGet(url: string) {
        const scope = this;
        this.getToken();

        return scope.http
            .get(url,
                {headers: scope.headers})
            .catch(scope.handleError);
    }

    sendGetMessages(url: string, params) {
        const scope = this;
        this.getToken();

        return scope.http
            .get(url,
                {headers: scope.headers, params: params})
            .catch(scope.handleError);
    }

    sendPost(url, data) {
        const scope = this;
        this.getToken();

        return scope.http
            .post(url,
                data,
                {headers: scope.headers})
            .catch(scope.handleError);
    }

    sendPatch(url, data) {
        const scope = this;
        this.getToken();
        return scope.http
            .patch(url,
                data,
                {headers: scope.headers})
            .catch(scope.handleError);
    }

    sendImagePost(url, data) {
        const scope = this;
        this.getToken();
        const header2 = new HttpHeaders({'Authorization': `Token ${this.token}`});
        return scope.http
            .post(url,
                data,
                {headers: header2})
            .catch(scope.handleError);
    }

    sendFilePost(url, data) {
        const scope = this;
        this.getToken();
        const header2 = new HttpHeaders({
            'Authorization': `Token ${this.token}`, 'enctype': 'multipart/form-data'
        });
        return scope.http
            .post(url,
                data,
                {headers: header2})
            .catch(scope.handleError);
    }

    sendImageDelete(url) {
        const scope = this;
        this.getToken();

        return scope.http
            .post(url, {},
                {headers: scope.headers})
            .catch(scope.handleError);
    }

    sendDelete(url) {
        const scope = this;
        this.getToken();

        return scope.http
            .delete(url,
                {headers: scope.headers})
            .catch(scope.handleError);
    }

    getToken() {
        this.token = localStorage.getItem('idrToken');
        this.headers = new HttpHeaders({
            'Content-Type': 'application/json', 'Authorization': `Token ${this.token}`
        });
    }

    sendHead(url) {
        const scope = this;
        this.getToken();
        return scope.http.options(url, {headers: scope.headers}).catch(scope.handleError);
    }
}
