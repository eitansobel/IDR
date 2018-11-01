import {Injectable} from '@angular/core';
import {Profile} from '../models/profile';
import {AppState} from '../redux/app.state';
import {Store} from '@ngrx/store';
import {DataColumns} from '../models/data-columns';


@Injectable()
export class UserPermissionService {
    private userProfile: Profile;
    private userCreateDataColumnPermission: boolean = false;
    private userCanEditDataColumnPermission: boolean = false;
    private userCanCopyDataColumnPermission: boolean = false;

    constructor(private store: Store<AppState>) {
        this.store.select('profilePage').map(data => data.profile).subscribe((_profile: Profile) => {
            this.userProfile = _profile;
            this.userCreateDataColumnPermission = _profile.create_data_cell_permission || _profile.is_admin;
            this.userCanEditDataColumnPermission = _profile.edit_data_cell_permission || _profile.is_admin;
            this.userCanCopyDataColumnPermission = _profile.export_permission || _profile.is_admin;
        });
    }

    get userIsAdmin(): boolean {
        return this.userProfile.is_admin;
    }

    get userCanCreateDataColumn(): boolean {
        return this.userCreateDataColumnPermission || this.userIsAdmin;
    }

    get userCanEditDataColumn(): boolean {
        return this.userCanEditDataColumnPermission || this.userIsAdmin;
    }

    get userCanCopyDataColumn(): boolean {
        return this.userCanCopyDataColumnPermission || this.userIsAdmin;
    }

    userCanSeeColumnButton(actionType, columnInstance): boolean {
        if (actionType === 'edit') {
            return this.userCanEditDataColumn ||
                this.userCanCreateDataColumn && columnInstance.author.id === this.userProfile.remote_id;
        }

        if (actionType === 'delete') {
            return this.userCanCreateDataColumn && columnInstance.author.id === this.userProfile.remote_id ||
                this.userIsAdmin;
        }

        if (actionType === 'copyIsAllowed') {
            const copy_allowed = !columnInstance.authors_in_group.includes(this.userProfile.remote_id);
            return copy_allowed && this.userCanCopyDataColumn;
        }
    }

    userCanSeeCellButton(actionType, cellInstance, columnInstance): boolean {
        if (actionType === 'editCell') {
            return cellInstance && (this.userCanEditDataColumn && !cellInstance.is_private ||
                columnInstance.author.id === this.userProfile.remote_id || this.userIsAdmin);
        }
    }

    userCanCreateCellOrField(columnInstance): boolean {
        return this.userCanCreateDataColumn && columnInstance.author.id === this.userProfile.remote_id ||
            this.userIsAdmin;
    }

    userCanLockCell(cellInstance): boolean {
        return cellInstance.author === this.userProfile.remote_id || this.userIsAdmin;
    }

    userCanSeeLockButton(cellInstance, columnInstance): boolean {
        return this.userCanLockCell(cellInstance) && columnInstance.author.id === this.userProfile.remote_id ||
            this.userIsAdmin;
    }

    userCanEditCellField(fieldInstance): boolean {
        return this.userCanEditDataColumn || fieldInstance.author === this.userProfile.remote_id;
    }

    userCanDeleteCellField(fieldInstance): boolean {
        return this.userCanCreateDataColumn && fieldInstance.author === this.userProfile.remote_id ||
            this.userIsAdmin;
    }
}
