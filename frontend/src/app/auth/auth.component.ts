import {Component, OnInit, HostBinding} from '@angular/core';
import {Router, NavigationEnd} from '@angular/router';
import 'rxjs/add/operator/switchMap';

@Component({
    selector: 'idr-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {

    constructor(private router: Router) {
        this.router.events.subscribe((event: any) => {

            if (event instanceof NavigationEnd) {
                if ((event.url === '/auth' || event.urlAfterRedirects === '/auth') && event.url !== '/auth/set-alerts') {
                    this.router.navigateByUrl('/auth/login');
                }
            }
        });
    }

    ngOnInit() {}
}
