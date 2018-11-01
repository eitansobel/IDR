import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'idr-modal-wrap',
    templateUrl: './idr-modal-wrap.component.html',
    styleUrls: ['./idr-modal-wrap.component.scss']
})
export class IdrModalWrapComponent implements OnInit {
    @Input() hasIconDecor: boolean;

    constructor() {}

    ngOnInit() {
    }
}
