import { regionMap } from "$lib/regions";
import { Container, Graphics, Point, Text } from "pixi.js";

export class Cell{
    parent: Container;
    root: Container;
    ex: Graphics;
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
        
        this.ex = new Graphics()
            .circle(this.center.x, this.center.y, 5)
            .fill(0xFF0000)
        ;
        this.ex.visible = false;
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
        console.log("update squak");
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
}