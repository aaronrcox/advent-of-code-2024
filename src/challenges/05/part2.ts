import { runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
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

function isValidPageNumbers(pageNumbers: number[], beforeRules: { [key: number]: number[] }, afterRules: { [key: number]: number[] }) {
    let isValid = true;
    for(let i=0; i<pageNumbers.length; i++) {

        const a = pageNumbers[i];

        // check all after the current value
        for(let j=i+1; j<pageNumbers.length; j++) {
            
            const b = pageNumbers[j];

            if( afterRules[b] !== undefined && afterRules[b].includes(a)) {
                isValid = false;
            }

            if( beforeRules[a] !== undefined && beforeRules[a].includes(b)) {
                isValid = false;
            }
        }
    }

    return isValid;
}


export async function* solver(filePath: string): AsyncGenerator<Day05P2RenderData> {

    const data: Day05P2RenderData = { output: "", input: { beforeRules: {}, afterRules: {}, updates: [] } };

    const input = await readFileStr(filePath);
    const parsedInput = parseInput(input);

    // process each collection of pageNumbers to check if valid
    for(const update of parsedInput.updates) {

        // assume it's valid until there is a rule that fails
        update.isValid = isValidPageNumbers(update.pageNumbers, parsedInput.beforeRules, parsedInput.afterRules);

        if(update.isValid)
            continue;
        
        update.correctedPageNumbers = [...update.pageNumbers];

        let retry = false;
        do {
            retry = false;

            for(let i=0; i<update.correctedPageNumbers.length; i++) {

                const a = update.correctedPageNumbers[i];

                for(let j=i+1; j<update.correctedPageNumbers.length; j++) {
                
                    const b = update.correctedPageNumbers[j];
    
                    if( (parsedInput.afterRules[b] !== undefined && parsedInput.afterRules[b].includes(a)) || (parsedInput.beforeRules[a] !== undefined && parsedInput.beforeRules[a].includes(b))) {
                        retry = true;
                        // swap the numbers
                        const tmp = update.correctedPageNumbers[i];
                        update.correctedPageNumbers[i] = update.correctedPageNumbers[j];
                        update.correctedPageNumbers[j] = tmp;
                        break;
                    }
    
                }

                if(retry) {
                    break;
                }          
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

function renderFrame(context: CanvasRenderingContext2D, data: Day05P2RenderData): void {

    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Render message
    context.fillStyle = "black";
    context.fillText(data.output, 10, 20);
}