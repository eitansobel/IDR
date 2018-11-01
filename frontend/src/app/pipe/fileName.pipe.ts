import {Pipe, PipeTransform} from '@angular/core';
@Pipe({
    name: 'fileName'
})
export class FileNamePipe implements PipeTransform {

    transform(value: any): any {
        
        if(!value) return;
        value = value.substring(value.lastIndexOf('/')+1);
        value = value.substring(value.lastIndexOf(`\\`)+1);
       return value;
    }
}