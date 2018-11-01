import {Component, OnInit} from '@angular/core';
import {MatDialog} from '@angular/material';
import {AppState} from '../redux/app.state';
import {Store} from '@ngrx/store';
import {DataColumnsService} from './services/data-columns.service';
import {DataColumnPopupComponent} from './data-column-popup/data-column-popup.component';
import {GetColumns} from '../redux/dataColumns/data-column.action';
import {UserPermissionService} from '../services/user-permission.service';


@Component({
    selector: 'idr-data-columns',
    templateUrl: './data-columns.component.html',
    styleUrls: ['./data-columns.component.scss']
})
export class DataColumnsComponent implements OnInit {
    public listHeader: string[] = [
        'List of available data columns',
        'Show/Hide',
        'Update Needed'
    ];
    public spinner: boolean = true;
    public loadProfile: boolean = false;

    constructor(public dialog: MatDialog,
                private dataColumnService: DataColumnsService,
                private userPermissionService: UserPermissionService,
                private store: Store<AppState>) {
    }

    ngOnInit() {
        this.dataColumnService.getDataColumns().subscribe(_dataColumns => {
            this.store.dispatch(new GetColumns(_dataColumns));
        });
    }

    newDataColumn(): void {
        this.dialog.open(DataColumnPopupComponent, {
            width: '440px',
            data: {
                header: 'Create Column',
            }
        });
    }

    get userCanCreateDataColumn() {
        return this.userPermissionService.userCanCreateDataColumn;
    }
}
