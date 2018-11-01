import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Store} from '@ngrx/store';
import {AppState} from '../../../redux/app.state';
import {AddAlert, SetAlert, DeletAlert, EditAlert} from '../../../redux/alerts/alerts.action';
import {Alert} from '../../../models/alert';
import {CustomValidators} from '../../../models/validator';
import {AlertService} from '../../../auth/services/alerts.service';
import {Router} from '@angular/router';
import {
    FormGroup,
    Validators,
    FormBuilder
} from '@angular/forms';
import {HelpService} from "../../../services/help.service";
import {NotifyService} from "../../../services/notify.service";
@Component({
    selector: 'idr-add-alert',
    templateUrl: './add-alert.component.html',
    styleUrls: ['./add-alert.component.scss'],
    providers: [AlertService]
})
export class AddAlertComponent implements OnInit {
    form: FormGroup;
    message;
    formSubmitted: boolean = false;
    selectedItem;
    valuePlaceholder = 'Number or Email';
    title_uniq = false;
    dynamicValidation = CustomValidators.validateEmail;
    alert_type: object[] = [];
    alertsList = [];
    public promoListText: string = '';
    public headerText: string = '';
    hideCancel: boolean = false;
    alertId: number;
    ok: string = '';
    contactList = [];
    contact;
    contactTypeTemp;
    contactValueTemp = '';
    contactId;
    show: boolean = true;
    prAlerts = [];

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<AddAlertComponent>,
        private helpService: HelpService,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private notify: NotifyService,
        private store: Store<AppState>,
        private alertService: AlertService,
        private router: Router
    ) {
        if (this.data) {
            this.headerText = this.data.header;
            this.ok = this.data.ok;

            if (this.data.edit) {
                this.store.select('profilePage').map((_data) => _data.profile).subscribe((_profile) => {
                    this.prAlerts = _profile.alerts;
                });
            }
        }
        this.store.select('alertPage').subscribe((_data) => {
            this.contactList = _data.alerts;
        });

        this.alert_type = this.helpService.getAlert_type;
        this.alertsList = this.helpService.getAlertsList;
    }

    ngOnInit() {
        this.form = this.fb.group({
            alert_type: [null, [
                Validators.required,
                Validators.minLength(3)
            ]],
            title: [null, [
                Validators.required,
                CustomValidators.validateCharacters,
                Validators.minLength(3)]
            ],
            value: [null,
                [Validators.required,
                CustomValidators.validatePhone]
            ],
            contact: [null]
        });
    }

    onContact(event) {
        if (!event) {
            this.form.controls.title.patchValue(null);
            this.form.controls.value.patchValue(null);
            this.form.controls.alert_type.patchValue(null);
            return;
        }
        this.form.controls.title.patchValue(event.title);

        this.form.controls.value.patchValue(event.value);
        this.form.controls.alert_type.patchValue(event.alert_type);
        this.contactValueTemp = event.value;
        this.contactTypeTemp = event.alert_type;
        this.contact = event;

        this.alertId = event.index_number;
        if (event.alert_type === 5) {
            this.onTypeChange({'label': event.title, 'value': event.alert_type});
        }

        if (this.prAlerts) {
            if (this.prAlerts['alert1'] && this.prAlerts['alert1'].id === event.id) {
                this.selectedItem = 1;
            } else if (this.prAlerts['alert2'] && this.prAlerts['alert2'].id === event.id) {
                this.selectedItem = 2;
            } else if (this.prAlerts['alert3'] && this.prAlerts['alert3'].id === event.id) {
                this.selectedItem = 3;
            } else if (this.prAlerts['alert4'] && this.prAlerts['alert4'].id === event.id) {
                this.selectedItem = 4;
            } else if (!event.show) {
                this.selectedItem = 5;
            } else {
                this.selectedItem = 0;
            }
        }
    }

    onTypeChange($event) {
        if (!this.contactTypeTemp) {
            this.form.controls.value.patchValue('');
        }
        if ($event.value === 5 && this.contactTypeTemp !== 5) {
            this.form.controls.value.patchValue('');
            this.valuePlaceholder = 'Email';

            this.form.get('value').setValidators([Validators.required, CustomValidators.validateEmail]);
        } else if ($event.value === 5 && this.contactTypeTemp === 5) {
            this.form.controls.value.patchValue(this.contactValueTemp);
            this.form.get('value').setValidators([Validators.required, CustomValidators.validateEmail]);
        } else if (!$event.value) {
            this.valuePlaceholder = 'Number  or Email';
            this.form.controls.value.patchValue('');
        } else if (this.contactTypeTemp === 5 && $event.value !== 5) {
            this.form.controls.value.patchValue('');
            this.valuePlaceholder = 'Number';
            this.form.get('value').setValidators([Validators.required, CustomValidators.validatePhone]);
        } else {
            this.form.controls.value.patchValue(this.contactValueTemp);
            this.valuePlaceholder = 'Number';
            this.form.get('value').setValidators([Validators.required, CustomValidators.validatePhone]);
        }

        this.form.get('value').updateValueAndValidity();
    }

    listClick(event, newValue) {
        this.selectedItem = newValue.value;
        this.alertId = newValue.value;
    }

    save() {
        if (this.form.dirty && this.form.valid) {

            if (!this.data.edit) {

                this.formSubmitted = false;
                if (this.alertId === 5) {
                    this.show = false;
                }
                this.alertService.createAlerts(new Alert(this.alertId, this.form.value, this.show)).subscribe((b) => {
                    this.store.dispatch(new AddAlert(new Alert(this.alertId, b, this.show, this.selectedItem)));
                    this.store.dispatch(new SetAlert(new Alert(this.alertId, b, this.show, this.selectedItem)));
                    this.dialogRef.close();
                    this.title_uniq = false;
                },
                    err => {
                        if (err.detail == 'Invalid token') {
                            localStorage.removeItem('idrToken');
                            localStorage.removeItem('idrId');
                            localStorage.removeItem('lock');
                            localStorage.removeItem('username');
                            this.router.navigateByUrl('auth/login');
                        } else {
                            this.message = [];
                            
                            //* check if error is not standart *//
                            Object.keys(err).forEach((key) => {
                                if (!key) return;
                                const mess = err[key][0];

                                this.message.push(`${key}: ${mess}`);
                                if (key === 'title') {
                                    this.title_uniq = true;
                                }

                            });
                        }
                    });
            } else {
                if (this.alertId === 5) {
                    this.show = false;
                }
                this.alertService.editAlerts(new Alert(this.alertId, {
                        ...this.contact,
                        ...this.form.value
                    }, this.show), this.contact.id).subscribe((b) => {
                    this.store.dispatch(new EditAlert(new Alert(this.alertId, b, this.show, this.selectedItem)));
                    this.store.dispatch(new SetAlert(new Alert(this.alertId, b, this.show, this.selectedItem)));
                    this.dialogRef.close();
                    this.title_uniq = false;
                },
                    err => {
                        if (err.detail == 'Invalid token') {
                            localStorage.removeItem('idrToken');
                            localStorage.removeItem('idrId');
                            localStorage.removeItem('lock');
                            localStorage.removeItem('username');
                            this.router.navigateByUrl('auth/login');
                        }  else {
                            //* check if error is not standart *//
                            this.message = [];
                            Object.keys(err).forEach((key) => {
                                if (!key) return;
                                const mess = err[key][0];

                                this.message.push(`${key}: ${mess}`);
                                if (key === 'title') {
                                    this.title_uniq = true;
                                }

                            });
                        }
                    });
            }
        } else {
            this.formSubmitted = true;
        }
    }


    deleteContact() {
        this.alertService.deleteContact(this.contact.id).subscribe(() => {
            this.store.dispatch(new DeletAlert(this.contact.id));
            this.dialogRef.close();
        });
    }

    closeDialog() {
        this.dialogRef.close();
    }
}
