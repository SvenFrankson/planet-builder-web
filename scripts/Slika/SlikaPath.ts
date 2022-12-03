

class SlikaPath extends SlikaElement {

    public static CreateParenthesis(
        x0: number,
        x1: number,
        y0: number,
        H: number,
        flip: boolean,
        style: SlikaShapeStyle
    ): SlikaPath {
        let yUp = y0 + (x1 - x0);
        let yBottom = y0 + H - (x1 - x0);
        
        if (flip) {
            let tmp = x1;
            x1 = x0;
            x0 = tmp;
        }
        
        return new SlikaPath(
            new SPoints([
                x1, y0,
                x0, yUp,
                x0, yBottom,
                x1, y0 + H
            ],
            true), style);
    }

    public static CreatePan(
        x0: number,
        x1: number,
        y0: number,
        thickness: number,
        H: number,
        ratio: number,
        bigRight: boolean,
        flip: boolean,
        style: SlikaShapeStyle
    ): SlikaPath {

        let points: number[];
        
        let sign = flip ? - 1 : 1;

        if (bigRight) {
            let xBottom = x1 - (x1 - x0) * ratio;
            let xUp = xBottom - (H - thickness);

            points = [
                x0, y0,
                x1, y0,
                x1, y0 + sign * H,
                xBottom, y0 + sign * H,
                xUp, y0 + sign * thickness,
                x0, y0 + sign * thickness
            ];
        }
        else {
            let xBottom = x0 + (x1 - x0) * ratio;
            let xUp = xBottom + (H - thickness);

            points = [
                x0, y0,
                x1, y0,
                x1, y0 + sign * thickness,
                xUp, y0 + sign * thickness,
                xBottom, y0 + sign * H,
                x0, y0 + sign * H
            ];
        }

        return new SlikaPath(new SPoints(points, true), style);
    }

    constructor(
        public points: SPoints,
        public style: SlikaShapeStyle
    ) {
        super();
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        if (this.points.points.length > 0) {
            if (this.style.fill === "none") {
                context.fillStyle = "none";
            }
            else {
                context.fillStyle = this.style.fill + Math.floor((this.style.fillAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
            }
            if (this.style.stroke === "none") {
                context.strokeStyle = "none";
            }
            else {
                context.strokeStyle = this.style.stroke + Math.floor((this.style.strokeAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
            }
            context.shadowBlur = this.style.highlightRadius;
            context.shadowColor = this.style.highlightColor;
            context.lineWidth = this.style.width;
            context.beginPath();
            context.moveTo(this.points.points[0], this.points.points[1]);
            for (let i = 1; i < this.points.points.length / 2; i++) {
                context.lineTo(this.points.points[2 * i], this.points.points[2 * i + 1]);
            }
            if (this.points.close) {
                context.closePath();
            }
            if (this.style.fill != "none") {
                context.fill();
            }
            if (this.style.stroke != "none") {
                context.stroke();
            }
        }
    }
}