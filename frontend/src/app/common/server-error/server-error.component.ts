import {Component, OnInit, Input} from '@angular/core';

@Component({
    selector: 'idr-server-error',
    templateUrl: './server-error.component.html',
    styleUrls: ['./server-error.component.scss']
})
export class ServerErrorComponent implements OnInit {
    @Input() message: string;
    constructor() {}

    ngOnInit() {
    }

}
