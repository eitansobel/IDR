import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';
@Pipe({
    name: 'localTime'
})
export class LocalTimePipe implements PipeTransform {

    transform(value: any): any {
        if(!value) return;

       return moment.parseZone(value).local().format('YYYY-MM-DD hh:mm');
    }
}