import {Component, Input} from '@angular/core';
import {AbstractControlDirective, AbstractControl} from '@angular/forms';

@Component({
    selector: 'idr-validation-message',
    templateUrl: './validation-error.component.html',
    styleUrls: ['./validation-error.component.scss']
})
export class ValidationErrorComponent {
    private static readonly errorMessages = {
        'required': () => 'This field is required',
        'minlength': (params) => 'The min number of characters is ' + params.requiredLength,
        'maxlength': (params) => 'The max allowed number of characters is ' + params.requiredLength,
        'pattern': (params) => 'The required pattern is: ' + params.requiredPattern,
        'years': (params) => params.message,
        'countryCity': (params) => params.message,
        'uniqueName': (params) => params.message,
        'telephoneNumbers': (params) => params.message,
        'email': (params) => params.message,
        'password': (params) => params.message,
        'telephoneNumber': (params) => params.message,
        'invalid_characters': (params) => params.message,
        'match': (params) => params.message
    };

    @Input()
    private control: AbstractControlDirective | AbstractControl;

    shouldShowErrors(): boolean {
        return this.control &&
            this.control.errors &&
            this.control.invalid;
    }

    listOfErrors(): string[] {
        return Object.keys(this.control.errors)
            .map(field => this.getMessage(field, this.control.errors[field]));
    }

    private getMessage(type: string, params: any) {
        return ValidationErrorComponent.errorMessages[type](params);
    }
}
