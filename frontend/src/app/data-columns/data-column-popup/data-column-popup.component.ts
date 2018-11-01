import {Component, OnInit, Inject, Input} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import {NgOption} from '@ng-select/ng-select';
import {DataColumnsUpdateIntervalMapService} from '../services/data-columns-update-interval-map.service';
import {CustomValidators} from '../../models/validator';
import {CreateColumn, UpdateColumn} from '../../redux/dataColumns/data-column.action';
import {Validators, FormBuilder, FormGroup} from '@angular/forms';
import {SortByPipe} from "../../pipe/sort.pipe";
import {DataColumnsService} from "../services/data-columns.service";
import {DataColumn} from "../../models/data-columns";
import {UpdateNestedColumn} from "../../redux/home/home.actions";
import {NotifyService} from "../../services/notify.service";

@Component({
    selector: 'idr-data-column-popup',
    templateUrl: './data-column-popup.component.html',
    styleUrls: ['./data-column-popup.component.scss']
})
export class DataColumnPopupComponent implements OnInit {
    public userFullName: string;
    public columnAuthor: string;
    public headerText: string = '';
    public updateIntervalTypes: NgOption[];
    public currentColumn: DataColumn;
    public columnForm: FormGroup;
    public homePage: boolean;

    formSubmitted: boolean = false;
    message;

    public showHideTypes: NgOption[] = [
        {
            value: false,
            label: 'Show'
        },
        {
            value: true,
            label: 'Hide'
        },
    ];

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                private dataColumnsUpdateIntervalMapService: DataColumnsUpdateIntervalMapService,
                public dialogRef: MatDialogRef<DataColumnPopupComponent>,
                private dataService: DataColumnsService,
                private fb: FormBuilder,
                private sort: SortByPipe,
                private store: Store<AppState>,
                private notify: NotifyService) {
        if (this.data) {
            this.headerText = this.data.header;
            if (this.data.columnInstance) {
                this.homePage = this.data.nested;
                this.currentColumn = this.data.columnInstance;
                this.columnAuthor = this.currentColumn.author.full_name;
            }
        }
    }

    ngOnInit() {
        this.store.select('profilePage').map(data => data.profile).subscribe((_profile) => {
            this.userFullName = `${_profile.first_name} ${_profile.last_name}`;
        });
        this.updateIntervalTypes = this.dataColumnsUpdateIntervalMapService.getLabelValue;
        this.columnForm = this.fb.group({
            title: [null, [
                Validators.required,
                Validators.maxLength(30),
                CustomValidators.validateBackspace
            ]],
            update_interval: [null, [Validators.required]],
            is_hidden: [null, []]
        });

        this.initForm();
    }

    initForm() {
        if (this.currentColumn) {
            this.columnForm.setValue({
                title: this.currentColumn.title || '',
                update_interval: this.currentColumn.update_interval.toString(),
                is_hidden: this.currentColumn.is_hidden || false
            });
        }
    }

    closeDialog() {
        this.dialogRef.close();
    }

    save() {

        if (this.columnForm.valid && this.columnForm.dirty) {
            this.formSubmitted = false;
            const obj = this.columnForm.value;
            if (this.currentColumn && this.currentColumn.id) {
                this.dataService.updateDataColumn(this.currentColumn.id, obj).subscribe(
                    (resp) => {
                        if (this.homePage) {
                            this.store.dispatch(new UpdateNestedColumn(resp));
                        } else {
                            this.store.dispatch(new UpdateColumn(resp));
                        }
                        this.dialogRef.close();
                    }, err => {
                        this.notify.notifyError(err);
                    });
            } else {
                this.dataService.createDataColumn(obj).subscribe(
                    (resp) => {
                        this.store.dispatch(new CreateColumn(resp));
                        this.dialogRef.close();
                    }, err => {
                        this.notify.notifyError(err);
                    });
            }
        } else {
            this.formSubmitted = true;
        }
    }

    cancel() {
        this.columnForm.reset();
        this.dialogRef.close();
    }
}
