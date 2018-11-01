import {Component, Input, forwardRef, ViewChild, ElementRef, OnChanges} from '@angular/core';
import {NG_VALUE_ACCESSOR, NG_VALIDATORS} from '@angular/forms';
import {ValueAccessorBase} from '../../../models/value-accessor';
@Component({
  selector: 'idr-search-control',
  templateUrl: './search-control.component.html',
  styleUrls: ['./search-control.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchControlComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => SearchControlComponent),
            multi: true,
        }]
})
export class SearchControlComponent extends ValueAccessorBase<string> implements OnChanges {
    @Input() placeholder: string = '-';
    @Input() control;
    @ViewChild('input') input: ElementRef;
    ngOnChanges() {
        if (!this.control) return;
        this.input.nativeElement.value = this.control.value;
    }
}

