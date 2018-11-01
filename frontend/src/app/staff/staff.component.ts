import {Component, OnInit, Renderer2, ElementRef} from '@angular/core';
import {MatDialog} from '@angular/material';
import {NewMemberComponent} from './new-member/new-member.component';
import {StaffService} from './service/staff.service';
import {Store} from '@ngrx/store';
import {AppState} from '../redux/app.state';
import {GetStaffLists, SetLoadedStafflist} from '../redux/staff/staff.action';
import {NewStaffListComponent} from './new-staff-list/new-staff-list.component';
import * as moment from 'moment';
import {Profile} from '../models/profile';
import {Role} from '../models/roles';
import {Departament} from '../models/hospital-departments';
import {Hospital} from '../models/hospital';
import {Router} from '@angular/router';
import {MultyUploadComponent} from './multyupload/multyupload.component';
import {NotifyService} from "../services/notify.service";
import {SortByPipe} from "../pipe/sort.pipe";

@Component({
    selector: 'idr-staff',
    templateUrl: './staff.component.html',
    styleUrls: ['./staff.component.scss']
})
export class StaffComponent implements OnInit {
    public header: string[] = ['Name', 'QTY', 'Edited'];
    public teamList: any[] = [];
    private members: Profile[] = [];
    public listHeaderSingle: string[] = [
        'First Name',
        'Mid Name',
        'Last Name',
        'H.Dep',
        'Role',
        'Job'
    ];
    public teamListSingle: Object[] = [];
    private roles: Role[] = [];
    private hospital_department: Departament[] = [];
    public checkedTitle: string = '';
    public spinner: boolean = true;
    public loadProfile: boolean = false;
    public chosedProfile: Object;
    private hospitals: Hospital[];
    private userHospital: Hospital;
    private editableListid: number;
    public myRole: boolean;
    constructor(public dialog: MatDialog,
                private staffS: StaffService,
                private notify: NotifyService,
                private store: Store<AppState>,
                private sort: SortByPipe,
                private renderer: Renderer2,
                private el: ElementRef,
                private router: Router) {
    }

    ngOnInit() {
        const today = new Date();
        const yesterday = moment(today.setDate(today.getDate() - 1)).format('DD/MM/YYYY');
        this.teamListSingle = [];
        this.store.select('hospitalsPage').subscribe((hp) => {
            if (!hp) return;
            this.hospitals = hp.hospitals;
            this.hospitals.forEach(h => {
                this.hospital_department.push(...h.hospital_department);
            });
            this.store.select('profilePage').map(data => data.profile).subscribe((_profile: Profile) => {
                this.myRole = _profile.is_admin;
                this.userHospital = this.hospitals[_profile.hospital - 1];

            });
        });

        this.store.select('rolesPage').subscribe((_roles) => {
            this.roles = _roles.roles;
        });

        this.store.select('staffPage').subscribe((data) => {
            if (data['loadedList'] && data['loadedList'][0]) {
                this.teamListSingle = data['loadedList'][0].participants;
                this.checkedTitle = data['loadedList'][0].title;
            } else if (data['loadedList'] && !data['loadedList'].length) {
                this.teamListSingle = undefined;
            }

            if (!data['staffLists']) return;
            const defaultLists: any[] = [];
            const datePat = /^(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
            const temp = data['staffLists'].filter(x => {
                if (x.hasOwnProperty('default')) {
                    for (const prop in x['default']) {
                        let title: string;
                        switch (prop) {
                            case 'all_users':
                                title = 'All Members';
                                break;
                            case 'pended_users':
                                title = 'Pended Users';
                                break;
                        }
                        defaultLists.push({
                            'qty': x['default'][prop].participants.length,
                            'title': title,
                            'participants': x['default'][prop].participants
                        });
                    }
                    return;

                } else {
                    x['qty'] = x['participants'].length;
                    const tempD = moment(x.update_time).format('X');
                    if (!x.update_time.match(datePat) && x.update_time !== 'yesterday') {
                        x.update_time = moment(tempD, 'X').format('DD/MM/YYYY');
                        if (yesterday === x.update_time) {
                            x.update_time = 'yesterday';
                        }
                    }
                    return x;
                }
            });
            this.teamList = [...temp, ...defaultLists];
        });
        this.checkMembers();
    }

    checkMembers() {
        this.store.select('membersPage').subscribe((_allmembers) => {
            if (!_allmembers) return;
            this.members = _allmembers.members;
            if (!this.members || !this.members.length) return;
            this.staffS.getStaffList().subscribe((_staffLists) => {

                if (this.checkedTitle === 'Pended Users' && _staffLists) {
                    this.onChooseData({
                        participants: _staffLists[_staffLists.length - 1]['default']['pended_users']['participants'],
                        qty: _staffLists[_staffLists.length - 1]['default']['pended_users']['participants'].length,
                        title: 'Pended Users'
                    });
                }
                
                this.store.dispatch(new GetStaffLists(_staffLists));
                this.spinner = false;
            }, err => {
                this.spinner = false;
                this.notify.notifyError(err);
            });
        });
    }

    multipleUpload() {
        const dialogRef = this.dialog.open(MultyUploadComponent, {
            width: '90%'
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.ngOnInit();
            }
        }, err => this.notify.notifyError(err));
    }

    newMember(): void {
        this.dialog.open(NewMemberComponent, {
            width: '90%',
            data: {
                header: 'Add New Member',
                hospital: this.userHospital
            }
        });
    }

    newList(): void {
        this.dialog.open(NewStaffListComponent, {
            width: '90%',
            data: {
                header: 'Create new list',
                ok: 'Save'
            }
        });
    }

    editList(): void {
        this.dialog.open(NewStaffListComponent, {
            width: '90%',
            data: {
                header: 'Edit list',
                edit: true,
                id: this.editableListid
            }
        });
    }

    onChooseData(data): void {
       
        this.closeProfile(false);
        this.editableListid = data.id;
        let teamList: any[] = [];
        if (!this.members) return;
    
        if(typeof data.participants[0] == 'object') {
            data.participants = data.participants.map(x => {console.log(x); return x.remote_id})
        }
 
        teamList = this.members.filter((x: Profile) =>{ 
            
           return data.participants.find(y => y === x.remote_id)
            });
        if (teamList.length) {
            teamList.map(x => {
                const role = this.roles.filter(y => y.id === x.hospital_role);
                const hdep = this.hospital_department.filter(y => y.id === x.hospital_department);
                if (role.length) x.hospital_role = role[0].title;
                if (hdep.length) x.hospital_department = hdep[0].title;
                return x;
            });
        }
        this.store.dispatch(new SetLoadedStafflist({participants: teamList, title: data.title}));
    }

    chosedPfData(data: Profile): void {
        if (!data) return;
        this.loadProfile = true;
        this.chosedProfile = data;
    }

    closeProfile(value: boolean): void {
        this.loadProfile = value;
    }

    toggleLists(val){
        if(val) {
            this.renderer.addClass(this.el.nativeElement, 'slide');
            this.renderer.addClass(document.body, 'hidden');
        } else {
            this.renderer.removeClass(this.el.nativeElement, 'slide');
            this.renderer.removeClass(document.body, 'hidden');
        }
    }
}
