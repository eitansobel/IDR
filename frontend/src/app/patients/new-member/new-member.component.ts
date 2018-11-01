import {Component, OnInit, Inject, Renderer2, Input} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import {NgOption} from '@ng-select/ng-select';
import {CustomValidators, atLeastOneFieldValidator} from '../../models/validator';
import {Papa} from 'ngx-papaparse';
import {AddPatient} from '../../redux/patients/patients.action';
import {countries} from 'coutries-states';
import {
    Ng4FilesStatus,
    Ng4FilesService,
    Ng4FilesConfig,
    Ng4FilesSelected
} from '../../ng4-files';
import {Router} from '@angular/router';
import {
    Validators,
    FormBuilder,
    FormGroup,
    FormArray
} from '@angular/forms';
import {PatientsService} from '../services/patients.service';
import {HelpService} from "../../services/help.service";
import {NotifyService} from "../../services/notify.service";

@Component({
    selector: 'idr-new-member',
    templateUrl: './new-member.component.html',
    styleUrls: ['./new-member.component.scss']
})
export class NewMemberComponent implements OnInit {
    showClear: boolean = false;
    showCancel: boolean = true;
    csvError: boolean = false;
    csvErrorText: string = '';
    private testConfig: Ng4FilesConfig = {
        acceptExtensions: ['csv'],
        maxFilesCount: 1
    };
        filename: string = `Drag and drop file to this area or choose file. \n
     CSV files supported.`;
    patient: FormGroup;
    selectedEventProperties;
    formSubmitted: boolean = false;
    personalFile: string;
    selectedFiles: any[] = [];
    croppedImage: string = '';
    last_update: string = '';
    message;
    states: NgOption[] = [];
    choosedState = 'US';
    preferred_mode: NgOption[] = [
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

    sex = [];

    kin: NgOption[] = [
        {
            value: true,
            label: 'Yes'
        },
        {
            value: false,
            label: 'No'
        },
    ];

    file;
    country: NgOption[] = [];

    constructor(public dialogRef: MatDialogRef<NewMemberComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private fb: FormBuilder,
                private renderer: Renderer2,
                private ng4FilesService: Ng4FilesService,
                private store: Store<AppState>,
                private papa: Papa,
                private router: Router,
                private helpService: HelpService,
                private ptService: PatientsService,
                private notify: NotifyService) {
        this.states = countries.find(c => c.iso === 'US').states;
        this.country = countries;
        this.sex = this.helpService.getSex;
    }

    filesSelect(selectedFiles: Ng4FilesSelected,): void {
        for (let i = 0; i < selectedFiles.files.length; i++) {
            const file = selectedFiles.files[i];
            this.file = selectedFiles.files[0];
            if (file['status'] === 4) {

            } else {
                this.filename = selectedFiles.files[i].name;
            }
        }
        this.csvErrorText = '';
        this.csvError = false;
    }

    importData() {
        const result = {};
        this.papa.parse(this.file, {

            complete: (results, file) => {
                results.data = results.data.filter(x => {
                    return !x.every((el) => {
                        return el === '';
                    });
                });
                if (results.data.length > 2) {
                    for (let i = 0; i <= results.data.length - 1; i++) {
                        if (i > 1 && results.data[i].length > 1 && !results.data[i][0]) {
                            this.csvErrorText = 'Can’t process your file, please check file format, or try again.';
                            this.csvError = true;
                            return;
                        }
                    }
                }
                results.data[0].forEach((key, i) => {

                    switch (key) {
                        case 'Date of Birth':
                            key = 'birthday';
                            break;
                        case 'Sex':
                            const sex = this.sex.find((x) =>
                                x.label.toLowerCase() === results.data[1][i].toLowerCase()
                            );

                            if (!sex) {
                                this.csvErrorText += 'Sex is wrong \n';
                                this.csvError = true;
                            } else {
                                results.data[1][i] = sex.value;
                                key = 'sex';
                            }
                            break;
                        case 'Post Code':
                            key = 'zip_code';
                            break;
                        case 'Phone Number':
                            key = 'phone';
                            break;
                    }
                    const newKey = key.toLowerCase().replace(/ /g, '_');

                    result[newKey] = results.data[1][i];
                    this.autoFillForm(newKey, results.data[1][i]);
                });
            }
        });
        this.showCancel = false;
        this.file = null;
        this.showClear = true;
        this.filename = 'Drag and drop file to this area of choose file.';
        this.selectedFiles = [];
    }

    autoFillForm(key, value) {
        if (this.patient.get(key)) {
            this.patient.get(key).patchValue(value);
        }
    }

    ngOnInit() {
        this.ng4FilesService.addConfig(this.testConfig);
        this.renderer.addClass(document.body, 'modal-open');

        this.patient = this.fb.group({
            first_name: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(30)
            ]],
            last_name: [null, [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(30)
            ]],
            middle_name: [null, [
                Validators.minLength(3),
                Validators.maxLength(30)
            ]],
            previous_last_name: [null, [
                Validators.minLength(3),
                Validators.maxLength(30)
            ]],
            mother_maiden_name: [null, [
                Validators.minLength(3),
                Validators.maxLength(30)
            ]],
            prefix: [null, [CustomValidators.validateCharacters]],
            suffix: [null, [CustomValidators.validateCharacters]],
            preferred_name: [null, [CustomValidators.validateCharacters]],
            preferred_language: [null, [CustomValidators.validateCharacters]],
            ethnicity: [null, [CustomValidators.validateCharacters]],
            mrn: [null, [
                Validators.required,
                CustomValidators.validateCharacters
            ]],
            birth_date: [null, [
                Validators.required,
                CustomValidators.validateBirthdayRequired]],
            mobile_phone: [null, [
                CustomValidators.validatePhone,
                atLeastOneFieldValidator('home_phone', 'work_phone')
            ]],
            home_phone: [null, [
                CustomValidators.validatePhone,
                atLeastOneFieldValidator('mobile_phone', 'work_phone')
            ]],
            work_phone: [null, [
                CustomValidators.validatePhone,
                atLeastOneFieldValidator('mobile_phone', 'home_phone')
            ]],
            preferred_communication: [null, [Validators.required]],
            ssn: [null, [
                CustomValidators.validateSSN,
                Validators.required
            ]],
            email: ['', [
                Validators.required,
                CustomValidators.validateEmail
            ]],
            country: [null],
            state: [null, [Validators.required]],
            city: ['', [Validators.required]],
            address1: ['', [Validators.required]],
            address2: [''],
            address3: [''],
            sex: [null, [Validators.required]],
            pcp: [''],
            preferred_pharmacy: [''],
            zip_code: ['', [Validators.required]],
            primary_payor: [''],
            secondary_payor: [''],
            room: [null, [Validators.maxLength(30)]],
            emergency_contacts: this.fb.array([]),
            guarantors: this.fb.array([])
        });
    }

    initItemEmContact() {
        return this.fb.group({
            first_name: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(30)
            ]],
            last_name: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(30)
            ]],
            relation_to_patient: [null, [Validators.required]],
            mobile_phone: [null, [
                CustomValidators.validatePhone,
                atLeastOneFieldValidator('home_phone', 'work_phone')
            ]],
            home_phone: [null, [
                CustomValidators.validatePhone,
                atLeastOneFieldValidator('mobile_phone', 'work_phone')
            ]],
            work_phone: [null, [
                CustomValidators.validatePhone,
                atLeastOneFieldValidator('mobile_phone', 'home_phone')
            ]],
            country: [null, [Validators.required]],
            state: [null, [Validators.required]],
            city: ['', [Validators.required]],
            address1: [''],
            address2: [''],
            address3: [''],
            zip_code: ['', [Validators.required]],
            next_of_kin: [false]
        });
    }

    initItemGurantor() {
        return this.fb.group({
            first_name: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(30)
            ]],
            last_name: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(30)
            ]],
            middle_name: [null, [
                Validators.minLength(3),
                Validators.maxLength(30),
            ]],
            sex: [null, Validators.required],
            ssn: [null, [CustomValidators.validateSSN]],
            relation_to_patient: [null, [Validators.required]],
            birth_date: [null, [CustomValidators.validateBirthdayRequired]],
            country: [null, [Validators.required]],
            state: [null, [Validators.required]],
            city: ['', [Validators.required]],
            address1: [''],
            address2: [''],
            address3: [''],
            zip_code: ['', [Validators.required]],
            employer: [null],
            mobile_phone: [null, [
                CustomValidators.validatePhone,
                atLeastOneFieldValidator('home_phone', 'work_phone')
            ]],
            home_phone: [null, [
                CustomValidators.validatePhone,
                atLeastOneFieldValidator('mobile_phone', 'work_phone')
            ]],
            work_phone: [null, [
                CustomValidators.validatePhone,
                atLeastOneFieldValidator('mobile_phone', 'home_phone')
            ]]
        });
    }

    addNewEmContact() {
        const control = <FormArray> this.patient.controls['emergency_contacts'];
        control.push(this.initItemEmContact());
    }

    addNewGuarantor() {
        const control = <FormArray> this.patient.controls['guarantors'];
        control.push(this.initItemGurantor());
    }

    removeNewEmContact(index) {
        const control = <FormArray> this.patient.controls['emergency_contacts'];
        control.removeAt(index);
    }

    removeNewGuarantor(index) {
        const control = <FormArray> this.patient.controls['guarantors'];
        control.removeAt(index);
    }

    closeDialog() {
        this.dialogRef.close();
        this.renderer.removeClass(document.body, 'modal-open');
    }

    cancelImport() {
        this.file = null;
        this.filename = 'Drag and drop file to this area of choose file.';
        this.selectedFiles = [];
        this.csvErrorText = '';
        this.csvError = false;
    }

    save() {
        if (this.patient.valid && this.patient.dirty) {
            this.formSubmitted = false;
            const obj = this.patient.value;
            this.ptService.createPatient(obj).subscribe(
                (_newpatient) => {
                    this.formSubmitted = true;
                    this.store.dispatch(new AddPatient({...this.patient.value, 'remote_id': _newpatient.remote_id}));
                    this.dialogRef.close();
                }, err => {
                    this.notify.notifyError(err);
                });
        } else {
            this.formSubmitted = true;
        }
    }

    cancel() {
        this.patient.reset();
        this.dialogRef.close();
    }

    onChangeCountry(evt, state?) {
        if (state.state) {
            state.state = null;
        }
    }
}
