import { runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
import { readFileStr } from "../../utils/input_reader.ts";

export interface Day01P2RenderData {
    output: string;
}

function parseInput(input: string): { a: number[], b: number[] } {
    const data = input.split("\r\n").map(line => {
        const [a, b] = line.split(/\s+/).map(Number);
        return { a, b };
    }).reduce((acc, curr) => {
        acc.a.push(curr.a);
        acc.b.push(curr.b);
        return acc;
    }, { a: [], b: [] } as { a: number[], b: number[] });

    data.a.sort((a, b) => a - b);
    data.b.sort((a, b) => a - b);

    return data;
}


export async function* solver(filePath: string): AsyncGenerator<Day01P2RenderData> {

    const data: Day01P2RenderData = { output: "" };
    
    const input = await readFileStr(filePath);
    const {a, b} = parseInput(input);

    const distances = a.map((val) => {
        const count = b.filter(b => b === val).length;
        return Math.abs(val * count);
    });

    const sum = distances.reduce((acc, curr) => acc + curr, 0);
    data.output = sum.toString();
    

    yield data;
}

export function loadRenderer(filepath: string) {
    // Begin rendering solution to canvas
    const solverSolutionStep = solver(filepath);
    runSolverWithAnimationFrame(solverSolutionStep, renderFrame);
}

function renderFrame(context: CanvasRenderingContext2D, data: Day01P2RenderData): void {

    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Render message
    context.fillStyle = "black";
    context.fillText(data.output, 10, 20);
}