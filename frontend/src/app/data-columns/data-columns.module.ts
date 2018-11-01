import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataColumnsComponent} from './data-columns.component';
import {DataColumnsService} from './services/data-columns.service';
import {SharedComponentModule} from '../common/common-share.module';
import {DataColumnListComponent} from './data-column-list/data-column-list.component';
import {ScrollbarModule} from 'ngx-scrollbar';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {NgSelectModule} from '@ng-select/ng-select';
import {MatDialogModule} from '@angular/material/dialog';
import {MatListModule} from '@angular/material/list';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {DataColumnPopupComponent} from './data-column-popup/data-column-popup.component';
import {DataColumnsUpdateIntervalMapService} from './services/data-columns-update-interval-map.service';
import {NgxDnDModule} from '@swimlane/ngx-dnd';
import {UserPermissionService} from '../services/user-permission.service';

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
        NgxDnDModule
    ],
    declarations: [DataColumnsComponent, DataColumnListComponent, DataColumnPopupComponent],
    providers: [
        DataColumnsService, DataColumnsUpdateIntervalMapService, UserPermissionService
    ],
    entryComponents: [DataColumnPopupComponent]
})
export class DataColumnsModule {
}


