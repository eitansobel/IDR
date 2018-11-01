import {OnInit, Component, Input, ViewChild, ChangeDetectorRef} from '@angular/core';
import {ChatService, Message} from '../services/chat.service';
import {ScrollbarComponent} from 'ngx-scrollbar';
import {NotifyService} from "../../services/notify.service";
@Component({
    selector: 'idr-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {
    public userId: string;
    messages: Message[] = [];
    @Input() chat;
    counter = 1;
    maxPages = 1;
    @ViewChild(ScrollbarComponent) scrollRef: ScrollbarComponent;
    constructor(
        private chatService: ChatService,
        private changeDetectorRef: ChangeDetectorRef,
        private notify: NotifyService,
    ) {
        this.userId = localStorage.getItem('idrUserId');
        
    }

    ngOnInit() {
        this.chatService.newMessage.subscribe((_mess: Message) => {
            this.messages.push(_mess);
            setTimeout(() => {
                this.scrollRef.scrollToBottom();
            }, 300);
        });
    }

    ngOnChanges() {
        if (!this.chat) {
            this.messages = [];
            this.counter = 1;
            this.maxPages = 1;
            return;
        }
        this.messages = [];
        this.counter = 1;
        this.maxPages = 1;
        if (!this.messages.length && this.chat.id) {
            this.chatService.getMessages(this.chat.id, this.counter).subscribe(_messages => {
                this.maxPages = _messages.num_pages;
                this.messages = _messages['results'].reverse();

                setTimeout(() => {
                    this.scrollRef.scrollToBottom();
                    this.scrollRef.update();
                }, 0);

            }, err => {
                this.notify.notifyError(err);
            });
        }
    }

    onScroll(event: any) {
        if (event) {
            if (event.target.scrollTop < 10) {
                if (this.counter < this.maxPages) {
                    this.counter++;
                    this.chatService.getMessages(this.chat.id, this.counter).subscribe(_messages => {
                        this.messages = this.messages.reverse().concat(_messages['results']).reverse();
                        this.changeDetectorRef.detectChanges();
                    }, err => {
                        this.notify.notifyError(err);
                    });
                }
            }
        }
    }

    trackByFn(index: number, item: any) {
        return item.created_at;
    }
}
