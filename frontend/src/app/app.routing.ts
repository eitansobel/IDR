import {Routes, RouterModule} from '@angular/router';
import {LoginRedirect} from './auth/services/login-redirect.service';
import {EnsureAuthenticated} from './auth/services/ensure-authenticated.service';
import {MethodAlertComponent} from './auth/method-alert/method-alert.component';

const appRoutes: Routes = [
    {
        path: 'auth/set-alerts',
        component: MethodAlertComponent,
        canActivate: [EnsureAuthenticated],
    },
    {
        path: 'auth',
        canActivate: [LoginRedirect],
        loadChildren: './auth/auth.module#AuthModule',

    },
    {
        path: 'dashboard',
        canActivate: [EnsureAuthenticated],
        loadChildren: './dashboard/dashboard.module#DashboardModule',
    },
    {
        path: '**',
        redirectTo: 'dashboard',
        canActivate: [EnsureAuthenticated]
    }
];

export const routing = RouterModule.forRoot(appRoutes);
