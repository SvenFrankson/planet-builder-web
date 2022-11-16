class SlikaPosition {

    constructor(
        public x: number = 0,
        public y: number = 0,
        public textAlign: string = "start"
    ) {

    }
}

class SlikaPoints {

    constructor(
        public points: number[] = [],
        public close: boolean = false
    ) {

    }
}

class SlikaShapeStyle {

    constructor(
        public stroke: string = "white",
        public fill: string = "none",
        public width: number = 1,
        public highlightColor: string = "white",
        public highlightRadius: number = 20
    ) {

    }
}

class SlikaTextStyle {

    constructor(
        public color: string = "white",
        public size: number = 20,
        public fontFamily: string = "Consolas",
        public highlightColor: string = "white",
        public highlightRadius: number = 20
    ) {
        
    }
}

abstract class SlikaElement {

    constructor() {

    }

    public abstract redraw(context: BABYLON.ICanvasRenderingContext): void;
}

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
            new SlikaPoints([
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

        return new SlikaPath(new SlikaPoints(points, true), style);
    }

    constructor(
        public points: SlikaPoints,
        public style: SlikaShapeStyle
    ) {
        super();
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        if (this.points.points.length > 0) {
            context.fillStyle = this.style.fill;
            context.strokeStyle = this.style.stroke;
            context.shadowBlur = this.style.highlightRadius;
            context.shadowColor = this.style.highlightColor;
            context.strokeStyle = this.style.highlightColor;
            context.lineWidth = this.style.width;
            context.beginPath();
            context.moveTo(this.points.points[0], this.points.points[1]);
            for (let i = 1; i < this.points.points.length / 2; i++) {
                context.lineTo(this.points.points[2 * i], this.points.points[2 * i + 1]);
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

class SlikaLine extends SlikaElement {

    public static Create(x0: number, y0: number, x1: number, y1: number, style = new SlikaShapeStyle()): SlikaLine {
        return new SlikaLine(
            new SlikaPosition(x0, y0),
            new SlikaPosition(x1, y1),
            style
        );
    }

    constructor(
        public pStart: SlikaPosition = new SlikaPosition(),
        public pEnd: SlikaPosition = new SlikaPosition(),
        public style: SlikaShapeStyle = new SlikaShapeStyle()
    ) {
        super();
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        context.strokeStyle = this.style.stroke;
        context.shadowBlur = this.style.highlightRadius;
        context.shadowColor = this.style.highlightColor;
        context.lineWidth = this.style.width;
        context.beginPath();
        context.moveTo(this.pStart.x, this.pStart.y);
        context.lineTo(this.pEnd.x, this.pEnd.y);
        context.stroke();
    }
}

class SlikaText extends SlikaElement {

    public text: string;
    public position: SlikaPosition;
    public textStyle: SlikaTextStyle;

    constructor(text: string = "", position?: SlikaPosition, textStyle?: SlikaTextStyle) {
        super();
        this.text = text;
        if (position) {
            this.position = position;
        }
        else {
            this.position = new SlikaPosition();
        }
        if (textStyle) {
            this.textStyle = textStyle;
        }
        else {
            this.textStyle = new SlikaTextStyle();
        }
        let highlightColor = BABYLON.Color3.FromHexString(this.textStyle.color);
        highlightColor.scaleInPlace(0.5);
        this.textStyle.highlightColor = highlightColor.toHexString();
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        context.fillStyle = this.textStyle.color;
        context.font = this.textStyle.size + "px " + this.textStyle.fontFamily;
        context.shadowBlur = this.textStyle.highlightRadius;
        context.shadowColor = this.textStyle.highlightColor;
        context.strokeStyle = this.textStyle.highlightColor;
        context.lineWidth = this.textStyle.highlightRadius * 0.2;
        let offsetX = 0;
        if (this.position.textAlign === "center") {
            offsetX = context.measureText(this.text).width * 0.5;
        }
        else if (this.position.textAlign === "end") {
            offsetX = context.measureText(this.text).width;
        }
        context.strokeText(this.text, this.position.x - offsetX, this.position.y);
        context.fillText(this.text, this.position.x - offsetX, this.position.y);
    }
}

class SlikaButton extends SlikaElement {

    private _text: SlikaText;
    private _strokes: (SlikaPath | SlikaLine)[] = [];
    private _fills: SlikaPath[] = [];

    constructor(
        public label: string,
        public position: SlikaPosition,
        public color: BABYLON.Color3 = BABYLON.Color3.White()
    ) {
        super();

        let hexColor = color.toHexString();

        this._text = new SlikaText(
            label,
            new SlikaPosition(this.position.x + 180, this.position.y + 80, "center"),
            new SlikaTextStyle(hexColor, 60, "XoloniumRegular")
        );

        this._strokes.push(
            SlikaPath.CreateParenthesis(this.position.x, this.position.x + 15, this.position.y + 3, 126, false, new SlikaShapeStyle(hexColor, "none", 6, hexColor, 20))
        );
        this._strokes.push(
            SlikaLine.Create(this.position.x + 30, this.position.y, this.position.x + 330, this.position.y, new SlikaShapeStyle(hexColor, "none", 6, hexColor, 20))
        );
        this._fills.push(
            SlikaPath.CreatePan(this.position.x + 30, this.position.x + 330, this.position.y + 9, 6, 111, 0.3, true, false, new SlikaShapeStyle("none", hexColor + "40", 0, hexColor, 20))
        );
        this._strokes.push(
            SlikaLine.Create(this.position.x + 30, this.position.y + 132, this.position.x + 330, this.position.y + 132, new SlikaShapeStyle(hexColor, "none", 6, hexColor, 20))
        );
        this._strokes.push(
            SlikaPath.CreateParenthesis(this.position.x + 345, this.position.x + 360, this.position.y + 3, 126, true, new SlikaShapeStyle(hexColor, "none", 6, hexColor, 20))
        );
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        this._fills.forEach(f => {
            f.redraw(context);
        })
        this._strokes.forEach(s => {
            s.redraw(context);
        })
        this._text.redraw(context);
    }
}
class Slika {

    private width: number;
    private height: number;
    private elements: UniqueList<SlikaElement> = new UniqueList<SlikaElement>();

    private context: BABYLON.ICanvasRenderingContext;

    constructor(width: number, height: number, context: BABYLON.ICanvasRenderingContext) {
        this.width = width;
        this.height = height;
        this.context = context;
    }

    public add(e: SlikaElement): void {
        this.elements.push(e);
    }

    public remove(e: SlikaElement): void {
        this.elements.remove(e);
    }

    public redraw(): void {
        for (let i = 0; i < this.elements.length; i++) {
            console.log("redraw");
            this.elements.get(i).redraw(this.context);
        }
    }

    public clear(clearColor: string): void {
        this.context.fillStyle = clearColor;
        this.context.fillRect(0, 0, this.width, this.height);
    }
}