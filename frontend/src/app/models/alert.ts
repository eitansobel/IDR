import * as _ from 'lodash';

export class Alert {
    alert_type: number;
    title: string;
    value: string;
    id;
    show: boolean;
    selectedItem;
    constructor(index_number, object, show, selectedItem?) {
        this.id = object.id;
        this.alert_type = object.alert_type;
        this.title = object.title;
        this.value = object.value;
        this.show = show;
        this.selectedItem = selectedItem;
    }
}


export interface Alerts {
    alerts: Alert[];
}
