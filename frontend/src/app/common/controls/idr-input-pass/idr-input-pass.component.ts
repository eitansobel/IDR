import {Component, Input, forwardRef, ViewChild, ElementRef, } from '@angular/core';
import {NG_VALUE_ACCESSOR, NG_VALIDATORS} from '@angular/forms';
import {ValueAccessorBase} from '../../../models/value-accessor';

@Component({
    selector: 'idr-input-pass',
    templateUrl: './idr-input-pass.component.html',
    styleUrls: ['./idr-input-pass.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => IdrInputPassComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => IdrInputPassComponent),
            multi: true,
        }],

})
export class IdrInputPassComponent extends ValueAccessorBase<string> {

    @Input() placeholder: string;
    @Input() hasError: boolean = false;
    @Input() control;
    @Input() required: boolean = false;
    @ViewChild('input') input: ElementRef;
    
     ngOnChanges() {
        if (!this.control) return;
        this.input.nativeElement.value = this.control.value;
    }
}
