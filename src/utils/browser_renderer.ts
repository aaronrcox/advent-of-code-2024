import { CanvasRenderer2d } from "./browser/canvasRenderer2d.ts";
import { KeyboardInput } from "./browser/keyboardInput.ts";
import { MouseInput } from "./browser/mouseInput.ts";
import { FrameTimer } from "./browser/renderFrameTimer.ts";


export class CanvasApp
{
    keyboardInput: KeyboardInput;
    mouseInput: MouseInput;

    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    renderer: CanvasRenderer2d;

    private updateCb: ((app: CanvasApp) => void)[] = [];
    private drawCb: ((app: CanvasApp) => void)[] = [];

    private animationFrameToken: number = 0;

    time: FrameTimer;

    private running: boolean = true;
    private frameSkip: number = 10;

    private playPauseButton: HTMLButtonElement;
    private playPauseIcon: HTMLElement;
    private nextButton: HTMLButtonElement;


    constructor(canvasElementId: string)
    {
        this.canvas = document.getElementById(canvasElementId) as HTMLCanvasElement;
        this.context = this.canvas.getContext("2d")!;

        this.renderer = new CanvasRenderer2d(this.context);

        this.keyboardInput = new KeyboardInput(this.canvas);
        this.mouseInput = new MouseInput(this.canvas);

        this.time = new FrameTimer();

        this.playPauseButton = document.getElementById("playPauseButton") as HTMLButtonElement;
        this.playPauseIcon = document.getElementById("playPauseIcon") as HTMLElement;
        this.nextButton = document.getElementById("nextButton") as HTMLButtonElement;

        this.addEventListeners();
        this.updateButtonStates();
    }

    destroy() {
        cancelAnimationFrame(this.animationFrameToken);
        this.keyboardInput.destroy();
        this.mouseInput.destroy();
    }

    run() {
        if(this.running) {
            this.runAsync().then(() => {
                this.animationFrameToken = requestAnimationFrame(() => this.run());
            });
        }   
    }

    async runAsync() {
        // update input states before we run app updates/draws
        this.time.update();
        this.keyboardInput.update();
        this.mouseInput.update();

        // run update methods - if we are skipping frames, we should run the update method multiple times
        for (let i = 0; i <= this.frameSkip; i++){
            for(const cb of this.updateCb) {
                await cb(this);
            }
        }

        // run draw methods
        for(const cb of this.drawCb) {
            await cb(this);
        }        
    }

    addUpdateCb(cb: (app: CanvasApp) => Promise<void>) {
        this.updateCb.push(cb);
    }
    

    addDrawCb(cb: (app: CanvasApp) => Promise<void>) {
        this.drawCb.push(cb);
    }

    play() {
        if (!this.running) {
            this.running = true;
            this.updateButtonStates();
            this.run();
        }
    }

    pause() {
        this.running = false;
        cancelAnimationFrame(this.animationFrameToken);
        this.updateButtonStates();
    }

    nextFrame() {
        if (!this.running) {
            this.runAsync().then(() => {
                this.animationFrameToken = requestAnimationFrame(() => this.run());
            });
        }
    }

    setFrameSkip(value: number) {
        if (value < 0) {
            throw new Error("frameSkip must be 0 or greater");
        }
       
        this.frameSkip = value;
    }

    private addEventListeners() {
        this.playPauseButton.addEventListener("click", () => {
            if (this.running) {
                this.pause();
            } else {
                this.play();
            }
        });

        this.nextButton.addEventListener("click", async () => {
            await this.nextFrame();
        });
    }

    private updateButtonStates() {
        if (this.running) {
            this.playPauseIcon.textContent = "pause";
            this.nextButton.disabled = true;
        } else {
            this.playPauseIcon.textContent = "play_arrow";
            this.nextButton.disabled = false;
        }
    }

}

let application: CanvasApp | null = null;

export function runSolverWithAnimationFrame<T>(
    solver: AsyncGenerator<T>, 
    renderFrameFunc: (app: CanvasApp, data: T) => void
): void {

    if(application !== null) {
        application?.destroy();
        application = null;
    }
    application = new CanvasApp("canvas");
    
    let solverData: T | null = null;

    application.addUpdateCb(async (app) => {
        const result = await solver.next();
        if(result.value) solverData = result.value;
    });

    // deno-lint-ignore require-await
    application.addDrawCb(async (app) => {
        if(solverData === null)
            return;
        renderFrameFunc(app, solverData);
    });

    application.run();
}


