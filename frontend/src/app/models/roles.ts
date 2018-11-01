export class Role {
    hospital: number;
    id: number;
    title: string;
    remote_role: number;

    constructor(role) {
        [ this.hospital, this.id,  this.remote_role, this.title ] = role;
    }
}

export interface Roles {
    roles: Role[];
}

