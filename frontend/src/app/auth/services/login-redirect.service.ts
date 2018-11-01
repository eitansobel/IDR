import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';

@Injectable()
export class LoginRedirect implements CanActivate {

    constructor(private router: Router) {}
    canActivate(): boolean {
        const token = localStorage.getItem('idrToken');
        if (token) {
            this.router.navigateByUrl('/dashboard/home/');
            return false;
        } else {
            return true;
        }
    }
}
