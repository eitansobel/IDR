import {Action} from '@ngrx/store';
import {Hospital} from '../../models/hospital';
export namespace HOSPITAL_ACTION {
    export const LOAD_HOSPITALS = 'LOAD_HOSPITALS';
}

export class LoadHospitals implements Action {
    readonly type = HOSPITAL_ACTION.LOAD_HOSPITALS;

    constructor(public payload: Hospital[]) {}
}

export type HospitalAction =  LoadHospitals;
