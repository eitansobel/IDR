import {environment} from '../../../environments/environment';
import {ApiFactory} from '../../services/api.factory';
import {Injectable} from '@angular/core';
import {CopyColumn, CreateColumn, DeleteColumn, UpdateColumn} from "../../redux/dataColumns/data-column.action";

@Injectable()
export class DataColumnsService {
    private BASE_URL: string = environment.settings.backend1 + 'api/';
    private userId = Number(localStorage.getItem('idrUserId'));

    constructor(private af: ApiFactory) {
    }

    getDataColumns() {
        return this.af.sendGet(`${this.BASE_URL}v1/homecolumn/`);
    }

    createDataColumn(data) {
        return this.af.sendPost(`${this.BASE_URL}v1/homecolumn/`, data);
    }

    copyDataColumn(id) {
        return this.af.sendPost(`${this.BASE_URL}v1/homecolumn/${id}/copy_column/`, {});
    }

    toggleDataColumn(id, data) {
        return this.af.sendPost(`${this.BASE_URL}v1/homecolumn/${id}/toggle_column/`, data);
    }

    updateDataColumn(id, data) {
        return this.af.sendPatch(`${this.BASE_URL}v1/homecolumn/${id}/`, data);
    }

    deleteDataColumn(id) {
        return this.af.sendDelete(`${this.BASE_URL}v1/homecolumn/${id}/`);
    }

    setDataColumnOrder(data) {
        return this.af.sendPost(`${this.BASE_URL}v1/homecolumn/set_order/`, data);
    }

    webSocketActionManager(wsEvent, existedData, store) {
        switch (wsEvent.action) {
            case 'column_created':
                if (wsEvent.doctor_remote_id !== this.userId) {
                    if (existedData.some(item => item.author.id === wsEvent.doctor_remote_id)) {
                        store.dispatch(new CreateColumn(wsEvent.update));
                    }
                }
                break;

            case 'column_copied':
                if (wsEvent.doctor_remote_id !== this.userId) {
                    const copiedColumnGroup = existedData.find(item => {
                        return item.group_id === wsEvent.update.group_id;
                    });
                    if (copiedColumnGroup) {
                        store.dispatch(new CopyColumn(wsEvent.update));
                    }
                }
                break;

            case 'column_updated':
                if (wsEvent.doctor_remote_id !== this.userId) {
                    if (existedData.some(item => item.id === wsEvent.update.id)) {
                        store.dispatch(new UpdateColumn(wsEvent.update));
                    }
                }
                break;

            case 'column_deleted':
                if (wsEvent.doctor_remote_id !== this.userId) {
                    const columnToDelete = existedData.find(item => item.id === wsEvent.update);
                    if (columnToDelete) {
                        store.dispatch(new DeleteColumn(columnToDelete));
                    }
                }
                break;
        }
    }
}
