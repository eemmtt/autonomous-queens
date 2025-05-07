import { Color, Container, Graphics, Rectangle, type FederatedPointerEvent } from "pixi.js";


export class Tile{
    root: Container;
    bg: Graphics;
    bgOutline: Graphics;
    region: number;
    trigger: (event: FederatedPointerEvent) => void;

    constructor(parent: Container, x: number, y: number, width: number, height: number){

        this.region = 0;

        this.root = new Container();
        this.root.eventMode = "static";
        this.root.hitArea = new Rectangle(0, 0, width, height);

        this.bg = new Graphics()
            .rect(0,0, width, height)
            .fill(0xffffff)
        ;
        this.bg.tint = new Color(0x2266bb);

        this.bgOutline = new Graphics()
            .rect(0,0, width, height)
            .stroke({ color: 0xff0000, pixelLine: true, width: 1})
        ;

        this.root.addChild(this.bg, this.bgOutline);


        this.trigger = (event: FederatedPointerEvent) => this.onClick(event);
        this.root.on("pointerdown", this.trigger);
        this.root.position.set(x, y);
        parent.addChild(this.root);
    }

    onClick(event: FederatedPointerEvent){
        this.bg.tint = new Color(0xbb6622);
    }
}