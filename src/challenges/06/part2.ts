
import { CanvasApp, runSolverWithAnimationFrame } from "../../utils/browser_renderer.ts";
import { readFileStr } from "../../utils/input_reader.ts";



export interface Day06P2RenderData {
    output: string;
    map: string[];
    trail: string[];
    newWalls: string[];
    guardStartPos: {x: number, y: number};
    guardPos: {x: number, y: number};
    guardDir: {x: number, y: number};
    guardTempPath: number[];
    guardExited: boolean;
    
    
}

function parseInput(input: string): Day06P2RenderData {
    const map = input.split("\r\n");
    const trail = [];
    const newWalls = [];
    const renderMap = [];
    const guardPos = {x: 0, y: 0};
    const guardTempPath: number[] = [];

    for(let y = 0; y < map.length; y++) {
        trail.push("");
        newWalls.push("");
        renderMap.push("");
        for(let x = 0; x < map[y].length; x++) {
            
            if(map[y][x] === '^') {
                map[y] = map[y].replace("^", ".");
                guardPos.x = x;
                guardPos.y = y;
            }

            trail[y] += ".";
            newWalls[y] += ".";
            renderMap[y] += map[y][x];
        }
    }

    return {
        output: "",
        map,
        trail,
        newWalls,
        guardPos,
        guardStartPos: {x: guardPos.x, y: guardPos.y},
        guardDir: {x: 0, y: -1},
        guardTempPath,
        guardExited: false
    }
}

function willLoop(map: string[], oxPos: number, oyPos: number, startPosX: number, startPosY: number): {loop: boolean, path: number[], ox?: number, oy?: number} {

    if(oxPos === startPosX && oyPos === startPosY) {
        return {loop: false, path: []};
    }

    const obsticalsHitStack: Set<string> = new Set<string>();
    const path: number[] = []
    
    path.push( startPosY * map[0].length + startPosX);

    // return false if the ahead position is out of the map
    if(oyPos >= map.length || oyPos < 0 || oxPos >= map[oyPos].length || oxPos < 0) {
        // path.push( oyPos * map[0].length + oxPos);
        return { loop: false, path };
    }

    // return false if the ahead position is a wall
    if(map[oyPos][oxPos] === '#') {
        return { loop: false, path };
    }

    let x = startPosX;
    let y = startPosY;

    // default direction is up
    let xd = 0;
    let yd = -1;

    const id = [x,y,xd,yd].join(',');
    obsticalsHitStack.add(id);

    

    
    const step = (): "LOOP_REPEATS" | "EXITED_MAP" | "CONTINUE_STEP" => {

        // look ahead for obstical
        const nx = x + xd;
        const ny = y + yd;

        // return true if we exit the map
        if(ny >= map.length || ny < 0 || nx >= map[ny].length || nx < 0) {

            return "EXITED_MAP";
        }

        const id = [nx,ny,xd,yd].join(',');
        
        // check if we hit the new obstical position again traveling in the same direction
        if(obsticalsHitStack.has(id)) {
            return "LOOP_REPEATS"
        }

        // check if we hit a wall - or the new obstical position - rotate right if we do
        if(map[ny][nx] === '#' || (nx === oxPos && ny === oyPos)) {

            obsticalsHitStack.add(id);

            const tmp = xd;
            xd = -yd;
            yd = tmp;
        }
        else {

            // update the render path with our current position
            path.push( ny * map[0].length + nx);

            x = nx;
            y = ny;
        }

        return "CONTINUE_STEP";
    }

    while(true){
        const stepResult = step();
        if(stepResult === "LOOP_REPEATS") {
            return { loop: true, path, ox: oxPos, oy: oyPos};
        }
        if(stepResult === "EXITED_MAP") {
            return { loop: false, path };
        }
        if(stepResult === "CONTINUE_STEP") {
            // do nothing - let the loop repeat
        }
    }


    // we will never get here
    // the loop above should exit

}

