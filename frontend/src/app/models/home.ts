import {ColumnDoctor} from './profile';

export class NestedColumn {
    id: number;
    group_id: number;
    is_hidden: boolean;
    title: string;
    update_interval: number;
    author: ColumnDoctor;
    authors_in_group: Number[];
    cells: NestedHomeCell[];
    order: number;
}

export class HomePatient {
    id: number;
    first_name: string;
    last_name: string;
    ssn: string;
    mrn: string;
    room: string;
    birth_date: string;
    age: number;
}

export class HomeCellField {
    id: number;
    title: string;
    author: ColumnDoctor;
    value: string;
    cell: number;
    is_deleted: boolean;
}

export class NestedHomeCell {
    id: number;
    title: string;
    author: ColumnDoctor;
    patient: number;
    column_group_id: number;
    is_private: boolean;
    update_interval: number;
    fields: HomeCellField[];
    last_update: string;
}
