import {Pipe, PipeTransform} from '@angular/core';
@Pipe({
    name: 'acronym'
})
export class AcronymPipe implements PipeTransform {

    transform(value: any): any {
        if(!value) return;
        let matches = value.match(/\b(\w)/g);              // ['J','S','O','N']
        let acronym = matches.join(''); 

          return acronym;
      
    }
}
