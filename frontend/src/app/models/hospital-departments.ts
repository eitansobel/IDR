export class Departament {
    hospital: number;
    id: number;
    title: string;

    constructor(departament) {
        [ this.hospital, this.id,  this.title ] = departament;
    }
}

export interface Departaments {
    departments: Departament[];
}
