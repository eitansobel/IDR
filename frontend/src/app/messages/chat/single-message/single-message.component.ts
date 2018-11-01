import {Component, OnInit, Input} from '@angular/core';
import {environment} from '../../../../environments/environment';
@Component({
    selector: 'idr-single-message',
    templateUrl: './single-message.component.html',
    styleUrls: ['./single-message.component.scss']
})
export class SingleMessageComponent implements OnInit {
    @Input() message;

    public imageUrl: string = environment.settings.imageUrl;
    constructor() {}

    ngOnInit() {
    }

    getMessage(text) {
        return this.jsonEscape(text);
    }

    jsonEscape(str) {
        return str.replace(/\b\b\b\b/g, ' ').replace('<br \>', '');
    }
}
