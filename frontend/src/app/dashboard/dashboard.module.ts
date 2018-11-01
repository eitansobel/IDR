import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DashboardComponent} from './dashboard.component';
import {AuthService} from '../auth/services/auth.service';
import {dashboardRouting} from './dashboard.routing';
import {ProfileModule} from '../profile/profile.module';
import {ProfileService} from '../profile/service/profile.service';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {StaffModule} from '../staff/staff.module';
import {LogoutComponent} from './logout/logout.component';
import {MatDialogModule} from '@angular/material/dialog';
import {SharedComponentModule} from '../common/common-share.module';
import {MessagesModule} from '../messages/messages.module';
import {PatientsModule} from '../patients/patients.module';
import {ChatService} from '../messages/services/chat.service';
import {HomeModule} from '../home/home.module';
import {DataColumnsModule} from '../data-columns/data-columns.module';
////////////////////////


///////////////////////
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        dashboardRouting,
        ProfileModule,
        MatSlideToggleModule,
        StaffModule,
        SharedComponentModule,
        MatDialogModule,
        PatientsModule,
        MessagesModule,
        HomeModule,
        DataColumnsModule,
    ],
    declarations: [
        DashboardComponent,
        LogoutComponent,
    ],

    providers: [
        AuthService,
        ProfileService,
        ChatService
    ],
    exports: [],
    entryComponents: [LogoutComponent]
})
export class DashboardModule {
}
