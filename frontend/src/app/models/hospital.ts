export class Hospital {
    clinic_remote_id: number;
    hospital_id: number;
    title: string;
    hospital_department;
    hospital_role;

    constructor(hospital) {
        this.clinic_remote_id = hospital.clinic_remote_id;
        this.title = hospital.title;
        this.hospital_department = hospital.hospital_department;
        this.hospital_role = hospital.hospital_role;
    }
}

export interface Hospitals {
    hospitals: Hospital[];
}
