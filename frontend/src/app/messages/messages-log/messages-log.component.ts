import {Component, OnInit, Input, EventEmitter, Output} from '@angular/core';
import {ChatService} from '../services/chat.service';
import {DialogOverviewComponent} from '../../common/dialogOverview/dialogOverview.component';
import {MatDialog} from '@angular/material/dialog';
import {Chat} from '../../models/chat';
import {environment} from '../../../environments/environment';
import {NotifyService} from "../../services/notify.service";
import {Patient} from "../../models/patient";

@Component({
    selector: 'idr-messages-log',
    templateUrl: './messages-log.component.html',
    styleUrls: ['./messages-log.component.scss']
})
export class MessagesLogComponent implements OnInit {
    newPatient: boolean;
    @Input() alertType;
    @Input() chat: Chat;
    @Input() choosedChat: Chat;
    @Input() myPatients: Patient[];
    @Output() removeChat = new EventEmitter<number>();
    public urgency: number;
    public not_read: boolean = false;
    public imageUrl: string = environment.settings.imageUrl;

    constructor(public dialog: MatDialog,
                private notify: NotifyService,
                private chatService: ChatService) {
    }

    ngOnInit() {
    }

    ngOnChanges() {
        this.urgency = this.chat.history.top_urgency;
        if (this.chat.history.count_of_unread_messages) {
            this.not_read = true;
        }
        if (this.choosedChat && (this.choosedChat.id == this.chat.id)) {
            this.not_read = false;
            this.chat.history.count_of_unread_messages = 0;
        }
        this.checkNewPatient();

    }

    checkNewPatient() {

        if (this.myPatients && this.myPatients.length) {
            let newPat = this.myPatients.find(x => {
                if (x['patient'].remote_id == this.chat.patient) return this.chat.patient
            });

            if (this.chat.patient) {
                if (newPat) {
                    this.newPatient = false;
                } else {
                    this.newPatient = true;
                }
            } else {
                this.newPatient = false;
            }
        } else {
            this.newPatient = true;
        }

    }

    deleteChat(id: number) {
        const dialogRef = this.dialog.open(DialogOverviewComponent, {
            width: '342px',
            data: {
                header: 'Delete Conversation',
                body: `All messages will be deleted permanently`
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.chatService.deleteChat(id).subscribe((_resp) => {
                    this.removeChat.emit(id);
                }, err => {
                    this.notify.notifyError(err);
                });
            }
        });
    }
}
