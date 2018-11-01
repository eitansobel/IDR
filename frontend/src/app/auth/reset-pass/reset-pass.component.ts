import {Component, OnInit} from '@angular/core';
import {
    FormGroup,
    Validators,
    FormBuilder
} from '@angular/forms';
import {ActivatedRoute} from '@angular/router';
import {matchOtherValidator, CustomValidators} from '../../models/validator';
import {AuthService} from '../services/auth.service';
import {NotifyService} from "../../services/notify.service";

@Component({
    selector: 'idr-reset-pass',
    templateUrl: './reset-pass.component.html',
    styleUrls: ['./reset-pass.component.scss']
})
export class ResetPassComponent implements OnInit {
    form: FormGroup;
    message: string[];
    private token: string;
    private uidb64;
    formSubmitted: boolean = false;
    showSuccess = false;

    constructor(private fb: FormBuilder,
        private route: ActivatedRoute,
        private notify: NotifyService,
        private auth: AuthService) {
        this.token = route.snapshot.url[route.snapshot.url.length - 1].path;
        this.uidb64 = route.snapshot.url[route.snapshot.url.length - 2].path;
    }

    ngOnInit() {
        this.form = this.fb.group({
            new_password1: ['', [
                Validators.required,
                Validators.minLength(8),
                CustomValidators.validatePassword
            ]],
            new_password2: ['', [
                Validators.required,
                Validators.minLength(8),
                CustomValidators.validatePassword,
                matchOtherValidator('new_password1')
            ]]
        });
    }

    resetPass() {
        if (this.form.dirty && this.form.valid) {
            const data = this.form.value;

            this.auth.resetPass({'uidb64': this.uidb64, 'token': this.token, ...data})
                .subscribe(() => {
                    this.formSubmitted = false;
                    this.showSuccess = true;
                },
                (err) => {
                    this.notify.notifyError(err);
                });
        } else {
            this.formSubmitted = true;
        }
    }
}
