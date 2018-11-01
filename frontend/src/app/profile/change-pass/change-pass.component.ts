import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {CustomValidators, matchOtherValidator} from '../../models/validator';
import {ProfileService} from '../service/profile.service';

import {
    FormGroup,
    Validators,
    FormBuilder
} from '@angular/forms';
import {Router} from '@angular/router';
import {NotifyService} from "../../services/notify.service";
@Component({
    selector: 'idr-change-pass',
    templateUrl: './change-pass.component.html',
    styleUrls: ['./change-pass.component.scss']
})
export class ChangePassComponent implements OnInit {
    headerText: string = '';
    form: FormGroup;
    message: string;
    formSubmitted: boolean = false;
    success = false;
    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<ChangePassComponent>,
        private pService: ProfileService,
        private router: Router,
        private notify: NotifyService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.headerText = this.data.header;
    }

    ngOnInit() {
        this.form = this.fb.group({
            current_password: ['', [
                Validators.required
            ]],
            password: ['', [
                Validators.required,
                Validators.minLength(8),
                CustomValidators.validatePassword,
            ]],
            confirm_password: ['', [
                Validators.required,
                Validators.minLength(8),
                CustomValidators.validatePassword,
                matchOtherValidator('password')
            ]]
        });
    }

    closeDialog() {
        this.dialogRef.close();
    }

    save() {
        if (this.form.dirty && this.form.valid) {
            this.pService.changePass(this.form.value).subscribe((pf) => {
                this.formSubmitted = false;
                this.success = true;
            },
                (err) => {
                    this.notify.notifyError(err);
                });
        } else {
            this.formSubmitted = true;
        }
    }
}
