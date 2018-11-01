import {environment} from '../../../environments/environment';
import {ApiFactory} from '../../services/api.factory';
import {Injectable} from '@angular/core';
import {
    CopyNestedColumn, CreateCell, CreateColumnFromSocket, EditNestedCell, HideNestedColumn,
    UpdateNestedColumn, UpdateChatFromSocket
} from '../../redux/home/home.actions';
import {CreateColumn} from '../../redux/dataColumns/data-column.action';

@Injectable()
export class HomeService {
    private BASE_URL: string = environment.settings.backend1 + 'api/';
    private userId = Number(localStorage.getItem('idrUserId'));

    constructor(private af: ApiFactory) {
    }

    getColumns() {
        return this.af.sendGet(`${this.BASE_URL}v1/homecolumn/?nested=1`);
    }

    getPatientsHeaders() {
        return this.af.sendGet(`${this.BASE_URL}v1/patient/patient_headers/`);
    }

    copyNestedColumn(id) {
        return this.af.sendPost(`${this.BASE_URL}v1/homecolumn/${id}/copy_column/?nested=1`, {});
    }

    getCellForAdminView(id) {
        return this.af.sendGet(`${this.BASE_URL}v1/homecell/${id}/?nested=1`);
    }

    createCell(data) {
        return this.af.sendPost(`${this.BASE_URL}v1/homecell/`, data);
    }

    updateCell(id, data) {
        return this.af.sendPatch(`${this.BASE_URL}v1/homecell/${id}/`, data);
    }


    setPatientOrder(id, data) {
        return this.af.sendPost(`${this.BASE_URL}v1/doctor/${id}/set_patient_order/`, data);
    }

    lockNestedCell(id, data) {
        return this.af.sendPost(`${this.BASE_URL}v1/homecell/${id}/lock_cell/`, data);
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
                        store.dispatch(new CopyNestedColumn(wsEvent.update));
                    }
                }
                break;

            case 'column_updated':
                if (wsEvent.doctor_remote_id !== this.userId) {
                    if (existedData.some(item => item.id === wsEvent.update.id)) {
                        store.dispatch(new UpdateNestedColumn(wsEvent.update));
                    }
                }
                break;

            case 'column_deleted':
                if (wsEvent.doctor_remote_id !== this.userId) {
                    const columnToDelete = existedData.find(item => item.id === wsEvent.update);
                    if (columnToDelete) {
                        store.dispatch(new HideNestedColumn(columnToDelete.id));
                    }
                }
                break;

            case 'cell_updated':
                if (wsEvent.doctor_remote_id !== this.userId) {
                    const updateNeeded = existedData.some(column => {
                        return column.cells.some(cell => cell.id === wsEvent.update.id);
                    });
                    if (updateNeeded) {
                        store.dispatch(new EditNestedCell(wsEvent.update));
                    }
                }
                break;

            case 'cell_created':
                if (wsEvent.doctor_remote_id !== this.userId) {
                    const columnFound = existedData.some(column => {
                        return column.group_id === wsEvent.update.cell.column_group_id;
                    });

                    if (columnFound) {
                        store.dispatch(
                            new CreateCell(wsEvent.update)
                        );
                    } else {
                        store.dispatch(
                            new CreateColumnFromSocket([wsEvent.update.cell, wsEvent.update.new_columns])
                        );
                    }
                }
                break;
            case 'message_created':
                if (wsEvent.doctor_remote_id !== this.userId) {
                    store.dispatch(
                        new UpdateChatFromSocket(wsEvent.update.chat_history)
                    );
                }
                break;
        }
    }
}
