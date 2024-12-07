import { CanvasApp, runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
import { readFileStr } from "../../utils/input_reader.ts";

export interface Day04P1RenderData {
    output: string;
}

function parseInput(input: string): string[] {
    return input.split("\r\n");
}

function search(findText: string, input: string[], xPos: number, yPos: number, xDir: number, yDir: number): boolean {
    let x = xPos;
    let y = yPos;

    for (let i = 0; i < findText.length; i++) {
        // Check if current position is out of bounds
        if (x < 0 || x >= input[0].length || y < 0 || y >= input.length) {
            return false;
        }
        
        // Check if current character matches
        if (input[y][x] !== findText[i]) {
            return false;
        }
        
        // Move to the next position
        x += xDir;
        y += yDir;
    }
    
    // successfully matched all characters
    return true;
}


export async function* solver(filePath: string): AsyncGenerator<Day04P1RenderData> {

    const data: Day04P1RenderData = { output: "" };

    const input = await readFileStr(filePath);
    const parsedInput = parseInput(input);

    const findText = "XMAS";
    let found = 0;
    for(let y=0; y<parsedInput.length; y++) {
        for(let x=0; x<parsedInput[y].length; x++) {

            if(search(findText, parsedInput, x, y, 1, 0)) found++; // search right
            if(search(findText, parsedInput, x, y, 1, 1)) found++; // search right-down
            if(search(findText, parsedInput, x, y, 0, 1)) found++; // search down
            if(search(findText, parsedInput, x, y,-1, 1)) found++; // search down-left
            if(search(findText, parsedInput, x, y,-1, 0)) found++; // search left
            if(search(findText, parsedInput, x, y,-1,-1)) found++; // search left-up
            if(search(findText, parsedInput, x, y, 0,-1)) found++; // search up
            if(search(findText, parsedInput, x, y, 1,-1)) found++; // search up-right
        }
    }

    data.output = `Found \"${findText}\" ${found} times`;
    yield data;
}

export function loadRenderer(filepath: string) {
    // Begin rendering solution to canvas
    const solverSolutionStep = solver(filepath);
    runSolverWithAnimationFrame(solverSolutionStep, renderFrame);
}

function renderFrame(app: CanvasApp, data: Day04P1RenderData): void {

    if(data === undefined || data == null) {
        return;
    }

    const renderer = app.renderer;
    renderer.clear();
    renderer.drawText(data.output, 10, 20, "Arial", 16, "left", "top", "black");

}
