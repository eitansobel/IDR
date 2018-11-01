import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import {ChangePhoto} from '../../redux/profile/profile.action';
import {ProfileService} from '../service/profile.service';
import {UpdatePhotoinList} from '../../redux/memberPhoto/memberPhoto.action';
import {environment} from '../../../environments/environment';
import {NotifyService} from "../../services/notify.service";
@Component({
    selector: 'idr-crop-image',
    templateUrl: './crop-image.component.html',
    styleUrls: ['./crop-image.component.scss']
})
export class CropImageComponent implements OnInit {
    public imageBase64;
    showCrop = false;
    imageChangedEvent: any = '';
    croppedImage: any = '';
    file;
    showCropError: boolean = false;
    tempUrl;
    constructor(
        public dialogRef: MatDialogRef<CropImageComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private pService: ProfileService,
         private notify: NotifyService,
        private store: Store<AppState>,
    ) {}

    ngOnInit() {
        if (this.data.memberId) {
            this.store.select('membersPhoto').subscribe((_photo) => {
                if (_photo.photo) {
                    this.croppedImage = `${environment.settings.imageUrl}${_photo.photo}`;
                } else {
                    this.croppedImage = '';
                }
            });
        } else {
            this.store.select('profilePage').map(data => data.profile).subscribe((data) => {
                if (data.full_photo) {
                    this.croppedImage = `${environment.settings.imageUrl}${data.full_photo}`;
                } else {
                    this.croppedImage = '';
                }
            });
        }

        window.addEventListener('dragover', e => {
            e && e.preventDefault();
        }, false);
        window.addEventListener('drop', e => {
            e && e.preventDefault();
        }, false);
    }

    crop() {
        this.showCrop = true;
        this.tempUrl = this.croppedImage;
        this.getDataUri(this.croppedImage, (dataUri) => {
            this.imageBase64 = dataUri;
        });
    }

    cancelCrop() {
        this.file = '';
        this.croppedImage = this.tempUrl;
        this.showCrop = false;
        this.imageChangedEvent = '';
    }

    getDataUri(url, callback) {
        const image: HTMLImageElement = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = function () {
            let canvas = <HTMLCanvasElement> document.createElement('canvas');
            canvas.width = image.width; // or 'width' if you want a special/scaled size
            canvas.height = image.height; // or 'height' if you want a special/scaled size
            const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);
            callback(canvas.toDataURL('image/png'));
            canvas = null;
        };
        image.src = url;
    }

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
        this.tempUrl = this.croppedImage;
        this.showCrop = true;
    }

    imageLoaded() {
        this.showCropError = false;
    }

    loadImageFailed(evt) {
        this.cancelCrop();
        this.showCropError = true;
        this.croppedImage = '';
    }

    imageCropped(image) {
        const scope = this;
        this.urltoFile(image, 'a.png')
            .then((file) => {
                scope.file = file;
            });
    }

    save() {
        const fileData = new FormData();
        fileData.append('photo', this.file);
        if (!this.file) {
            this.dialogRef.close();
            return;
        }
        if (this.data.memberId) {
            this.pService.updateMemberPhoto(fileData, this.data.memberId).subscribe((pf) => {
                this.pService.invalidateDoctorCache();
                this.store.dispatch(new UpdatePhotoinList({'full_photo': pf.full_photo}));
                this.dialogRef.close();
            }, err => {
                this.errorShow(err);
                this.notify.notifyError(err);
            });
        } else {

            this.pService.updatePhoto(fileData).subscribe((pf) => {
                this.pService.invalidateDoctorCache();
                this.store.dispatch(new ChangePhoto(pf));
                this.dialogRef.close();
            }, err => {
                this.errorShow(err);
                this.notify.notifyError(err);
            });
        }
    }

    deleteImage() {
        this.file = null;
        this.imageChangedEvent = null;
        this.pService.deletePhoto().subscribe((pf) => {
            this.pService.invalidateDoctorCache();
            this.store.dispatch(new ChangePhoto(pf));
            this.croppedImage = '';
        }, err => {
            this.errorShow(err);
            this.notify.notifyError(err);
        });
    }

    closeDialog() {
        this.dialogRef.close();
    }

    b64toBlob(b64Data, contentType, sliceSize?) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }

    urltoFile(url, filename, mimeType?) {
        mimeType = mimeType || (url.match(/^data:([^;]+);/) || '')[1];
        return (fetch(url)
            .then((res) => res.arrayBuffer())
            .then((buf) => new File([buf], filename, {type: mimeType}))
        );
    }

    errorShow(err) {
        if (err.detail === 'Invalid token') {
            localStorage.removeItem('idrToken');
            localStorage.removeItem('idrId');
        }
    }
}
