import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {ValidationErrorComponent} from './validation-error/validation-error.component';
import {DefaultBtnComponent} from './btns/default-btn/default-btn.component';
import {InputTextComponent} from './controls/idr-input-text/idr-input-text.component';
import {SelectComponent} from './controls/idr-select/idr-select.component';
import {IdrCheckboxComponent} from './controls/idr-checkbox/idr-checkbox.component';
import {IdrModalWrapComponent} from './idr-modal-wrap/idr-modal-wrap.component';
import {IdrInputPassComponent} from './controls/idr-input-pass/idr-input-pass.component';
import {TimeSetupComponent} from './time-setup/time-setup.component';
import {OwlDateTimeModule, OwlNativeDateTimeModule, OWL_DATE_TIME_FORMATS} from 'ng-pick-datetime';
import {OwlMomentDateTimeModule} from 'ng-pick-datetime-moment';
import {ServerErrorComponent} from './server-error/server-error.component';
import {BackBtnComponent} from './btns/back-btn/back-btn.component';
import {CheckSvgComponent} from './svg/check-svg/check-svg.component';
import {LoginIconSvgComponent} from './svg/login-icon-svg/login-icon-svg.component';
import {DropdownSvgComponent} from './svg/dropdown-svg/dropdown-svg.component';
import {MatDialogModule} from '@angular/material/dialog';
import {DialogOverviewComponent} from './dialogOverview/dialogOverview.component';
import {ProfilIconSvgComponent} from './svg/profil-icon-svg/profil-icon-svg.component';
import {MatRadioModule} from '@angular/material/radio';
import {AlertCheckboxComponent} from './controls/alert-checkbox/alert-checkbox.component';
import {CloseSvgComponent} from './svg/close-svg/close-svg.component';
import {PortalModule} from '@angular/cdk/portal';
import {EditSvgComponent} from './svg/edit-svg/edit-svg.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {PlusSvgComponent} from './svg/plus-svg/plus-svg.component';
import {Ng4FilesModule} from './../ng4-files';
import {FormWrapComponent} from './form-wrap/form-wrap.component';
import {EditIconSvgComponent} from './svg/edit-icon-svg/edit-icon-svg.component';
import {NgSelectModule} from '@ng-select/ng-select';
import {DateSelectComponent} from './date-select/date-select.component';
import {ClosePopupSvgComponent} from './svg/close-popup-svg/close-popup-svg.component';
import {PaginationComponent} from './pagination/pagination.component';
import {CropSvgComponent} from './svg/crop-svg/crop-svg.component';
import {FilterPipe} from '../pipe/filter.pipe';
import {SelectPipe} from '../pipe/select.pipe';
import {AcronymPipe} from '../pipe/acronym.pipe';
import {ArrowSvgComponent} from './svg/arrow-svg/arrow-svg.component';
import {SortableListComponent} from './sortable-list/sortable-list.component';
import {TrashIconSvgComponent} from './svg/trash-icon-svg/trash-icon-svg.component';
import {CopyIconSvgComponent} from './svg/copy-icon-svg/copy-icon-svg.component';
import {WrenchIconSvgComponent} from './svg/wrench-icon-svg/wrench-icon-svg.component';
import {MoveIconSvgComponent} from './svg/move-icon-svg/move-icon-svg.component';
import {KeyIconSvgComponent} from './svg/key-icon-svg/key-icon-svg.component';
import {SearchIconSvgComponent} from './svg/search-icon-svg/search-icon-svg.component';
import {SortByPipe} from '../pipe/sort.pipe';
import {ScrollbarModule} from 'ngx-scrollbar';
import { AlertIconSvgComponent } from './svg/alert-icon-svg/alert-icon-svg.component';
import {CloseRoundSvgComponent} from './svg/close-round-svg/close-round-svg.component';
import {AttachSvgComponent} from './svg/attach-svg/attach-svg.component';
import {SendSvgComponent} from './svg/send-svg/send-svg.component';
import {SearchControlComponent} from './controls/search-control/search-control.component';
import {TextareaComponent} from './controls/textarea/textarea.component';
import {CountryContactsComponent} from './country-contacts/country-contacts.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {PrivilegesComponent} from './privileges/privileges.component';
import {EditHomeSvgComponent} from './svg/edit-home-svg/edit-home-svg.component';
import {MessageSvgComponent} from './svg/message-svg/message-svg.component';
import {SettingsSvgComponent} from './svg/settings-svg/settings-svg.component';
import {CopySvgComponent} from './svg/copy-svg/copy-svg.component';
import {LockSvgComponent} from './svg/lock-svg/lock-svg.component';
import {CrossSvgComponent} from './svg/cross-svg/cross-svg.component';
import {SortPatientSvgComponent} from './svg/sort-patient-svg/sort-patient-svg.component';
import {CircleSvgComponent} from './svg/circle-svg/circle-svg.component';
import {FileNamePipe} from '../pipe/fileName.pipe';
import {LocalTimePipe} from '../pipe/localTime.pipe';
import {MinusSvgComponent} from "./svg/minus-svg/minus-svg.component";
import { PhoneMaskDirective } from '../directives/phone.mask.directive';
import {SsnMaskDirective} from "../directives/ssn.mask.directive";
export const MY_MOMENT_FORMATS = {
    parseInput: 'l LT',
    fullPickerInput: 'l LT',
    datePickerInput: 'l',
    timePickerInput: 'LT',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
};

