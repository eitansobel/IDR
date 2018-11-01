import {HomeService} from './services/home.service';
import {NestedColumn, HomePatient} from '../models/home';
import {UserPermissionService} from '../services/user-permission.service';
import {DataColumnsService} from '../data-columns/services/data-columns.service';
import {AppState} from '../redux/app.state';
import {Store} from '@ngrx/store';
import {DataColumnPopupComponent} from '../data-columns/data-column-popup/data-column-popup.component';
import {EditCellPopupComponent} from './edit-cell-popup/edit-cell-popup.component';
import {SortPatientPopupComponent} from './sort-patient-popup/sort-patient-popup.component';
import {MatDialog} from '@angular/material';
import {
    CopyNestedColumn,
    EditNestedCell,
    GetNestedColumns,
    HideNestedColumn,
    ChangeChatsReadStatus, GetHomePatients
} from '../redux/home/home.actions';
import {ChatService} from '../messages/services/chat.service';
import {DialogOverviewComponent} from '../common/dialogOverview/dialogOverview.component';
import {ScrollbarComponent} from 'ngx-scrollbar';
import {SortPatientsByPipe} from '../pipe/sortPatients.pipe';
import {Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, Renderer2} from '@angular/core';
import {Chat} from '../models/chat';
import {Patient} from '../models/patient';
import {PatientsService} from '../patients/services/patients.service';
import {DataColumnsUpdateIntervalMapService} from '../data-columns/services/data-columns-update-interval-map.service';
import {NotifierService} from 'angular-notifier';
import {NotifyService} from "../services/notify.service";

@Component({
    selector: 'idr-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    providers: [HomeService]
})

export class HomeComponent implements OnInit {
    @ViewChild(ScrollbarComponent) scrollRef: ScrollbarComponent;
    @ViewChild('tableSidebar') tableSidebar: ElementRef;
    @ViewChild('tableHeader') tableHeader: ElementRef;
    public nestedColumnList: NestedColumn[];
    public patients: HomePatient[];
    private patientColumnMap = {};
    public userId = Number(localStorage.getItem('idrUserId'));
    choosedChat = {
        id: null
    };
    sticky: boolean = false;
    showChatWindow: boolean = false;
    choosedPatient: number;
    public patientSearchText: string;
    public patientSearchKeys = ['first_name', 'last_name'];
    public patientProfileData: Patient;
    public showPatientProfile: boolean = false;
    public viewProfileIsEdited: boolean = true;
    public cellColorState = {};
    private readonly notifier: NotifierService;

    constructor(private hService: HomeService,
                private dataService: DataColumnsService,
                private userPermissionService: UserPermissionService,
                private changeDetectorRef: ChangeDetectorRef,
                private store: Store<AppState>,
                private chatService: ChatService,
                public dialog: MatDialog,
                private sort: SortPatientsByPipe,
                private patService: PatientsService,
                private updateIntervalMapService: DataColumnsUpdateIntervalMapService,
                private notify: NotifyService,
                private renderer: Renderer2,
                notifierService: NotifierService) {
        this.notifier = notifierService;
        this.hService.getColumns().subscribe((_columns: NestedColumn[]) => {
                this.store.dispatch(new GetNestedColumns(_columns));
            }, err => {
                this.notify.notifyError(err);
            }
        );
        this.hService.getPatientsHeaders().subscribe((_patients: HomePatient[]) => {
            this.store.dispatch(new GetHomePatients(_patients));
        }, err => {
            this.notify.notifyError(err);
        });
    }

    onWindowScroll(event): void {
        if (!event) return;
        this.renderer.setStyle(this.tableSidebar.nativeElement, 'margin-top', -event.target.scrollTop + 'px');
        this.renderer.setStyle(this.tableHeader.nativeElement, 'margin-left', -event.target.scrollLeft + 'px');
    }

