import { runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
import { readFileStr } from "../../utils/input_reader.ts";

export interface Day03P1RenderData {
    output: string;
}

function parseInput(input: string): {instruction: string, lhs: number, rhs: number}[] {

    // Matches all occurrences of "mul(x,x)" where x is one or more digits, e.g., "mul(2,3)", and returns them as an array of strings.
    const regex = /mul\(\d+,\d+\)/g;
    const matches: string[] = input.match(regex) || [];

    return matches.map(match => {

        // Extracts the instruction (e.g., "mul") and two numeric arguments (lhs, rhs) from a string like "mul(2,3)". If no match, assigns an empty array.
        const rx = /(\w+)\((\d+),(\d+)\)/;
        const [ , instruction, lhs, rhs] = match.match(rx) || [];
        
        return {
            instruction,
            lhs: parseInt(lhs, 10),
            rhs: parseInt(rhs, 10),
        };
    });
    
}


export async function* solver(filePath: string): AsyncGenerator<Day03P1RenderData> {

    const data: Day03P1RenderData = { output: "" };

    const input = await readFileStr(filePath);
    const parsedInput = parseInput(input);

    data.output = parsedInput.reduce((acc, {instruction, lhs, rhs}) => {
        if(instruction === "mul")
            acc = acc + (lhs * rhs);
        return acc;
    }, 0).toString();

    console.log(data);

    yield data;
}

export function loadRenderer(filepath: string) {
    // Begin rendering solution to canvas
    const solverSolutionStep = solver(filepath);
    runSolverWithAnimationFrame(solverSolutionStep, renderFrame);
}

function renderFrame(context: CanvasRenderingContext2D, data: Day03P1RenderData): void {

    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Render message
    context.fillStyle = "black";
    context.fillText(data.output, 10, 20);
}