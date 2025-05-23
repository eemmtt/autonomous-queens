import { regionMap } from "$lib/regions";
import { Flag } from "$lib/Flag";
import { lerp1d, lerp2d, messyTri, perpVecNormalized, randomSign, scratchLine } from "$lib/utils";
import { Container, Graphics, Point, Text } from "pixi.js";
import { game, GameState } from "$lib/model";

export class Cell{
    parent: Container;
    root: Container;
    ex: Container;
    flag: Container;
    p0: Point;
    p1: Point;
    p2: Point;
    p3: Point;
    center: Point;
    state: number;
    region: number;
    asFlag: Flag;


    constructor(pts: Point[], state: number, region: number, parent: Container, flagContainer: Container, indices: {x: number, y: number}){
        [this.p0, this.p1, this.p2, this.p3] = pts;
        this.center = new Point((pts[0].x + pts[1].x + pts[2].x + pts[3].x)/4, (pts[0].y + pts[1].y + pts[2].y + pts[3].y)/4);
        this.state = state;
        this.region = region;
        this.parent = parent;
        this.root = new Container();
        this.asFlag = new Flag(indices.x, indices.y, region);

        this.messyQuad(this.root, 4.5);
        
        this.ex = new Container();
        scratchLine(this.ex, lerp2d(this.p0, this.p2, 0.05), lerp2d(this.p2, this.p0, 0.05), 5, 0.1, 0x4f3032);
        scratchLine(this.ex, lerp2d(this.p1, this.p3, 0.05), lerp2d(this.p3, this.p1, 0.05), 5, 0.1, 0x4f3032);

        this.ex.visible = false;
        this.root.addChild(this.ex);

        this.flag = new Container();
        //flag pole + penant
        //TODO: make height proportional to cell height
        const flagEnd = new Point(this.center.x - 8, this.center.y - 40);
        const pendant0 = lerp2d(this.center, flagEnd, 0.9);
        const pendant2 = lerp2d(this.center, flagEnd, 0.5);
        const perpFlag = perpVecNormalized(this.center, flagEnd);
        const pendant1 = new Point(lerp1d(pendant2.x, pendant0.x, 0.6) + perpFlag.x * 30, lerp1d(pendant2.y, pendant0.y, 0.6) + perpFlag.y * 30);
        
        scratchLine(this.flag, this.center, flagEnd, 5, 0, 0x4f3032);
        scratchLine(this.flag, pendant0, pendant1, 5, 0, 0x4f3032);
        scratchLine(this.flag, pendant2, pendant1, 5, 0, 0x4f3032);
        messyTri(this.flag, pendant0, pendant1, lerp2d(pendant2, pendant1, 0.05), 1, 0x101721);

        //flag shadow
        const flagShadow = new Container();
        const shadowEnd = new Point(this.center.x + 25, this.center.y + 11);
        //const shad0 = lerp2d(this.center, shadowEnd, 0.9);
        //const shad2 = lerp2d(this.center, shadowEnd, 0.5);
        //const perpShad = perpVecNormalized(this.center, shadowEnd);
        //const shad1 = new Point(lerp1d(shad2.x, shad0.x, 0.6) + perpShad.x * -1 * 15, lerp1d(shad2.y, shad0.y, 0.6) + perpShad.y * -1 * 15);
        

        scratchLine(flagShadow, this.center, shadowEnd, 5, 0, 0x4f3032);
        //scratchLine(flagShadow, shad0, shad1, 5, 0, 0x4f3032);
        //scratchLine(flagShadow, shad2, shad1, 5, 0, 0x4f3032);
        //messyTri(flagShadow, shad0, shad1, lerp2d(shad2, shad1, 0.05), 2, 0x4f3032);

        flagShadow.blendMode = 'overlay';
        flagShadow.alpha = 0.4;

        this.flag.addChild(flagShadow);


        this.flag.visible = false;

        flagContainer.addChild(this.flag);



        
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
            this.flag.visible = false;
            game.updateFlags(this.asFlag);
        }
        if (newState == 1){
            //ex
            this.ex.visible = true;
        }
        if (newState == 2){
            //flag
            this.ex.visible = false;
            this.flag.visible = true;
            game.updateFlags(this.asFlag);
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
}