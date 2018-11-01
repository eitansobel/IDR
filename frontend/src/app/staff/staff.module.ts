import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedComponentModule} from '../common/common-share.module';
import {StaffComponent} from './staff.component';
import {MatDialogModule} from '@angular/material/dialog';
import {NewMemberComponent} from './new-member/new-member.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgSelectModule} from '@ng-select/ng-select';
import {StaffService} from './service/staff.service';
import {MatListModule} from '@angular/material/list';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {NewStaffListComponent} from './new-staff-list/new-staff-list.component';
import {ScrollbarModule} from 'ngx-scrollbar';
import {Ng4FilesModule} from './../ng4-files';
import { ViewProfileComponent } from './view-profile/view-profile.component';
import {MultyUploadComponent} from './multyupload/multyupload.component';
import {MatStepperModule} from '@angular/material/stepper';
import {MatTableModule} from '@angular/material/table';
import {MatFormFieldModule} from '@angular/material/form-field';
@NgModule({
    declarations: [
        StaffComponent,
        NewMemberComponent,
        NewStaffListComponent,
        ViewProfileComponent,
        MultyUploadComponent
    ],
    imports: [
        CommonModule,
        SharedComponentModule,
        MatDialogModule,
        NgSelectModule,
        ReactiveFormsModule,
        FormsModule,
        MatListModule,
        MatCheckboxModule,
        ScrollbarModule,
        Ng4FilesModule,
        MatStepperModule,
        MatTableModule,
        MatFormFieldModule
    ],
    providers: [
        StaffService
    ],
    exports: [],
    entryComponents: [
        NewMemberComponent,
        NewStaffListComponent,
        ViewProfileComponent,
        MultyUploadComponent
    ]
})
export class StaffModule {}


