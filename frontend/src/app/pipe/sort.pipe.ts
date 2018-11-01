import {Pipe, PipeTransform} from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';

@Pipe({
    name: 'sortBy'
})
export class SortByPipe implements PipeTransform {
    transform(array: Array<any>, ...args: any[]): any {

        if (!array) return;
        if (!array.length) return;

        const [key, direction, ignor] = args;
        let row;
        let ignorlist;
        let sortedlist;

        if (!direction) {
            row = 'asc';
        } else {
            row = 'desc';
        }
  
        if(ignor) {
            ignorlist = array.filter((x) => {
                return !x[ignor]
            });
            sortedlist = array.filter((x) => {
                return x[ignor]
            });

            return [...ignorlist, ..._.orderBy(sortedlist, [item => _.isString(item[key]) ? item[key].toLowerCase() : item[key]], [row])];
        } else 
        if (key === 'history') {
            return _.orderBy(array, [
                (item) => {
                    if (moment(item[key].last_message_time).format('X')) {
                        return moment(item[key].last_message_time).format('MM-DD-YYYY HH:mm');
                    }
                }
            ], ['desc']);
        } else {
            return _.orderBy(array, [item => _.isString(item[key]) ? item[key].toLowerCase() : item[key]],
                [row]);
        }
    }
}
