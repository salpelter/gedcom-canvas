export class Node {
    level: number;
    tag: string;
    payload: string;

    constructor(level: number, tag: string, payload: string) {
        this.level = level;
        this.tag = tag;
        this.payload = payload;
    }
}