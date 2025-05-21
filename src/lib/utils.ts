import { Point } from "pixi.js";

export function lerp2d(from: Point, to: Point, amount: number){
    return new Point(from.x + (to.x - from.x) * amount, from.y + (to.y - from.y) * amount);
}

export function lerp1d(from: number, to: number, amount: number){
    return from + (to - from) * amount;
}

export function randomSign() {
    return Math.round(Math.random()) * 2 - 1;
}

export function perpVecNormalized(from: Point, to: Point) {
    const line = new Point(to.x - from.x, to.y - from.y);
    const dist = Math.sqrt(line.x * line.x + line.y * line.y);
    return new Point( -line.y / dist, line.x / dist);
}