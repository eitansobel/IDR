import {Routes, RouterModule} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {LoginRedirect} from './services/login-redirect.service';
import {RegistrationComponent} from './registration/registration.component';
import {ForgotPassComponent} from './forgot-pass/forgot-pass.component';
import {AuthComponent} from './auth.component';
import {ResetPassComponent} from './reset-pass/reset-pass.component';
import {HelpPageComponent} from "./help-page/help-page.component";
import {HiwPageComponent} from "./hiw-page/hiw-page.component";
export const authRoutes: Routes = [
    {
        path: '',
        component: AuthComponent,
        canActivate: [LoginRedirect],
        children: [
            {
                path: 'login',
                component: LoginComponent,
                canActivate: [LoginRedirect],
                pathMatch: 'full'
            },
            {
                path: 'registration',
                component: RegistrationComponent,
                canActivate: [LoginRedirect]
            },
            {
                path: 'forgot-pass',
                component: ForgotPassComponent,
                canActivate: [LoginRedirect]
            },
            {
                path: 'reset_password/:id/:id',
                component: ResetPassComponent,
                canActivate: [LoginRedirect]
            },
            {
                path: 'help',
                component: HelpPageComponent,
                canActivate: [LoginRedirect]
            },
            {
                path: 'how-it-works',
                component: HiwPageComponent,
                canActivate: [LoginRedirect]
            }
        ]
    }

];

export const authRouting = RouterModule.forChild(authRoutes);
