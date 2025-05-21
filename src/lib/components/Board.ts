import { regionMap } from "$lib/regions";
import { Container, FederatedPointerEvent, Graphics, Point, Rectangle } from "pixi.js";
import { Cell } from "./Cell";


export class Board{
    root: Container;
    bg: Container;
    fg: Container;
    quadPts: Point[];
    cells: Cell[][];
    trigger: (event: FederatedPointerEvent) => void;


    constructor(parent: Container, containerWidth: number, containerHeight: number, regions: number[][], gridSize: number){
        const start = performance.now();

        this.root = new Container();
        this.root.hitArea = new Rectangle(0,0,containerWidth,containerHeight);
        this.root.eventMode = 'static';

        this.bg = new Container();
        this.fg = new Container();

        const inset = 50;
        const rScale = 20;
        const p0 = new Point(inset + (Math.random() - 0.5) * rScale, inset + (Math.random() - 0.5) * rScale);
        const p1 = new Point(containerWidth - inset + (Math.random() - 0.5) * rScale, inset + (Math.random() - 0.5) * rScale);
        const p2 = new Point(containerWidth - inset + (Math.random() - 0.5) * rScale, containerHeight - inset + (Math.random() - 0.5) * rScale);
        const p3 = new Point(inset + (Math.random() - 0.5) * rScale, containerHeight - inset + (Math.random() - 0.5) * rScale);
        this.quadPts = [p0, p1, p2, p3];

        const grid = new Graphics()
            .poly([p0,p1,p2,p3], true)
            .fill(0x61aec2)
        ;
        this.bg.addChild(grid);

        const gridPts: Point[][] = this.calcGrid(p0, p1, p2, p3, gridSize, 0.05);
        this.cells = this.calcCells(gridPts, gridSize, regions, this.bg);
        

        //debugging gridpts
        /*
        for (let y = 0; y < gridPts[0].length; y++) {
            for (let x = 0; x < gridPts.length; x++) {
                const dot = new Graphics()
                    .circle(gridPts[y][x].x, gridPts[y][x].y, 3)
                    .fill(0xFF0000)
                ;
                this.fg.addChild(dot);
            }
            
        }
        */

        for (let i = 0; i < gridPts[0].length; i++) {
            //draw grid lines with random splits
            if (Math.random() < 0.4){
                this.scratchLine(this.bg, gridPts[0][i], gridPts[gridPts[0].length - 1][i], 5, 0.05, 0x4f3014);
            } else {
                const split = Math.floor(Math.random() * gridPts.length);
                this.scratchLine(this.bg, gridPts[0][i], gridPts[split][i], 7, 0.025, 0x4f3014);
                this.scratchLine(this.bg, gridPts[split][i], gridPts[gridPts[0].length - 1][i], 7, 0.025, 0x4f3014);
            }

            if (Math.random() < 0.4){
                this.scratchLine(this.bg, gridPts[0][i], gridPts[gridPts[0].length - 1][i], 5, 0.05, 0x4f3014);
            } else {
                const split = Math.floor(Math.random() * gridPts.length);
                this.scratchLine(this.bg, gridPts[i][0], gridPts[i][split], 7, 0.025, 0x4f3014);
                this.scratchLine(this.bg, gridPts[i][split], gridPts[i][gridPts[0].length - 1], 7, 0.025, 0x4f3014);
            }
        }


        this.root.addChild(this.bg, this.fg);
        parent.addChild(this.root);

        this.trigger = (event) => this.onClick(event, this.quadPts, this.cells);
        this.root.on('pointerdown', this.trigger);
        console.log("Board constructor in", performance.now() - start, "ms");

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
        let pj;
        if (Math.random() < 0.5){
            pj = new Point(e0.x + (Math.random() - 0.5) * jitter, e0.y + (Math.random() - 0.5) * jitter);
        } else {
            pj = new Point(e1.x + (Math.random() - 0.5) * jitter, e1.y + (Math.random() - 0.5) * jitter);
        }
        const line = new Graphics()
            .moveTo(e0.x, e0.y)
            .lineTo(pj.x, pj.y)
            .lineTo(e1.x, e1.y)
            .closePath()
            .fill(color)
        ;
        parent.addChild(line);
    }

    messyQuad(parent: Container, cell: Cell, jitter: number) {
        const p0j = new Point(cell.p0.x + (Math.random() - 0.5) * jitter, cell.p0.y + (Math.random() - 0.5) * jitter);
        const p1j = new Point(cell.p1.x + (Math.random() - 0.5) * jitter, cell.p1.y + (Math.random() - 0.5) * jitter);
        const p2j = new Point(cell.p2.x + (Math.random() - 0.5) * jitter, cell.p2.y + (Math.random() - 0.5) * jitter);
        const p3j = new Point(cell.p3.x + (Math.random() - 0.5) * jitter, cell.p3.y + (Math.random() - 0.5) * jitter);

        const quad = new Graphics()
            .moveTo(p0j.x, p0j.y)
            .lineTo(p1j.x, p1j.y)
            .lineTo(p2j.x, p2j.y)
            .lineTo(p3j.x, p3j.y)
            .closePath()
            .fill(regionMap[cell.region].color)
        ;
        parent.addChild(quad);
    }

    lineIntersection(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
        const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        /*
        if (denom === 0) {
          return null; // Lines are parallel
        }
        */

        const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denom;
        const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denom;
      
        return new Point(px, py);
      }

