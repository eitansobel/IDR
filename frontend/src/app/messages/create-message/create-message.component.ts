import {Component, Input, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {ChatService, } from '../services/chat.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../redux/app.state';
import {Profile} from '../../models/profile';
import {Patient} from '../../models/patient';
import {Message} from '../../models/message';
import {Chat} from '../../models/chat';
import {ScrollbarComponent} from "ngx-scrollbar";
import {MatSelectionList} from "@angular/material/list";
import {HelpService} from "../../services/help.service";
import {NotifyService} from "../../services/notify.service";

@Component({
    selector: 'idr-create-message',
    templateUrl: './create-message.component.html',
    styleUrls: ['./create-message.component.scss']
})
export class CreateMessageComponent {
    newPatient: boolean = false;
    @Input() homePage = false;
    @Input() title = '';
    @Input() chat = {
        title: '',
        patient: '',
        patient_name: '',
        id: null,
        display_data: {
            full_name: '',
            full_photo: ''
        },
        attachment: null
    };
    @ViewChild(ScrollbarComponent) scrollRef: ScrollbarComponent;
    @ViewChild('selectedReceiver') selectedReceiver: MatSelectionList;
    @ViewChild('selectedPatients') selectedPatients: MatSelectionList;
    @ViewChild('fileInput') el: ElementRef;

    @Input() patient = '';
    @Input() messagesL = 0;
    @Input() myPatients;
    @Output() createdChat = new EventEmitter<Chat>();
    @Output() changeMyPatient = new EventEmitter<any>();
    blockSendbtn = true;
    public alerts = [];

    public receivers: Profile[];
    public patients: Patient[];
    private choosedReceiver: number;
    private choosedPatient: number;
    public showAllReceivers: boolean = false;
    public showAllPatients: boolean = false;
    public choosedChat = {};
    private formData: FormData;

    public alertReq: boolean = false;
    private subjectChanged: boolean = false;
    private message: Message = {
        attachment: null,
        sender: null,
        text: null,
        alert: null,
    };

    public chatOpened = {
        patient: '',
        receiver: '',
        title: ''
    };
    constructor(private chatService: ChatService,
        private helpService: HelpService,
        private notify: NotifyService,
        private store: Store<AppState>) {
        this.store.select('membersPage').map(x => x['members']).subscribe((_allmembers: Profile[]) => {
            if (!_allmembers) return;
            const id = Number(localStorage.getItem('idrUserId'));
            this.receivers = _allmembers.filter((x: Profile) => x.is_approved === true && x.remote_id !== id);
        });
        this.store.select('patientsPage').map(x => x['patients']).subscribe((_allpatients: Patient[]) => {
            this.patients = _allpatients;
        });

        this.alerts = this.helpService.getMessageAlerts;
        document.addEventListener("click", () => {this.hideOnClickOutside(event)}, false);
    }

    sendMsg() {
        this.blockSendbtn = false;
        if (!this.messagesL && !this.chat || !this.chat.id) {

            this.chatService.createChat({
                participants: [this.choosedReceiver],
                title: this.chatOpened.title,
                patient: this.choosedPatient
            }).subscribe(_chat => {
                if (this.message.attachment) {
                    this.formData.append('chat', _chat.id);
                    this.formData.append('text', this.message.text);
                    this.createMessage(this.formData);
                } else {
                    const sendData = {
                        chat: _chat.id,
                        text: this.message.text,
                        urgency: this.message.alert
                    };

                    this.createMessage(sendData);
                }
                this.chat = _chat;
                this.createdChat.emit(_chat);
                this.subjectChanged = false;
            }, err => {
                this.notify.notifyError(err)
            });
        } else if (this.subjectChanged) {

            this.chatService.updateChat(this.chat.id, {
                title: this.chatOpened.title,
                patient: this.choosedPatient
            }).subscribe(_chat => {
                if (this.message.attachment) {
                    this.formData.append('chat', this.chat.id);
                    this.formData.append('text', this.message.text);
                    this.createMessage(this.formData);
                } else {
                    const sendData = {
                        chat: this.chat.id,
                        text: this.message.text,
                        urgency: this.message.alert
                    };
                    this.createMessage(sendData);
                }
            }, err => {
                this.notify.notifyError(err);
            });
        } else {
            if (this.message.attachment) {
                this.formData.append('chat', this.chat.id);
                this.formData.append('text', this.message.text);
                this.createMessage(this.formData);
            } else {
                const sendData = {
                    chat: this.chat.id,
                    text: this.message.text,
                    urgency: this.message.alert
                };
                this.createMessage(sendData);
            }
        }
    }

    createMessage(data) {
        if (this.formData && this.message.attachment) {

            this.chatService.createMessageAttached(data).subscribe((x) => {
                this.backToDefault();
            }, err => {
                if (err.urgency.length) this.alertReq = true;

                this.notify.notifyError(err);
            });
        } else {
            this.chatService.createMessage(data).subscribe((x) => {
                this.backToDefault();
            }, err => {
                if (err.urgency.length) this.alertReq = true;

                this.notify.notifyError(err);
            });
        }
    }

    titleChanged() {
        this.subjectChanged = true;
    }

    removeFile(event) {
        this.message.attachment = null;
    }

    ngOnChanges() {
        this.checkNewPatient();
        this.showAllReceivers = false;
        this.showAllPatients = false;

        if (this.patient) {

            this.chatOpened.patient = `${this.patient['first_name']} ${this.patient['last_name']}`;
            if (this.newPatient) {
                this.chatOpened.patient += this.chatOpened.patient + ' (New)'
            }
            this.choosedPatient = this.patient['id'];
            return;
        }
        if (!this.chat || !this.chat.id) {
            if (this.selectedReceiver && this.selectedPatients) {
                this.selectedReceiver.deselectAll();
                this.selectedPatients.deselectAll();
            }
            this.message.sender = '';
            this.backToDefault();
            this.choosedChat = {};
            this.choosedPatient = undefined;
            this.chatOpened = {
                patient: '',
                receiver: '',
                title: ''
            };
            this.newPatient = false;

            this.showAllReceivers = false;
            return;
        }
        this.choosedChat = this.chat;
        this.chatOpened.title = this.chat.title;
        this.chatOpened.patient = this.chat.patient_name;
         
        if (this.newPatient) {
            this.chatOpened.patient += ' (New)';
        }
        this.message.text = '';
        if (this.chat.display_data.full_name) {
            this.chatOpened.receiver = this.chat.display_data.full_name;
        }

    }

    addToMy() {
        this.changeMyPatient.emit(this.chat.patient);
    }

    backToDefault() {
        this.alertReq = false;
        this.message.text = '';
        this.message.attachment = null;
        this.message.alert = null;
        this.blockSendbtn = true;
    }

    showReceiver(evt) {
        this.showAllReceivers = !this.showAllReceivers;

        setTimeout(() => {
            this.scrollRef.update();
        }, 0);
    }

    showAllPatientsFunc() {
        this.showAllPatients = !this.showAllPatients;

        setTimeout(() => {
            this.scrollRef.update();
        }, 0);
    }

    selectReceiver(event) {
        if (event.option.selected) {
            event.source.deselectAll();
            event.option._setSelected(true);
            this.chatOpened.receiver = `${event.option.value.first_name} ${event.option.value.last_name}`;
            this.choosedReceiver = event.option.value.remote_id;
            this.showAllReceivers = !this.showAllReceivers;
        }
    }

    selectPatients(event) {
        if (event.option.selected) {
            event.source.deselectAll();
            event.option._setSelected(true);
            this.chatOpened.patient = `${event.option.value.first_name} ${event.option.value.last_name}`;
            this.choosedPatient = event.option.value.remote_id;
            this.showAllPatients = !this.showAllPatients;
            this.subjectChanged = true;
        }
    }

    selectFile(evt) {
        const file = evt.target.files[0];
        this.formData = new FormData();
        this.message.attachment = this.el.nativeElement.files[0];
        this.formData.append('attachment', file, file.name);
    }

    hideOnClickOutside(event) {
        if (this.showAllReceivers || this.showAllPatients) {
            if (!event.target.closest('.receiverWrap')) {
                this.showAllReceivers = false;
                this.showAllPatients = false;
            }
        }
    }

    checkNewPatient() {
    
        if (this.myPatients && this.myPatients.length &&  this.chat) {
            let newPat = this.myPatients.find(x => {if (x['patient'].remote_id == this.chat.patient) return this.chat.patient});

            if (this.chat.patient) {
                if (newPat) {
                    this.newPatient = false;
                } else {
                    this.newPatient = true;
                }

            } else {
                this.newPatient = false;
            }
        } else if(this.homePage) {
            this.newPatient = false;
        } else {
            this.newPatient = true;
        }
    }
}
