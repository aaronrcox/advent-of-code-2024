import { runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
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

    
    let found = 0;
    for(let y=0; y<parsedInput.length; y++) {
        for(let x=0; x<parsedInput[y].length; x++) {

            // Search for "MAS" or "SAM" in X Shape
            // M.M || S.M || S.S || M.S
            // .A. || .A. || .A. || .A.
            // S.S || S.M || M.M || M.S

            if( (search("MAS", parsedInput, x, y, 1, 1) && search("MAS", parsedInput, x+2, y,-1, 1)) ||  
                (search("SAM", parsedInput, x, y, 1, 1) && search("MAS", parsedInput, x+2, y,-1, 1)) || 
                (search("SAM", parsedInput, x, y, 1, 1) && search("SAM", parsedInput, x+2, y,-1, 1)) || 
                (search("MAS", parsedInput, x, y, 1, 1) && search("SAM", parsedInput, x+2, y,-1, 1))
            ) {
                found++;
            }
        }
    }

    data.output = `Found "X-MAS" ${found} times`;
    yield data;
}

export function loadRenderer(filepath: string) {
    // Begin rendering solution to canvas
    const solverSolutionStep = solver(filepath);
    runSolverWithAnimationFrame(solverSolutionStep, renderFrame);
}

function renderFrame(context: CanvasRenderingContext2D, data: Day04P1RenderData): void {

    // Clear the canvas
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    // Render message
    context.fillStyle = "black";
    context.fillText(data.output, 10, 20);
}