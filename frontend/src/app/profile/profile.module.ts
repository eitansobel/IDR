import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ProfileComponent} from './profile.component';
import {CropImageComponent} from './crop-image/crop-image.component';
import {ImageCropperModule} from 'ngx-image-cropper';
import {MatDialogModule} from '@angular/material/dialog';
import {SharedComponentModule} from '../common/common-share.module';
import {ProfileService} from './service/profile.service';
import {Ng4FilesModule} from './../ng4-files';
import {NgSelectModule} from '@ng-select/ng-select';
import {RouterModule} from '@angular/router';
import { ChangePassComponent } from './change-pass/change-pass.component';
@NgModule({
    declarations: [
        ProfileComponent,
        CropImageComponent,
        ChangePassComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        ReactiveFormsModule,
        ImageCropperModule,
        MatDialogModule,
        SharedComponentModule,
        Ng4FilesModule,
        NgSelectModule,
        RouterModule
    ],
    providers: [
        ProfileService
    ],
    exports: [],
    entryComponents: [
        CropImageComponent,
        ChangePassComponent
    ]
})
export class ProfileModule {}