    ngOnInit() {
        this.store.select('homePatientsPage').map(x => x.homePatients).subscribe((_homePatients) => {
            this.patients = _homePatients;
            this.makePatientAndColorColumnMap();
            // this.scrollRef.update();
        });

        this.store.select('nestedColumnsPage').subscribe((_nestedColumns) => {
            this.nestedColumnList = _nestedColumns['columns'];
            this.makePatientAndColorColumnMap();
            setTimeout(() => {
                this.scrollRef.update();
            }, 0);
        });
        this.store.select('profilePage').map(data => data.profile).subscribe((_profile) => {
            this.patients = this.sort.transform(this.patients, _profile.patient_sort_by, _profile.patient_order);
        });
        this.chatService.notifications.subscribe(notif => {
            switch (notif.action) {
                case 'message_created':
                    this.updateChat(notif.update);
                    break;
            }
            this.hService.webSocketActionManager(notif, this.nestedColumnList, this.store);
        });
    }

    userCanSeeColumnButton(buttonType, column): boolean {
        return this.userPermissionService.userCanSeeColumnButton(buttonType, column);
    }

    editDataColumn(columnInstance): void {
        this.dialog.open(DataColumnPopupComponent, {
            width: '440px',
            data: {
                header: 'Edit Column',
                columnInstance: columnInstance,
                nested: true
            }
        });
    }

    updateChat(mess) {
        if (this.choosedChat.id === mess.chat) {
            this.chatService.updateMessagesLog(mess);
        }
    }

    hideColumn(id) {
        this.dataService.toggleDataColumn(id, {'is_hidden': true}).subscribe((_resp) => {
            this.store.dispatch(new HideNestedColumn(id));
        });
    }

    copyRow(columnInstance) {
        const dialogRef = this.dialog.open(DialogOverviewComponent, {
            width: '342px',
            data: {
                header: 'Copy Column',
                body: `Are you sure you want to copy ${columnInstance.title} column?`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.hService.copyNestedColumn(columnInstance.id).subscribe((_data) => {
                    this.store.dispatch(new CopyNestedColumn(_data));
                });
            }
        });
    }

    userCanSeeCellButton(buttonType, cell, column): boolean {
        return this.userPermissionService.userCanSeeCellButton(buttonType, cell, column);
    }

    userCanCreateCell(column): boolean {
        return this.userPermissionService.userCanCreateCellOrField(column);
    }

    editCell(cellInstance, columnInstance): void {
        const _openEditCellDialog = cell => {
            this.dialog.open(EditCellPopupComponent, {
                width: '440px',
                data: {
                    header: 'Edit Cell Record',
                    columnInstance: columnInstance,
                    cellInstance: cell
                }
            });
        };

        if (cellInstance.is_private && this.userPermissionService.userIsAdmin &&
            cellInstance.author !== Number(localStorage.getItem('idrUserId'))) {
            this.hService.getCellForAdminView(cellInstance.id).subscribe((_resp) => {
                this.store.dispatch(new EditNestedCell(_resp));
                _openEditCellDialog(_resp);
            });
        } else {
            _openEditCellDialog(cellInstance);
        }
    }

    createCell(column, patientId): void {
        this.dialog.open(EditCellPopupComponent, {
            width: '440px',
            data: {
                header: 'Create Cell Record',
                columnInstance: column,
                cellPatientId: patientId
            }
        });
    }

    makePatientAndColorColumnMap() {
        if (this.patients && this.nestedColumnList && this.nestedColumnList.length) {
            this.patientColumnMap = {};
            this.nestedColumnList.forEach(column => {
                column.cells.forEach(cell => {
                    if (!this.patientColumnMap[cell.patient]) {
                        this.patientColumnMap[cell.patient] = {};
                    }
                    this.patientColumnMap[cell.patient][column.id] = cell;

                    // make cell color map
                    const state = this.cellColorState[cell.id] ? this.cellColorState[cell.id] : {class: 'default'};
                    const update_interval = this.updateIntervalMapService.secondsToUpdate(
                        cell.update_interval || column.update_interval);
                    this.addColorTimeouts(state, cell.last_update, update_interval);
                    this.cellColorState[cell.id] = state;
                });
            });
        }
    }

