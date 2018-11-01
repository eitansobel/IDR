import {Component, OnInit, Renderer2, ViewChild, ElementRef} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Store} from '@ngrx/store';
import {AppState} from '../redux/app.state';
import {Patient} from '../models/patient';
import * as moment from 'moment';
import {NewMemberComponent} from './new-member/new-member.component';
import {PatientsService} from './services/patients.service';
import {GetPatients} from '../redux/patients/patients.action';
import {SetChosenPatientList, GetPatientsLists} from '../redux/patientsList/patientsList.action';
import {NewPatListComponent} from './new-pat-list/new-pat-list.component';
import {MultyUploadComponent} from './multyupload/multyupload.component';
import {NotifyService} from "../services/notify.service";

@Component({
    selector: 'idr-patients',
    templateUrl: './patients.component.html',
    styleUrls: ['./patients.component.scss']
})
export class PatientsComponent implements OnInit {
    public header: string[] = ['Name', 'QTY', 'Edited'];
    public patientLists: any[];

    private patients: Patient[];
    public listHeaderSingle: string[] = [
        'First Name',
        'Mid Name',
        'Last Name',
        'DOB',
        'Age'
    ];
    public spinner: boolean = true;
    public loadProfile: boolean = false;
    public chosedProfile: Patient;
    public myRole: boolean;
    private editableListId: number;
    public chosenPatientListTitle: string = 'My Patients';
    private myPatientsObj: {};
    public patientsListSingle: Object[] = [];
    public combinedPatientLists: Object[] = [];
    val = false;

    constructor(public dialog: MatDialog,
                private patService: PatientsService,
                private store: Store<AppState>,
                private renderer: Renderer2,
                private el: ElementRef,
                private notify: NotifyService) {
    }

    @ViewChild('idr-patients') patientWrap: ElementRef;

    ngOnInit() {
        this.store.select('patientsPage').subscribe((_patientsStore) => {
            this.patients = _patientsStore.patients;
            if (!this.patients.length) return;
            this.patService.getPatList().subscribe((_patLists) => {
                if (!_patLists[_patLists.length - 1]['all_patients']) return;
                this.patientLists = _patLists;
                this.generatePatientLists();
            }, err => {
                this.notify.notifyError(err);
            });
        });

        this.store.select('profilePage').map(x => x.profile).subscribe(_profile => {
            this.myRole = _profile.is_admin;
            if (!_profile['my_patients_list_participants']) return;
            const myPatients = _profile['my_patients_list_participants'].map(x => {
                return Object.assign(x.patient, {id: x.id, show: x.show});
            });
            this.myPatientsObj = {title: 'My Patients', participants: myPatients};
            this.generatePatientLists();
        });

        this.store.select('patListPage').subscribe((data) => {
            if (data['chosenList'] && data['chosenList'][0]) {
                this.patientsListSingle = data['chosenList'][0].participants;
                this.chosenPatientListTitle = data['chosenList'][0].title;
            } else if (data['chosenList'] && !data['chosenList'].length) {
                this.patientsListSingle = undefined;
            }
            this.combinedPatientLists = data['patientsLists'];
            this.patientLists = this.combinedPatientLists.slice(1);

        });
    }

    generatePatientLists() {
        if (!this.myPatientsObj || !this.chosenPatientListTitle || !this.patientLists) return;
        this.store.dispatch(new GetPatientsLists([this.myPatientsObj, ...this.patientLists]));

        if (this.chosenPatientListTitle === 'My Patients' && !this.spinner) {
            this.onChooseData(this.myPatientsObj);
        }

        this.spinner = false;
    }


    onChooseData(data): void {
        if (!data) return;
        this.closeProfile(false);
        this.editableListId = data.id;
        if (!this.patients) return;
        this.store.dispatch(new SetChosenPatientList({participants: data.participants, title: data.title}));
    }

    newList(): void {
        this.dialog.open(NewPatListComponent, {
            width: '90%',
            data: {
                header: 'Create new list',
                ok: 'Save'
            }
        });
    }

    chosedPfData(data: Patient): void {
        if (!data) return;
        this.loadProfile = true;
        this.chosedProfile = data;
    }

    closeProfile(value: boolean): void {
        this.loadProfile = value;
    }

    multipleUpload() {
        const dialogRef = this.dialog.open(MultyUploadComponent, {
            width: '90%'
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.patService.getAllPatients().subscribe((_patients: Patient[]) => {
                    this.store.dispatch(new GetPatients(_patients));
                }, err => {
                    this.notify.notifyError(err);
                });
            }
        });
    }

    newMember() {
        this.dialog.open(NewMemberComponent, {
            width: '90%',
            data: {
                header: 'Add New Member'
            }
        });
    }

    editList(): void {
        if (this.chosenPatientListTitle !== 'My Patients') {
            this.dialog.open(NewPatListComponent, {
                width: '90%',
                data: {
                    header: 'Edit list',
                    edit: true,
                    id: this.editableListId
                }
            });

        } else {
            this.dialog.open(NewPatListComponent, {
                width: '90%',
                data: {
                    header: 'Edit list',
                    edit: true,
                    id: 'My Patients'
                }
            });
        }
    }

    toggleLists(val) {
        if (val) {
            this.renderer.addClass(this.el.nativeElement, 'slide');
            this.renderer.addClass(document.body, 'hidden');
        } else {
            this.renderer.removeClass(this.el.nativeElement, 'slide');
            this.renderer.removeClass(document.body, 'hidden');
        }
    }

}
