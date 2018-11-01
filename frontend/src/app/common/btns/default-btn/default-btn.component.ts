import {Component, Input, Output, EventEmitter} from '@angular/core';

@Component({
    selector: 'idr-default-btn',
    templateUrl: './default-btn.component.html',
    styleUrls: ['./default-btn.component.scss']
})
export class DefaultBtnComponent {
    @Input() className: string = 'default';
    @Output() onClick: EventEmitter<any> = new EventEmitter<any>();

    handleClick(event: any) {
        this.onClick.emit(event);
    }
}
