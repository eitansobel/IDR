import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {authRouting} from './auth.routing';
import {AuthComponent} from './auth.component';
import {LoginComponent} from './login/login.component';
import { HelpPageComponent } from './help-page/help-page.component';
import { HiwPageComponent } from './hiw-page/hiw-page.component';
import {CommonModule} from '@angular/common';
import {SharedComponentModule} from '../common/common-share.module';
import {AuthService} from './services/auth.service';
import {AlertService} from './services/alerts.service';
import {MatDialogModule} from '@angular/material/dialog';
import {HttpClientModule} from '@angular/common/http';
import {LoginRedirect} from './services/login-redirect.service';
import {RouterModule} from '@angular/router';
import {RegistrationComponent} from './registration/registration.component';
import {MatStepperModule} from '@angular/material/stepper';
import { NgSelectModule } from '@ng-select/ng-select';
import { ForgotPassComponent } from './forgot-pass/forgot-pass.component';
import { ResetPassComponent } from './reset-pass/reset-pass.component';

@NgModule({
    declarations: [
        AuthComponent,
        LoginComponent,
        RegistrationComponent,
        ForgotPassComponent,
        ResetPassComponent,
        HelpPageComponent,
        HiwPageComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        authRouting,
        SharedComponentModule,
        CommonModule,
        HttpClientModule,
        RouterModule,
        MatStepperModule,
        NgSelectModule,
        MatDialogModule
    ],
    providers: [
        AuthService,
        LoginRedirect,
        AlertService
    ],
    exports: [
        AuthComponent,
        SharedComponentModule,
        ForgotPassComponent,
        ResetPassComponent
    ]
})
export class AuthModule {}
