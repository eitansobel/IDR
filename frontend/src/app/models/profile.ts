export class Profile {
    remote_id: number;
    username: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    title: string;
    phone: string;
    prefix: string;
    suffix: string;
    preferred_name: string;
    cell: string;
    pager: string;
    fax: string;
    email: string;
    preferred_mode: number;
    hospital_department: number;
    hospital: number;
    hospital_role: number;
    alerts;
    full_photo: string;
    dea_number;
    birthday;
    is_approved;
    npi_number;
    state_license;
    last_update;
    user_id;
    id;
    is_admin;
    create_data_cell_permission: boolean;
    edit_data_cell_permission: boolean;
    export_permission: boolean;
    patient_sort_by: number;
    patient_order: number;
    constructor(profile) {
        [
            this.birthday,
            this.full_photo,
            this.remote_id,
            this.username,
            this.first_name,
            this.middle_name,
            this.last_name,
            this.title,
            this.phone,
            this.prefix,
            this.suffix,
            this.preferred_name,
            this.cell,
            this.pager,
            this.fax,
            this.email,
            this.preferred_mode,
            this.hospital_department,
            this.hospital,
            this.hospital_role,
            this.dea_number,
            this.is_approved,
            this.npi_number,
            this.state_license,
            this.last_update,
            this.is_admin,
            this.user_id,
            this.alerts,
            this.create_data_cell_permission,
            this.patient_sort_by,
            this.patient_order,
            this.edit_data_cell_permission,
            this.export_permission] = profile;
    }
}

export class ColumnDoctor {
    id: number;
    job: string;
    full_name: string;
    constructor(profile) {
        [
            this.id,
            this.job,
            this.full_name] = profile;
    }
}
