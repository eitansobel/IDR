import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NotifierModule, NotifierOptions} from 'angular-notifier';
import {NgModule} from '@angular/core';
import {StoreModule} from '@ngrx/store';
import {AppComponent} from './app.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {AddAlertComponent} from './auth/method-alert/add-alert/add-alert.component';
import {routing} from './app.routing';
import {SharedComponentModule} from './common/common-share.module';
import {EnsureAuthenticated} from './auth/services/ensure-authenticated.service';
import {HospitalDepartmentService} from './services/hospital.structure.service';
import {ApiFactory} from './services/api.factory';
import {alertsReducer} from './redux/alerts/alerts.reducer';
import {departmentReducer} from './redux/departments/department.reducer';
import {roleReducer} from './redux/roles/role.reducer';
import {hospitalReducer} from './redux/hospitals/hospital.reducer';
import {profileReducer} from './redux/profile/profile.reducer';
import {staffReducer} from './redux/staff/staff.reducer';
import {membersReducer} from './redux/members/members.reducer';
import {memberPhotoReducer} from './redux/memberPhoto/memberPhoto.reducer';
import {dataColumnsReducer} from './redux/dataColumns/data-column.reducer';
import {patientsReducer} from './redux/patients/patients.reducer';
import {patReducer} from './redux/patientsList/patientsList.reducer';
import {nestedColumnsReducer, homePatientReducer} from './redux/home/home.reducer';
import {tokenStatusReducer} from './redux/token-status/token-status.reducer';
import {RouterModule} from '@angular/router';
import {MethodAlertComponent} from './auth/method-alert/method-alert.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {HttpClientModule} from '@angular/common/http';
import {LoginRedirect} from './auth/services/login-redirect.service';
import {PapaParseModule} from 'ngx-papaparse';
import {TokenInterceptor} from './auth/token.interceptor';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {HelpService} from "./services/help.service";
import {NotifyService} from "./services/notify.service";


const customNotifierOptions: NotifierOptions = {
    position: {
        horizontal: {
            position: 'middle',
            distance: 12
        },
        vertical: {
            position: 'top',
            distance: 12,
            gap: 10
        }
    },
    theme: 'material',
    behaviour: {
        autoHide: 8000,
        onClick: false,
        onMouseover: 'pauseAutoHide',
        showDismissButton: true,
        stacking: 4
    },
    animations: {
        enabled: true,
        show: {
            preset: 'slide',
            speed: 300,
            easing: 'ease'
        },
        hide: {
            preset: 'fade',
            speed: 300,
            easing: 'ease',
            offset: 50
        },
        shift: {
            speed: 300,
            easing: 'ease'
        },
        overlap: 150
    }
};

@NgModule({
    declarations: [
        AppComponent,
        MethodAlertComponent,
        AddAlertComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        routing,
        SharedComponentModule,
        ReactiveFormsModule,
        MatDialogModule,
        HttpClientModule,
        RouterModule,
        NgSelectModule,
        PapaParseModule,
        NotifierModule.withConfig(customNotifierOptions),
        StoreModule.forRoot(
            {
                alertPage: alertsReducer,
                alertSingle: alertsReducer,
                departmentPage: departmentReducer,
                rolesPage: roleReducer,
                hospitalsPage: hospitalReducer,
                profilePage: profileReducer,
                staffPage: staffReducer,
                membersPage: membersReducer,
                membersPhoto: memberPhotoReducer,
                patientsPage: patientsReducer,
                patListPage: patReducer,
                dataColumnPage: dataColumnsReducer,
                nestedColumnsPage: nestedColumnsReducer,
                tokenStatus: tokenStatusReducer,
                homePatientsPage: homePatientReducer
            }
        )
    ],
    providers: [
        EnsureAuthenticated,
        HospitalDepartmentService,
        ApiFactory,
        LoginRedirect,
        TokenInterceptor,
        HelpService,
        NotifyService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true
        },
    ],
    bootstrap: [AppComponent],
    exports: [RouterModule, MethodAlertComponent],
    entryComponents: [
        AddAlertComponent
    ]
})
export class AppModule {
}
