import {Directive, ElementRef, HostListener, HostBinding} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
    selector: '[formControlName][phoneMask]'
})
export class PhoneMaskDirective {

    constructor(public ngControl: NgControl, public el: ElementRef) {

    }
    @HostListener('ngModelChange', ['$event'])
    onModelChange(event) {
        this.onInputChange(event, false);
    }

    @HostListener('input', ['$event.target.value'])
    onInput(value: string) {
        // Use NgControl patchValue to prevent the issue on validation
        this.ngControl.control.patchValue(value.replace(/[^0-9]/g, ''));
    }

    @HostListener('keydown.backspace', ['$event'])
    keydownBackspace(event) {
        this.onInputChange(event.target.value, true);
    }

    private onInputChange(event, backspace) {
        if (!event) return;

        let newVal = event.replace(/\D/g, '');
        // console.log(newVal.length);
        // if (backspace && newVal.length == 6) {
        //     newVal = newVal.substring(0, newVal.length - 1);
           
        // }
        if (!backspace) {
            
       
        if (newVal.length === 0 ) {
            newVal = '';
        } else if (newVal.length <= 3) {
            newVal = newVal.replace(/^(\d{0,3})/, '($1)');
        } else if (newVal.length <= 6) {
            newVal = newVal.replace(/^(\d{0,3})(\d{0,3})/, '($1) $2');
        } else if (newVal.length <= 10) {
            newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '($1) $2-$3');
        } else {
            newVal = newVal.substring(0, 10);
            newVal = newVal.replace(/^(\d{0,3})(\d{0,3})(\d{0,4})/, '($1) $2-$3');
        }
    }
        return this.ngControl.valueAccessor.writeValue(newVal);
    }

}