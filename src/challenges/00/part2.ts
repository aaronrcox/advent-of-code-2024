import { CanvasApp, runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
import { readFileStr } from "../../utils/input_reader.ts";

export interface Day00P2RenderData {
    output: string;
}

export async function* solver(filePath: string): AsyncGenerator<Day00P2RenderData> {

    const data: Day00P2RenderData = {
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


function renderFrame(app: CanvasApp, data: Day00P2RenderData): void {

    const renderer = app.renderer;
    renderer.clear();
    renderer.drawText(data.output, 10, 20, "Arial", 16, "left", "top", "black");

}
