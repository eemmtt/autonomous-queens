import { derived, writable } from "svelte/store";
import { generateSolution, generateRegions, type SolutionDescription, type Flag } from "./solution";

export enum GameState{
    "loading",
    "inProgress",
    "win"
}

interface GameModel{
    gridSize: number,
    solution: number[][],
    regions: number[][],
    startTime: number,
    state: GameState
    placedFlags: number[][],
    numCurrFlags: number
}

function createGameStore(){
    const gridSize = 8;
    const solutionDesc =  generateSolution(gridSize);
    const regions = generateRegions(solutionDesc);
    const initPlacedFlags =  Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));


    const { subscribe, set, update } = writable<GameModel>({
        gridSize: gridSize,
        solution: solutionDesc.solution,
        regions: regions,
        startTime: Date.now(),
        state: GameState.inProgress,
        placedFlags: initPlacedFlags,
        numCurrFlags: 0,
    });

    return {
        subscribe,
        reset: (gridSize: number) => update((store) => {
            const newSolutionDesc = generateSolution(gridSize);
            const newRegions = generateRegions(newSolutionDesc);
            const initPlacedFlags =  Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));

            
            return {
                ...store,
                gridSize: gridSize,
                solution: newSolutionDesc.solution,
                regions: newRegions,
                startTime: Date.now(),
                state: GameState.inProgress,
                placedFlags: initPlacedFlags,
                numCurrFlags: 0,
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
            if (updatedFlags[flag.x][flag.y] == 1){
                updatedFlags[flag.x][flag.y] = 0;
                updatedCount -= 1;
                
            } else {
                updatedFlags[flag.x][flag.y] = 1;
                updatedCount += 1;
            }

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

            //check for expected win (placedFlags == solution flags)
            let gameWon = true;
            for (let y = 0; y < store.solution.length; y++) {
                for (let x = 0; x < store.solution[0].length; x++) {
                    if (updatedFlags[x][y] != store.solution[x][y]){
                        gameWon = false;
                        break;
                    }
                }    
                if (gameWon == false) {
                    break;
                }
            }

            //check for unexpected win (and log)
            let gameWonUnexpected = true;
            const rows = Array(gridSize).fill(0);
            const cols = Array(gridSize).fill(0);
            const regs = Array(gridSize).fill(0);
            const dirs = [{x:-1,y:-1}, {x:0,y:-1}, {x:1,y:-1}, {x:-1,y:0}, {x:1,y:0}, {x:-1,y:1}, {x:0,y:1}, {x:1,y:1}];

            for (let v = 0; v < updatedFlags.length; v++) {
                for (let u = 0; u < updatedFlags[0].length; u++) {
                    //console.log("Start unexpected check: y =", v, ",x =", u);
                    if (updatedFlags[u][v] == 1){
                        if (rows[u] != 1){
                            rows[u] = 1;
                        } else {
                            gameWonUnexpected = false;
                            break;
                        }

                        if (cols[v] != 1){
                            cols[v] = 1;
                        } else {
                            gameWonUnexpected = false;
                            break;
                        }

                        const flagRegion = store.regions[u][v];
                        if (regs[flagRegion] != 1){
                            regs[flagRegion] = 1;
                        } else {
                            gameWonUnexpected = false;
                            break;
                        }

                        dirs.forEach((dir) => {
                            const skip = u+dir.x >= 0 && u+dir.x < gridSize && v+dir.y >= 0 && v+dir.y < gridSize? false: true;

                            if (skip == false && updatedFlags[u+dir.x][v+dir.y] == 1){
                                //console.log("Flag at ", u, v, "has neighbor at", xClamped, yClamped);
                                gameWonUnexpected = false;
                            }
                        })

                    }
                }    
                if (gameWonUnexpected == false) {
                    break;
                }
            }



            if (gameWon || gameWonUnexpected){
                return {
                    ...store,
                    placedFlags: updatedFlags,
                    state: GameState.win,
                    numCurrFlags: updatedCount
                }
            } else {
                return {
                    ...store,
                    placedFlags: updatedFlags,
                    state: GameState.inProgress,
                    numCurrFlags: updatedCount
                }
            }

        }),

    }
}

export const game = createGameStore();

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