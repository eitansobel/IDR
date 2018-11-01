import {Component, OnChanges, Input, Output, EventEmitter} from '@angular/core';
import {
    Validators,
    FormBuilder,
    FormGroup
} from '@angular/forms';
import {AppState} from '../../redux/app.state';
import {ProfileService} from '../../profile/service/profile.service';
import {NgOption} from '@ng-select/ng-select';
import {Store} from '@ngrx/store';
import {CustomValidators} from '../../models/validator';
import {CropImageComponent} from '../../profile/crop-image/crop-image.component';
import {MatDialog} from '@angular/material';
import {UpdateLoadedList} from '../../redux/staff/staff.action';
import {HospitalDepartmentService} from '../../services/hospital.structure.service';
import {UpdatePhotoinList} from '../../redux/memberPhoto/memberPhoto.action';
import {UpdateMember} from "../../redux/members/members.action";
import {environment} from '../../../environments/environment';
import {NotifyService} from "../../services/notify.service";
@Component({
    selector: 'idr-view-profile',
    templateUrl: './view-profile.component.html',
    styleUrls: ['./view-profile.component.scss']
})
export class ViewProfileComponent implements OnChanges {
    @Input() viewProfile;
    @Input() myRole;
    @Output() loadListData = new EventEmitter<any>();
    personal: FormGroup;
    personalEdit: boolean = true;
    hospital_role: NgOption[] = [];
    role = '';
    message;
    formSubmitted: boolean = false;
    hospital_department = [];
    croppedImage: string = '';
    preferred_mode: NgOption[] = [
        {
            value: 0,
            label: 'Select Preferred Contact Method'
        },
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
    hospital;
    static_hospital;
    static_hospital_title = '';
    @Output() closeAll = new EventEmitter();

    department_title;

    constructor(private fb: FormBuilder,
        private hd: HospitalDepartmentService,
        private pService: ProfileService,
        private store: Store<AppState>,
        private notify: NotifyService,
        public dialog: MatDialog) {

        this.hd.getDepartments().subscribe((departments) => {
            this.hospital = departments;
        }, err => {
            this.notify.notifyError(err);
        });

        this.personal = this.fb.group({
            first_name: ['', [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(30),
                CustomValidators.validateCharacters
            ]],
            last_name: [null, [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(30),
                CustomValidators.validateCharacters
            ]],
            middle_name: [null, [
                Validators.minLength(3),
                Validators.maxLength(30),
                CustomValidators.validateCharacters
            ]],
            title: [null, [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(30)
            ]],
            prefix: [null, [CustomValidators.validateCharacters]],
            suffix: [null, [CustomValidators.validateCharacters]],
            preferred_name: [null, [CustomValidators.validateCharacters]],
            birthday: [null, [CustomValidators.validateBirthdayRequired]],
            phone: ['', [Validators.required,
            CustomValidators.validatePhone
            ]],
            fax: [null, [
                CustomValidators.validatePhone
            ]],
            pager: [null, [
                CustomValidators.validatePhone
            ]],
            email: ['', [
                Validators.required,
                CustomValidators.validateEmail
            ]],
            cell: [null, [Validators.required,
            CustomValidators.validatePhone
            ]],
            preferred_mode: [null, [CustomValidators.validateEmailRequired
            ]],
            hospital_role: [null, [Validators.required]],
            dea_number: [null, []],
            hospital: [null, [Validators.required]],
            hospital_department: [null, [Validators.required]],
            user_id: [null, []],
            npi_number: [null, []],
            state_license: [null, []]
        });
        this.disableadAll();

        setTimeout(() => {
            this.disableadAll();
        }, 0);

    }

    ngOnChanges() {
        if (!this.viewProfile) return;
        this.store.select('rolesPage').map((x) => x.roles).subscribe((_roles) => {
             this.hospital_role = _roles;
             this.viewProfile.role = this.hospital_role.filter((x) => x.title === this.viewProfile.hospital_role)[0].id;
        });

        this.store.dispatch(new UpdatePhotoinList({'full_photo': this.viewProfile.full_photo}));
        this.store.select('membersPhoto').subscribe((_photo) => {
            if (_photo) {
                this.croppedImage = `${environment.settings.imageUrl}${_photo.photo}`;
            } else {
                this.croppedImage = '';
            }
        });

        this.role = this.viewProfile.hospital_role;
        this.department_title = this.viewProfile.hospital_department;
        this.static_hospital = this.hospital.filter((hp) => hp.clinic_remote_id === this.viewProfile.hospital)[0];

        this.static_hospital_title = this.static_hospital.title;
        this.hospital_department = this.static_hospital.hospital_department;

        const department = this.hospital_department.filter((hp) => hp.title === this.viewProfile.hospital_department)[0];

        this.personal.setValue({
            first_name: this.viewProfile.first_name || '',
            last_name: this.viewProfile.last_name || '',
            middle_name: this.viewProfile.middle_name,
            title: this.viewProfile.title,
            prefix: this.viewProfile.prefix,
            suffix: this.viewProfile.suffix,
            preferred_name: this.viewProfile.preferred_name,
            birthday: this.viewProfile.birthday,
            phone: this.viewProfile.phone,
            fax: this.viewProfile.fax,
            email: this.viewProfile.email || 'Unknown',
            cell: this.viewProfile.cell,
            pager: this.viewProfile.pager,
            preferred_mode: this.viewProfile.preferred_mode || 0,
            hospital_role: this.viewProfile.role ,
            hospital: this.viewProfile.hospital,
            hospital_department: department.id,
            dea_number: this.viewProfile.dea_number,
            user_id: this.viewProfile.user_id,
            npi_number: this.viewProfile.npi_number,
            state_license: this.viewProfile.state_license
        });

        if (this.viewProfile.full_photo) {
            this.croppedImage = `${environment.settings.imageUrl}${this.viewProfile.full_photo}`;
        } else {
            this.croppedImage = '';
        }

        if (!this.static_hospital.length) return;
        this.disableadAll();
    }

    disableadAll() {
        this.personal.controls.preferred_mode.disable();
        this.personal.controls.hospital_role.disable();
        this.personal.controls.hospital.disable();
        this.personal.controls.hospital_department.disable();
    }

    enableAll() {
        this.personal.controls.preferred_mode.enable();
        this.personal.controls.hospital_role.enable();
        this.personal.controls.hospital.enable();
        this.personal.controls.hospital_department.enable();
    }

    close() {
        this.cancel();
        this.closeAll.emit(false);
    }

    cancel() {
        this.ngOnChanges();
        this.personalEdit = true;
        this.disableadAll();
    }

    save() {
        if (this.personal.valid) {

            let preferred_mode;
            this.formSubmitted = false;
            if (this.personal.value.preferred_mode === 0) {
                this.personal.value.preferred_mode = null;
            } else {
                preferred_mode = this.personal.value.preferred_mode;
            }

            this.pService.updateMemberServer1(this.personal.value, this.viewProfile.remote_id).subscribe((_d) => {
                this.loadListData.emit(this.personal.value);
                this.formSubmitted = true;
                this.personalEdit = true;
                const updatedMemberData = {
                        ...this.personal.value,
                        'hospital_department': this.department_title,
                        'id': this.viewProfile.remote_id,
                        'remote_id': this.viewProfile.remote_id,
                        'hospital_role': this.role
                    };
                this.store.dispatch(new UpdateLoadedList(updatedMemberData));
                this.store.dispatch(new UpdateMember(updatedMemberData));
                this.disableadAll();
            }, err => {
                this.notify.notifyError(err);
            });
        } else {
            this.formSubmitted = true;
        }
    }

    uploadPhoto() {
        this.dialog.open(CropImageComponent, {
            data: {
                header: 'Add New Alert',
                memberId: this.viewProfile.remote_id
            }
        });
    }

    onChange($event) {
        this.role = $event.title;
    }

    onChangeDepartment($event) {
        this.department_title = $event.title;
    }
}
