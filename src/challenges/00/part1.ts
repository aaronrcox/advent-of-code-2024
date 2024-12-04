import { runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
import { readFileStr } from "../../utils/input_reader.ts";

export interface Day00P1RenderData {
    output: string;
}

export async function* solver(filePath: string): AsyncGenerator<Day00P1RenderData> {

    const data: Day00P1RenderData = {
        output: ""
    };

    data.output = await readFileStr(filePath);

    yield data;
}

export function loadRenderer(filepath: string) {
    // Begin rendering solution to canvas
    const solverSolutionStep = solver(filepath);
    runSolverWithAnimationFrame(solverSolutionStep, renderFrame);
}

function renderFrame(context: CanvasRenderingContext2D, data: Day00P1RenderData): void {

	// Clear the canvas
	context.clearRect(0, 0, context.canvas.width, context.canvas.height);

	// Render message
	context.fillStyle = "black";
	context.fillText(data.output, 10, 20);
}