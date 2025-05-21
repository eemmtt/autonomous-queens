import { Container, Graphics, Point } from "pixi.js";

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

export function messyTri(parent: Container, p0: Point, p1: Point, p2: Point, jitter: number, color: number) {
        //jitter pt positions
        const p0j = new Point(p0.x + (Math.random() - 0.5) * jitter, p0.y + (Math.random() - 0.5) * jitter);
        //const p1j = new Point(p1.x + (Math.random() - 0.5) * jitter, p1.y + (Math.random() - 0.5) * jitter);
        const p1j = p1;
        const p2j = new Point(p2.x + (Math.random() - 0.5) * jitter, p2.y + (Math.random() - 0.5) * jitter);

        const tri = new Graphics()
            .moveTo(p0j.x, p0j.y)
            .lineTo(p1j.x, p1j.y)
            .lineTo(p2j.x, p2j.y)
            .closePath()
            .fill(color)
        ;
        parent.addChild(tri);
}

export function scratchLine(parent: Container, p0: Point, p1: Point, jitter: number, extension: number, color: number) {
    //scratchline draws a thin triangle between two pts

    //randomly extend the line (up to extension %)
    const r0 = Math.random();
    const e0 = new Point(p0.x + (p0.x - p1.x) * (extension * r0), p0.y + (p0.y - p1.y) * (extension * r0));
    const r1 = Math.random();
    const e1 = new Point(p1.x + (p1.x - p0.x) * (extension * r1), p1.y + (p1.y - p0.y) * (extension * r1));

    // generate 3rd pt of triangle as random offset from either end-point of the line
    // this gives the appearence of the line having a direction
    let pj0, pj1;
    const rV = perpVecNormalized(p0, p1);
    const rS = randomSign();
    const rX = rV.x * lerp1d(0.2, 0.5, Math.random()) * rS;
    const rY = rV.y * lerp1d(0.2, 0.5, Math.random()) * rS;
    if (Math.random() < 0.5){
        pj0 = new Point(e0.x + rX * jitter, e0.y + rY * jitter);
        pj1 = new Point(e1.x + rX * jitter/2, e1.y + rY * jitter/2);
    } else {
        pj0 = new Point(e0.x + rX * jitter/2, e0.y + rY * jitter/2);
        pj1 = new Point(e1.x + rX * jitter, e1.y + rY * jitter);

    }
    const line = new Graphics()
        .moveTo(e0.x, e0.y)
        .lineTo(pj0.x, pj0.y)
        .lineTo(pj1.x, pj1.y)
        .lineTo(e1.x, e1.y)
        .closePath()
        .fill(color)
    ;
    parent.addChild(line);
}