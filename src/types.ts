
export interface Vector {
    x: number;
    y: number;
}

export interface Entity {
    address: string;
    velocity: Vector;
    position: Vector;
    rotation: number;
    oldPosition?: Vector;
    time?: number;
    oldTime?: number;
}

export type Address = string;