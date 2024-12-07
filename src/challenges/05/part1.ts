import { CanvasApp, runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
import { readFileStr } from "../../utils/input_reader.ts";

export interface ParsedInput {
    beforeRules: { [key: number]: number[] };
    afterRules: { [key: number]: number[] };
    updates: { pageNumbers: number[], isValid: boolean }[];
}

export interface Day05P1RenderData {
    output: string;
    input: ParsedInput;
}



function parseInput(input: string): ParsedInput {

    // Split input into rules (sectionA) and updates (sectionB)
    const [sectionA, sectionB] = input.split("\r\n\r\n");

    // Parse ordering rules
    const rules = sectionA.split("\r\n").reduce((acc, line) => {
        const [key, value] = line.split("|").map(Number);

         // Initialize arrays if not already present
        if(acc.beforeRules[value] === undefined) acc.beforeRules[value] = [];
        if(acc.afterRules[key] === undefined) acc.afterRules[key] = [];

        // Populate rules
        acc.afterRules[key].push(value);
        acc.beforeRules[value].push(key);
        
        return acc;

    }, {  beforeRules: {}, afterRules: {} } as {
          beforeRules: { [key: number]: number[] }, 
          afterRules: { [key: number]: number[] }
    });

    // Parse page number updates
    const pageNumbers = sectionB
        .split("\r\n")
        .map(line => line.split(',').map(Number))
        .map(pageNumbers => ({ pageNumbers, isValid: false }));

    return {
        beforeRules: rules.beforeRules,
        afterRules: rules.afterRules,
        updates: pageNumbers
    }
}

function isValidPageNumbers(pageNumbers: number[], beforeRules: { [key: number]: number[] }, afterRules: { [key: number]: number[] }) : boolean {
    
    for(let i=0; i<pageNumbers.length; i++) {

        const a = pageNumbers[i];

        for(let j=i+1; j<pageNumbers.length; j++) {
            
            const b = pageNumbers[j];

            if( (afterRules[b] !== undefined && afterRules[b].includes(a)) || (beforeRules[a] !== undefined && beforeRules[a].includes(b)) ) {
                return false;
            }
        }
    }

    return true;
}


export async function* solver(filePath: string): AsyncGenerator<Day05P1RenderData> {

    const data: Day05P1RenderData = { output: "", input: { beforeRules: {}, afterRules: {}, updates: [] } };

    const input = await readFileStr(filePath);
    const parsedInput = parseInput(input);

    // process each collection of pageNumbers to check if valid
    for(const update of parsedInput.updates) {

        update.isValid = isValidPageNumbers(update.pageNumbers, parsedInput.beforeRules, parsedInput.afterRules);
        
    }

    const validUpdates = parsedInput.updates.filter(update => update.isValid);
    const middleNumbers = validUpdates.map(update => update.pageNumbers[Math.floor(update.pageNumbers.length/2)]);
    const sum = middleNumbers.reduce((acc, val) => acc + val, 0);

    console.log(`Middle Numbers: ${middleNumbers}`);
    console.log(`Sum: ${sum}`);

    // data.input = parsedInput;
    data.output = `Sum of middle numbers: ${sum}`;
    yield data;
}

export function loadRenderer(filepath: string) {
    // Begin rendering solution to canvas
    const solverSolutionStep = solver(filepath);
    runSolverWithAnimationFrame(solverSolutionStep, renderFrame);
}

function renderFrame(app: CanvasApp, data: Day05P1RenderData | undefined): void {

    if(data === undefined || data == null) {
        return;
    }

    const renderer = app.renderer;
    renderer.clear();
    renderer.drawText(data.output, 10, 20, "Arial", 16, "left", "top", "black");

}
