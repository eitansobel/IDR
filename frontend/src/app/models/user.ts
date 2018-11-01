export class User {
    id: number;
    username: string;
    password: string;
    sign_out: string;
    constructor(username: string, password: string, sign_out?: string) {
        this.username = username;
        this.password = password;
        this.sign_out = sign_out;
    }
}
