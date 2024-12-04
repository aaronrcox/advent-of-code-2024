




export function runSolverWithAnimationFrame<T>(
    solver: AsyncGenerator<T>, 
    renderFrameFunc: (context: CanvasRenderingContext2D, data: T) => void
): void {

    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Failed to get 2D context");

    context.font = "14px Arial";
    context.fillStyle = "black";

    const processFrame = async function() {
        const next = await solver.next();
        if(next.done) {
            return;
        }
        
        // render the frame
        renderFrameFunc(context, next.value);

        // schedule next frame
        requestAnimationFrame(processFrame);
    
    }

    // process the first frame
    processFrame();
}

