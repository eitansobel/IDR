import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedComponentModule} from '../common/common-share.module';
import {PatientsComponent} from '../patients/patients.component';
import {ScrollbarModule} from 'ngx-scrollbar';
import {Ng4FilesModule} from './../ng4-files';
import {MatDialogModule} from '@angular/material/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatListModule} from '@angular/material/list';
import {NgSelectModule} from '@ng-select/ng-select';
import {NewMemberComponent} from './new-member/new-member.component';
import {PatientsService} from './services/patients.service';
import {NewPatListComponent} from './new-pat-list/new-pat-list.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { ViewPatientProfileComponent } from './view-profile/view-profile.component';
import {MultyUploadComponent} from './multyupload/multyupload.component';
import {MatStepperModule} from '@angular/material/stepper';
import {MatTableModule} from '@angular/material/table';

@NgModule({
    declarations: [
        PatientsComponent,
        NewMemberComponent,
        NewPatListComponent,
        ViewPatientProfileComponent,
        MultyUploadComponent
    ],
    imports: [
        CommonModule,
        SharedComponentModule,
        ScrollbarModule,
        Ng4FilesModule,
        MatDialogModule,
        FormsModule,
        ReactiveFormsModule,
        MatListModule,
        NgSelectModule,
        MatCheckboxModule,
        MatStepperModule,
        MatTableModule
    ],
    providers: [
        PatientsService
    ],
    exports: [ViewPatientProfileComponent],
    entryComponents: [
        NewMemberComponent,
        NewPatListComponent,
        ViewPatientProfileComponent,
        MultyUploadComponent
    ]
})
export class PatientsModule {}
