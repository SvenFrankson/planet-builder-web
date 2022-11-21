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
        public highlightColor: string = "grey",
        public highlightRadius: number = 20
    ) {
        
    }
}

abstract class SlikaElement {

    public slika: Slika;
    public scene: BABYLON.Scene;

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
        context.fillText(this.text, this.position.x - offsetX, this.position.y);
    }
}

enum SlikaButtonState {
    Enabled,
    Disabled,
    Active
}

class SlikaButton extends SlikaElement {

    public state: SlikaButtonState = SlikaButtonState.Enabled;
    public colors: BABYLON.Color3[] = [
        BABYLON.Color3.FromHexString("#8dd6c0"),
        BABYLON.Color3.FromHexString("#a0bab2"),
        BABYLON.Color3.FromHexString("#cc8a2d")
    ];

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
            new SlikaTextStyle(hexColor, 60, "XoloniumRegular", color.scale(0.6).toHexString())
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

    public setStatus(state: number): void {
        this.state = state;
        this._animateColor(this.colors[this.state], 0.5);
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

    private _updateColor(): void {
        let hexColor = this.color.toHexString();
        this._fills.forEach(f => {
            f.style.fill = hexColor + "40";
            f.style.highlightColor = hexColor;
        })
        this._strokes.forEach(s => {
            s.style.stroke = hexColor;
            s.style.highlightColor = hexColor;
        })
        this._text.textStyle.color = hexColor;
        this._text.textStyle.highlightColor = this.color.scale(0.6).toHexString();
        if (this.slika) {
            this.slika.needRedraw = true;
        }
    }

    private async _animateColor(targetColor: BABYLON.Color3, duration: number = 1): Promise<void> {
        if (this.scene) {
            return new Promise<void>(resolve => {
                let colorZero = this.color.clone();
                let t = 0;
                let cb = () => {
                    t += this.scene.getEngine().getDeltaTime() / 1000;
                    if (t < duration) {
                        let f = t / duration;
                        BABYLON.Color3.LerpToRef(colorZero, targetColor, f, this.color);
                        this._updateColor();
                    }
                    else {
                        this.color.copyFrom(targetColor);
                        this._updateColor();
                        this.scene.onBeforeRenderObservable.removeCallback(cb);
                        resolve();
                    }
                }
                this.scene.onBeforeRenderObservable.add(cb);
            });
        }
    }
}

class Slika {

    private elements: UniqueList<SlikaElement> = new UniqueList<SlikaElement>();
    public needRedraw: boolean = true;

    constructor(
        private width: number,
        private height: number,
        private context: BABYLON.ICanvasRenderingContext,
        private texture?: BABYLON.DynamicTexture
    ) {
        if (texture) {
            this.texture.getScene().onBeforeRenderObservable.add(this._update);
        }
    }

    private _update = () => {
        if (this.needRedraw) {
            this.redraw();
            if (this.texture) {
                this.texture.update();
            }
            this.needRedraw = false;
        }
    }

    public add(e: SlikaElement): void {
        this.elements.push(e);
        e.slika = this;
        if (this.texture) {
            e.scene = this.texture.getScene();
        }
    }

    public remove(e: SlikaElement): void {
        this.elements.remove(e);
    }

    public redraw(): void {
        this.context.clearRect(0, 0, this.width, this.height);
        for (let i = 0; i < this.elements.length; i++) {
            this.elements.get(i).redraw(this.context);
        }
    }
}