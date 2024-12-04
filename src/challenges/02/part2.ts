import { runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
import { readFileStr } from "../../utils/input_reader.ts";

export interface Day02P2RenderData {
    output: string;
}

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

export async function* solver(filePath: string): AsyncGenerator<Day02P2RenderData> {

    const data: Day02P2RenderData = { output: "" };

    const input = await readFileStr(filePath);
    const parsedInput = parseInput(input);


    // process the input
    for(let i=0; i<parsedInput.length; i++) {

        parsedInput[i].isSafe = isReportSafe(parsedInput[i].report);
        if(parsedInput[i].isSafe)
            continue;

        // broot force - remove a number till it's safe
        for (let j = 0; j < parsedInput[i].report.length; j++) {
            const modifiedReport = [...parsedInput[i].report];
            modifiedReport.splice(j, 1); // Remove the j-th number
            if (isReportSafe(modifiedReport)) {
                parsedInput[i].isSafe = true;
                break;
            }
        }
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

function renderFrame(context: CanvasRenderingContext2D, data: Day02P2RenderData): void {

    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Render message
    context.fillStyle = "black";
    context.fillText(data.output, 10, 20);
}