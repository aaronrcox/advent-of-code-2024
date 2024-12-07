import { CanvasApp, runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
import { readFileStr } from "../../utils/input_reader.ts";

export interface Day03P2RenderData {
    output: string;
}

function parseInput(input: string): {instruction: string, lhs: number | null, rhs: number | null}[] {

    // Matches all occurrences of "mul(x,x)", "do()", or "don't()" in the input string and returns them as an array of strings.
    const regex = /mul\(\d+,\d+\)|do\(\)|don't\(\)/g;
    const matches: string[] = input.match(regex) || [];

    return matches.map(match => {

        // Extracts the instruction (e.g., "mul", "do", "don't") and optionally captures two numeric arguments (lhs, rhs) from strings like "mul(2,3)" or "do()".
        const rx = /([\w']+)\((\d+)?,?(\d+)?\)/;
        const [ , instruction, lhs, rhs] = match.match(rx) || [];

        return {
            instruction,
            lhs: lhs ? parseInt(lhs, 10) : null,
            rhs: rhs ? parseInt(rhs, 10) : null,
        };
    });
    
}


export async function* solver(filePath: string): AsyncGenerator<Day03P2RenderData> {

    const data: Day03P2RenderData = { output: "" };

    const input = await readFileStr(filePath);
    const parsedInput = parseInput(input);
    console.log(parsedInput);

    data.output = parsedInput.reduce((acc, {instruction, lhs, rhs}) => {
        if(instruction === "mul" && acc.process === true)
            acc.result = acc.result + (lhs! * rhs!);
        else if(instruction == "do")
            acc.process = true;
        else if(instruction == "don't")
            acc.process = false;

        return acc;
    }, {process: true, result: 0}).result.toString();

    yield data;
}

export function loadRenderer(filepath: string) {
    // Begin rendering solution to canvas
    const solverSolutionStep = solver(filepath);
    runSolverWithAnimationFrame(solverSolutionStep, renderFrame);
}


function renderFrame(app: CanvasApp, data: Day03P2RenderData): void {

    const renderer = app.renderer;
    renderer.clear();
    renderer.drawText(data.output, 10, 20, "Arial", 16, "left", "top", "black");

}
