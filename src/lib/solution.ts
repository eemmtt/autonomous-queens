interface Flag{
    x: number,
    y: number,
    regionID: number
}

export interface SolutionDescription{
    gridSize: number,
    solution: number[][],
    flags: Flag[],
}

function randomNonAdjacentArray(n: number) {
    const start = performance.now();
    // Create groups using array methods
    const evens = Array.from({length: Math.ceil(n/2)}, (_, i) => i*2).filter(x => x < n);
    const odds = Array.from({length: Math.ceil(n/2)}, (_, i) => i*2+1).filter(x => x < n);
    
    // Shuffle both groups and randomize their order
    const result = Math.random() < 0.5 ? 
        [...evens.sort(() => Math.random() - 0.5), ...odds.sort(() => Math.random() - 0.5)] : 
        [...odds.sort(() => Math.random() - 0.5), ...evens.sort(() => Math.random() - 0.5)]
    ;

    console.log("randomNonAdjacentArray in", performance.now() - start, "ms");
    return result;
}

function checkArray(arr: number[]){
    //check each array element is not adjacent to it's real neighbor (abs(a - b) != 1)
    return arr.every((num, i) => i === 0 || Math.abs(num - arr[i-1]) !== 1);
}


function shuffleArray(arr: number[]){
    const newArr = arr.slice();
    for (let i = 0; i < arr.length; i++) {
        const randomIndex = Math.floor(Math.random() * arr.length);
        [newArr[i], newArr[randomIndex]] = [newArr[randomIndex], newArr[i]];
    }
    return newArr;
}


export function generateSolution(gridSize:number): SolutionDescription {
    const start = performance.now();
    let initArr: number[] = randomNonAdjacentArray(gridSize);
    //generate 1d arrays until we get a valid array
    while (!checkArray(initArr)){
        initArr = randomNonAdjacentArray(gridSize);
    }

    // use the 1d initArray to generate a 2d solution grid
    // initArray's index : value is the column : row of each flag
    const regionMap = shuffleArray(Array.from(Array(gridSize).keys()));
    const solution: number[][] = [];
    const flags: Flag[] = []
    initArr.forEach((ele,i) => {
        const newArr = new Array(gridSize).fill(0);
        newArr[ele] = 1;
        solution.push(newArr);
        flags.push({
            x: i,
            y: ele,
            regionID: regionMap[i],
        })
        //console.log(newArr);
    });

    console.log("generateSolution in", performance.now() - start, "ms");

    return {
        gridSize: gridSize,
        solution: solution,
        flags: flags,
    };
}
  
  
export function generateRegions(desc: SolutionDescription): number[][] {
    const start = performance.now();
    const { gridSize, flags } = desc;

    // Initialize grid with -1 (unassigned)
    const grid: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(-1));

    // Place flags on the grid
    for (const flag of flags) {
        grid[flag.x][flag.y] = flag.regionID;
    }

    // Create individual queues for each region
    const queues: Map<number, Array<[number, number]>> = new Map();

    // Initialize each region's queue with its flag position
    for (const flag of flags) {
        queues.set(flag.regionID, [[flag.x, flag.y]]);
    }

    // Define directions with weighted preferences
    const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // up, right, down, left

    // Continue until all regions can't expand anymore
    let expansionHappened = true;
    while (expansionHappened) {
        expansionHappened = false;
        
        // Randomly shuffle the order in which regions expand
        const regionIDs = Array.from(queues.keys()).sort(() => Math.random() - 0.5);
        
        for (const regionID of regionIDs) {
        const queue = queues.get(regionID)!;
        
        if (queue.length === 0) continue;
        
        // Take a random cell from the front portion of the queue to add some unpredictability
        const frontPortion = Math.min(queue.length, 3);
        const randomIndex = Math.floor(Math.random() * frontPortion);
        const [x, y] = queue.splice(randomIndex, 1)[0];
        
        // Shuffle directions to add randomness
        const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
        
        // Try to expand in random directions
        const maxExpansions = Math.random() > 0.6 ? 1 : 2; // 60% chance to only expand in one direction
        let expansionCount = 0;
        
        for (const [dx, dy] of shuffledDirections) {
            if (expansionCount >= maxExpansions) break;
            
            const newX = x + dx;
            const newY = y + dy;
            
            // Check if the new position is within bounds and unassigned
            if (
            newX >= 0 && newX < gridSize &&
            newY >= 0 && newY < gridSize &&
            grid[newX][newY] === -1
            ) {
            // Add some randomness - sometimes skip expanding even if possible
            if (Math.random() > 0.2) { // 80% chance to expand
                // Assign this cell to the current region
                grid[newX][newY] = regionID;
                expansionCount++;
                expansionHappened = true;
                
                // Only add to queue if it's not creating too wide a region
                if (Math.random() > 0.3) { // 70% chance to add to queue
                queue.push([newX, newY]);
                }
            }
            }
        }
        
        // Update the queue in the map
        queues.set(regionID, queue);
        }
    }

    // Fill any remaining unassigned cells
    // This is a fallback to ensure all cells are assigned
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
        if (grid[x][y] === -1) {
            // Find the nearest assigned cell's region
            let nearestRegion = -1;
            let minDistance = Infinity;
            
            for (let checkY = 0; checkY < gridSize; checkY++) {
            for (let checkX = 0; checkX < gridSize; checkX++) {
                if (grid[checkX][checkY] !== -1) {
                const distance = Math.abs(x - checkX) + Math.abs(y - checkY);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestRegion = grid[checkX][checkY];
                }
                }
            }
            }
            
            if (nearestRegion !== -1) {
            grid[x][y] = nearestRegion;
            }
        }
        }
    }

    console.log("generateRegions in", performance.now() - start, "ms");


    return grid;
}