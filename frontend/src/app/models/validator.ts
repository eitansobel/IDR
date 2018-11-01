import {
    FormControl,
    Validators,
    ValidatorFn,
    AbstractControl
} from '@angular/forms';
import * as moment from 'moment';
const validCharacters = /[^\w,.:&\/()+%'`@-]/;

export class CustomValidators extends Validators {

    // create a static method for your validation
    static validateCharacters(control: FormControl) {

        // first check if the control has a value
        if (control.value && control.value.length > 0) {
            // match the control value against the regular expression
            const matches = control.value.match(validCharacters);
            const message = {
                'invalid_characters': {
                    'message': 'Invalid symbol'
                }
            };
            // if there are matches return an object, else return null.
            return matches && matches.length ? message : null;
        } else {
            return null;
        }
    }

    static atLeastOneCapital(control: FormControl) {

        // first check if the control has a value
        if (control.value && control.value.length > 0) {
            // match the control value against the regular expression
            const matches = control.value.match(validCharacters);
            const message = {
                'invalid_characters': {
                    'message': 'Invalid symbol'
                }
            };
            // if there are matches return an object, else return null.
            return matches && matches.length ? message : null;
        } else {
            return null;
        }
    }

    static validateBackspace(control: FormControl) {

        // first check if the control has a value
        if (control.value && control.value.length > 0) {
            // match the control value against the regular expression
            const matches = control.value.match(/^\s/);
            const message = {
                'invalid_characters': {
                    'message': 'Invalid symbol'
                }
            };
            // if there are matches return an object, else return null.
            return matches && matches.length ? message : null;
        } else {
            return null;
        }
    }

    static validatePhone(control: FormControl) {
        if (control.value && control.value.length > 0) {

            const isValidPhoneNumber = /^\d{10}$/.test(control.value);
            const message = {
                'telephoneNumber': {
                    'message': 'The phone number must be valid ( (XXX) XXX-XXXX, where X is a digit)'
                }
            };
            return isValidPhoneNumber ? null : message;
        } else {
            return null;
        }
    }

    static validateSSN(control: FormControl) {
        if (control.value && control.value.length > 0) {
            const isValidPhoneNumber = /^\d{3}-\d{2}-\d{4}$/.test(control.value);
            const message = {
                'telephoneNumber': {
                    'message': 'The phone number must be valid (XXX-XX-XXXX, where X is a digit)'
                }
            };
            return isValidPhoneNumber ? null : message;
        } else {
            return null;
        }
    }

    static validateEmail(control: FormControl) {

        if (control.value && control.value.length > 0) {
            const isValidEmail = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+(\.[A-Za-z0-9-]+){1,14}$/.test(control.value);
            const message = {
                'email': {
                    'message': 'Please enter a valid email address'
                }
            };
            return isValidEmail ? null : message;
        }
        return null;
    }

    static validatePassword(control: FormControl) {

        if (control.value && control.value.length > 0) {
            const isValidPass = /^.(?=.*\d)(?=.*[a-zA-Z]).*$/.test(control.value);
            const message = {
                'password': {
                    'message': 'Password should contain letters and digital'
                }
            };
            return isValidPass ? null : message;
        }
        return null;
    }

    static validateEmailRequired(otherControlName: string) {

        let thisControl: FormControl;
        let otherControl: FormControl;

        return function matchOtherValidate(control: FormControl) {

            if (!control.parent) {
                return null;
            }

            // Initializing the validator.
            if (!thisControl) {
                thisControl = control;
                otherControl = control.parent.get(otherControlName) as FormControl;
                if (!otherControl) {
                    throw new Error('matchOtherValidator(): other control is not found in parent group');
                }
                otherControl.valueChanges.subscribe(() => {
                    thisControl.updateValueAndValidity();
                });
            }

            if (!otherControl) {
                return null;
            }

            if (otherControl.value === 5) {
                if (thisControl.value.length === 0) {
                    const message = {
                        'email': {
                            'message': 'This field is required'
                        }
                    };
                    return message;
                }
            }

            return null;
        };
    }

    static validateBirthdayRequired(control: FormControl) {

        if (control.value && control.value.length > 0) {
            const isValidDate = /[0-9]{4}[-][0-9]{2}[-][0-9]{2}$/.test(control.value);
            const message = {
                'years': {
                    'message': 'Date should be in format XX-XX-XXXX'
                }
            };
            return isValidDate ? null : message;
        }
        return null;
    }
}

export function matchOtherValidator(otherControlName: string) {

    let thisControl: FormControl;
    let otherControl: FormControl;

    return function matchOtherValidate(control: FormControl) {

        if (!control.parent) {
            return null;
        }

        // Initializing the validator.
        if (!thisControl) {
            thisControl = control;
            otherControl = control.parent.get(otherControlName) as FormControl;
            if (!otherControl) {
                throw new Error('matchOtherValidator(): other control is not found in parent group');
            }
            otherControl.valueChanges.subscribe(() => {
                thisControl.updateValueAndValidity();
            });
        }

        if (!otherControl) {
            return null;
        }

        if (otherControl.value !== thisControl.value) {
            const message = {
                'match': {
                    'message': 'Confirm Password do not match'
                }
            };
            return message;
        }

        return null;
    };
}

export class DateValidator {

    constructor() {}

    static date(c: FormControl) {
        const date1 = new Date(moment(c.value).format());
        const date2 = new Date();
        const message = {
            'match': {
                'message': 'Past date/time not allowed'
            }
        };
        
        if (date1.getFullYear() > 9999) {
            return message;
        } else {
            date1.setTime(date1.getTime() + (60 * 1000));

            if (!(date1.getTime() >= date2.getTime())) {
                return message;
            } 
            else if
                (!(new Date(c.value) instanceof Date)) {
                return message;
            } else {
                return null;
            }
        }

    }
}

export class DateScopeValidator {

    constructor() {
    }

    static date(c: FormControl) {
        const message = {
            'match': {
                'message': 'Invalid birthday date'
            }
        };
        const date1 = new Date(c.value);
        const date2 = new Date();

        if (date1.getTime() >= date2.getTime()) {
            return message;
        } else {
            return null;
        }

    }
}

export function atLeastOneFieldValidator(field1, field2) {

    return function atLeastOneFieldValidator(control: FormControl) {
        if (!control.parent) {
            return null;
        }

        if (!control.parent.get(field1).value && !control.parent.get(field2).value && !control.value) {
            const message = {
                'match': {
                    'message': 'At least one phone number required'
                }
            };
            return message;
        } else {
            if (control.value) {
                control.statusChanges.subscribe(() => {
                    if (!control.errors) {
                        control.parent.get(field1).updateValueAndValidity({
                            onlySelf: true,
                            emitEvent: false
                        });
                        control.parent.get(field2).updateValueAndValidity({
                            onlySelf: true,
                            emitEvent: false
                        });
                    }
                });
            }
        }

        return null;
    };
}

