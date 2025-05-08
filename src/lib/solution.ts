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
    return arr.every((num, i) => i === 0 || Math.abs(num - arr[i-1]) !== 1);
}

function generateSolution(gridSize:number): number[][] {
    let initArr: number[] = randomNonAdjacentArray(gridSize);
    while (!checkArray(initArr)){
        initArr = randomNonAdjacentArray(gridSize);
    }
    const solution: number[][] = [];
    initArr.forEach(ele => {
        const newArr = new Array(gridSize).fill(0);
        newArr[ele] = 1;
        solution.push(newArr);
        console.log(newArr);
    });
    return solution;
}
export const gridSize = 8;
export const solution = generateSolution(gridSize);