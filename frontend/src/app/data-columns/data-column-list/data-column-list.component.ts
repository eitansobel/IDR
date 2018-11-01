import {
    Component,
    OnInit,
    Input,
    OnChanges,
    EventEmitter,
    Output, ChangeDetectorRef,
} from '@angular/core';
import {SortByPipe} from '../../pipe/sort.pipe';
import {FilterPipe} from '../../pipe/filter.pipe';
import {MatDialog} from '@angular/material';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import {
    CopyColumn, DeleteColumn, GetColumns, UpdateColumn
} from '../../redux/dataColumns/data-column.action';
import {DataColumnPopupComponent} from '../data-column-popup/data-column-popup.component';
import {DialogOverviewComponent} from '../../common/dialogOverview/dialogOverview.component';
import {DataColumn} from '../../models/data-columns';
import {DataColumnsService} from '../services/data-columns.service';
import {DataColumnsUpdateIntervalMapService} from '../services/data-columns-update-interval-map.service';
import {UserPermissionService} from '../../services/user-permission.service';
import {ChatService} from '../../messages/services/chat.service';
import {NotifyService} from "../../services/notify.service";

@Component({
    selector: 'idr-data-column-list',
    templateUrl: './data-column-list.component.html',
    styleUrls: ['./data-column-list.component.scss']
})

export class DataColumnListComponent implements OnInit, OnChanges {
    @Output() chosedData = new EventEmitter<any>();
    @Input() listHeader = [];
    @Input() searchHolder = 'Search text';
    @Input() sortableKeys = [];
    @Input() searchKeys = [];

    public direc: boolean = false;
    public active: number = null;
    public dataColumnList: DataColumn[] = [];
    private initDataColumnList: DataColumn[] = [];
    public updateNeededMap: {};
    public pages;
    public start = 0;
    public end = 10;
    public maxPages = 10;
    public searchText;
    public currentPageIndex = 0;
    public slideLeft = 5;


    constructor(private dataColumnsUpdateIntervalMapService: DataColumnsUpdateIntervalMapService,
                private userPermissionService: UserPermissionService,
                private sort: SortByPipe,
                private filter: FilterPipe,
                private notify: NotifyService,
                private store: Store<AppState>,
                private dataService: DataColumnsService,
                private chatService: ChatService,
                public dialog: MatDialog,
                private changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.store.select('dataColumnPage').subscribe((_dataColumns) => {
            if (this.initDataColumnList.length && !_dataColumns['columns'].length) {
                this.dataColumnList = _dataColumns['columns'];
            }
            this.initDataColumnList = _dataColumns['columns'];
            if (this.initDataColumnList.length) {
                if (this.active !== null) {
                    this.sortable(this.active, true);
                } else {
                    this.dataColumnList = _dataColumns['columns'];
                }
            }
            this.getPages();
        });
        this.updateNeededMap = this.dataColumnsUpdateIntervalMapService.keyValueMap;
        this.chatService.notifications.subscribe(notif => {
            this.dataService.webSocketActionManager(notif, this.initDataColumnList, this.store);
        });
    }

    ngOnChanges() {
        this.getPages();
    }

    getPages() {
        this.start = 0;
        this.end = this.maxPages;
        if (!this.dataColumnList.length) return;
        this.pages = Math.ceil(this.dataColumnList.length / this.maxPages);
        if (this.searchText) {
            this.pages = Math.ceil(this.filter.transform(this.dataColumnList, this.sortableKeys, this.searchText).length / this.maxPages);
        }
        if (this.currentPageIndex >= this.pages) {
            this.activePage(this.currentPageIndex - 1);
        } else {
            this.activePage(this.currentPageIndex);
        }
    }

    sortable(index, refresh = false) {
        if (!refresh) {
            this.direc = !this.direc;
        }
        this.dataColumnList = this.sort.transform(this.initDataColumnList, this.sortableKeys[index], this.direc);
    }

    deleteRow(index, column) {
        const dialogRef = this.dialog.open(DialogOverviewComponent, {
            width: '342px',
            data: {
                header: 'Delete Column',
                body: `Are you sure you want to delete ${this.dataColumnList[index].title}?`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dataService.deleteDataColumn(column.id).subscribe((_d) => {
                        this.store.dispatch(new DeleteColumn(column));
                    },
                    err => {
                        this.notify.notifyError(err);
                    });
            }
        });
    }

    copyRow(index, id) {
        const dialogRef = this.dialog.open(DialogOverviewComponent, {
            width: '342px',
            data: {
                header: 'Copy Column',
                body: `Are you sure you want to copy ${this.dataColumnList[index].title} column?`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dataService.copyDataColumn(id).subscribe((_data) => {
                    this.store.dispatch(new CopyColumn(_data));
                });
            }
        });
    }

    toggleColumn(status, id) {
        this.dataService.toggleDataColumn(id, {'is_hidden': status.checked}).subscribe(
            (resp) => {
                this.store.dispatch(new UpdateColumn(resp));
            });
    }

    activePage(i) {
        this.currentPageIndex = i;
        this.start = i * this.maxPages;
        this.end = (i + 1) * this.maxPages;
    }

    filterUsers(searchText) {
        this.pages = Math.round((this.filter.transform(this.dataColumnList, this.sortableKeys, searchText).length / this.maxPages));
    }

    editDataColumn(columnInstance): void {
        this.dialog.open(DataColumnPopupComponent, {
            width: '440px',
            data: {
                header: 'Edit Column',
                columnInstance: columnInstance,
            }
        });
    }

    userCanSeeButton(buttonType, column): boolean {
        return this.userPermissionService.userCanSeeColumnButton(buttonType, column);
    }

    setNewColumnOrder(e: any) {
        if (e.type === 'drop') {
            const newOrderData = this.dataColumnList.map((item, index) => {
                return {column_id: item.id, order: index + 1};
            });
            this.active = null;
            this.dataService.setDataColumnOrder({order_list: newOrderData}).subscribe((_resp) => {
                this.store.dispatch(new GetColumns(_resp));
            });
        }
    }

    scrollDetect(evt) {
        if (!evt) return;
        this.slideLeft = evt.target.scrollLeft + 10;
        this.changeDetectorRef.detectChanges();
    }
}
