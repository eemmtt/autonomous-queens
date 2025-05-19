import { derived, writable } from "svelte/store";
import { generateSolution, generateRegions, type SolutionDescription } from "./solution";

interface GameModel{
    gridSize: number,
    solution: SolutionDescription,
    regions: number[][],
    startTime: number,
}

function createGameStore(){
    const gridSize = 8;
    const solution =  generateSolution(gridSize);
    const regions = generateRegions(solution);


    const { subscribe, set, update } = writable<GameModel>({
        gridSize: gridSize,
        solution: solution,
        regions: regions,
        startTime: Date.now(),
    });

    return {
        subscribe,
        reset: (gridSize: number) => update((store) => {
            const newSolution = generateSolution(gridSize);
            const newRegions = generateRegions(newSolution);
            
            return {
                ...store,
                gridSize: gridSize,
                solution: newSolution,
                regions: newRegions,
                startTime: Date.now(),
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