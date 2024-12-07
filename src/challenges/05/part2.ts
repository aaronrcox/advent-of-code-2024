import { CanvasApp, runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
import { readFileStr } from "../../utils/input_reader.ts";

export interface ParsedInput {
    beforeRules: { [key: number]: number[] };
    afterRules: { [key: number]: number[] };
    updates: { pageNumbers: number[], correctedPageNumbers?: number[] | undefined, isValid: boolean }[];
}

export interface Day05P2RenderData {
    output: string;
    input: ParsedInput;
}



function parseInput(input: string): ParsedInput {

    const [sectionA, sectionB] = input.split("\r\n\r\n");

    const rules = sectionA.split("\r\n").reduce((acc, line) => {
        const [key, value] = line.split("|").map(Number);
        if(acc.beforeRules[value] === undefined) acc.beforeRules[value] = [];
        if(acc.afterRules[key] === undefined) acc.afterRules[key] = [];

        acc.afterRules[key].push(value);
        acc.beforeRules[value].push(key);
        
        

        return acc;
    }, {  beforeRules: {}, afterRules: {} } as {
          beforeRules: { [key: number]: number[] }, 
          afterRules: { [key: number]: number[] }
    });

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

function isValidPageNumbers(pageNumbers: number[], beforeRules: { [key: number]: number[] }, afterRules: { [key: number]: number[] }) : { isValid: boolean, aIndex: number, bIndex: number} {
    
    for(let i=0; i<pageNumbers.length; i++) {

        const a = pageNumbers[i];

        // check all after the current value
        for(let j=i+1; j<pageNumbers.length; j++) {
            
            const b = pageNumbers[j];

            if( (afterRules[b] !== undefined && afterRules[b].includes(a)) || (beforeRules[a] !== undefined && beforeRules[a].includes(b)) ) {
                return {isValid: false, aIndex: i, bIndex: j};
            }
        }
    }

    return {isValid: true, aIndex: -1, bIndex: -1};
}


export async function* solver(filePath: string): AsyncGenerator<Day05P2RenderData> {

    const data: Day05P2RenderData = { output: "", input: { beforeRules: {}, afterRules: {}, updates: [] } };

    const input = await readFileStr(filePath);
    const parsedInput = parseInput(input);

    // process each collection of pageNumbers to check if valid
    for(const update of parsedInput.updates) {

        // check if the numbers are valid
        update.isValid = isValidPageNumbers(update.pageNumbers, parsedInput.beforeRules, parsedInput.afterRules).isValid;

        if(update.isValid)
            continue;
        
        // copy the numbers to a new 'correctedPageNumbers' array - we will modify the new array to correct the order
        update.correctedPageNumbers = [...update.pageNumbers];

        let retry = false;
        do {
            const {isValid, aIndex, bIndex} = isValidPageNumbers(update.correctedPageNumbers!, parsedInput.beforeRules, parsedInput.afterRules);
            retry = !isValid;

            if(retry) {
                // swap the values at aIndex and bIndex
                const temp = update.correctedPageNumbers![aIndex];
                update.correctedPageNumbers![aIndex] = update.correctedPageNumbers![bIndex];
                update.correctedPageNumbers![bIndex] = temp;
            }

        } while(retry);
    }


    const correctedPageNumbers = parsedInput.updates.filter(update => update.correctedPageNumbers !== undefined).map(update => update.correctedPageNumbers!);
    console.log(correctedPageNumbers);
    const middleNumbers = correctedPageNumbers.map(pageNumbers => pageNumbers[Math.floor(pageNumbers.length/2)]);
    console.log(middleNumbers);
    const sum = middleNumbers.reduce((acc, val) => acc + val, 0);
    console.log(`Sum of middle numbers: ${sum}`);

    // data.input = parsedInput;
    data.output = `Sum of middle numbers: ${sum}`;
    yield data;
}

export function loadRenderer(filepath: string) {
    // Begin rendering solution to canvas
    const solverSolutionStep = solver(filepath);
    runSolverWithAnimationFrame(solverSolutionStep, renderFrame);
}

function renderFrame(app: CanvasApp, data: Day05P2RenderData): void {

    if(data === undefined || data == null) {
        return;
    }

    const renderer = app.renderer;
    renderer.clear();
    renderer.drawText(data.output, 10, 20, "Arial", 16, "left", "top", "black");

}

