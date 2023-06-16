import { string } from "yargs";

export interface Vector {
    x: number;
    y: number;
}

export interface Entity {
    address: string;
    velocity: Vector;
    position: Vector;
    oldPosition?: Vector;
    time?: number;
    oldTime?: number;
}