import {Component, OnInit, forwardRef, OnChanges, Input} from '@angular/core';
import {NgOption} from '@ng-select/ng-select';
import {NG_VALUE_ACCESSOR, NG_VALIDATORS, } from '@angular/forms';
import {ValueAccessorBase} from '../../models/value-accessor';
@Component({
    selector: 'idr-date-select',
    templateUrl: './date-select.component.html',
    styleUrls: ['./date-select.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateSelectComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => DateSelectComponent),
            multi: true,
        },
    ],
})
export class DateSelectComponent extends ValueAccessorBase<string> implements OnInit, OnChanges {
    @Input() date;
    @Input() readonly = false;
    startYear = 1933;
    lastYear = (new Date()).getFullYear();
    days;

    birthday = {
        yearId: null,
        monthId: null,
        dayId: null,
    };

    months: NgOption[] = [
        {
            id: '01',
            label: 'January'
        },
        {
            id: '02',
            label: 'February'
        },
        {
            id: '03',
            label: 'March'
        },
        {
            id: '04',
            label: 'April'
        },
        {
            id: '05',
            label: 'May'
        },
        {
            id: '06',
            label: 'June'
        },
        {
            id: '07',
            label: 'July'
        },

        {
            id: '08',
            label: 'August'
        },
        {
            id: '09',
            label: 'September'
        },
        {
            id: '10',
            label: 'October'
        },
        {
            id: '11',
            label: 'November'
        },
        {
            id: '12',
            label: 'December'
        }
    ];
    years = [];


    ngOnInit() {
        if (!this.years.length) {
            for (let i = this.startYear; i <= this.lastYear; i++) {
                this.years.push(i);
            }
        }

        this.days = Array(31).fill(1).map((x, i) => {
            if (i < 9) {
                return '0' + ++i;
            } else {
                return '' + ++i;
            }
        });

    }

    ngOnChanges() {
        if (!this.date) {
            this.birthday.dayId = null;
            this.birthday.yearId = null;
            this.birthday.monthId = null;
            return;
        }
        const str = this.date.split('-');
        if (str[2] !== ('null' || "NaN") && str[2]) {
            this.birthday.dayId = str[2];
        }
        if (str[0] !== ('null' || "NaN") && str[0]) {
            this.birthday.yearId = +str[0];
        }
        if (str[1] !== ('null' || "NaN") && str[1]) {
            this.birthday.monthId = str[1];
        }
    }

    calcDaysofMonth() {

        this.daysInMonth(this.birthday.monthId, this.birthday.yearId);
        this.days = Array(31).fill(1).map((x, i) => {
            if (i < 9) {
                return '0' + ++i;
            } else {
                return '' + ++i;
            }
        });
    }

    daysInMonth(month, year) {
        return new Date(year, month, 1).getDate();
    }

    calcMonthOfYear() {
        if (!this.birthday.monthId) return;
        this.calcDaysofMonth();
    }
}