    getPatientCell(patientId, columnId) {
        if (this.patientColumnMap[patientId]) {
            return this.patientColumnMap[patientId][columnId];
        }
    }

    lockCell(cellInstance) {
        if (this.userPermissionService.userCanLockCell(cellInstance)) {
            const data = {is_private: !cellInstance.is_private};
            this.hService.lockNestedCell(cellInstance.id, data).subscribe(_data => {
                this.store.dispatch(new EditNestedCell(_data));
            });
        }
    }

    userCanSeeLockButton(cellInstance, columnInstance): boolean {
        return this.userPermissionService.userCanSeeLockButton(cellInstance, columnInstance);
    }

    getLockedClass(cellInstance) {
        return cellInstance.is_private ? 'default red' : 'default';
    }

    openChat(cell, column) {
        this.choosedPatient = undefined;
        if (cell.chat) {
            this.choosedPatient = undefined;
            this.chatService.getChat(cell.chat.id).subscribe((_chat) => {
                this.choosedChat = _chat;
                this.showChatWindow = true;
                this.store.dispatch(new ChangeChatsReadStatus(this.choosedChat));
            });
        } else {
            this.chatService.createChat({
                participants: [column.author.id],
                patient: cell.patient
            }).subscribe((_chat) => {
                this.choosedChat = _chat;
                this.showChatWindow = true;
            });
        }
    }

    createChat(patient) {
        this.showChatWindow = true;
        this.choosedPatient = patient;
    }

    createdChat(chat: Chat) {
        this.choosedPatient = undefined;
        this.choosedChat = chat;
    }

    closeChat() {
        this.choosedChat = {
            id: null
        };
        this.showChatWindow = false;
    }

    onScroll(evt: any) {
        if (evt) {
            if (evt.target.scrollTop > 70) {

                this.sticky = true;

            } else if (evt.target.scrollTop < 70) {
                this.sticky = false;
            }
            this.changeDetectorRef.detectChanges();
        }
    }

    sortPatients() {
        this.dialog.open(SortPatientPopupComponent, {
            width: '485px',
            data: {
                header: 'Sort Patient'
            }
        });
    }

    openPatientProfile(patient, previewMode = true) {
        this.showPatientProfile = true;
        this.viewProfileIsEdited = previewMode;
        this.patService.getSinglePatient(patient.id).subscribe(_resp => {
            this.patientProfileData = _resp;
        });
    }

    closePatientProfile(event) {
        this.showPatientProfile = false;
        this.viewProfileIsEdited = true;
    }

    addColorTimeouts(state, lastUpdate, update_interval) {
        const fiveMin = 1000 * 60 * 5;
        const triggerTime = Date.parse(lastUpdate) + update_interval;
        const now = new Date().getTime();
        const timeToEvent = triggerTime - now;
        clearTimeout(state.soonTimer);
        clearTimeout(state.elapsedTimer);
        if (update_interval) {
            if (timeToEvent >= fiveMin) {
                state.class = 'default';
                state.soonTimer = setTimeout(() => {
                    setElapsedTimer(fiveMin);
                }, timeToEvent - fiveMin);
            } else {
                if (fiveMin > timeToEvent && timeToEvent > 0) {
                    setElapsedTimer(timeToEvent);
                } else {
                    state.class = 'elapsed';
                }
            }
        } else {
            state.class = 'default';
        }

        function setElapsedTimer(timeToEvent) {
            state.class = 'soon';
            state.elapsedTimer = setTimeout(() => {
                state.class = 'elapsed';
            }, timeToEvent);
        }
    }

    getCellColorClass(patient_id, column_id) {
        const cell = this.getPatientCell(patient_id, column_id);
        return cell ? this.cellColorState[cell.id].class : null;
    }
}


