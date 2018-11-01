import {Component, AfterViewInit, ViewChild, OnInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import 'rxjs/add/operator/debounceTime';
import {ChatService} from './services/chat.service';
import {Chat} from '../models/chat';
import * as _ from 'lodash';
import * as moment from 'moment';
import {Store} from '@ngrx/store';
import {AppState} from '../redux/app.state';
import {Patient} from '../models/patient';
import {Message} from '../models/message';
import {Router} from '@angular/router';
import {ScrollbarComponent} from "ngx-scrollbar";
import {NotifyService} from "../services/notify.service";
import {PatientsService} from "../patients/services/patients.service";
import {UpdateUserParticipantList} from "../redux/profile/profile.action";

@Component({
    selector: 'idr-socket',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.scss'],

})
export class MessagesComponent implements OnInit {
    public chatsLog: Chat[] = [];
    public choosedChat: Chat;
    public messages: Message[] = [];
    public patient: Patient;
    public title: string;
    public patients: Patient[];
    public newChatShow: boolean = false;
    public search: string;
    private myPatients: Patient[] = [];
    private modelChanged: Subject<string> = new Subject<string>();
    @ViewChild(ScrollbarComponent) scrollRef: ScrollbarComponent;

    constructor(private chatService: ChatService,
                private router: Router,
                private patService: PatientsService,
                private notify: NotifyService,
                private store: Store<AppState>) {
        this.store.select('patientsPage').map(x => x['patients']).subscribe((_allpatients: Patient[]) => {
            if (_allpatients && !_allpatients.length) {
                return;
            }
            this.patients = _allpatients;
            this.chatService.getChats().subscribe((_chats: Chat[]) => {

                if (!_chats.length) {
                    this.newChatShow = true;
                    return;
                }

                this.chatsLog = _.orderBy(_chats, [
                    (item) => {
                        if (moment(item['history'].last_message_time).format('X')) {
                            return moment(item['history'].last_message_time).format('MM-DD-YYYY HH:mm');
                        }
                    }
                ], ['desc']);

                this.choosedChat = this.chatsLog[0];

                setTimeout(() => {
                    this.scrollRef.update();
                }, 0);
            }, err => {
                this.notify.notifyError(err);
            });
            this.store.select('profilePage').map(data => data.profile).subscribe((_profile) => {
                this.myPatients = _profile['my_patients_list_participants'];
            });
        });

        this.modelChanged
            .debounceTime(300)
            .subscribe(model => {
                this.chatService.getChatSearch(model).subscribe((_chats: Chat[]) => {
                    this.chatsLog = _chats;
                }, err => {
                    this.notify.notifyError(err);
                });
            });
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.chatService.messages.subscribe((data) => {
            this.patient = null;
            this.title = '';
            this.messages = data;
            this.choosedChat = undefined;
            this.newChatShow = true;
        });

        this.chatService.notifications.subscribe(notif => {

            this.updateReadCounter(notif.update.chat);
            switch (notif.action) {

                case 'chat_created':
                    this.chatService.getChats().subscribe((_chats: Chat[]) => {
                        this.chatsLog = _chats;
                        this.choosedChat = notif.update;

                    });
                    this.newChatShow = false;

                    break;

                case 'message_created':
                    this.updateChat(notif.update);
                    break;
            }
        });
    }

    newPatient(index) {

        if (this.myPatients.length) {

            let newPat = this.myPatients.find(x => {
                if (x['patient'].remote_id !== index) return index
            });

            if (index) {

                return index;
            } else {
                return false;
            }
        } else {
            return true;
        }

    }

    changeMyPatient(id) {
        let patients = this.myPatients.map(x => x['patient'].remote_id);
        patients.push(id);
        this.patService.setMyPatientList(patients).subscribe((_resp) => {
            this.store.dispatch(new UpdateUserParticipantList(_resp['my_patients_list_participants']));

        });
    }

    updateReadCounter(id) {
        if (this.choosedChat && id === this.choosedChat.id) {
            this.chatService.getChat(id).subscribe(() => {
            });
        }
    }

    changeSearch(evt) {
        this.modelChanged.next(evt);
    }

    createdChat(chat: Chat) {
        this.choosedChat = chat;
    }

    updateChat(mess) {
        if (this.choosedChat.id === mess.chat) {
            this.chatService.updateMessagesLog(mess);
        }

        this.chatService.getChats().subscribe((_chats: Chat[]) => {
            this.chatsLog = _chats;
        }, err => {
            this.notify.notifyError(err);
        });
    }

    removeChat(evt: number) {
        this.chatsLog = this.chatsLog.filter(x => x.id !== evt);
        if (!this.chatsLog.length) {
            this.choosedChat = undefined;
            this.newChatShow = true;
            return;
        }
        this.choosedChat = this.chatsLog[0];
    }

    trackByFn(index: number, item: any) {
        return item.id;
    }
}
