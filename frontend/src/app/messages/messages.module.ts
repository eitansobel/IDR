import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {MessagesComponent} from './messages.component';
import {ChatComponent} from './chat/chat.component';
import {CreateMessageComponent} from './create-message/create-message.component';
import {ChatService} from './services/chat.service';
import {WebSocketService} from '../services/websocket.service';
import {NgSelectModule} from '@ng-select/ng-select';
import { ScrollbarModule } from 'ngx-scrollbar';
import {SharedComponentModule} from '../common/common-share.module';
import {SingleMessageComponent} from './chat/single-message/single-message.component';
import {MessagesLogComponent} from './messages-log/messages-log.component';
import {MatListModule} from '@angular/material/list';

@NgModule({
    declarations: [
        MessagesComponent,
        ChatComponent,
        CreateMessageComponent,
        SingleMessageComponent,
        MessagesLogComponent,
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        NgSelectModule,
        ScrollbarModule,
        MatListModule,
        SharedComponentModule
    ],
    providers: [
        ChatService,
        WebSocketService
    ],
    exports: [
        MessagesComponent,
        ChatComponent,
        CreateMessageComponent,
        SingleMessageComponent,
        MessagesLogComponent
    ],
    entryComponents: [
    ]
})
export class MessagesModule {}

