import 'rxjs/add/operator/do';
import {Router} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {AppState} from '../redux/app.state';
import {TokenGoingToExpire} from '../redux/token-status/token-status.action';
import {environment} from '../../environments/environment';
import {Store} from '@ngrx/store';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor, HttpResponse, HttpErrorResponse
} from '@angular/common/http';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    private lastRequestTimer;

    constructor(private router: Router,
                private store: Store<AppState>) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        return next.handle(request).do((event: HttpEvent<any>) => {
            if (event instanceof HttpResponse) {
                this.setTokenGoingToExpireTimeout();
            }

        }, (err: any) => {
            if (err instanceof HttpErrorResponse) {
                if (err.status === 401 || err.status === 403 && err.error && err.error.detail === 'Invalid token') {
                    localStorage.removeItem('idrToken');
                    localStorage.removeItem('idrId');
                    localStorage.removeItem('lock');
                    localStorage.removeItem('username');
                    localStorage.removeItem('alerts');
                    localStorage.removeItem('logoutTimerId');
                    localStorage.setItem('logoutPage', this.router.url);
                    this.router.navigateByUrl('auth/login');
                }
            }
        });
    }

    setTokenGoingToExpireTimeout() {
        clearTimeout(this.lastRequestTimer);
        this.lastRequestTimer = setTimeout(() => {
            this.store.dispatch(new TokenGoingToExpire());
        }, environment.logOutAfter - 60 * 1000);
    }
}