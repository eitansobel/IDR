import {Directive, ElementRef, HostListener} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
    selector: '[formControlName][ssnMask]'
})
export class SsnMaskDirective {
    private patt = new RegExp("\d{3}[\-]\d{2}[\-]\d{4}");
    constructor(public ngControl: NgControl) {

    }
//    @HostListener('ngModelChange', ['$event'])
//    onModelChange(event) {
//        this.onInputChange(event, false);
//    }

    @HostListener('input', ['$event.target.value'])
    onInput(value: string) {
        

   
        // Use NgControl patchValue to prevent the issue on validation
        this.ngControl.control.patchValue(value
        .match(/\d*/g).join('')
        .match(/(\d{0,3})(\d{0,2})(\d{0,4})/).slice(1).join('-')
        .replace(/-*$/g, '')
        );
    }
//
    @HostListener('keydown.backspace', ['$event'])
    keydownBackspace(event) {
        this.onInputChange(event.target.value, true);
    }

    private onInputChange(event, backspace) {
        if (!event) return;

        let newVal = event.replace(/\D/g, '');
        console.log(newVal);
        if (backspace && newVal.length <= 6) {
            console.log(454);
            newVal = newVal.substring(0, newVal.length - 1);
        }
        if (newVal.length === 0) {
            newVal = '';
        } else if (newVal.length <= 3) {
            newVal = newVal.replace(/^(\d{0,3})/, '$1');
        } else if (newVal.length <= 5) {
            newVal = newVal.replace(/^(\d{0,3})(\d{0,2})/, '$1-$2');
        } else if (newVal.length <= 9) {
            newVal = newVal.replace(/^(\d{0,3})(\d{0,2})(\d{0,4})/, '$1-$2-$3');
        } else {
            newVal = newVal.substring(0, 9);
            newVal = newVal.match(/\d*/g).join('').match(/(\d{0,3})(\d{0,2})(\d{0,4})/).slice(1).join('-').replace(/-*$/g, '');
     
        }

        return this.ngControl.valueAccessor.writeValue(newVal);
    }

}