import {SharedComponentModule} from '../common/common-share.module';
import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatTableModule} from '@angular/material/table';
import {ScrollbarModule} from 'ngx-scrollbar';
import {MatDialogModule} from '@angular/material/dialog';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatListModule} from '@angular/material/list';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {NgSelectModule} from '@ng-select/ng-select';
import {HomeComponent} from './home.component';
import {EditCellPopupComponent} from './edit-cell-popup/edit-cell-popup.component';
import {MessagesModule} from '../messages/messages.module';
import {HomeService} from './services/home.service';
import {SortPatientPopupComponent} from './sort-patient-popup/sort-patient-popup.component';
import {MatRadioModule} from '@angular/material';
import {SortPatientsByPipe} from '../pipe/sortPatients.pipe';
import {PatientsModule} from '../patients/patients.module';

@NgModule({
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
        MatSlideToggleModule,
        MatRadioModule,
        MessagesModule,
        MatTableModule,
        PatientsModule
    ],
    declarations: [
        HomeComponent,
        EditCellPopupComponent,
        SortPatientPopupComponent
    ],
    providers: [HomeService, SortPatientsByPipe],
    exports: [],
    entryComponents: [EditCellPopupComponent, SortPatientPopupComponent]
})
export class HomeModule {
}
