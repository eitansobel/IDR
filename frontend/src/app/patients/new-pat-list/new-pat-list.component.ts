import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatDialog} from '@angular/material';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import {SortByPipe} from '../../pipe/sort.pipe';
import {fromEvent} from 'rxjs/observable/fromEvent';
import {merge} from 'rxjs/observable/merge';
import {Profile} from '../../models/profile';
import {PatientsService} from '../services/patients.service';
import {Patient} from '../../models/patient';
import {AddPatlist, DeletePatlist, UpdateChosenPatientList} from '../../redux/patientsList/patientsList.action';
import {DialogOverviewComponent} from '../../common/dialogOverview/dialogOverview.component';
import {UpdateUserParticipantList} from "../../redux/profile/profile.action";
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {NotifyService} from "../../services/notify.service";

declare var require: any;
require('rxjs').fromEvent = fromEvent;
require('rxjs').merge = merge;

@Component({
    selector: 'idr-new-pat-list',
    templateUrl: './new-pat-list.component.html',
    styleUrls: ['./new-pat-list.component.scss']
})
export class NewPatListComponent implements OnInit {
    public patients: Patient[];
    public membersInList: Profile[] = [];
    private membersTempAddList: Profile[] = [];
    private membersTempRemoveList: Profile[] = [];
    public newList;
    public direc: boolean = false;
    public checked: boolean = false;
    public keys: string[] = ['first_name', 'last_name', 'mrn', 'birth_date'];
    public newListChecked: boolean = false;
    public deleteList: boolean = false;
    public membersAll: Profile[];
    public selectedOptions: any[] = [];
    public message;
    showSuccessChange: string = 'hide';
    showErrorChange: string = 'hide';
    public listForm: FormGroup;
    public formSubmitted: boolean = false;
    public list = {
        title: '',
        id: null,
        update_time: undefined
    };

    constructor(public dialogRef: MatDialogRef<NewPatListComponent>,
        @Inject(MAT_DIALOG_DATA) public popup: any,
        private patS: PatientsService,
        private sort: SortByPipe,
        private store: Store<AppState>,
        private notify: NotifyService,
        private fb: FormBuilder,
        public dialog: MatDialog) {
        
        
    }

    ngOnInit() {
        this.store.select('patientsPage').subscribe((_allpatients) => {
            this.patients = _allpatients.patients;
           
            if (this.popup) {
                this.listForm = this.fb.group({
                    title: ['', [Validators.required, Validators.maxLength(30)]]
                });

                if (this.popup.edit) {
                    this.deleteList = true;
                    if (this.popup.id === 'My Patients') {
                        this.store.select('patListPage').map(x => x['chosenList'][0]).subscribe((_list) => {
                            if (!_list) return;
                            this.list = _list;
                            this.patients.forEach((el) => {
                                _list.participants.filter(x => {
                                    if (x.remote_id === el.remote_id) {
                                        this.selectedOptions.push(el);
                                    }
                                    return;
                                });
                            });
                          
                            this.membersInList = this.selectedOptions;
                            this.listForm.setValue({title: this.list.title || ''});
                        });
                    } else {
                        this.patS.getSingleList(this.popup.id).subscribe((_list) => {
                            this.list = _list;
                           
                            this.patients.forEach((el) => {
                                _list.participants.filter(x => {
                                    if (x === el.remote_id) {
                                        this.selectedOptions.push(el);
                                    }
                                    return;
                                });
                            });
                            this.membersInList = this.selectedOptions;
                            console.log(this.membersInList);
                             this.listForm.setValue({title: this.list.title || ''});
                        }, err => {
                            this.notify.notifyError(err);
                        });

                    }
                }
            }
        });
    }

    closeDialog() {
        this.patients.map((x) => {
            x['hidden'] = 'block';
        });
        this.dialogRef.close();
    }

    deleteCreatedList() {
        const dialogRef = this.dialog.open(DialogOverviewComponent, {
            width: '400px',
            data: {
                header: 'Delete patient list',
                body: `Are you sure you want to delete "${this.list.title}" list?`
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.patS.removeList(this.list.id).subscribe((resp) => {
                    this.store.dispatch(new DeletePatlist(this.list.id));
                    this.closeDialog();
                }, err => {
                    this.notify.notifyError(err);
                });
            }
        });
    }

    sortable(key) {
        this.direc = !this.direc;
        this.patients = this.sort.transform(this.patients, key, this.direc);
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

    manageList() {
        this.formSubmitted = true;
         if (!this.listForm.valid) return;
        if (this.popup.edit) {

            if (this.popup.id === 'My Patients') {
                const obj = {
                    'my_patients_list_participants': this.membersInList.map(x => x.remote_id)
                };
                this.patS.changeMyPatients(obj).subscribe((resp) => {
                    this.store.dispatch(new UpdateUserParticipantList(resp['my_patients_list_participants']));
                    this.notify.success('Saved successfully');
                    this.closeDialog();
                }, err => {
                    this.notify.notifyError(err);
                });
            } else {
                const obj = {
                    participants: this.membersInList.map(x => x.remote_id),
                    title: this.listForm.controls.title.value
                };
                this.patS.updateSingleList(obj, this.list.id).subscribe((_resp) => {
                    this.store.dispatch(new UpdateChosenPatientList(_resp));

                    this.notify.success('Saved successfully');
                    this.closeDialog();
                }, err => {
                    this.notify.notifyError(err);
                });
            }
        } else {
            const obj = {
                participants: this.membersInList.map(x => x.remote_id),
                title: this.listForm.controls.title.value
            };
            this.patS.createList(obj).subscribe((resp) => {
                let temp = resp;
                this.store.select('patientsPage').subscribe((_allpatients) => {

                    let pats = _allpatients['patients'].filter((x) => {

                        return resp['participants'].find(y =>
                            y === x.remote_id
                        );
                    });
                    temp['participants'] = pats;
                });

                this.store.dispatch(new AddPatlist(temp));
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
