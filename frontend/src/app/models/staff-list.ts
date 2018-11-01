export class StaffList {
    id: number;
    title: string;
    qty: number;
    update_time: string;

    constructor(list) {
        [this.id, this.title, this.update_time] = list;
        this.qty = list.participants.length;
    }
}

export interface StaffLists {
    staffLists: StaffList[];
}
