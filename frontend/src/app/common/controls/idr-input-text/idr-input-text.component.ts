import {Component, Input, forwardRef, ViewChild, ElementRef, OnChanges} from '@angular/core';
import {NG_VALUE_ACCESSOR, NG_VALIDATORS} from '@angular/forms';
import {ValueAccessorBase} from '../../../models/value-accessor';

@Component({
    selector: 'idr-input-text',
    templateUrl: './idr-input-text.component.html',
    styleUrls: ['./idr-input-text.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputTextComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => InputTextComponent),
            multi: true,
        }]

})
export class InputTextComponent extends ValueAccessorBase<string> implements OnChanges {
    @Input() placeholder: string = '-';
    @Input() hasError: boolean = false;
    @Input() required: boolean = false;
    @Input() maxLength;
    @Input() control;
    @ViewChild('input') input: ElementRef;
    @Input() readonly = false;

    ngOnChanges() {
        if (!this.control) return;
        this.input.nativeElement.value = this.control.value;
    }
}
