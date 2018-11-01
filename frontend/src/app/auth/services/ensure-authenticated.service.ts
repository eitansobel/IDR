import {Injectable} from '@angular/core';
import {environment} from '../../../environments/environment';
import {CanActivate, Router} from '@angular/router';
import {ApiFactory} from '../../services/api.factory';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import {AddProfile} from '../../redux/profile/profile.action';
import {NotifyService} from "../../services/notify.service";
@Injectable()
export class EnsureAuthenticated implements CanActivate {
    private BASE_URL: string = environment.settings.backend1 + 'api/';
    constructor(
        private store: Store<AppState>,
        private af: ApiFactory,
        private notify: NotifyService,
        private router: Router) {}

    canActivate(): boolean {
        const token = localStorage.getItem('idrToken');

        this.getProfile().subscribe(
            (pf) => {
                this.store.dispatch(new AddProfile(pf));
            },
            err => {
                this.notify.notifyError(err);
            });
        if (token) {
            return true;
        } else {
            this.router.navigateByUrl('/auth/login');
            return false;
        }
    }

    getProfile() {
        const id = localStorage.getItem('idrUserId');
        return this.af.sendGet(`${this.BASE_URL}v1/doctor/${id}/`);
    }
}
