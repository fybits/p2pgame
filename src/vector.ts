
export interface Vector {
    x: number;
    y: number;
}


export const vectorLength = (vector: Vector): number => {
  return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
}

export const normalizedVector = (vector: Vector): Vector => {
  const length = vectorLength(vector);
  return { x: vector.x / length, y: vector.y / length };
}

export const distance = (a: Vector, b: Vector): number => {
  return vectorLength({ x: b.x - a.x, y: b.y - a.y });
}
