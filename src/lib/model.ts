import { derived, readable, writable } from "svelte/store";
import { generateSolution, generateRegions } from "./solution";
import type { Flag } from "./Flag";

export enum GameState{
    "loading",
    "inProgress",
    "win"
}

interface GameModel{
    id: number,
    gridSize: number,
    solution: number[][],
    regions: number[][],
    startTime: number,
    endTime: number,
    state: GameState
    placedFlags: number[][],
    numCurrFlags: number,
    notifications: string,
    annotations: number[][],
}

function createGameStore(){
    const gridSize = 8;
    const solutionDesc =  generateSolution(gridSize);
    const regions = generateRegions(solutionDesc);
    const initPlacedFlags =  Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));


    const { subscribe, set, update } = writable<GameModel>({
        id: Date.now(),
        gridSize: gridSize,
        solution: solutionDesc.solution,
        regions: regions,
        startTime: Date.now(),
        endTime: -1,
        state: GameState.inProgress,
        placedFlags: initPlacedFlags,
        numCurrFlags: 0,
        notifications: "",
        annotations: initPlacedFlags.slice(),
    });

    return {
        subscribe,
        reset: (gridSize: number) => update((store) => {
            const newSolutionDesc = generateSolution(gridSize);
            const newRegions = generateRegions(newSolutionDesc);
            const initPlacedFlags =  Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));

            
            return {
                ...store,
                id: Date.now(),
                gridSize: gridSize,
                solution: newSolutionDesc.solution,
                regions: newRegions,
                startTime: Date.now(),
                endTime: -1,
                state: GameState.inProgress,
                placedFlags: initPlacedFlags,
                numCurrFlags: 0,
                notifications: "",
                annotations: initPlacedFlags.slice(),
            }
        }),
        updateState: (state: GameState) => update((store) => {
            const newState = state;

            return {
                ...store,
                state: newState
            }
        }),
        updateFlags: (flag: Flag) => update((store) => {
            const updatedFlags = store.placedFlags;
            let updatedCount = store.numCurrFlags;
            
            //toggle flag
            if (updatedFlags[flag.y][flag.x] == 1){
                updatedFlags[flag.y][flag.x] = 0;
                updatedCount -= 1;
                
            } else {
                updatedFlags[flag.y][flag.x] = 1;
                updatedCount += 1;
            }

            /*
            //return if there aren't enough flags to bother checking for a win
            if (updatedCount != gridSize){
                //console.log("Escape because flagCount ==", updatedCount);
                return {
                    ...store,
                    placedFlags: updatedFlags,
                    state: GameState.inProgress,
                    numCurrFlags: updatedCount,
                }
            }
            */

            /*
            //check for expected win (placedFlags == solution flags)
            let gameWon = true;
            for (let y = 0; y < store.solution.length; y++) {
                for (let x = 0; x < store.solution[y].length; x++) {
                    if (updatedFlags[y][x] != store.solution[y][x]){
                        gameWon = false;
                        break;
                    }
                }    
                if (gameWon == false) {
                    break;
                }
            }
            */

            const start = performance.now();
            //check for unexpected win (and log)
            let gameWonUnexpected = updatedCount == gridSize ? true : false; //win only possible if gridSize number of flags placed
            const rows = Array(gridSize).fill(0);
            const cols = Array(gridSize).fill(0);
            const regs = Array(gridSize).fill(0);
            const dirs = [{x:-1,y:-1}, {x:0,y:-1}, {x:1,y:-1}, {x:-1,y:0}, {x:1,y:0}, {x:-1,y:1}, {x:0,y:1}, {x:1,y:1}];
            let notif = "";
            const updatedAnnotations: number[][] =  Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));

            for (let y = 0; y < updatedFlags.length; y++) {
                for (let x = 0; x < updatedFlags[y].length; x++) {
                    //console.log("Start unexpected check: y =", y, ",x =", x);
                    if (updatedFlags[y][x] == 1){
                        if (rows[y] != 1){
                            rows[y] = 1;
                        } else {
                            //row collision
                            notif += `2 or more flags in row ${y};`;
                            const filledRow = Array(gridSize).fill(1);
                            updatedAnnotations[y] = filledRow.slice();

                            gameWonUnexpected = false;
                            
                        }

                        if (cols[x] != 1){
                            cols[x] = 1;
                        } else {
                            //col collision
                            console.log("column collision?");
                            notif += `2 or more flags in column ${x};`;
                            updatedAnnotations.forEach((row) => row[x] = 1);

                            gameWonUnexpected = false;

                        }

                        const flagRegion = store.regions[y][x];
                        if (regs[flagRegion] != 1){
                            regs[flagRegion] = 1;
                        } else {
                            //region collision
                            notif += `2 or more flags in color region;`;
                            //fill region in
                            for (let v = 0; v < store.regions.length; v++) {
                                for (let u = 0; u < store.regions[0].length; u++) {
                                    if (store.regions[v][u] == store.regions[y][x]){
                                        updatedAnnotations[v][u] = 1;
                                    }
                                }
                            }

                            gameWonUnexpected = false;

                        }

                        dirs.forEach((dir) => {
                            const newX = x + dir.x;
                            const newY = y + dir.y;

                            //check if outside bounds
                            const skip = newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize ? false : true;

                            if (skip == false && updatedFlags[newY][newX] == 1){
                                //console.log("Flag at ", x, y, "has neighbor at", newX, newY);
                                //adjacent flag
                                notif += `flags must not be adjacent;`;
                                //fill adjacent in, nasty style
                                dirs.forEach((dir) => {
                                    const newX = x + dir.x;
                                    const newY = y + dir.y;

                                    //check if outside bounds
                                    const skip = newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize ? false : true;
                                    if (skip == false){
                                        updatedAnnotations[newY][newX] = 1;
                                    }
                                })

                                gameWonUnexpected = false;

                            }
                        })

                    }
                }    
            }
            console.log("Checked for win in:", performance.now() - start, "ms");


            //if (gameWon || gameWonUnexpected){
            if (gameWonUnexpected){
                const newEndTime = Math.floor((Date.now() - store.startTime) / 1000);
                return {
                    ...store,
                    endTime: newEndTime,
                    placedFlags: updatedFlags,
                    state: GameState.win,
                    numCurrFlags: updatedCount,
                    notifications: "",
                    annotations: Array(gridSize).fill(null).map(() => Array(gridSize).fill(0)),
                }
            } else {
                return {
                    ...store,
                    placedFlags: updatedFlags,
                    state: GameState.inProgress,
                    numCurrFlags: updatedCount,
                    notifications: notif,
                    annotations: updatedAnnotations,
                }
            }

        }),

    }
}

export const game = createGameStore();

export const currTime = readable(Date.now(), function start(set) {
	const interval = setInterval(() => {
		set(Date.now());
	}, 100);

	return function stop() {
		clearInterval(interval);
	};
});

export const getGridSize = derived(
    game, 
    $store => $store.gridSize
);

export const getRegions = derived(
    game, 
    $store => $store.regions
);

export const getGameState = derived(
    game, 
    $store => $store.state
);

export const getSolution = derived(
    game, 
    $store => $store.solution
);

export const getGameId = derived(
    game, 
    $store => $store.id
);

export const getGameStartTime = derived(
    game, 
    $store => $store.startTime
);

export const getGameEndTime = derived(
    game, 
    $store => $store.endTime
);

export const getGameNotifications = derived(
    game, 
    $store => $store.notifications
);

export const getGameAnnotations = derived(
    game, 
    $store => $store.annotations
);