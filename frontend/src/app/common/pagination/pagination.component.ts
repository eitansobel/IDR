import {Component, OnInit, Input, OnChanges, Output, EventEmitter, ChangeDetectorRef} from '@angular/core';

@Component({
    selector: 'idr-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit, OnChanges {
    @Input() pages: number = 5;
    @Input() listTitle;
    @Output() activePage = new EventEmitter<any>();
    pagesArr = [];
    tempData;
    selected = 0;
    constructor(private ref: ChangeDetectorRef) {}

    ngOnInit() {
        if (this.pages === undefined) return;
        if (this.pages < 1) this.pages = 1;
        this.pagesArr = Array(Math.ceil(this.pages)).fill(1).map((x, i) => i + 1);
    }

    ngOnChanges() {
        this.selected = 0;
        if (this.pages < 1) this.pages = 1;
        if (this.pages < 1) this.pages = 1;
        this.pagesArr = Array(Math.ceil(this.pages)).fill(1).map((x, i) => i + 1);
    }

    selectPage(i) {
        this.selected = i;
        this.activePage.emit(i);
    }
}
