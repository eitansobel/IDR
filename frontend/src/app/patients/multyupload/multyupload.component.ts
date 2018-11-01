import {Component, OnInit, Inject, Renderer2, Input, ChangeDetectorRef} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatStepper} from '@angular/material';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import {Router} from '@angular/router';
import {
    Ng4FilesStatus,
    Ng4FilesService,
    Ng4FilesConfig,
    Ng4FilesSelected
} from '../../ng4-files';
import {
    Validators,
    FormBuilder,
    FormGroup
} from '@angular/forms';
import {PatientsService} from "../services/patients.service";
import {environment} from "../../../environments/environment";

export interface PatientElement {
    first_name: string;
    middle_name: string;
    last_name: string;
    dob: string;
    mrn: string;
    prefix: string;
    preferred_name: string;
    suffix: string;
    home_phone: string;
    sex: string;
    mobile_phone: string;
    work_phone: string;
    email: string;
    country: string;
    city: string;
    address1: string;
    address2: string;
    address3: string;
    state: string;
    zip: string;
    ssn: string;
    previous_name: string;
    maiden_name: string;
    preffered_name: string;
    ethnicity: string;
    preferredCommunication: string;
    preferredPharmacy: string;
    pcp: string;
    primary_payor: string;
    secondary_payor: string;
}
export interface ResultElement {
    author: string;
    added: number;
    errors: number;
    precessed: number;
    timestamp: string;
    sheet_url: string;
}

const PATIENT_DATA: PatientElement[] = [
    {
        first_name: 'Endy',
        middle_name: '-',
        last_name: 'Crimer',
        dob: '12/22/1967',
        mrn: '1234567890',
        prefix: 'prefix',
        preferred_name: 'preferred name',
        suffix: 'suffix',
        home_phone: 'XXXXXXXXXX',
        sex: 'male',
        mobile_phone: 'XXXXXXXXXX',
        work_phone: 'XXXXXXXXXX',
        email: 'some5@some.ua',
        country: 'USA',
        city: 'Portland',
        address1: '21 street',
        address2: '',
        address3: '',
        state: 'AR',
        zip: '178452',
        ssn: 'XXX-XX-XXXX',
        previous_name: 'some name',
        maiden_name: 'some name',
        preffered_name: 'some name',
        ethnicity: '',
        preferredCommunication: 'phone',
        preferredPharmacy: '',
        pcp: '',
        primary_payor: '',
        secondary_payor: ''
    },
    {
        first_name: 'Endy',
        middle_name: '-',
        last_name: 'Crimer',
        dob: '12/22/1967',
        mrn: '1234567890',
        prefix: 'prefix',
        preferred_name: 'preferred name',
        suffix: 'suffix',
        home_phone: 'XXXXXXXXXX',
        sex: 'male',
        mobile_phone: 'XXXXXXXXXX',
        work_phone: 'XXXXXXXXXX',
        email: 'some5@some.ua',
        country: 'USA',
        city: 'Portland',
        address1: '21 street',
        address2: '',
        address3: '',
        state: 'AR',
        zip: '178452',
        ssn: 'XXX-XX-XXXX',
        previous_name: 'some name',
        maiden_name: 'some name',
        preffered_name: 'some name',
        ethnicity: '',
        preferredCommunication: 'phone',
        preferredPharmacy: '',
        pcp: '',
        primary_payor: '',
        secondary_payor: ''
    }
];
@Component({
    selector: 'idr-multyupload',
    templateUrl: './multyupload.component.html',
    styleUrls: ['./multyupload.component.scss']
})
export class MultyUploadComponent implements OnInit {
    private testConfig: Ng4FilesConfig = {
        acceptExtensions: ['csv'],
        maxFilesCount: 1
    };
    firstFormGroup: FormGroup;
    secondFormGroup: FormGroup;
    thirdFormGroup: FormGroup;
    isLinear = false;
    private formData: FormData;
    filenname: string = '';
    resultColumns: string[] = ['author', 'timestamp', 'processed', 'added', 'errors'];
    displayedColumns: string[] = [
        'first_name',
        'middle_name',
        'last_name',
        'dob',
        'mrn',
        'prefix',
        'preferred_name',
        'suffix',
        'home_phone',
        'sex',
        'mobile_phone',
        'work_phone',
        'email',
        'country',
        'city',
        'address1',
        'address2',
        'address3',
        'state',
        'zip',
        'ssn',
        'previous_name',
        'maiden_name',
        'preffered_name',
        'ethnicity',
        'preferredCommunication',
        'preferredPharmacy',
        'pcp',
        'primary_payor',
        'secondary_payor'
    ];
    dataSource = PATIENT_DATA;
    resultData: ResultElement[] = [];
    frongFormat: boolean = false;
    file;
    authorName: string;
    formSubmitted: boolean = false;
    isEditable = false;
    private successUpload: Number = 0;
    constructor(
        public dialogRef: MatDialogRef<MultyUploadComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private fb: FormBuilder,
        private renderer: Renderer2,
        private ng4FilesService: Ng4FilesService,
        private store: Store<AppState>,
        protected changeDetectorRef: ChangeDetectorRef,
        private router: Router,
        private patS: PatientsService
    ) {
        this.store.select('profilePage').map(data => data.profile).subscribe((_profile) => {
            this.authorName = `${_profile.first_name} ${_profile.last_name}`;
        });
        this.firstFormGroup = this.fb.group({
            csvTrue: [null, Validators.required],
            headerTrue: [null, Validators.required],
            requiredTrue: [null, Validators.required],
            namesTrue: [null, Validators.required],
            bithdayTrue: [null, Validators.required],
            followCsvTrue: [null, Validators.required]
        });
        this.secondFormGroup = this.fb.group({

        });
    }

