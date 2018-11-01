import {Action} from '@ngrx/store';

export namespace MEMBER_PHOTO_ACTION {
     export const UPDATE_PHOTOIN_LIST = 'UPDATE_PHOTOIN_LIST';
}

export class UpdatePhotoinList implements Action {
    readonly type = MEMBER_PHOTO_ACTION.UPDATE_PHOTOIN_LIST;

    constructor(public payload) {}
}

export type MemberPhotoAction = UpdatePhotoinList;
