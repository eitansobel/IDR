import {ColumnDoctor} from './profile';
export class DataColumn {
    id: number;
    update_interval: number;
    group_id: number;
    author: ColumnDoctor;
    title: string;
    is_hidden: boolean;
    order: number;
    authors_in_group: Number[];

    constructor(dataColumn) {[
        this.update_interval,
        this.group_id,
        this.author,
        this.title,
        this.is_hidden,
        this.order,
        this.authors_in_group] = dataColumn;
    }
}

export interface DataColumns {
    dataColumns: DataColumn[];
}
