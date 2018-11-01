import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'filter'
})
export class FilterPipe implements PipeTransform {

    transform(value: any, keys: any, args?: any, whiteSpaceMode = false): any {

        if (!value) return null;
        if (!args) return value;
        const delimiter = whiteSpaceMode ? ' ' : '~>';

        args = args.toLowerCase();
        return value.filter(function (item) {
            let str = '';
            keys.forEach((key) => {
                if (key !== null && typeof key === 'object') {
                    Object.keys(key).forEach(nestedKey => {
                        const subKeys = key[nestedKey];
                        if (Array.isArray(subKeys)) {
                            subKeys.forEach(keyInArray => {
                                const subStr = item[nestedKey][keyInArray];
                                str += subStr ? delimiter + subStr : '';
                            });
                        } else {
                            str += delimiter + item[nestedKey][subKeys];
                        }
                    });
                } else {
                    str += delimiter + item[key];
                }
                str = str.toLowerCase();
            });
            return str.includes(args);
        });
    }
}
