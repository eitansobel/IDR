import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {
    Ng4FilesService,
    Ng4FilesConfig,
    Ng4FilesSelected
} from '../../ng4-files';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import {ProfileService} from '../../profile/service/profile.service';
import * as _ from 'lodash';

import {AddProfile} from '../../redux/profile/profile.action';
@Component({
    selector: 'idr-form-wrap',
    templateUrl: './form-wrap.component.html',
    styleUrls: ['./form-wrap.component.scss']
})
export class FormWrapComponent implements OnInit {
    private testConfig: Ng4FilesConfig = {
        acceptExtensions: ['csv'],
        maxFilesCount: 1
    };
    message;
    filename: string = 'Drag and drop file to this area of choose file.';
    @Input() edittable;
    @Input() editName = '';
    @Input() formData;
    @Output() onSave = new EventEmitter<any>();
    constructor(
        private ng4FilesService: Ng4FilesService,
        private pService: ProfileService,
        private store: Store<AppState>) {}

    ngOnInit() {
        this.ng4FilesService.addConfig(this.testConfig);
    }

    filesSelect(selectedFiles: Ng4FilesSelected, ): void {
        for (let i = 0; i < selectedFiles.files.length; i++) {
            const file = selectedFiles.files[i];
            if (file['status'] === 4) {

            } else {
                this.filename = selectedFiles.files[i].name;
            }
        }
    }

    save() {
        if (this.formData.valid) {
            let preferred_mode;

            if (this.formData.value.preferred_mode === 0) {
                this.formData.value.preferred_mode = null;
            } else {
                preferred_mode = this.formData.value.preferred_mode;
            }
            this.pService.updateProfileServer1(this.formData.value).subscribe(() => {
                    this.store.dispatch(new AddProfile(this.formData.value));
                    this.onSave.emit([this.editName]);
                    this.message = '';
            }, err => {
                if (err.detail === 'Invalid token') {
                    localStorage.removeItem('idrToken');
                    localStorage.removeItem('idrId');
                } else {
                    this.message = [];
                   Object.keys(err).forEach((key) => {
                            if (!key) return;
                            const mess = err[key][0];
                            this.message.push(`${key}: ${mess}`);
                        });
                }
            });
        }
    }

    cancel() {
        this.onSave.emit([this.editName, 'cancel']);
    }
}
