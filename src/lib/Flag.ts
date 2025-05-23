export class Flag{
    x: number;
    y: number;
    region: number;

    constructor(x: number, y: number, region: number){
        this.x = x;
        this.y = y;
        this.region = region;
    }

    isEqual(f: Flag): boolean{
        return f.x == this.x && f.y == this.y && f.region == this.region;
    }

}