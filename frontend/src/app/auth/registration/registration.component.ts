import {Component, OnInit} from '@angular/core';
import {MatStepper} from '@angular/material';
import {
    FormGroup,
    Validators,
    FormBuilder
} from '@angular/forms';
import {User} from '../../models/user';
import {Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {HospitalDepartmentService} from '../../services/hospital.structure.service';
import {CustomValidators, matchOtherValidator} from '../../models/validator';
import {MatDialog} from '@angular/material';
import {DialogOverviewComponent} from '../../common/dialogOverview/dialogOverview.component';
import {NotifyService} from "../../services/notify.service";

@Component({
    selector: 'idr-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.scss']
})

export class RegistrationComponent implements OnInit {
    firstFormGroup: FormGroup;
    secondFormGroup: FormGroup;
    thirdFormGroup: FormGroup;
    fourthFormGroup: FormGroup;
    hospital_department = [];
    hospital = [];
    formSubmitted: boolean = false;
    message = [];

    preferred_mode: object[] = [
        {
            value: 1,
            label: 'Phone'
        },
        {
            value: 2,
            label: 'Cell'
        },
        {
            value: 3,
            label: 'Pager'
        },
        {
            value: 4,
            label: 'Fax'
        },
        {
            value: 5,
            label: 'Email'
        }
    ];

    hospital_role = [
        {
            'id': 1,
            'title': 'ADMIN',
            'remote_role': 1,
            'hospital': 1
        },
        {
            'id': 2,
            'title': 'DOCTOR',
            'remote_role': 2,
            'hospital': 1
        },
        {
            'id': 3,
            'title': 'NURSE',
            'remote_role': 3,
            'hospital': 1
        },

    ];


    constructor(private fb: FormBuilder,
        private auth: AuthService,
        private hd: HospitalDepartmentService,
        private notify: NotifyService,
        private router: Router,
        public dialog: MatDialog) {

    }

    ngOnInit() {
        this.hd.getDepartments().subscribe((departments) => {
            this.hospital = departments;
        }, err => {
            this.notify.notifyError(err);
        });
        this.firstFormGroup = this.fb.group({
            first_name: ['',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(30),
                    CustomValidators.validateCharacters
                ]
            ],
            last_name: ['',
                [
                    Validators.required,
                    Validators.minLength(3),
                    Validators.maxLength(30),
                    CustomValidators.validateCharacters
                ]],
            middle_name: ['', [
                Validators.minLength(3),
                Validators.maxLength(30),
                CustomValidators.validateCharacters
            ]],
        });
        this.secondFormGroup = this.fb.group({
            title: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(30),
                CustomValidators.validateBackspace
            ]],
            prefix: [''],
            suffix: [''],
            preferred_name: ['']
        });
        this.thirdFormGroup = this.fb.group({
            phone: ['', [Validators.required,
            CustomValidators.validatePhone
            ]],
            cell: ['', [
                Validators.required,
                CustomValidators.validatePhone]],
            pager: ['', [CustomValidators.validatePhone]],
            fax: ['', [CustomValidators.validatePhone]],
            email: ['', [
                Validators.required,
                CustomValidators.validateEmail
            ]],
            preferred_mode: [null, CustomValidators.validateEmailRequired]
        });
        this.fourthFormGroup = this.fb.group({
            hospital: [null, [Validators.required]],
            hospital_department: [null, [Validators.required]],
            hospital_role: [null,
                Validators.required
            ],
            username: ['', [Validators.required, Validators.minLength(3)]],
            password: ['', [
                Validators.required,
                Validators.minLength(8),
                CustomValidators.validatePassword
            ]],
            confirm_password: ['', [
                Validators.required,
                Validators.minLength(8),
                CustomValidators.validatePassword,
                matchOtherValidator('password')
            ]]
        });
    }

    checkError(form) {
        if(this.thirdFormGroup.controls['username']){
            console.log(this.thirdFormGroup.controls['username'].errors)
        }
       
        this.formSubmitted = !(form.dirty && form.valid);
    }

    onChange($event) {
        this.fourthFormGroup.get('hospital_department').patchValue(null);
        this.hospital_department = $event.hospital_department;
    }

    goForward(stepper: MatStepper) {

        this.checkError(stepper.selected.stepControl);

        if (stepper.selectedIndex === stepper._steps.length - 1) {
            if (
                (this.firstFormGroup.dirty && this.firstFormGroup.valid) &&
                (this.secondFormGroup.dirty && this.secondFormGroup.valid) &&
                (this.thirdFormGroup.dirty && this.thirdFormGroup.valid) &&
                (this.fourthFormGroup.dirty && this.fourthFormGroup.valid)) {
                const obj = {
                    ...this.firstFormGroup.value,
                    ...this.secondFormGroup.value,
                    ...this.thirdFormGroup.value,
                    ...this.fourthFormGroup.value
                };

                this.auth.register(obj).subscribe(
                    () => {
                        this.formSubmitted = true;
                        const today = new Date();
                        today.setTime(today.getTime() + (8 * 60 * 60 * 1000));
                        this.auth.login(new User(
                            this.fourthFormGroup.value.username,
                            this.fourthFormGroup.value.password,
                            today.toISOString()
                        )).subscribe(
                            (data) => {
                                localStorage.setItem('idrToken', data.token);
                                localStorage.setItem('idrUserId', data.user.id);
                                this.router.navigateByUrl('auth/set-alerts');
                            },
                            (err) => {
                                this.notify.notifyError(err);
                                
                            });
                    }, (err) => {
                      
                        this.notify.notifyError(err);
                        if(err.email) {
                            this.thirdFormGroup.controls['email'].setErrors({
                                'email': {
                                    'message': ''
                                }
                            });
                            stepper.selectedIndex = 2;
                            this.formSubmitted = true;
                        } else if(err.username) {
                            this.fourthFormGroup['username'].setErrors(
                                {
                                    'invalid_characters': {
                                        'message': ''
                                    }
                                }
                            );
                            this.formSubmitted = true;
                        }
                    });
            }
        } else {
            stepper.next();
        }
    }

    goBack(stepper: MatStepper) {
        if (stepper.selectedIndex !== 0) {
            stepper.previous();
        }
    }

    cancel() {
        const dialogRef = this.dialog.open(DialogOverviewComponent, {
            width: '342px',
            data: {
                header: 'Cancel registration',
                body: 'All data entered will be erased. Are you sure you want to cancel?'
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.router.navigateByUrl('auth/login');
            }
        });
    }
}