    filesSelect(selectedFiles: Ng4FilesSelected, stepper: MatStepper): void {

        for (let i = 0; i < selectedFiles.files.length; i++) {
            const file = selectedFiles.files[i];
            this.file = selectedFiles.files[0];
            if (file['status'] === 4) {
                this.frongFormat = true;
            } else {
                this.resultData = [];
                this.formData = new FormData();
                this.formData.append('file', file);
                this.patS.multyUpload(this.formData).subscribe((_result) => {
                    this.successUpload = this.successUpload || _result.added;
                    this.resultData.push(_result);
                    this.resultData.map((c) => {
                        c.author = this.authorName;
                        c.sheet_url = `${environment.settings.backend1.slice(0, -1)}${c.sheet_url}`;
                    });
                    this.changeDetectorRef.detectChanges();
                    stepper.next();
                });
                this.frongFormat = false;
            }
        }
    }

    ngOnInit() {
        this.ng4FilesService.addConfig(this.testConfig);
        this.renderer.addClass(document.body, 'modal-open');
    }

    checkError(form) {
        this.formSubmitted = !(form.dirty && form.valid);
    }

    goForward(stepper: MatStepper) {
        if (stepper.selectedIndex == 1 && this.file) {
            stepper.next();
        } else if (stepper.selectedIndex !== 1) {
            stepper.next();
        }
    }

    checkButtonStatus(stepper: MatStepper) {
        if (stepper.selectedIndex !== 1 && this.firstFormGroup.valid) {
            return false;
        } else if (stepper.selectedIndex == 1 && this.file) {
            return false;
        }
        return true;
    }

    goBack(stepper: MatStepper) {

        if (stepper.selectedIndex !== 0) {
            this.isEditable = true;
            const tempIndex = stepper.selectedIndex;
            setTimeout(() => {
                stepper.selected.completed = false;
                switch (tempIndex) {
                    case 1:
                        stepper.selectedIndex = 0;
                        break;

                    case 2:
                        stepper.selectedIndex = 1;
                        break;

                }
                this.isEditable = false;
            }, 0);
        } else {
            this.closeDialog();
        }
    }

    closeDialog() {
        this.dialogRef.close(this.successUpload);
        this.renderer.removeClass(document.body, 'modal-open');
    }
}
