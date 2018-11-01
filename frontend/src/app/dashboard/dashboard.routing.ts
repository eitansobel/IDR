import {Routes, RouterModule} from '@angular/router';
import {ProfileComponent} from '../profile/profile.component';
import {DashboardComponent} from './dashboard.component';
import {StaffComponent} from '../staff/staff.component';
import {MessagesComponent} from '../messages/messages.component';
import {PatientsComponent} from '../patients/patients.component';
import {HomeComponent} from '../home/home.component';
import {DataColumnsComponent} from '../data-columns/data-columns.component';

const dashboardRoutes: Routes = [
    {
        path: '',
        component: DashboardComponent,
        children: [
            {
                path: 'profile',
                component: ProfileComponent
            },
            {
                path: 'staff',
                component: StaffComponent
            },
            {
                path: 'patients',
                component: PatientsComponent
            },
            {
                path: 'messages',
                component: MessagesComponent
            },
            {
                path: 'home',
                component: HomeComponent,
            },
            {
                path: 'data-columns',
                component: DataColumnsComponent
            }
        ]
    },

];

export const dashboardRouting = RouterModule.forChild(dashboardRoutes);
