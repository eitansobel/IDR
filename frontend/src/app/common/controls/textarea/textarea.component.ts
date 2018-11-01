
import {Component, Input, forwardRef, ViewChild, ElementRef, OnChanges} from '@angular/core';
import {NG_VALUE_ACCESSOR, NG_VALIDATORS} from '@angular/forms';
import {ValueAccessorBase} from '../../../models/value-accessor';
@Component({
  selector: 'idr-textarea',
  templateUrl: './textarea.component.html',
  styleUrls: ['./textarea.component.scss'],
   providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextareaComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => TextareaComponent),
            multi: true,
        }]
})
export class TextareaComponent extends ValueAccessorBase<string> implements OnChanges {

    @Input() placeholder: string = '-';
    @Input() hasError: boolean = false;
    @Input() required: boolean = false;
    @Input() control;
    @ViewChild('input') input: ElementRef;
    @Input() readonly = false;

    ngOnChanges() {
        if (!this.control) return;
        this.input.nativeElement.value = this.control.value;
    }
}
