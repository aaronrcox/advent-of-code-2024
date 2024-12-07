import { CanvasApp, runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
import { readFileStr } from "../../utils/input_reader.ts";



export interface Day06P1RenderData {
    output: string;
    map: string[];
    trail: string[];
    guardPos: {x: number, y: number};
    guardDir: {x: number, y: number};
    guardExited: boolean;
}

function parseInput(input: string): Day06P1RenderData {
    const map = input.split("\r\n");
    const trail = [];
    const guardPos = {x: 0, y: 0};

    for(let y = 0; y < map.length; y++) {
        trail.push("");
        for(let x = 0; x < map[y].length; x++) {
            trail[y] += ".";
            if(map[y][x] === '^') {
                guardPos.x = x;
                guardPos.y = y;
            }
        }
    }

    return {
        output: "",
        map,
        trail,
        guardPos,
        guardDir: {x: 0, y: -1},
        guardExited: false
    }
}

function updateStep(data: Day06P1RenderData): void {

    const x = data.guardPos.x + data.guardDir.x;
    const y = data.guardPos.y + data.guardDir.y;

    
    if(y >= data.map.length || y < 0 || x >= data.map[y].length || x < 0) {
        data.guardExited = true;
        data.trail[data.guardPos.y] = data.trail[data.guardPos.y].substring(0, data.guardPos.x) + "X" + data.trail[data.guardPos.y].substring(data.guardPos.x + 1);
        return;
    }

    
    const tileId = data.map[y][x];
    if(tileId === '#') {
        data.guardDir = {x: -data.guardDir.y, y: data.guardDir.x}; // rotate right
    }
    else {
        data.trail[data.guardPos.y] = data.trail[data.guardPos.y].substring(0, data.guardPos.x) + "X" + data.trail[data.guardPos.y].substring(data.guardPos.x + 1);
        data.guardPos.x = x;
        data.guardPos.y = y;
    }
}

export async function* solver(filePath: string): AsyncGenerator<Day06P1RenderData> {

    const input = await readFileStr(filePath);
    const data: Day06P1RenderData =  parseInput(input);


    while(data.guardExited === false) {
        updateStep(data);
        // yield data;
    }

    const tiledTraversed = data.trail.flatMap(row => Array.from(row)).filter(x => x === 'X').length;
    console.log(tiledTraversed);
    data.output = `Tiles traversed: ${tiledTraversed}`;
    
    yield data;
}

export function loadRenderer(filepath: string) {
    // Begin rendering solution to canvas
    const solverSolutionStep = solver(filepath);
    runSolverWithAnimationFrame(solverSolutionStep, renderFrame);
}

function renderFrame(app: CanvasApp, data: Day06P1RenderData | undefined): void {

    if(data === undefined || data == null) {
        return;
    }

    const renderer = app.renderer;
    renderer.clear();
    renderer.drawText(data.output, 10, 20, "Arial", 16, "left", "top", "black");

}