    calcGrid(p0: Point, p1: Point, p2: Point, p3: Point, gridSize: number, jitter: number): Point[][]{
        //generate a grid within the quad defined by p0-p3, with gridSize subdivisions
        //jitter is a decimal percentage e.g., 0.05
        const gridPts: Point[][] = [];

        //distribute pts along the edges of the quad
        const leftPts = this.distribPts(p0, p3, gridSize, jitter);
        const rightPts = this.distribPts(p1, p2, gridSize, jitter);
        const topPts = this.distribPts(leftPts[0], rightPts[0], gridSize, jitter);
        const botPts = this.distribPts(leftPts[leftPts.length - 1], rightPts[rightPts.length - 1], gridSize, jitter);

        //interpolate between the edge pts to define grid vertices
        gridPts.push(leftPts);
        for (let x = 1; x < topPts.length - 1; x++) {
            const newPts: Point[] = [];
            for (let y = 0; y < leftPts.length; y++) {
                if (y == 0){
                    newPts.push(topPts[x]);
                } else if (y == leftPts.length - 1){
                    newPts.push(botPts[x]);
                } else {
                    newPts.push(this.lineIntersection(leftPts[y].x, leftPts[y].y, rightPts[y].x, rightPts[y].y, topPts[x].x, topPts[x].y, botPts[x].x, botPts[x].y));
                }
            }
            gridPts.push(newPts);
        }
        gridPts.push(rightPts);
        return gridPts;
    }

    distribPts(lStart: Point, lEnd: Point, count: number, jitter: number): Point[] {
        //~evenly distribute Count number of points along a line between lStart and lEnd
        const newPts: Point[] = [];
        for (let i = 0; i <= count; i++) {
            const rX = (Math.random() - 0.5) * jitter;
            const rY = (Math.random() - 0.5) * jitter;
            const x = ((i / count) + rX) * (lEnd.x - lStart.x) + lStart.x;
            const y = ((i / count) + rY) * (lEnd.y - lStart.y) + lStart.y;
            newPts.push( new Point(x, y));
        }

        return newPts;
    }

    calcCells(pts: Point[][], gridSize: number, regions: number[][], parent: Container): Cell[][]{
        const cells: Cell[][] = [];

        //pts.length will always be gridSize + 1
        for (let i = 0; i < gridSize; i++) {
            const newCells: Cell[] = [];
            for (let j = 0; j < gridSize; j++) {
                const qPts: Point[] = [
                    pts[j][i],     // current
                    pts[j+1][i],   // right
                    pts[j+1][i+1], // right-down
                    pts[j][i+1]    // down
                ];
                newCells.push( new Cell(qPts, 0, regions[j][i], parent));
            }
            cells.push(newCells);
        }

        return cells;
    }

    calcDir(p0: Point, p1: Point, m: Point) {
        const p0_p1 = new Point(p1.x - p0.x, p1.y - p0.y);
        const p0_m = new Point(m.x - p0.x,  m.y - p0.y);
        const cross = p0_p1.x * p0_m.y - p0_p1.y * p0_m.x;
        return cross < 0 ? -1 : 1;
    }

    insideQuad(pt: Point, cell: Cell){
        const d0 = this.calcDir(cell.p0, cell.p1, pt);
        const d1 = this.calcDir(cell.p1, cell.p2, pt);
        const d2 = this.calcDir(cell.p2, cell.p3, pt);
        const d3 = this.calcDir(cell.p3, cell.p0, pt);
        //console.log(cell.p0, cell.p1, cell.p2, cell.p3);
        //console.log(d0, d1, d2, d3);

        return {
            result: (d0 == d1 && d1 == d2 && d2 == d3),
            dirs: {
                north: d0,
                east: d1,
                south: d2,
                west: d3,
            },
        };
    } 

    onClick(event: FederatedPointerEvent, quad: Point[], cells: Cell[][]){
        //find limits of quad
        const xMin = Math.min(quad[0].x, quad[3].x);
        const xMax = Math.max(quad[1].x, quad[2].x);
        const yMin = Math.min(quad[0].y, quad[1].y);
        const yMax = Math.max(quad[2].y, quad[3].y);

        //return if outside quad limits
        if (event.globalX < xMin || event.globalX > xMax || event.globalY < yMin || event.globalY > yMax){
            return;
        }

        //estimate cell based on quad limits
        const xIndex = Math.floor(((event.globalX - xMin) / (xMax - xMin)) * cells.length);
        const yIndex = Math.floor(((event.globalY - yMin) / (yMax - yMin)) * cells[0].length);

        const testCell = cells[yIndex][xIndex];
        const initTest = this.insideQuad(event.global, testCell);
        //console.log(initTest.dirs, [xIndex, yIndex]);
        if (initTest.result == true){
            testCell.update();
        } else {
            //check nearby cells
            if (initTest.dirs.north < 0 && yIndex - 1 >= 0){
                const northCell = cells[yIndex - 1][xIndex];
                const nTest = this.insideQuad(event.global, northCell);
                if (nTest.result == true){
                    northCell.update();
                }
                return;
            }
            if (initTest.dirs.east < 0 && xIndex + 1 < cells.length){
                const eastCell = cells[yIndex][xIndex + 1];
                const eTest = this.insideQuad(event.global, eastCell);
                if (eTest.result == true){
                    eastCell.update();
                }
                return;
            }
            if (initTest.dirs.south < 0 && yIndex + 1 < cells[0].length){
                const southCell = cells[yIndex + 1][xIndex];
                const sTest = this.insideQuad(event.global, southCell);
                if (sTest.result == true){
                    southCell.update();
                }
                return;                
            }
            if (initTest.dirs.west < 0 && xIndex - 1 >= 0){
                const westCell = cells[yIndex][xIndex - 1];
                const wTest = this.insideQuad(event.global, westCell);
                if (wTest.result == true){
                    westCell.update();
                }
                return;
            }

            console.log("couldn't find the correct cell!")

        }

    }
}