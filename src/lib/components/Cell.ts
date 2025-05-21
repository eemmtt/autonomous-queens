import { regionMap } from "$lib/regions";
import { lerp1d, lerp2d, perpVecNormalized, randomSign } from "$lib/utils";
import { Container, Graphics, Point, Text } from "pixi.js";

export class Cell{
    parent: Container;
    root: Container;
    ex: Container;
    p0: Point;
    p1: Point;
    p2: Point;
    p3: Point;
    center: Point;
    state: number;
    region: number;


    constructor(pts: Point[], state: number, region: number, parent: Container){
        [this.p0, this.p1, this.p2, this.p3] = pts;
        this.center = new Point((pts[0].x + pts[1].x + pts[2].x + pts[3].x)/4, (pts[0].y + pts[1].y + pts[2].y + pts[3].y)/4);
        this.state = state;
        this.region = region;
        this.parent = parent;
        this.root = new Container();

        this.messyQuad(this.root, 4.5);
        
        this.ex = new Container();
        this.scratchLine(this.ex, lerp2d(this.p0, this.p2, 0.05), lerp2d(this.p2, this.p0, 0.05), 5, 0.1, 0x4f3032);
        this.scratchLine(this.ex, lerp2d(this.p1, this.p3, 0.05), lerp2d(this.p3, this.p1, 0.05), 5, 0.1, 0x4f3032);

        //this.ex.visible = true;
        this.root.addChild(this.ex);
        
        //visualize winding
        /*
        const t0 = new Text({text: "0", style: {fontSize: 16}});
        t0.position.set(this.p0.x, this.p0.y);
        const t1 = new Text({text: "1", style: {fontSize: 16}});
        t1.position.set(this.p1.x - 16, this.p1.y);
        const t2 = new Text({text: "2", style: {fontSize: 16}});
        t2.position.set(this.p2.x - 16, this.p2.y - 16);
        const t3 = new Text({text: "3", style: {fontSize: 16}});
        t3.position.set(this.p3.x, this.p3.y - 16);
        this.root.addChild(t0, t1, t2, t3);
        */

        this.parent.addChild(this.root);
    }

    update(){
        const newState = (this.state + 1) % 3;
        if (newState == 0){
            //nothing
        }
        if (newState == 1){
            //ex
            this.ex.visible = true;
        }
        if (newState == 2){
            //flag
            this.ex.visible = false;
        }
        this.state = newState;
    }

    messyQuad(parent: Container, jitter: number) {
        //jitter pt positions
        const p0j = new Point(this.p0.x + (Math.random() - 0.5) * jitter, this.p0.y + (Math.random() - 0.5) * jitter);
        const p1j = new Point(this.p1.x + (Math.random() - 0.5) * jitter, this.p1.y + (Math.random() - 0.5) * jitter);
        const p2j = new Point(this.p2.x + (Math.random() - 0.5) * jitter, this.p2.y + (Math.random() - 0.5) * jitter);
        const p3j = new Point(this.p3.x + (Math.random() - 0.5) * jitter, this.p3.y + (Math.random() - 0.5) * jitter);

        const quad = new Graphics()
            .moveTo(p0j.x, p0j.y)
            .lineTo(p1j.x, p1j.y)
            .lineTo(p2j.x, p2j.y)
            .lineTo(p3j.x, p3j.y)
            .closePath()
            .fill(regionMap[this.region].color)
        ;
        parent.addChild(quad);
    }

    scratchLine(parent: Container, p0: Point, p1: Point, jitter: number, extension: number, color: number) {
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
}