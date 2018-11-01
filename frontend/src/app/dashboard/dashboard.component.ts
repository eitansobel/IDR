import {Component, HostListener, OnInit} from '@angular/core';
import {ProfileService} from '../profile/service/profile.service';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {AppState} from '../redux/app.state';
import {AddProfile} from '../redux/profile/profile.action';
import * as moment from 'moment';
import {HospitalDepartmentService} from '../services/hospital.structure.service';
import {MatDialog} from '@angular/material';
import {Hospital} from '../models/hospital';
import {LogoutComponent} from './logout/logout.component';
import {LoadHospitals} from '../redux/hospitals/hospital.action';
import {GetRole} from '../redux/roles/role.action';
import {StaffService} from '../staff/service/staff.service';
import {Profile} from '../models/profile';
import {GetMembers} from '../redux/members/members.action';
import {PatientsService} from '../patients/services/patients.service';
import {Patient} from '../models/patient';
import {GetPatients} from '../redux/patients/patients.action';
import {ChatService} from '../messages/services/chat.service';
import {environment} from '../../environments/environment';
import {NotifyService} from "../services/notify.service";

@Component({
    selector: 'idr-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    public avatar: string;
    firstName: string;
    lastName: string;
    currentTime: string;
    backSize: string;
    hospital_role = ['Admin', 'Doctor', 'Nurse'];
    role;
    username;
    is_admin: false;
    is_approved: false;
    private patients: Patient[];
    members;
    private logoutByTime;
    @HostListener('click', ['$event'])
    @HostListener('keydown', ['$event'])
    @HostListener('keyup', ['$event'])
    onDocumentActivity() {
        this.setLogoutTimeout();
    }
    
    newDialogs(){
        console.log(123)
    }

    constructor(
    private pService: ProfileService,
        private store: Store<AppState>,
        private router: Router,
        private hd: HospitalDepartmentService,
        public dialog: MatDialog,
        private notify: NotifyService,
        private staffS: StaffService,
        private patService: PatientsService,
        private chatService: ChatService
        ) {
        const alerts = localStorage.getItem('alerts');

        if (!alerts) {
            localStorage.removeItem('idrToken');
            localStorage.removeItem('idrId');
            this.router.navigateByUrl('/auth/login');
        }
        this.pService.getProfile2().subscribe((pf) => {
            this.store.dispatch(new AddProfile(pf));
        }, err => {
            this.notify.notifyError(err);
        });
        this.store.select('tokenStatus').subscribe((state) => {
            if (+localStorage.getItem('logoutTimerId') && state) {
                this.pService.makeEmptyRequests();
            }
        });
    }

    ngOnInit() {
        this.store.select('profilePage').map(data => data.profile).subscribe((_profile) => {
            if (!_profile['my_patients_list_participants']) return;
            if (_profile.full_photo) {
                this.avatar = `${environment.settings.imageUrl}${_profile.full_photo}`;
                this.backSize = 'cover';
            } else {
                this.avatar = '/assets/images/placeholder.svg';
                this.backSize = '70%';
            }

            this.firstName = _profile.first_name;
            this.lastName = _profile.last_name;
            this.role = this.hospital_role[_profile.hospital_role - 1];
            this.username = _profile.username;
            this.is_approved = _profile.is_approved;
        });

        this.currentTime = moment().format('hh:mm A, dddd, MMMM D');
        this.hd.getDepartments().subscribe((departments: Hospital[]) => {
            this.store.dispatch(new GetRole(departments[0].hospital_role));
            this.store.dispatch(new LoadHospitals(departments));
        }, err => {
            this.notify.notifyError(err);
        });

        this.staffS.getAllMembers().subscribe((_members: Profile[]) => {
            this.staffS.getAllMembers2().subscribe((_members2: Profile[]) => {
                this.members = _members.map((x: Profile) => {
                    return Object.assign(x, _members2.find(y =>
                        y.id === x.remote_id
                    ));
                });

                this.store.dispatch(new GetMembers(this.members));
            }, err => {
                this.notify.notifyError(err);
            });
        }, err => {
            this.notify.notifyError(err);
        });

        this.patService.getAllPatients().subscribe((_patients: Patient[]) => {
            this.patients = _patients;
            this.store.dispatch(new GetPatients(this.patients));

        }, err => {
            this.notify.notifyError(err);
        });
        this.setLogoutTimeout();
        this.setLogoutByTime();
    }

    logout() {
        this.dialog.open(LogoutComponent, {
            width: '380px',
            data: {
                header: 'Are you sure want to logout?',
                username: this.username
            }
        });
    }

    newChat() {
        this.chatService.updateMessage([]);
    }

    setLogoutTimeout() {
        let logoutTimerId = +localStorage.getItem('logoutTimerId');
        clearTimeout(logoutTimerId);
        logoutTimerId = +setTimeout(() => {
            localStorage.setItem('logoutPage', this.router.url);
            localStorage.setItem('lock', 'true');
            localStorage.removeItem('idrToken');
            localStorage.removeItem('idrId');
            clearTimeout(+localStorage.getItem('logoutTimerId'));
            localStorage.removeItem('logoutTimerId');
            this.router.navigateByUrl('auth/login');
        }, environment.logOutAfter);
        localStorage.setItem('logoutTimerId', `${logoutTimerId}`);
    }
    setLogoutByTime() {
        clearInterval(this.logoutByTime);
        this.logoutByTime = setInterval(() => {
            if (new Date() > new Date(localStorage.getItem('signout_time'))) {
                localStorage.removeItem('idrToken');
                localStorage.removeItem('idrId');
                clearTimeout(+localStorage.getItem('logoutTimerId'));
                localStorage.removeItem('logoutTimerId');
                clearInterval(this.logoutByTime);
                this.router.navigateByUrl('auth/login');
            }
        }, 30000);
    }
}
