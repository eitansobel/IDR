import {MemberPhotoAction, MEMBER_PHOTO_ACTION} from './memberPhoto.action';
const initialState = {
    photo: ''
};

export function memberPhotoReducer(state = initialState, action: MemberPhotoAction) {
    switch (action.type) {

        case MEMBER_PHOTO_ACTION.UPDATE_PHOTOIN_LIST:
            return {
                ...state,
                photo: action.payload.full_photo
            };

        default:
            return state;
    }
}