@NgModule({
    declarations: [
        CircleSvgComponent,
        SortPatientSvgComponent,
        CrossSvgComponent,
        LockSvgComponent,
        CopySvgComponent,
        SettingsSvgComponent,
        MessageSvgComponent,
        EditHomeSvgComponent,
        ValidationErrorComponent,
        DefaultBtnComponent,
        BackBtnComponent,
        InputTextComponent,
        SelectComponent,
        IdrCheckboxComponent,
        IdrModalWrapComponent,
        IdrInputPassComponent,
        TimeSetupComponent,
        ServerErrorComponent,
        CheckSvgComponent,
        DropdownSvgComponent,
        LoginIconSvgComponent,
        ProfilIconSvgComponent,
        DialogOverviewComponent,
        AlertCheckboxComponent,
        CloseSvgComponent,
        EditSvgComponent,
        PlusSvgComponent,
        FormWrapComponent,
        EditIconSvgComponent,
        ClosePopupSvgComponent,
        SendSvgComponent,
        DateSelectComponent,
        CropSvgComponent,
        SortableListComponent,
        ArrowSvgComponent,
        PaginationComponent,
        FilterPipe,
        SelectPipe,
        SortByPipe,
        FileNamePipe,
        AcronymPipe,
        LocalTimePipe,
        SearchIconSvgComponent,
        TrashIconSvgComponent,
        WrenchIconSvgComponent,
        CopyIconSvgComponent,
        MoveIconSvgComponent,
        MinusSvgComponent,
        KeyIconSvgComponent,
        PrivilegesComponent,
        CountryContactsComponent,
        TextareaComponent,
        SearchControlComponent,
        AttachSvgComponent,
        CloseRoundSvgComponent,
        AlertIconSvgComponent,
        PhoneMaskDirective,
        SsnMaskDirective
    ],
    imports: [
        CommonModule,
        OwlDateTimeModule,
        OwlNativeDateTimeModule,
        OwlMomentDateTimeModule,
        MatDialogModule,
        PortalModule,
        MatRadioModule,
        FormsModule,
        Ng4FilesModule,
        NgSelectModule,
        ReactiveFormsModule,
        ScrollbarModule,
        MatSlideToggleModule
    ],
    providers: [
        SortByPipe,
        FilterPipe,
        SelectPipe,
        {provide: OWL_DATE_TIME_FORMATS, useValue: MY_MOMENT_FORMATS}
    ],
    exports: [
        CircleSvgComponent,
        SortPatientSvgComponent,
        CrossSvgComponent,
        LockSvgComponent,
        CopySvgComponent,
        SettingsSvgComponent,
        MessageSvgComponent,
        EditHomeSvgComponent,
        ValidationErrorComponent,
        DefaultBtnComponent,
        InputTextComponent,
        SelectComponent,
        IdrCheckboxComponent,
        IdrModalWrapComponent,
        IdrInputPassComponent,
        TimeSetupComponent,
        ServerErrorComponent,
        BackBtnComponent,
        CheckSvgComponent,
        DropdownSvgComponent,
        LoginIconSvgComponent,
        ProfilIconSvgComponent,
        SendSvgComponent,
        DialogOverviewComponent,
        AlertCheckboxComponent,
        CloseSvgComponent,
        EditSvgComponent,
        PlusSvgComponent,
        FormWrapComponent,
        EditIconSvgComponent,
        ClosePopupSvgComponent,
        DateSelectComponent,
        CropSvgComponent,
        SortableListComponent,
        ArrowSvgComponent,
        PaginationComponent,
        FilterPipe,
        SortByPipe,
        SelectPipe,
        AcronymPipe,
        FileNamePipe,
        LocalTimePipe,
        SearchIconSvgComponent,
        TrashIconSvgComponent,
        WrenchIconSvgComponent,
        CopyIconSvgComponent,
        MoveIconSvgComponent,
        MinusSvgComponent,
        KeyIconSvgComponent,
        PrivilegesComponent,
        CountryContactsComponent,
        TextareaComponent,
        SearchControlComponent,
        AttachSvgComponent,
        CloseRoundSvgComponent,
        AlertIconSvgComponent,
        SsnMaskDirective,
        PhoneMaskDirective
    ],
    entryComponents: [
        DialogOverviewComponent,
        PrivilegesComponent
    ],
})
export class SharedComponentModule {
}
