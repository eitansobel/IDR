import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import {AuthService} from '../../auth/services/auth.service';
import {ClearAlert} from '../../redux/alerts/alerts.action';
import {ClearLists} from '../../redux/staff/staff.action';
import {Logout} from '../../redux/profile/profile.action';
import {Router} from '@angular/router';
import {ClearPatients} from '../../redux/patients/patients.action';
import {ClearPatLists} from '../../redux/patientsList/patientsList.action';
import {NotifyService} from "../../services/notify.service";

@Component({
    selector: 'idr-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
    public headerText = '';
    private saveMode = false;
    username;
    constructor(
        public dialogRef: MatDialogRef<LogoutComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private auth: AuthService,
        private notify: NotifyService,
        private router: Router,
        private store: Store<AppState>, ) {
        if (this.data) {
            this.headerText = this.data.header;
            this.username = this.data.username;
        }
    }

    ngOnInit() {}

    closeDialog() {
        this.dialogRef.close();
    }

    logoutControl(value) {
        this.saveMode = value;
    }

    save() {
        if (!this.saveMode) {
            this.auth.logout().subscribe(() => {
                this.clearStore();
                this.clearLocalStorage();
                this.closeDialog();
            }, (err) => {
                if (err.detail === 'Invalid token') {
                    this.clearStore();
                    this.clearLocalStorage();
                } else {
                    this.notify.notifyError(err);
                }
            });
        } else {
            localStorage.removeItem('idrToken');
            localStorage.removeItem('idrId');
            this.router.navigateByUrl('auth/login');
            this.clearStore();
            localStorage.setItem('lock', 'true');
            localStorage.setItem('logoutPage', this.router.url);
        }
    }

    clearLocalStorage() {
        localStorage.removeItem('idrToken');
        localStorage.removeItem('idrId');
        localStorage.removeItem('lock');
        localStorage.removeItem('username');
        localStorage.removeItem('logoutPage');
        localStorage.removeItem('alerts');
        localStorage.removeItem('logoutTimerId');
        this.router.navigateByUrl('auth/login');
        this.closeDialog();
    }

    clearStore() {
        this.store.dispatch(new Logout());
        this.store.dispatch(new ClearAlert());
        this.store.dispatch(new ClearLists());
        this.store.dispatch(new ClearPatLists());
        this.store.dispatch(new ClearPatients());
        this.closeDialog();
    }
}
