import { regionMap } from "$lib/regions";
import { gridSize } from "$lib/solution";
import { Color, Container, Graphics, Rectangle, Sprite, Texture, type FederatedPointerEvent } from "pixi.js";

export interface TileTextures{
    flag: {
        up: Texture,
        down: Texture,
        bg: Texture
    },
    ex: Texture
}

export const tileStates = ["none", "ex", "queen"];

export class Tile{
    root: Container;
    bg: Graphics;
    bgOutline: Graphics;
    flagUp: Sprite;
    flagDwn: Sprite;
    flagBg: Sprite;
    ex: Sprite;
    state: number;
    region: number;
    trigger: (event: FederatedPointerEvent) => void;

    constructor(parent: Container, x: number, y: number, width: number, height: number, textures: TileTextures, region: number, isSolve: boolean){

        this.region = region;
        this.state = 0;

        this.root = new Container();
        this.root.eventMode = "static";
        this.root.hitArea = new Rectangle(0, 0, width, height);

        this.bg = new Graphics()
            .rect(0,0, width, height)
            .fill(0xffffff)
        ;

        this.bg.tint = new Color(regionMap[this.region].color);

        this.bgOutline = new Graphics()
            .rect(0,0, width, height)
            .stroke({ color: 0x000000, pixelLine: true, width: 3})
        ;
        this.root.addChild(this.bg, this.bgOutline);

        this.flagUp = new Sprite(textures.flag.up);
        this.flagUp.anchor.set(0,1);
        this.flagUp.scale.set(width/256);
        this.flagUp.position.set(0,height);
        this.flagUp.visible = isSolve;

        this.flagDwn = new Sprite(textures.flag.down);
        this.flagDwn.anchor.set(0,1);
        this.flagDwn.scale.set(width/256);
        this.flagDwn.position.set(0,height);
        this.flagDwn.visible = false;

        this.flagBg = new Sprite(textures.flag.bg);
        this.flagBg.anchor.set(0,1);
        this.flagBg.scale.set(width/256);
        this.flagBg.position.set(0,height);
        this.flagBg.blendMode = "soft-light";
        this.flagBg.alpha = 0.25;
        this.flagBg.visible = false;

        this.ex = new Sprite(textures.ex);
        this.ex.anchor.set(0,1);
        this.ex.scale.set(width/256);
        this.ex.position.set(0,height);
        this.ex.visible = false;

        this.root.addChild(this.ex, this.flagBg, this.flagDwn, this.flagUp);
        

        this.trigger = (event: FederatedPointerEvent) => this.onClick(event);
        this.root.on("pointerdown", this.trigger);
        this.root.position.set(x, y);
        parent.addChild(this.root);
    }

    onClick(event: FederatedPointerEvent){
        this.ex.visible = false;
        this.flagBg.visible = false;
        this.flagUp.visible = false;
        this.flagDwn.visible = false;


        this.state = (this.state + 1) % tileStates.length;
        if (tileStates[this.state] == 'none'){
            console.log("onClick none");
        }
        if (tileStates[this.state] == 'ex'){
            //this.bg.tint = new Color(0xbb6a22);
            this.ex.visible = true;
        }
        if (tileStates[this.state] == 'queen'){
            //this.bg.tint = new Color(0x226622);
            this.flagUp.visible = true;
            this.flagBg.visible = true;
        }
    }
}