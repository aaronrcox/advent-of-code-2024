import { runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
import { readFileStr } from "../../utils/input_reader.ts";

export interface Day02P1RenderData {
    output: string;
}

// Helper function - parse the input into 
function parseInput(input: string): { report: number[], isSafe?: boolean | null}[] {

    const data = input.split("\r\n").map(line => {
        return {
            report: line.split(/\s+/).map(Number), // split whitespace and convert to number
            isSafe: null
        }
    });

    return data;
}

// Helper function to check if a report is safe
const isReportSafe = (report: number[]): boolean => {
    const steps = [];
    for (let j = 1; j < report.length; j++) {
        steps.push(report[j] - report[j - 1]);
    }
    const isIncreasing = steps.every(step => step > 0);
    const isDecreasing = !isIncreasing && steps.every(step => step < 0);
    const isMixed = !isIncreasing && !isDecreasing;

    const maxStepDist = 3;

    return !isMixed && steps.every(step => Math.abs(step) <= maxStepDist);
};

export async function* solver(filePath: string): AsyncGenerator<Day02P1RenderData> {

    const data: Day02P1RenderData = { output: "" };

    const input = await readFileStr(filePath);
    const parsedInput = parseInput(input);


    // process each report - check if safe
    for(let i=0; i<parsedInput.length; i++) {
        parsedInput[i].isSafe = isReportSafe(parsedInput[i].report);
    }


    data.output = parsedInput.map(report => report.isSafe).filter(isSafe => isSafe == true).length.toString();
    console.log("Solution: ", data.output);

    yield data;
}

export function loadRenderer(filepath: string) {
    // Begin rendering solution to canvas
    const solverSolutionStep = solver(filepath);
    runSolverWithAnimationFrame(solverSolutionStep, renderFrame);
}

function renderFrame(context: CanvasRenderingContext2D, data: Day02P1RenderData): void {

    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Render message
    context.fillStyle = "black";
    context.fillText(data.output, 10, 20);
}