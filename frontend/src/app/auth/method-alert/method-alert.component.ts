import {Component, OnInit, ViewChild} from '@angular/core';
import {Departament} from '../../models/hospital-departments';
import {Hospitals, Hospital} from '../../models/hospital';
import {Alerts} from '../../models/alert';
import {HospitalDepartmentService} from '../../services/hospital.structure.service';
import {AddProfile} from '../../redux/profile/profile.action';
import {CustomValidators} from '../../models/validator';
import {NgOption, NgSelectConfig} from '@ng-select/ng-select';
import {
    FormGroup,
    Validators,
    FormBuilder,
    AbstractControl
} from '@angular/forms';
import {Router} from '@angular/router';
import {AlertService} from '../../auth/services/alerts.service';
import {GetAlerts} from '../../redux/alerts/alerts.action';
import {MatDialog} from '@angular/material';
import {AddAlertComponent} from './add-alert/add-alert.component';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import {Observable} from 'rxjs/Observable';
import {LoadHospitals} from '../../redux/hospitals/hospital.action';
import {GetRole} from '../../redux/roles/role.action';
import {ProfileService} from '../../profile/service/profile.service';
import * as _ from 'lodash';
import {NotifyService} from "../../services/notify.service";

@Component({
    selector: 'idr-method-alert',
    templateUrl: './method-alert.component.html',
    styleUrls: ['./method-alert.component.scss'],
    providers: [ProfileService, AlertService]
})
export class MethodAlertComponent implements OnInit {

    form: FormGroup;
    message;
    username: AbstractControl;
    formSubmitted: boolean = false;
    alertState: Observable<Alerts>;
    hospitalsState: Observable<Hospitals>;
    rolesState: any[];
    hospital_department: Departament[];
    alerts: NgOption[] = [];
    is_admin: false;
    tempArray;
    arrayForm = [];
    removeForm = [];
    tempArr3 = [];
    @ViewChild(AddAlertComponent) productsChild: AddAlertComponent;

    constructor(private fb: FormBuilder,
        private alertService: AlertService,
        public dialog: MatDialog,
        private store: Store<AppState>,
        private hd: HospitalDepartmentService,
        private pService: ProfileService,
        private notify: NotifyService,
        private router: Router) {

        /* get history of alerts */
        this.alertService.getAlerts().subscribe((alerts) => {
            this.store.dispatch(new GetAlerts(alerts));
        }, err => {
            if (err.detail === 'Invalid token') {
                localStorage.removeItem('idrToken');
                localStorage.removeItem('idrId');
            }
            this.notify.notifyError(err);
        });

    }

    ngOnInit() {
        /* Get saved profile data and push to store */
        this.hospitalsState = this.store.select('hospitalsPage');

        this.form = this.fb.group({
            title: [null, [Validators.required, Validators.minLength(3),
            Validators.maxLength(30),
            CustomValidators.validateBackspace
            ]],
            hospital: [null, [Validators.required]],
            hospital_department: [null, [Validators.required]],
            hospital_role: [null, [Validators.required]],
            first: [null, [
                Validators.required,
            ]],
            second: [null, [
                Validators.required,
            ]],
            third: [null],
            forth: [null],
        });

        this.hd.getDepartments().subscribe((departments: Hospital[]) => {
            this.store.dispatch(new GetRole(departments[0].hospital_role));
            this.store.dispatch(new LoadHospitals(departments));
            this.store.select('profilePage').subscribe((data) => {
                if(!data.partialProfile) return; 
                if(data.partialProfile)  this.is_admin = data.partialProfile.is_admin;

                this.store.select('rolesPage').map((x) => x.roles).subscribe((_roles) => {
                    this.rolesState = _roles.filter((x) => {
                        if (!this.is_admin && x.id === 1) {
                            return false;
                        } else {
                            return x;
                        }
                    });
                });
                if (!data.partialProfile.hospital) return;

                this.form.get('hospital_role').patchValue(data.partialProfile.hospital_role);
                this.form.get('hospital_department').patchValue(data.partialProfile.hospital_department);
                this.form.get('hospital').patchValue(data.partialProfile.hospital);
                this.form.get('title').patchValue(data.partialProfile.title);

                if (data.partialProfile.alerts) {

                    if (data.partialProfile.alerts.alert1) {
                        this.form.get('first').patchValue(data.partialProfile.alerts.alert1.id);
                    }
                    if (data.partialProfile.alerts.alert2) {
                        this.form.get('second').patchValue(data.partialProfile.alerts.alert2.id);
                    }
                    if (data.partialProfile.alerts.alert3) {
                        this.form.get('third').patchValue(data.partialProfile.alerts.alert3.id);
                    }
                    if (data.partialProfile.alerts.alert4) {
                        this.form.get('forth').patchValue(data.partialProfile.alerts.alert4.id);
                    }
                }

                this.store.select('hospitalsPage').subscribe((hp) => {
                    const hospital = hp.hospitals.filter((hp) => hp.hospital_id === data.partialProfile.hospital);
                    this.hospital_department = hospital[0].hospital_department;
                });

                this.store.select('alertSingle').map((_a) => _a.setAlert[0]).subscribe((_a) => {
                    if (!_a) return;
                    switch (_a.selectedItem) {
                        case 1:
                            this.form.get('first').patchValue(_a.id);
                            break;
                        case 2:
                            this.form.get('second').patchValue(_a.id);
                            break;
                        case 3:
                            this.form.get('third').patchValue(_a.id);
                            break;
                        case 4:
                            this.form.get('forth').patchValue(_a.id);
                            break;
                    }
                });

                this.store.select('alertPage').subscribe((_a) => {
                    this.alerts = _a.alerts.filter((x) => {
                        return x.show === true;
                    });
                    this.tempArray = _a.alerts.filter((x) => {
                        return x.show === true;
                    });

                    if (!this.alerts.find((obj) => obj.id === this.form.value.first)) {
                        this.form.get('first').patchValue(null);
                    }
                    if (!this.alerts.find((obj) => obj.id === this.form.value.second)) {
                        this.form.get('second').patchValue(null);
                    }
                    if (!this.alerts.find((obj) => obj.id === this.form.value.third)) {
                        this.form.get('third').patchValue(null);
                    }
                    if (!this.alerts.find((obj) => obj.id === this.form.value.forth)) {
                        this.form.get('forth').patchValue(null);
                    }
                    this.arrayForm = [];
                    this.arrayForm.push(this.form.value.first);
                    this.arrayForm.push(this.form.value.second);
                    this.arrayForm.push(this.form.value.third);
                    this.arrayForm.push(this.form.value.forth);
                    setTimeout(() => {
                        this.arrayForm.forEach((y) => {
                            this.alerts = this.alerts.filter((x) => x.id !== y);
                        });
                    });
                });
                this.arrayForm = [];
                this.arrayForm.push(this.form.value.first);
                this.arrayForm.push(this.form.value.second);
                this.arrayForm.push(this.form.value.third);
                this.arrayForm.push(this.form.value.forth);
                setTimeout(() => {
                    this.arrayForm.forEach((y) => {
                        this.alerts = this.alerts.filter((x) => x.id !== y);
                    });
                });
            }, err => this.notify.notifyError(err));

        }, err => {
            if (err.detail === 'Invalid token') {
                localStorage.removeItem('idrToken');
                localStorage.removeItem('idrId');
            }
            this.notify.notifyError(err);
        });
    }

