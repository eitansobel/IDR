import {ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl, Validator} from '@angular/forms';
import { Renderer2 } from '@angular/core';
export class ValueAccessorBase<T> implements ControlValueAccessor {
    private jsonString: T;
    private parseError: boolean;
    private data: any;

    get value(): T {
          
        return this.jsonString;
      
    }

    set value(value: T) {
       
        if (this.data !== value) {
            this.data = value;
            this.onChange(value);
        }
    }

    public writeValue(value: any) {
        this.jsonString = value;
       
        if (value) {
            this.data = value;
            // this will format it with 4 character spacing
            this.jsonString = value;
        }
    }

    // registers 'fn' that will be fired wheb changes are made
    // this is how we emit the changes back to the form
    public registerOnChange(fn: any) {
        this.propagateChange = fn;
    }

    // validates the form, returns null when valid else the validation object
    // in this case we're checking if the json parsing has passed or failed from the onChange method
    public validate(c: FormControl) {
        return (!this.parseError) ? null : {
            jsonParseError: {
                valid: false,
            },
        };
    }

    // not used, used for touch input
    public registerOnTouched() {}

    // change events from the textarea
    private onChange(event) {
        let newValue;
       
        if (event.hasOwnProperty('yearId')) {
            
            newValue = `${event.yearId}-${event.monthId}-${event.dayId}`;
        } else if (event instanceof Date) {
            newValue = event;
        } else if (!event.target && event.value) {
            newValue = event.value.format('YYYY-MM-DD HH:mm:ss');
        } else if (event.target) {
            // get value from text area
            newValue = event.target.value;
        } else {
            newValue = event;
        }
        try {
            // parse it to json
            this.data = newValue;
            this.parseError = false;
        } catch (ex) {
            // set parse error if it fails
            this.parseError = true;
        }
  
        // update the form
        this.propagateChange(this.data);
    }

    // the method set in registerOnChange to emit changes back to the form
    private propagateChange = (_: any) => {};
}
