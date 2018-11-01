import {Action} from '@ngrx/store';
export namespace LOGOUT_ACTION {
    export const LOGOUT = 'LOGOUT';
}
export class LogOut implements Action {
  readonly type = LOGOUT_ACTION.LOGOUT;
}

export type LogoutAction =  LogOut;
