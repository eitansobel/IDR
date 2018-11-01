import {Component, OnInit, forwardRef, OnChanges, Input} from '@angular/core';
import {countries, Country, State, Region} from "coutries-states";
import {NgOption} from '@ng-select/ng-select';
import {NG_VALUE_ACCESSOR, NG_VALIDATORS, } from '@angular/forms';
import {ValueAccessorBase} from '../../models/value-accessor';
@Component({
    selector: 'idr-country-contacts',
    templateUrl: './country-contacts.component.html',
    styleUrls: ['./country-contacts.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CountryContactsComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => CountryContactsComponent),
            multi: true,
        },
    ],
})
export class CountryContactsComponent extends ValueAccessorBase<string>  {
    @Input() stateChoosed = 'US';
    @Input() formSubmitted = true;
    @Input() control = null;
    @Input() readonly = false;
    countries: NgOption[] = [];
    states: NgOption[] = [];
    zip_code;
    chosedState = '';
    city;
    country;
    state;
    ngOnInit() {
        this.states = countries.find(c => c.iso === "US").states;
        this.countries = countries;
    }

    ngOnChanges() {
        if (!this.stateChoosed) return;
        if (!this.formSubmitted) {
            this.state = null;

            if (this.control) {
                this.state = this.control;
            } else {

            }
            this.chosedState = null;
            if(!countries.find(c => c.name === this.stateChoosed)) return;
            this.states = countries.find(c => c.name === this.stateChoosed).states;
        }
    }
}
