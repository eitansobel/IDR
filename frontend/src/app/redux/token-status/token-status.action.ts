import {Action} from '@ngrx/store';

export namespace TOKEN_ACTION {
    export const TOKEN_GOING_TO_EXPIRE = 'TOKEN_GOING_TO_EXPIRE';
}

export class TokenGoingToExpire implements Action {
    readonly type = TOKEN_ACTION.TOKEN_GOING_TO_EXPIRE;
}

export type TokenAction = TokenGoingToExpire;
