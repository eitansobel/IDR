export class Patient {
    address1: string;
    address2: string;
    address3: string;
    birth_date: string;
    city: string;
    country: string;
    ethnicity: string;
    first_name: string;
    home_phone: string;
    id?: number;
    remote_id: number;
    mobile_phone: string;
    mother_maiden_name: string;
    middle_name: string;
    last_name: string;
    mrn: string;
    pcp: string;
    preferred_communication: number;
    preferred_language: string;
    preferred_name: string;
    prefix: string;
    suffix: string;
    preferred_pharmacy: string;
    previous_last_name: string;
    primary_payor: string;
    secondary_payor: string;
//    email: string;
    sex: number;
    ssn: string;

    state: string;
    work_phone: string;
    zip_code: string;

    constructor(patient) {
        [
            this.birth_date,
            this.city,
            this.remote_id,
            this.country,
            this.address1,
            this.address2,
            this.address3,
            this.first_name,
            this.middle_name,
            this.last_name,
            this.ethnicity,
            this.home_phone,
            this.prefix,
            this.suffix,
            this.preferred_name,
            this.mobile_phone,
            this.mother_maiden_name,
            this.mrn,
//            this.email,
            this.pcp,
            this.preferred_communication,
            this.preferred_language,
            this.preferred_pharmacy,
            this.previous_last_name,
            this.primary_payor,
            this.secondary_payor,
            this.ssn,
            this.state,
            this.work_phone,
            this.zip_code
            ] = patient;
    }
}
