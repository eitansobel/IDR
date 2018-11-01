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
import {StaffService} from "../service/staff.service";
import {environment} from "../../../environments/environment";
import {NotifyService} from "../../services/notify.service";

export interface PeriodicElement {
    first_name: string;
    middle_name: string;
    last_name: string;
    dob: string;
    prefix: string;
    preferred_name: string;
    suffix: string;
    phone: string;
    pager: string;
    role: string;
    fax: string;
    email: string;
    title: string;
    hospital_department: string;
    user_id: string;
    dea_number: string;
    npi_number: string;
    state_license: string;
    cell: string;
}

export interface ResultElement {
    author: string;
    added: number;
    errors: number;
    precessed: number;
    timestamp: string;
    sheet_url: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
    {
        first_name: 'John',
        middle_name: 'Malkolm',
        last_name: 'Granovich',
        dob: '04/13/1992',
        prefix: 'MR',
        preferred_name: '-',
        suffix: '-',
        phone: 'XXXXXXXXXX',
        cell: 'XXXXXXXXXX',
        pager: 'XXXXXXXXXX',
        role: 'doctor',
        fax: 'XXXXXXXXXX',
        email: 'expl@mail.com',
        title: 'Job name',
        hospital_department: 'NICU',
        user_id: 'XXXXX',
        state_license: 'JDK7845',
        dea_number: '123456789',
        npi_number: '987654321'
    },
    {
        first_name: 'John',
        middle_name: 'Malkolm',
        last_name: 'Granovich',
        dob: '04/13/1992',
        prefix: '-',
        preferred_name: 'Angy',
        suffix: '-',
        phone: 'XXXXXXXXXX',
        cell: 'XXXXXXXXXX',
        pager: 'XXXXXXXXXX',
        role: 'doctor',
        fax: 'XXXXXXXXXX',
        email: 'expl@mail.com',
        state_license: 'MJDS78558',
        title: 'Job name',
        hospital_department: 'NICU',
        user_id: 'XXXXX',
        dea_number: '123456789',
        npi_number: '987654321',
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
        'prefix',
        'preferred_name',
        'suffix',
        'phone',
        'cell',
        'pager',
        'role',
        'fax',
        'email',
        'title',
        'hospital_department',
        'user_id',
        'dea_number',
        'npi_number',
        'state_license'
    ];
    dataSource = ELEMENT_DATA;
    resultData: ResultElement[] = [];
    frongFormat: boolean = false;
    file;
    authorName: string;
    formSubmitted: boolean = false;
    isEditable = false;
    private successUpload: Number = 0;

    constructor(public dialogRef: MatDialogRef<MultyUploadComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private fb: FormBuilder,
                private renderer: Renderer2,
                private ng4FilesService: Ng4FilesService,
                private store: Store<AppState>,
                private notify: NotifyService,
                protected changeDetectorRef: ChangeDetectorRef,
                private router: Router,
                private staffS: StaffService) {
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
             secondCtrl: ['', Validators.required]
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
                this.staffS.multyUpload(this.formData).subscribe((_result) => {
                    this.successUpload = this.successUpload || _result.added;
                    this.resultData.push(_result);
                    this.resultData.map((c) => {
                        c.author = this.authorName;
                        c.sheet_url = `${environment.settings.backend1.slice(0, -1)}${c.sheet_url}`;
                    });
                    this.changeDetectorRef.detectChanges();
                    stepper.next();
                }, err => this.notify.notifyError(err));
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
       } else if(stepper.selectedIndex !== 1) {
           stepper.next();
       }
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
    
    checkButtonStatus(stepper: MatStepper) {
        if (stepper.selectedIndex !== 1 && this.firstFormGroup.valid) {
            return false;
        } else if (stepper.selectedIndex == 1 && this.file) {
            return false;
        }
        return true;
    }
}