    removeFromArray() {
        this.removeForm = [];
        this.removeForm.push(this.form.value.first);
        this.removeForm.push(this.form.value.second);
        this.removeForm.push(this.form.value.third);
        this.removeForm.push(this.form.value.forth);
        const indexDiff = _.difference(this.arrayForm, this.removeForm);

        const el = this.tempArray.find((_c) => _c.id === indexDiff[0]);
        this.arrayForm = this.arrayForm.filter((_c) => indexDiff[0] !== _c);

        if (!el) return;
        const arr = this.alerts;
        arr.push(el);
        return arr;
    }

    addToArray(event) {
        const temp = [];
        temp.push(this.form.value.first);
        temp.push(this.form.value.second);
        temp.push(this.form.value.third);
        temp.push(this.form.value.forth);
        const some = this.alerts.map((x) => x.id);
        const other = this.tempArray.map((x) => x.id);
        const mergeArr = _.union(temp, some);
        const indexDiff = _.difference(other, mergeArr);

        if (indexDiff.length > 0) {
            const el = this.tempArray.find((_c) => _c.id === indexDiff);
            this.alerts.push(el);
        }

        this.alerts = this.alerts.filter((x) => x.id !== event.id);
        this.arrayForm = [];
        this.arrayForm.push(this.form.value.first);
        this.arrayForm.push(this.form.value.second);
        this.arrayForm.push(this.form.value.third);
        this.arrayForm.push(this.form.value.forth);
    }

    update(event) {
        if (!event) {
            const arr = this.removeFromArray();
            this.alerts = [];
            const scope = this;
            setTimeout(() => {
                scope.alerts = arr;
            }, 0);
        }
    }

    onChange($event) {
        this.form.get('hospital_department').patchValue(null);
        this.hospital_department = $event.hospital_department;
    }

    setAlerts() {

        if (this.form.valid) {
            this.formSubmitted = false;
            localStorage.setItem('alerts', 'true');
            const data = {
                'hospital_department': this.form.value.hospital_department,
                'hospital_role': this.form.value.hospital_role,
                'alerts': {
                    'alert1': this.form.value.first,
                    'alert2': this.form.value.second,
                    'alert3': this.form.value.third,
                    'alert4': this.form.value.forth,
                },
                'hospital': this.form.value.hospital,
                'title': this.form.value.title
            };

            this.alertService.updateDoctorAlerts(data).subscribe((data) => {
                this.router.navigateByUrl('dashboard/profile');
            }, err => {
                if (err.detail === 'Invalid token') {
                    localStorage.removeItem('idrToken');
                    localStorage.removeItem('idrId');
                    localStorage.removeItem('lock');
                    localStorage.removeItem('username');
                    this.router.navigateByUrl('auth/login');
                } else {
                    this.notify.notifyError(err);
                }
            });
        } else {
            this.formSubmitted = true;
        }
    }

    createNewAlert() {
        this.dialog.open(AddAlertComponent, {
            width: '340px',
            data: {
                header: 'Add New Alert',
                ok: 'Save',
                edit: false
            }
        });
    }

    editAlert() {
        this.dialog.open(AddAlertComponent, {
            width: '340px',
            data: {
                header: 'Edit Alert',
                ok: 'Save',
                edit: true
            }
        });
    }

}
