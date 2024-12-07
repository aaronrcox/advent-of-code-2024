
export class CanvasRenderer2d {

    ctx: CanvasRenderingContext2D;

    constructor(context: CanvasRenderingContext2D) {
        this.ctx = context;
    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    /**
     * Draw a rectangle with specified origin, rotation, and color.
     * @param ctx - Canvas rendering context.
     * @param x - X-coordinate of the rectangle.
     * @param y - Y-coordinate of the rectangle.
     * @param w - Width of the rectangle.
     * @param h - Height of the rectangle.
     * @param xo - Horizontal origin (0 to 1, 0 = left, 1 = right).
     * @param yo - Vertical origin (0 to 1, 0 = top, 1 = bottom).
     * @param color - Fill color.
     * @param rotation - Rotation angle in degrees.
     */
    drawRect(
        x: number,
        y: number,
        w: number,
        h: number,
        xo: number,
        yo: number,
        color: string,
        rotation: number
    ): void {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.fillStyle = color;
        ctx.fillRect(-xo * w, -yo * h, w, h);
        ctx.restore();
    }

    /**
     * Draw text at specified position with alignment options.
     * @param text - string of text to display
     * @param x - X-coordinate of the text.
     * @param y - Y-coordinate of the text.
     * @param fontFace - Font face, e.g., "Arial".
     * @param fontSize - Font size in pixels.
     * @param hAlign - Horizontal alignment ('left', 'centered', or 'right').
     * @param vAlign - Vertical alignment ('top', 'middle', or 'bottom').
     * @param color - Fill color for the text.
     */
    drawText(
        text: string,
        x: number,
        y: number,
        fontFace: string,
        fontSize: number,
        hAlign: 'left' | 'centered' | 'right',
        vAlign: 'top' | 'middle' | 'bottom',
        color: string
    ): void {
        const ctx = this.ctx;
        ctx.save();
        ctx.font = `${fontSize}px ${fontFace}`;
        ctx.fillStyle = color;

        // Set horizontal alignment
        ctx.textAlign = hAlign === 'centered' ? 'center' : hAlign;

        // Set vertical alignment
        switch (vAlign) {
            case 'top':
                ctx.textBaseline = 'top';
                break;
            case 'middle':
                ctx.textBaseline = 'middle';
                break;
            case 'bottom':
                ctx.textBaseline = 'bottom';
                break;
        }

        ctx.fillText(text, x, y);
        ctx.restore();
    }

    /**
     * Draw a circle at specified position.
     * @param x - X-coordinate of the circle.
     * @param y - Y-coordinate of the circle.
     * @param radius - Radius of the circle.
     * @param color - Fill color for the circle.
     */
    drawCircle(
        x: number,
        y: number,
        radius: number,
        color: string
    ): void {
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }

    /**
     * Draw a line between two points.
     * @param x1 - X-coordinate of the start point.
     * @param y1 - Y-coordinate of the start point.
     * @param x2 - X-coordinate of the end point.
     * @param y2 - Y-coordinate of the end point.
     * @param color - Stroke color.
     * @param lineWidth - Width of the line.
     */
    drawLine(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        color: string,
        lineWidth: number
    ): void {
        const ctx = this.ctx;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Draw a polyline from a list of points.
     * @param points - Array of points with x, y coordinates.
     * @param color - Stroke color.
     * @param lineWidth - Width of the line.
     */
    drawLineList(
        points: {x: number, y:number}[],
        color: string,
        lineWidth: number
    ): void {
        const ctx = this.ctx;
        if (points.length < 2) return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Apply a 2D camera transform.
     * @param cameraX - X-coordinate of the camera focus.
     * @param cameraY - Y-coordinate of the camera focus.
     * @param xOrigin - Horizontal origin of the camera (0 to 1).
     * @param yOrigin - Vertical origin of the camera (0 to 1).
     */
    applyCamera(
        cameraX: number,
        cameraY: number,
        xOrigin: number,
        yOrigin: number
    ): void {
        const ctx = this.ctx;
        const offsetX = ctx.canvas.width * xOrigin;
        const offsetY = ctx.canvas.height * yOrigin;

        ctx.translate(offsetX - cameraX, offsetY - cameraY);
    }

}