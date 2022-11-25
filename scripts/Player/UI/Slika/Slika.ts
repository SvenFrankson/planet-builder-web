class SPosition {

    constructor(
        public x: number = 0,
        public y: number = 0,
        public textAlign: string = "start"
    ) {

    }
}

class SRect {

    public static WidthHeight(x: number, y: number, w: number, h: number): SRect {
        return new SRect(x, y, x + w, y + h);
    }

    public static MinMax(xMin: number, yMin: number, xMax: number, yMax: number): SRect {
        return new SRect(xMin, yMin, xMax, yMax);
    }
    
    constructor(
        public x0: number = 0,
        public y0: number = 0,
        public x1: number = 0,
        public y1: number = 0
    ) {

    }
}

class SArc {

    constructor(
        public r: number = 10,
        public a0: number = 0,
        public a1: number = 2 * Math.PI
    ) {
        
    }
}

class SPoints {

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
    public isPickable: boolean = false;
    public hitBox : SRect;

    constructor() {

    }

    public abstract redraw(context: BABYLON.ICanvasRenderingContext): void;

    public onHoverStart(): void {}

    public onHoverEnd(): void {}
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
            new SPosition(x0, y0),
            new SPosition(x1, y1),
            style
        );
    }

    constructor(
        public pStart: SPosition = new SPosition(),
        public pEnd: SPosition = new SPosition(),
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

class SlikaCircle extends SlikaElement {

    public static Circle(x: number, y: number, r: number, style = new SlikaShapeStyle()): SlikaCircle {
        return new SlikaCircle(
            new SPosition(x, y),
            new SArc(r, 0, 2 * Math.PI),
            style
        );
    }

    constructor(
        public pCenter: SPosition = new SPosition(),
        public pArc: SArc = new SArc(),
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
        context.arc(this.pCenter.x, this.pCenter.y, this.pArc.r, this.pArc.a0, this.pArc.a1, true);
        context.stroke();
    }
}

class SlikaText extends SlikaElement {

    public text: string;
    public position: SPosition;
    public textStyle: SlikaTextStyle;

    constructor(text: string = "", position?: SPosition, textStyle?: SlikaTextStyle) {
        super();
        this.text = text;
        if (position) {
            this.position = position;
        }
        else {
            this.position = new SPosition();
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

class SlikaPointer extends SlikaElement {

    private _lines: SlikaLine[] = [];
    private _circle: SlikaCircle;

    constructor(
        public position: SPosition,
        public min: SPosition,
        public max: SPosition,
        public r: number,
        public color: BABYLON.Color3 = BABYLON.Color3.White()
    ) {
        super();

        let hexColor = color.toHexString();

        this._lines.push(new SlikaLine(undefined, undefined, new SlikaShapeStyle(hexColor, "none", 3, hexColor, 10)));
        this._lines.push(new SlikaLine(undefined, undefined, new SlikaShapeStyle(hexColor, "none", 3, hexColor, 10)));
        this._lines.push(new SlikaLine(undefined, undefined, new SlikaShapeStyle(hexColor, "none", 3, hexColor, 10)));
        this._lines.push(new SlikaLine(undefined, undefined, new SlikaShapeStyle(hexColor, "none", 3, hexColor, 10)));
        this._circle = SlikaCircle.Circle(0, 0, 60, new SlikaShapeStyle(hexColor, "none", 3, hexColor, 10));
    }

    public setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.x = Math.max(this.min.x + this.r, Math.min(this.max.x - this.r, this.position.x));
        this.position.y = y;
        this.position.y = Math.max(this.min.y + this.r, Math.min(this.max.y - this.r, this.position.y));

        this._updatePosition();
    }

    private _updatePosition(): void {
        this._lines[0].pStart.x = this.min.x;
        this._lines[0].pStart.y = this.position.y;
        this._lines[0].pEnd.x = this.position.x - this.r;
        this._lines[0].pEnd.y = this.position.y;
        
        this._lines[1].pStart.x = this.position.x;
        this._lines[1].pStart.y = this.min.y;
        this._lines[1].pEnd.x = this.position.x;
        this._lines[1].pEnd.y = this.position.y - this.r;
        
        this._lines[2].pStart.x = this.position.x + this.r;
        this._lines[2].pStart.y = this.position.y;
        this._lines[2].pEnd.x = this.max.x;
        this._lines[2].pEnd.y = this.position.y;
        
        this._lines[3].pStart.x = this.position.x;
        this._lines[3].pStart.y = this.position.y + this.r;
        this._lines[3].pEnd.x = this.position.x;
        this._lines[3].pEnd.y = this.max.y;

        this._circle.pCenter.x = this.position.x;
        this._circle.pCenter.y = this.position.y;

        if (this.slika) {
            this.slika.needRedraw = true;
        }
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        this._lines.forEach(l => {
            l.redraw(context);
        });
        this._circle.redraw(context);
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
        public position: SPosition,
        public color: BABYLON.Color3 = BABYLON.Color3.White()
    ) {
        super();
        this.isPickable = true;
        this.hitBox = SRect.WidthHeight(this.position.x, this.position.y, 360, 132);

        let hexColor = color.toHexString();

        this._text = new SlikaText(
            label,
            new SPosition(this.position.x + 180, this.position.y + 80, "center"),
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

    public onHoverStart(): void {
        let color = this.colors[this.state].clone().scale(1.4);
        color.clampToRef(0, 1, color);
        this._animateColor(color, 0.3);
    }

    public onHoverEnd(): void {
        this._animateColor(this.colors[this.state], 0.3);
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

    private _animateColorCB: () => void;
    private async _animateColor(targetColor: BABYLON.Color3, duration: number = 1): Promise<void> {
        if (this.scene) {
            if (this._animateColorCB) {
                this.scene.onBeforeRenderObservable.removeCallback(this._animateColorCB);
            }
            return new Promise<void>(resolve => {
                let colorZero = this.color.clone();
                let t = 0;
                this._animateColorCB = () => {
                    t += this.scene.getEngine().getDeltaTime() / 1000;
                    if (t < duration) {
                        let f = t / duration;
                        BABYLON.Color3.LerpToRef(colorZero, targetColor, f, this.color);
                        this._updateColor();
                    }
                    else {
                        this.color.copyFrom(targetColor);
                        this._updateColor();
                        this.scene.onBeforeRenderObservable.removeCallback(this._animateColorCB);
                        this._animateColorCB = undefined;
                        resolve();
                    }
                }
                this.scene.onBeforeRenderObservable.add(this._animateColorCB);
            });
        }
    }
}

class Slika {

    private elements: UniqueList<SlikaElement> = new UniqueList<SlikaElement>();
    private pickableElements: UniqueList<SlikaElement> = new UniqueList<SlikaElement>();
    public needRedraw: boolean = true;
    public aimedElement: SlikaElement;

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
        if (e.isPickable) {
            this.pickableElements.push(e);
        }
        e.slika = this;
        if (this.texture) {
            e.scene = this.texture.getScene();
        }
        console.log(this.pickableElements.length);
    }

    public remove(e: SlikaElement): void {
        this.elements.remove(e);
        this.pickableElements.remove(e);
        console.log("X" + this.pickableElements.length);
    }

    public redraw(): void {
        this.context.clearRect(0, 0, this.width, this.height);
        for (let i = 0; i < this.elements.length; i++) {
            this.elements.get(i).redraw(this.context);
        }
    }

    public onPointerEnter(x: number, y: number): void {
        this.onPointerMove(x, y);
    }

    public onPointerMove(x: number, y: number): void {
        for (let i = 0; i < this.pickableElements.length; i++) {
            let e = this.pickableElements.get(i);
            if (x > e.hitBox.x0 && x < e.hitBox.x1) {
                if (y > e.hitBox.y0 && y < e.hitBox.y1) {
                    this.setAimedElement(e);
                    console.log(":)");
                    return;
                }
            }
        }
        console.log(":( " + this.pickableElements.length);
        this.setAimedElement(undefined);
    }

    public onPointerExit(): void {
        this.setAimedElement(undefined);
    }

    public setAimedElement(e: SlikaElement): void {
        if (e != this.aimedElement) {
            if (this.aimedElement) {
                this.aimedElement.onHoverEnd();
            }
            this.aimedElement = e;
            if (this.aimedElement) {
                this.aimedElement.onHoverStart();
            }
        }
    }
}