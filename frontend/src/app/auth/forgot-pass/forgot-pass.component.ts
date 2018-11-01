import {Component, OnInit} from '@angular/core';
import {
    FormGroup,
    Validators,
    FormBuilder,
    AbstractControl
} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {CustomValidators} from '../../models/validator';
@Component({
    selector: 'idr-forgot-pass',
    templateUrl: './forgot-pass.component.html',
    styleUrls: ['./forgot-pass.component.scss']
})
export class ForgotPassComponent implements OnInit {
    form: FormGroup;
    message: string;
    email: AbstractControl;
    formSubmitted: boolean = false;
    showSuccess: boolean = false;
    constructor(
        private fb: FormBuilder,
        private auth: AuthService
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            email: [null, [
                Validators.required,
                CustomValidators.validateEmail
            ]]
        });
    }

    forgotPass() {
         if (this.form.dirty && this.form.valid) {
            this.formSubmitted = false;
            this.auth.forgotPass(this.form.value).subscribe(
                () => {
                   this.showSuccess = true;
                }, (err) => {
                    //* check if error is not standart *//
                    this.message = err.non_field_errors[0];
                });
        } else {
            this.formSubmitted = true;
        }
    }

}
