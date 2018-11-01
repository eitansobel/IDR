import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {StaffService} from '../../staff/service/staff.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import {ApproveUser} from '../../redux/staff/staff.action';

@Component({
    selector: 'idr-privileges',
    templateUrl: './privileges.component.html',
    styleUrls: ['./privileges.component.scss']
})
export class PrivilegesComponent {
    public promoListText: string = '';
    public headerText: string = '';
    hideCancel: boolean = false;
    options = [
        {name: 'Allow to create data cell permission', checked: this.data._permissions.create_data_cell_permission, value: 1},
        {name: 'Management of doctor\'s permission', checked: this.data._permissions.doctor_permission, value: 2},
        {name: 'Allow edit data cell permission', checked: this.data._permissions.edit_data_cell_permission, value: 3},
        {name: 'Allow export', checked: this.data._permissions.export_permission, value: 4},
        {name: 'Management of patients permission', checked: this.data._permissions.patient_permission, value: 5}
    ];

    constructor( @Inject(MAT_DIALOG_DATA) public data: any,
        private staffService: StaffService,
        private store: Store<AppState>,
        public dialogRef: MatDialogRef<PrivilegesComponent>, ) {
        if (this.data) {
            this.headerText = this.data.header;
            if (this.data.buttons) {
                this.hideCancel = true;
            }
        }
    }



    get selectedOptions() { // right now: ['1','3']
        return this.options
            .filter(opt => opt.checked)
            .map(opt => opt.value);
    }

    closeDialog() {
        this.dialogRef.close();
    }

    save() {
        const obj = {
            create_data_cell_permission: this.options[0].checked,
            doctor_permission: this.options[1].checked,
            edit_data_cell_permission: this.options[2].checked,
            export_permission: this.options[3].checked,
            patient_permission: this.options[4].checked
        };

        this.staffService.setMemberPermissions(obj, this.data.id).subscribe((_permissions) => {
            this.store.dispatch(new ApproveUser({user_id: this.data.id}));
            this.dialogRef.close();
        });
    }
}
