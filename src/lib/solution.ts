function randomNonAdjacentArray(n: number) {
    // Create groups using array methods
    const evens = Array.from({length: Math.ceil(n/2)}, (_, i) => i*2).filter(x => x < n);
    const odds = Array.from({length: Math.ceil(n/2)}, (_, i) => i*2+1).filter(x => x < n);
    
    // Shuffle both groups and randomize their order
    return Math.random() < 0.5 ? 
        [...evens.sort(() => Math.random() - 0.5), ...odds.sort(() => Math.random() - 0.5)] : 
        [...odds.sort(() => Math.random() - 0.5), ...evens.sort(() => Math.random() - 0.5)];
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

interface Flag{
    x: number,
    y: number,
    regionID: number
}

interface SolutionDescription{
    gridSize: number,
    solution: number[][],
    flags: Flag[],
}

function generateSolution(gridSize:number): SolutionDescription {
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
    return {
        gridSize: gridSize,
        solution: solution,
        flags: flags,
    };
}
export const gridSize = 8;
export const solution: SolutionDescription = generateSolution(gridSize);

interface Flag {
    x: number;
    y: number;
    regionID: number;
  }
  
  interface SolutionDescription {
    gridSize: number;
    solution: number[][];
    flags: Flag[];
  }
  
  function generateRegions(desc: SolutionDescription): number[][] {
    const { gridSize, flags } = desc;
    
    // Initialize grid with -1 (unassigned)
    const grid: number[][] = Array(gridSize).fill(0).map(() => Array(gridSize).fill(-1));
    
    // Place flags on the grid
    for (const flag of flags) {
      grid[flag.x][flag.y] = flag.regionID;
    }
    
    // Create a queue for BFS
    const queue: [number, number, number][] = []; // [x, y, regionID]
    
    // Add all flag positions to the queue
    for (const flag of flags) {
      queue.push([flag.x, flag.y, flag.regionID]);
    }
    
    // Define directions: up, right, down, left
    const directions = [[0, -1], [1, 0], [0, 1], [-1, 0]];
    
    // Grow regions using BFS
    while (queue.length > 0) {
      const [x, y, regionID] = queue.shift()!;
      
      // Check all four adjacent cells
      for (const [dx, dy] of directions) {
        const newX = x + dx;
        const newY = y + dy;
        
        // Check if the new position is within bounds and unassigned
        if (
          newX >= 0 && newX < gridSize &&
          newY >= 0 && newY < gridSize &&
          grid[newX][newY] === -1
        ) {
          // Assign this cell to the current region
          grid[newX][newY] = regionID;
          
          // Add this cell to the queue for further expansion
          queue.push([newX, newY, regionID]);
        }
      }
    }
    
    // Check if there are any unassigned cells (-1)
    // If we have unassigned cells, it means our flags couldn't reach all areas
    const hasUnassignedCells = grid.some(row => row.some(cell => cell === -1));
    if (hasUnassignedCells) {
      console.warn("Warning: Some cells could not be assigned to any region!");
    }
    
    return grid;
  }
  
  function generateRegions2(desc: SolutionDescription): number[][] {
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
    
    return grid;
  }

  export const regions = generateRegions2(solution);