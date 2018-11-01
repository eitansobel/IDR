import {Component, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import {
    Validators,
    FormBuilder,
    FormGroup,
    FormArray
} from '@angular/forms';
import {AppState} from '../../redux/app.state';
import {NgOption} from '@ng-select/ng-select';
import {Store} from '@ngrx/store';
import {CustomValidators, atLeastOneFieldValidator, DateScopeValidator} from '../../models/validator';
import {CropImageComponent} from '../../profile/crop-image/crop-image.component';
import {MatDialog} from '@angular/material';
import {countries} from 'coutries-states';
import {PatientsService} from '../services/patients.service';
import {Router} from '@angular/router';
import {UpdateLoadedAllList} from '../../redux/patientsList/patientsList.action';
import {UpdatePatients} from '../../redux/patients/patients.action';
import {UpdatePatientProfile} from '../../redux/profile/profile.action';
import {UpdateHomePatient} from '../../redux/home/home.actions';
import {HelpService} from "../../services/help.service";
import {NotifyService} from "../../services/notify.service";

@Component({
    selector: 'idr-patient-view-profile',
    templateUrl: './view-profile.component.html',
    styleUrls: ['./view-profile.component.scss']
})
export class ViewPatientProfileComponent implements OnChanges {
    dialogRef: any;
    @Input() viewProfile;
    @Input() personalEdit: boolean = true;
    @Input() updateHomePatients: boolean = false;
    @Output() loadListData = new EventEmitter<any>();
    patient: FormGroup;
    states: NgOption[] = [];

    message;
    formSubmitted: boolean = false;
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

    country: NgOption[] = [];
    @Output() closeAll = new EventEmitter();

    constructor(private fb: FormBuilder,
                private ptService: PatientsService,
                private router: Router,
                private helpService: HelpService,
                private store: Store<AppState>,
                public dialog: MatDialog,
                private notify: NotifyService) {
        this.states = countries.find(c => c.iso === 'US').states;
        this.country = countries;
        this.sex = helpService.getSex;
        this.init();
    }

    init() {
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
            room: [null, [ Validators.maxLength(30)]],
            birth_date: [null, Validators.compose([Validators.required, DateScopeValidator.date,
                CustomValidators.validateBirthdayRequired])],
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
            preferred_communication: [null, [
                Validators.required
            ]],
            ssn: [null, [
                CustomValidators.validateSSN,
                Validators.required
            ]],
            email: ['', [
                Validators.required,
                CustomValidators.validateEmail
            ]],
            country: [null, [Validators.required]],
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
            emergency_contacts: this.fb.array([]),
            guarantors: this.fb.array([])
        });
        if (this.personalEdit) {
            this.disableadAll();
        } else {
            setTimeout(() => {
                this.startEditProfile();
            }, 0);
        }
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
            relation_to_patient: [null, [
                Validators.required,
            ]],
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
            id: '',
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
            last_name: ['', [ //
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(30)
            ]],
            middle_name: [null, [
                Validators.minLength(3),
                Validators.maxLength(30)
            ]],
            sex: [null, Validators.required],
            ssn: [null, CustomValidators.validateSSN],
            relation_to_patient: [null, [Validators.required]],
            birth_date: [null, [Validators.required, CustomValidators.validateBirthdayRequired]],
            country: [null, [Validators.required]],
            state: [null, [Validators.required]],
            city: ['', [Validators.required]],
            address1: [''],
            address2: [''],
            address3: [''],
            zip_code: ['', [Validators.required]],
            id: '',
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

    ngOnChanges() {

        if (!this.viewProfile) return;
        if (!this.patient.get('emergency_contacts').value.length) {
            this.viewProfile.emergency_contacts.forEach((x, index) => {
                this.addNewEmContact();
            });
        }
        if (!this.patient.get('guarantors').value.length) {
            this.viewProfile.guarantors.forEach((x) => {
                this.addNewGuarantor();
            });
        }
        this.patient.setValue({
            first_name: this.viewProfile.first_name || '',
            last_name: this.viewProfile.last_name || '',
            middle_name: this.viewProfile.middle_name || '',
            prefix: this.viewProfile.prefix,
            suffix: this.viewProfile.suffix,
            preferred_name: this.viewProfile.preferred_name,
            previous_last_name: this.viewProfile.previous_last_name,
            mother_maiden_name: this.viewProfile.mother_maiden_name,
            preferred_language: this.viewProfile.preferred_language,
            ethnicity: this.viewProfile.ethnicity,
            mrn: this.viewProfile.mrn,
            birth_date: this.viewProfile.birth_date,
            mobile_phone: this.viewProfile.mobile_phone,
            home_phone: this.viewProfile.home_phone,
            work_phone: this.viewProfile.work_phone,
            preferred_communication: this.viewProfile.preferred_communication,
            ssn: this.viewProfile.ssn,
            email: this.viewProfile.email || 'Unknown',
            country: this.viewProfile.country,
            state: this.viewProfile.state,
            city: this.viewProfile.city,
            address1: this.viewProfile.address1,
            address2: this.viewProfile.address2,
            address3: this.viewProfile.address3,
            zip_code: this.viewProfile.zip_code,
            primary_payor: this.viewProfile.primary_payor,
            secondary_payor: this.viewProfile.secondary_payor,
            guarantors: this.viewProfile.guarantors,
            emergency_contacts: this.viewProfile.emergency_contacts,
            room: this.viewProfile.room,
            sex: this.viewProfile.sex,
            pcp: this.viewProfile.pcp,
            preferred_pharmacy: this.viewProfile.preferred_pharmacy
        });
    }

    disableadAll() {
        this.patient.controls.sex.disable();
        this.patient.controls.preferred_communication.disable();
        this.patient.controls.country.disable();
        this.patient.get('emergency_contacts').value.forEach((x, index) => {
            this.patient.controls.emergency_contacts['controls'][index]['controls']['next_of_kin'].disable();
            this.patient.controls.emergency_contacts['controls'][index]['controls']['country'].disable();
        });
        this.patient.get('guarantors').value.forEach((x, index) => {
            this.patient.controls.guarantors['controls'][index]['controls']['sex'].disable();
            this.patient.controls.guarantors['controls'][index]['controls']['country'].disable();
        });
    }

    enableAll() {
        this.patient.controls.sex.enable();
        this.patient.controls.preferred_communication.enable();
        this.patient.controls.country.enable();
        this.patient.get('emergency_contacts').value.forEach((x, index) => {
            this.patient.controls.emergency_contacts['controls'][index]['controls']['next_of_kin'].enable();
            this.patient.controls.emergency_contacts['controls'][index]['controls']['country'].enable();
        });
        this.patient.get('guarantors').value.forEach((x, index) => {
            this.patient.controls.guarantors['controls'][index]['controls']['sex'].enable();
            this.patient.controls.guarantors['controls'][index]['controls']['country'].enable();
        });
    }

    close() {
        this.cancel();
        this.closeAll.emit(false);
    }

    cancel() {
        this.personalEdit = true;
        this.disableadAll();
        this.ngOnChanges();
    }

    save() {
        if (this.patient.valid) {
            this.formSubmitted = false;
            this.ptService.updatePatient(this.viewProfile.remote_id, this.patient.value).subscribe(
                (resp) => {
                    this.formSubmitted = true;
                    const updatedPatientData = {
                        ...this.patient.value,
                        'remote_id': this.viewProfile.remote_id,
                        'id': this.viewProfile.remote_id,
                        'age': resp.age
                    };
                    this.store.dispatch(new UpdatePatientProfile(updatedPatientData));
                    this.store.dispatch(new UpdatePatients(updatedPatientData));
                    if (this.updateHomePatients) {
                        const homePatient = {
                            id: updatedPatientData.id,
                            first_name: updatedPatientData.first_name,
                            last_name: updatedPatientData.last_name,
                            ssn: updatedPatientData.ssn,
                            mrn: updatedPatientData.mrn,
                            birth_date: updatedPatientData.birth_date,
                            age: resp.age,
                            room: resp.room
                        };
                        this.store.dispatch(new UpdateHomePatient(homePatient));
                    }
                    this.disableadAll();
                    this.message = '';
                    this.personalEdit = true;
                },
                (err) => {
                    this.notify.notifyError(err);
                });
        } else {
            this.formSubmitted = true;
        }
    }


    deleteGuarantor(formIndex) {
        const control = <FormArray>this.patient.controls['guarantors'];
        control.removeAt(formIndex);
    }

    deleteEmergencyContact(formIndex) {
        const control = <FormArray>this.patient.controls['emergency_contacts'];
        control.removeAt(formIndex);
    }


    uploadPhoto() {
        this.dialog.open(CropImageComponent, {
            data: {
                header: 'Add New Alert',
                memberId: this.viewProfile.remote_id
            }
        });
    }

    onChangeCountry(evt, control?) {
//      this.patient.get('state').patchValue(null);
    }

    startEditProfile() {
        this.personalEdit = false;
        this.enableAll();
    }
}
