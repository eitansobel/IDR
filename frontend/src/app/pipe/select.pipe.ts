import {Pipe, PipeTransform} from '@angular/core';
@Pipe({
    name: 'select'
})
export class SelectPipe implements PipeTransform {

    transform(value: any, keys: any, args?: any): any {

        if (!value) return null;
        if (args == undefined) return value;
        args = args.toLowerCase();
        return value.map(function (item) {
            let str = '';
            keys.forEach((key) => {
                str += item[key];
                str = str.toLowerCase();
            });
            if(!str.includes(args)) {
                item['hidden'] = 'none';
            } else {
                 item['hidden'] = 'block';
            }
            return item;
        });
    }
}
