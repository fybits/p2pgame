import { Vector } from "./vector";

export interface Entity {
    address: string;
    velocity: Vector;
    position: Vector;
    rotation: number;
    oldRotation?: number;
    oldPosition?: Vector;
    time?: number;
    oldTime?: number;
    deleted?: boolean;
    health?: number;
}

export type Address = string;