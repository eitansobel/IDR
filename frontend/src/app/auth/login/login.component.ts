import {Component, OnInit} from '@angular/core';
import {
    FormGroup,
    Validators,
    FormBuilder,
    AbstractControl
} from '@angular/forms';
import {User} from '../../models/user';
import {Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {AddProfile} from '../../redux/profile/profile.action';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import * as moment from 'moment';
import {DateValidator} from '../../models/validator';
import {ClearLists} from '../../redux/staff/staff.action';
import {ClearMembers} from '../../redux/members/members.action';

@Component({
    selector: 'idr-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    form: FormGroup;
    message: string;
    username: AbstractControl;
    formSubmitted: boolean = false;
    lock;
    redirectLink;

    constructor(private fb: FormBuilder,
                private auth: AuthService,
                private router: Router,
                private store: Store<AppState>) {
        const now = new Date();
        const nowInTimestamp = moment(now).format('X');
        const getOldTime = localStorage.getItem('signout_time');

        if (!getOldTime) {
            localStorage.removeItem('username');
            localStorage.removeItem('signout_time');
            localStorage.removeItem('lock');
            localStorage.removeItem('logoutPage');
        } else {
            const oldTime = moment(getOldTime).format('X');
            if (oldTime < nowInTimestamp) {
                localStorage.removeItem('username');
                localStorage.removeItem('signout_time');
                localStorage.removeItem('lock');
                localStorage.removeItem('logoutPage');
            }
        }
    }

    ngOnInit() {
        this.lock = localStorage.getItem('lock');
        this.redirectLink = localStorage.getItem('logoutPage');

        this.form = this.fb.group({
            username: ['', [
                Validators.required,
                Validators.minLength(3)
            ]],
            password: [null, [
                Validators.required,
                Validators.minLength(3)]
            ],
            selectedMoment2: [new Date(), Validators.compose([Validators.required, DateValidator.date])]
        });
        this.form.get('username').patchValue(localStorage.getItem('username'));
    }

    login() {
        if (this.form.dirty && this.form.valid) {
            this.formSubmitted = false;
            const signOutTime = moment(this.form.value.selectedMoment2).format();
            
            if (this.lock) {

                this.auth.login(new User(
                    this.form.value.username,
                    this.form.value.password,
                    localStorage.getItem('signout_time')
                )).subscribe(
                    (data) => {
                        localStorage.setItem('idrToken', data.token);
                        localStorage.setItem('idrUserId', data.user.id);
                        this.router.navigateByUrl(this.redirectLink);
                        this.store.dispatch(new AddProfile(data.user));
                    },
                    (err) => {
                        // * check if error is not standart *//
                        this.message = err.non_field_errors[0];
                    });
            } else {

                if (localStorage.getItem('idrToken')) {
                    this.router.navigateByUrl('auth/set-alerts');
                    this.store.dispatch(new ClearLists());
                    this.store.dispatch(new ClearMembers());
                } else {
                    this.auth.login(new User(
                        this.form.value.username,
                        this.form.value.password,
                        signOutTime
                    )).subscribe(
                        (data) => {
                            this.store.dispatch(new ClearLists());
                            this.store.dispatch(new ClearMembers());
                            localStorage.setItem('idrToken', data.token);
                            localStorage.setItem('idrUserId', data.user.id);
                            localStorage.setItem('username', this.form.value.username);
                            localStorage.setItem('signout_time', signOutTime);
                            this.router.navigateByUrl('auth/set-alerts');
                            this.store.dispatch(new AddProfile(data.user));
                        },
                        (err) => {
                            // * check if error is not standart *//
                            this.message = err.non_field_errors[0];
                        });
                }
            }
        } else {
            this.formSubmitted = true;
        }
    }

    safeMode() {
        localStorage.removeItem('username');
        localStorage.removeItem('lock');
        localStorage.removeItem('logoutPage');
        this.form.get('username').patchValue(localStorage.getItem(''));
        this.lock = false;
    }

    registration() {
    }
}
