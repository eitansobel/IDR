import {Component, OnInit, Inject, Input} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import {NgOption} from '@ng-select/ng-select';
import {DataColumnsUpdateIntervalMapService} from '../../data-columns/services/data-columns-update-interval-map.service';
import {CustomValidators} from '../../models/validator';
import {CreateCell, EditNestedCell} from '../../redux/home/home.actions';
import {Validators, FormBuilder, FormGroup, FormArray} from '@angular/forms';
import {SortByPipe} from '../../pipe/sort.pipe';
import {NestedColumn, NestedHomeCell, HomeCellField} from '../../models/home';
import {HomeService} from '../services/home.service';
import {UserPermissionService} from '../../services/user-permission.service';
import {NotifyService} from "../../services/notify.service";

@Component({
    selector: 'idr-edit-cell-popup',
    templateUrl: './edit-cell-popup.component.html',
    styleUrls: ['./edit-cell-popup.component.scss']
})
export class EditCellPopupComponent implements OnInit {
    @Input() cellPatientId: number;
    public userFullName: string;
    public cellAuthor: string;
    public headerText: string = '';
    public updateIntervalTypes: NgOption[];
    public currentCell: NestedHomeCell;
    public currentColumn: NestedColumn;
    public cellForm: FormGroup;
    public newFieldTitleForm: FormGroup;
    public temporaryNewFieldList: HomeCellField[] = [];
    public newFieldFormSubmitted: boolean;
    public formSubmitted: boolean = false;
    message;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                private userPermissionService: UserPermissionService,
                private hService: HomeService,
                private notify: NotifyService,
                private dataColumnsUpdateIntervalMapService: DataColumnsUpdateIntervalMapService,
                public dialogRef: MatDialogRef<EditCellPopupComponent>,
                private fb: FormBuilder,
                private store: Store<AppState>) {
        if (this.data) {
            this.headerText = this.data.header;
            this.cellPatientId = this.data.cellPatientId;
            this.currentColumn = this.data.columnInstance;
            if (this.data.cellInstance) {
                this.currentCell = this.data.cellInstance;
                // TODO 'rewrite name to get a doctor fullname list to render not own columns'
                this.cellAuthor = this.userFullName;
            }
        }
    }

    ngOnInit() {
        this.store.select('profilePage').map(data => data.profile).subscribe((_profile) => {
            this.userFullName = `${_profile.first_name} ${_profile.last_name}`;
        });
        this.updateIntervalTypes = this.dataColumnsUpdateIntervalMapService.getLabelValue;
        this.cellForm = this.fb.group({
            title: [null, [
                Validators.required,
                Validators.maxLength(30),
                CustomValidators.validateBackspace
            ]],
            update_interval: [null, []],
            fields: this.fb.array([])
        });

        this.initMainForm();
        this.initNewFieldForm();
    }

    initMainForm() {
        if (this.currentCell) {
            this.currentCell.fields.forEach(fieldRecord => this.injectFieldControl(fieldRecord));
            this.cellForm.setValue({
                title: this.currentCell.title || '',
                update_interval: this.currentCell.update_interval ? this.currentCell.update_interval.toString() : null,
                fields: this.currentCell.fields
            });
        }
    }

    initNewFieldForm() {
        this.newFieldTitleForm = this.fb.group({
            title: [null, [
                Validators.required,
                Validators.maxLength(30),
                CustomValidators.validateBackspace
            ]]
        });
    }

    closeDialog() {
        this.dialogRef.close();
    }

    saveCell() {
        if (this.cellForm.valid && this.cellForm.dirty) {
            this.formSubmitted = false;
            const obj = this.cellForm.value;
            if (this.currentCell && this.currentCell.id) {
                this.hService.updateCell(this.currentCell.id, obj).subscribe(
                    (_resp) => {
                        this.store.dispatch(new EditNestedCell(_resp));
                        this.dialogRef.close();
                    },
                    (err) => {
                        this.notify.notifyError(err);
                    }
                );
            } else {
                const data = Object.assign(obj, {
                    patient: this.cellPatientId,
                    column_group_id: this.currentColumn.group_id
                });
                this.hService.createCell(data).subscribe(
                    (_resp) => {
                        this.store.dispatch(new CreateCell(_resp));
                        this.dialogRef.close();
                    },
                    (err) => {
                        this.notify.notifyError(err);
                    }
                );
            }
        } else {
            this.formSubmitted = true;
        }
    }

    addField() {
        this.newFieldFormSubmitted = true;
        if (this.newFieldTitleForm.valid && this.newFieldTitleForm.dirty) {
            this.injectFieldControl(this.newFieldTitleForm.value);
            this.newFieldFormSubmitted = false;
            this.newFieldTitleForm.reset();
            this.initNewFieldForm();
        }
    }

    deleteField(fieldForm, formIndex) {
        this.cellForm.markAsDirty();
        const controls = fieldForm['controls'];
        if (controls.id.value) {
            controls.is_deleted.setValue(true);
        } else {
            const control = <FormArray>this.cellForm.controls['fields'];
            control.removeAt(formIndex);
        }
    }

    injectFieldControl(inputData) {
        const control = <FormArray> this.cellForm.controls['fields'];
        const subForm = this.fb.group({
            id: [inputData.id || null, []],
            title: [inputData.title || null, []],
            value: [inputData.value, [
                Validators.required,
                Validators.maxLength(30)
            ]],
            author: [null, []],
            cell: [null, []],
            is_deleted: [false, []]
        });
        control.push(subForm);
    }

    cancel() {
        this.newFieldTitleForm.reset();
        this.temporaryNewFieldList = [];
        this.dialogRef.close();
    }

    get userCanCreateCellField(): boolean {
        if (this.currentColumn) {
            return this.userPermissionService.userCanCreateCellOrField(this.currentColumn);
        }
    }

    userCanEditCellField(fieldInstance): boolean {
        return this.userPermissionService.userCanEditCellField(fieldInstance);
    }

    userCanDeleteCellField(fieldInstance): boolean {
        return this.userPermissionService.userCanDeleteCellField(fieldInstance);
    }
}
