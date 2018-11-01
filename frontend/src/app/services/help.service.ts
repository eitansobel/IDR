import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable()
export class HelpService {
    private message_alerts: string[] = [
        'Immediate',
        '30 minuts',
        '1hr',
        '2hr',
        'FYI - No Alert'
    ];

    alert_type: string[] = [
        'Phone call',
        'SMS',
        'Pager',
        'Fax',
        'Email'
    ];


    preferred_mode: string[] = [
        'Phone',
        'Cell',
        'Pager',
        'Fax',
        'Email'
    ];

    alertsList: string[] = [
        `Alert 1`,
        `Alert 2`,
        `Alert 3`,
        `Alert 4`,
        `None`
    ];


    sex: string[] = ['Male', 'Female', 'Unknown'];
    
    hospital_role = [
        {
            'id': 1,
            'title': 'ADMIN',
            'remote_role': 1,
            'hospital': 1
        },
        {
            'id': 2,
            'title': 'DOCTOR',
            'remote_role': 2,
            'hospital': 1
        },
        {
            'id': 3,
            'title': 'NURSE',
            'remote_role': 3,
            'hospital': 1
        },

    ];
    
    constructor(private router: Router) {
        
    }

    get getSex() {
        return this.mapLabelValue(this.sex);
    }

    get getAlerts() {
        return this.mapLabelValue(this.alertsList);
    }

    get getMessageAlerts() {
        return this.mapLabelValue(this.message_alerts);
    }

    get getAlert_type() {
        return this.mapLabelValue(this.alert_type);
    }

    get getAlertsList() {
        return this.mapLabelValue(this.alertsList);
    }

    mapLabelValue(val) {
        return Object.entries(val).map((item, index) => {
            return {value: index + 1, label: item[1]};
        });
    }


}