function updateStep(data: Day06P2RenderData): void {

    // update the guard to the new tile position
    data.guardPos.x += data.guardDir.x;
    data.guardPos.y += data.guardDir.y;

    // bounds check
    if(data.guardPos.y < 0 || data.guardPos.y >= data.map.length || data.guardPos.x < 0 || data.guardPos.x >= data.map[data.guardPos.y].length) {
        data.guardPos = {x: data.guardPos.x - data.guardDir.x, y: data.guardPos.y - data.guardDir.y}; // move back
        data.guardExited = true;
        return;
    }

    const tileId = data.map[data.guardPos.y][data.guardPos.x];

    // check if there is a wall in new position
    if(tileId === '#') {
        data.guardPos = {x: data.guardPos.x - data.guardDir.x, y: data.guardPos.y - data.guardDir.y}; // move back
        data.guardDir = {x: -data.guardDir.y, y: data.guardDir.x}; // rotate right
    }

    // there is no wall - test if the guard will loop if we put a temporary wall head of current position
    const willLoopResult = willLoop(data.map, data.guardPos.x, data.guardPos.y, data.guardStartPos.x, data.guardStartPos.y);
    data.guardTempPath = willLoopResult.path;
    if(willLoopResult.loop && willLoopResult.ox !== undefined && willLoopResult.oy !== undefined) {
        data.newWalls[willLoopResult.oy] = data.newWalls[willLoopResult.oy].substring(0, willLoopResult.ox) + "O" + data.newWalls[willLoopResult.oy].substring(willLoopResult.ox + 1);
    }

    

}

export async function* solver(filePath: string): AsyncGenerator<Day06P2RenderData> {

    const input = await readFileStr(filePath);
    const data: Day06P2RenderData =  parseInput(input);
    yield data;


    while(data.guardExited === false) {
        updateStep(data);
        yield data;
    }

    const tiledTraversed = data.trail.flatMap(row => Array.from(row)).filter(x => x === '+' || x === "-" || x === "|").length;
    const obsticalsPlaced = data.newWalls.flatMap(row => Array.from(row)).filter(x => x === 'O').length;
    console.log(tiledTraversed);
    console.log(obsticalsPlaced);
    data.output = `Tiles traversed: ${tiledTraversed}, Obsticals placed: ${obsticalsPlaced}`;
    
    yield data;
}

export function loadRenderer(filepath: string) {
    // Begin rendering solution to canvas
    const solverSolutionStep = solver(filepath);
    runSolverWithAnimationFrame(solverSolutionStep, renderFrame);
}

function renderFrame(app: CanvasApp, data: Day06P2RenderData | undefined | null): void {

    if(data === undefined || data == null) {
        return;
    }

    const renderer = app.renderer;

    // Clear the canvas
    renderer.clear();

    const ts = 8;
    const gs = 4;

    // draw vertical tile lines
    for(let x = 0; x < data.map[0].length; x++) {
        renderer.drawLine(x * ts, 0, x * ts, data.map.length * ts, "#cccccc", 1);
    }

    // draw horizontal tile lines
    for(let y = 0; y < data.map.length; y++) {
        renderer.drawLine(0, y * ts, data.map[0].length * ts, y * ts, "#cccccc", 1);
    }

    // draw the obsticals
    for(let y = 0; y < data.map.length; y++) {
        for(let x = 0; x < data.map[y].length; x++) {
            if(data.map[y][x] === "#") {
                renderer.drawRect(x * ts, y * ts, ts, ts, 0, 0, "#FF0000", 0);
            }
        }
    }

    // draw the  temp obsticals
    for(let y = 0; y < data.newWalls.length; y++) {
        for(let x = 0; x < data.newWalls[y].length; x++) {
            if(data.newWalls[y][x] === "O") {
                renderer.drawRect(x * ts, y * ts, ts, ts, 0, 0, "#FFFF00", 0);
            }
        }
    }

        

    // draw the guard
    const guardCenterPos = {x: data.guardPos.x * ts + ts/2, y: data.guardPos.y * ts + ts/2};
    const guardEyesPos = {x: guardCenterPos.x + data.guardDir.x * ts/4, y: guardCenterPos.y + data.guardDir.y * ts/4};
    renderer.drawRect(guardCenterPos.x,guardCenterPos.y, gs, gs, 0.5, 0.5, "#00FF00", 0);
    renderer.drawRect(guardEyesPos.x,guardEyesPos.y, gs, gs, 0.5, 0.5, "#000000", 0);

    
    // draw the path for the temporary obsticals
    for(let i = 1; i<data.guardTempPath.length; i++) {
        const tileA = data.guardTempPath[i-1];
        const tileB = data.guardTempPath[i];
        const xA = (tileA % data.map[0].length) * ts + ts / 2;
        const yA = (Math.floor(tileA / data.map[0].length)) * ts + ts / 2;
        const xB = (tileB % data.map[0].length) * ts + ts / 2;
        const yB = (Math.floor(tileB / data.map[0].length)) * ts + ts / 2;

        renderer.drawLine(xA, yA, xB, yB, "#FF0000", 1);

    }

    // Render message
    renderer.drawText("Hello WOrld", 10, 10, "Arial", 12, 'left', 'top', "#000000");
}