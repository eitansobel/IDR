import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {Store} from '@ngrx/store';
import {StaffService} from '../service/staff.service';
import {AddStafflist, DeleteStafflist, UpdateLoadedStafflist} from '../../redux/staff/staff.action';
import {AppState} from '../../redux/app.state';
import {SortByPipe} from '../../pipe/sort.pipe';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {merge} from 'rxjs/observable/merge';
import {Profile} from '../../models/profile';
import {DialogOverviewComponent} from '../../common/dialogOverview/dialogOverview.component';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {NotifyService} from "../../services/notify.service";

declare var require: any;
require('rxjs').fromEvent = fromEvent;
require('rxjs').merge = merge;

@Component({
    selector: 'idr-new-staff-list',
    templateUrl: './new-staff-list.component.html',
    styleUrls: ['./new-staff-list.component.scss']
})
export class NewStaffListComponent implements OnInit {
    public members: Profile[];
    public membersInList: Profile[] = [];
    private membersTempAddList: Profile[] = [];
    private membersTempRemoveList: Profile[] = [];
    public newList;
    public direc: boolean = false;
    public checked: boolean = false;
    public keys: string[] = ['first_name', 'last_name', 'title'];
    public newListChecked: boolean = false;
    public deleteList: boolean = false;
    public membersAll: Profile[];
    public selectedOptions: any[] = [];
    public message;
    showSuccessChange: string = 'hide';
    showErrorChange: string = 'hide';
    public formSubmitted: boolean = false;
    public listForm: FormGroup;
    public list = {
        title: '',
        id: null,
        update_time: undefined
    };

    constructor(public dialogRef: MatDialogRef<NewStaffListComponent>,
        @Inject(MAT_DIALOG_DATA) public popup: any,
        private staffS: StaffService,
        private sort: SortByPipe,
        private notify: NotifyService,
        private store: Store<AppState>,
        public dialog: MatDialog,
        private fb: FormBuilder) {


    }

    ngOnInit() {
                if (this.popup) {

            this.listForm = this.fb.group({
                title: ['', [Validators.required, Validators.maxLength(30)]]
            });
            if (this.popup.edit) {

                this.deleteList = true;

                this.staffS.getSingleList(this.popup.id).subscribe((_list) => {
                    this.list = _list;
                    this.listForm.setValue({title: this.list.title || ''});
                    this.members.forEach((el) => {
                        _list.participants.filter(x => {
                            if (x === el.id) {
                                this.selectedOptions.push(el);
                            }
                            return;
                        });
                    });
                    this.membersInList = this.selectedOptions;
               
                }, err => {
                    this.notify.notifyError(err);
                });
            }
        }

        this.store.select('membersPage').subscribe((_allmembers) => {
            if (!_allmembers) return;
            this.members = _allmembers.members;
        });
    }

    closeDialog() {
        this.members.map((x) => {
            x['hidden'] = 'block';
        });
        this.dialogRef.close();
    }

    deleteCreatedList() {
        const dialogRef = this.dialog.open(DialogOverviewComponent, {
            width: '400px',
            data: {
                header: 'Delete staff list',
                body: `Are you sure you want to delete "${this.list.title}" list?`
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.staffS.removeList(this.list.id).subscribe((resp) => {
                    this.store.dispatch(new DeleteStafflist(this.list.id));
                    this.closeDialog();
                }, err => {
                    this.notify.notifyError(err);
                });
            }
        });
    }

    sortable(key) {
        this.direc = !this.direc;
        this.members = this.sort.transform(this.members, key, this.direc);
    }

    sortableList(key) {
        this.direc = !this.direc;
        this.membersInList = this.sort.transform(this.membersInList, key, this.direc);
    }

    addToList(membersAll) {
        if (!membersAll) return;
        membersAll.selectedOptions.selected.forEach((el) => {
            this.membersTempAddList.push(el.value);
        });
        this.membersInList = this.membersTempAddList;
        this.membersTempAddList = [];
   
      
        this.membersTempAddList = [];
    }

    removeFromList(value, membersAll) {
        value.selectedOptions.selected.forEach((el, index) => {
            this.membersTempRemoveList.unshift(el.value[0]);
            membersAll.selectedOptions.selected.find((_select) => {
                if (_select.value === el.value[0]) {
                    _select.toggle();
                }
                return;
            });
        });

        this.membersInList = this.membersInList.filter((obj) => this.membersTempRemoveList.indexOf(obj) === -1);
        this.membersTempRemoveList = [];
        this.newListChecked = false;
        this.checked = false;
    }

    selectAll2(value, list) {
        if (value) {
            list.selectAll();
        } else {
            list.deselectAll();
        }
    }

    createList() {
        this.formSubmitted = true;
        if (!this.listForm.valid) return;

        const obj = {
            participants: this.membersInList.map(x => x.id),
            title: this.listForm.controls.title.value
        };

        if (this.popup.edit) {
            this.list.title = this.listForm.controls.title.value;
            this.staffS.updateSingleList(obj, this.list.id).subscribe((resp) => {
                this.store.dispatch(new UpdateLoadedStafflist({
                    ...this.list,
                    participants: this.membersInList,
                    qty: this.membersInList.length,
                }));

                this.notify.success('Saved successfully');
                this.closeDialog();
            }, err => {
                this.notify.notifyError(err);
            });
        } else {
            this.staffS.createList(obj).subscribe((resp) => {
                this.store.dispatch(new AddStafflist(resp));
                this.list.id = resp.id;
                this.deleteList = true;
                this.notify.success('Saved successfully');
                this.closeDialog();
            }, err => {
                this.notify.notifyError(err);
            });
        }
    }
}
