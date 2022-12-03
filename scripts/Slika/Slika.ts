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

    private _strokeAlphaString: string = "ff";
    public get strokeAlphaString(): string {
        return this._strokeAlphaString;
    }
    private _fillAlphaString: string = "ff";
    public get fillAlphaString(): string {
        return this._fillAlphaString;
    }

    public get strokeAlpha(): number {
        return this._strokeAlpha;
    }

    public set strokeAlpha(a: number) {
        this._strokeAlpha = a;
        this._strokeAlphaString = Math.floor(this._strokeAlpha * 255).toString(16).padStart(2, "0");
    }

    public get fillAlpha(): number {
        return this._fillAlpha;
    }

    public set fillAlpha(a: number) {
        this._fillAlpha = a;
        this._fillAlphaString = Math.floor(this._fillAlpha * 255).toString(16).padStart(2, "0");
    }

    constructor(
        public stroke: string = "white",
        private _strokeAlpha: number = 1,
        public fill: string = "none",
        private _fillAlpha: number = 1,
        public width: number = 1,
        public highlightColor: string = "white",
        public highlightRadius: number = 20
    ) {
        this._strokeAlphaString = Math.floor(this._strokeAlpha * 255).toString(16).padStart(2, "0");
        this._fillAlphaString = Math.floor(this._fillAlpha * 255).toString(16).padStart(2, "0");
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

    private _alpha: number = 1;
    public get alpha(): number {
        return this._alpha;
    }
    public setAlpha(v: number): void {
        this._alpha = v;
    }

    public onPointerDown: () => void;
    public onPointerUp: () => void;

    constructor() {

    }

    public abstract redraw(context: BABYLON.ICanvasRenderingContext): void;

    public onHoverStart(): void {}

    public onHoverEnd(): void {}

    private _animateAlphaCB: () => void;
    public async animateAlpha(alphaTarget: number, duration: number = 1): Promise<void> {
        if (this.scene) {
            if (this._animateAlphaCB) {
                this.scene.onBeforeRenderObservable.removeCallback(this._animateAlphaCB);
            }
            return new Promise<void>(resolve => {
                let alphaZero = this.alpha;
                let t = 0;
                this._animateAlphaCB = () => {
                    t += this.scene.getEngine().getDeltaTime() / 1000;
                    if (t < duration) {
                        let f = t / duration;
                        this.setAlpha(alphaZero * (1 - f) + alphaTarget * f);
                        if (this.slika) {
                            this.slika.needRedraw = true;
                        }
                    }
                    else {
                        this.setAlpha(alphaTarget);
                        if (this.slika) {
                            this.slika.needRedraw = true;
                        }
                        this.scene.onBeforeRenderObservable.removeCallback(this._animateAlphaCB);
                        this._animateAlphaCB = undefined;
                        resolve();
                    }
                }
                this.scene.onBeforeRenderObservable.add(this._animateAlphaCB);
            });
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
        context.strokeStyle = this.style.stroke + Math.floor((this.style.strokeAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
        context.shadowBlur = this.style.highlightRadius;
        context.shadowColor = this.style.highlightColor;
        context.lineWidth = this.style.width;
        context.beginPath();
        context.moveTo(this.pStart.x, this.pStart.y);
        context.lineTo(this.pEnd.x, this.pEnd.y);
        context.stroke();
    }
}

class SlikaImage extends SlikaElement {

    private _img: HTMLImageElement;
    private _isLoaded: boolean = false;
    public size: number = 1;

    public static Create(x0: number, y0: number, x1: number, y1: number, style = new SlikaShapeStyle()): SlikaLine {
        return new SlikaLine(
            new SPosition(x0, y0),
            new SPosition(x1, y1),
            style
        );
    }

    constructor(
        public p: SPosition = new SPosition(),
        public w: number,
        public h: number,
        public url: string
    ) {
        super();
        this._img = new Image();
        this._img.src = url;
        this._img.onload = () => {
            this._isLoaded = true;
        };
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        if (this._isLoaded) {
            context.drawImage(this._img, this.p.x - this.w * 0.5 * this.size, this.p.y - this.h * 0.5 * this.size, this.w * this.size, this.h * this.size);
        }
        else {
            requestAnimationFrame(() => {
                this.redraw(context);
            })
        }
    }

    private _animateSizeCB: () => void;
    public async animateSize(sizeTarget: number, duration: number = 1): Promise<void> {
        if (this.scene) {
            if (this._animateSizeCB) {
                this.scene.onBeforeRenderObservable.removeCallback(this._animateSizeCB);
            }
            return new Promise<void>(resolve => {
                let sizeZero = this.size;
                let t = 0;
                this._animateSizeCB = () => {
                    t += this.scene.getEngine().getDeltaTime() / 1000;
                    if (t < duration) {
                        let f = t / duration;
                        this.size = sizeZero * (1 - f) + sizeTarget * f;
                        if (this.slika) {
                            this.slika.needRedraw = true;
                        }
                    }
                    else {
                        this.size = sizeTarget;
                        if (this.slika) {
                            this.slika.needRedraw = true;
                        }
                        this.scene.onBeforeRenderObservable.removeCallback(this._animateSizeCB);
                        this._animateSizeCB = undefined;
                        resolve();
                    }
                }
                this.scene.onBeforeRenderObservable.add(this._animateSizeCB);
            });
        }
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
        context.strokeStyle = this.style.stroke + this.style.strokeAlphaString;
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
        let alphaString = Math.floor(this.alpha * 255).toString(16).padStart(2, "0");
        context.fillStyle = this.textStyle.color + alphaString;
        context.font = this.textStyle.size + "px " + this.textStyle.fontFamily;
        context.shadowBlur = this.textStyle.highlightRadius;
        context.shadowColor = this.textStyle.highlightColor + alphaString;;
        context.strokeStyle = this.textStyle.highlightColor + alphaString;;
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
        public color: BABYLON.Color3 = BABYLON.Color3.White(),
        public XToDY?: (x: number) => number,
        public YToDX?: (y: number) => number
    ) {
        super();

        let hexColor = color.toHexString();

        this._lines.push(new SlikaLine(undefined, undefined, new SlikaShapeStyle(hexColor, 1, "none", 1, 3, hexColor, 10)));
        this._lines.push(new SlikaLine(undefined, undefined, new SlikaShapeStyle(hexColor, 1, "none", 1, 3, hexColor, 10)));
        this._lines.push(new SlikaLine(undefined, undefined, new SlikaShapeStyle(hexColor, 1, "none", 1, 3, hexColor, 10)));
        this._lines.push(new SlikaLine(undefined, undefined, new SlikaShapeStyle(hexColor, 1, "none", 1, 3, hexColor, 10)));
        this._circle = SlikaCircle.Circle(0, 0, 60, new SlikaShapeStyle(hexColor, 1, "none", 1, 3, hexColor, 10));
    }

    public setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.x = Math.max(this.min.x + this.r, Math.min(this.max.x - this.r, this.position.x));
        this.position.y = y;
        this.position.y = Math.max(this.min.y + this.r, Math.min(this.max.y - this.r, this.position.y));

        this._updatePosition();
    }

    private _updatePosition(): void {
        let dx = 0;
        if (this.YToDX) {
            dx = this.YToDX(this.position.y);
        }
        let dy = 0;
        if (this.XToDY) {
            dy = this.XToDY(this.position.x);
        }

        this._lines[0].pStart.x = this.min.x + dx;
        this._lines[0].pStart.y = this.position.y;
        this._lines[0].pEnd.x = this.position.x - this.r;
        this._lines[0].pEnd.y = this.position.y;
        
        this._lines[1].pStart.x = this.position.x;
        this._lines[1].pStart.y = this.min.y + dy;
        this._lines[1].pEnd.x = this.position.x;
        this._lines[1].pEnd.y = this.position.y - this.r;
        
        this._lines[2].pStart.x = this.position.x + this.r;
        this._lines[2].pStart.y = this.position.y;
        this._lines[2].pEnd.x = this.max.x - dx;
        this._lines[2].pEnd.y = this.position.y;
        
        this._lines[3].pStart.x = this.position.x;
        this._lines[3].pStart.y = this.position.y + this.r;
        this._lines[3].pEnd.x = this.position.x;
        this._lines[3].pEnd.y = this.max.y - dy;

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

    public add(e: SlikaElement): SlikaElement {
        this.elements.push(e);
        if (e.isPickable) {
            this.pickableElements.push(e);
        }
        e.slika = this;
        if (this.texture) {
            e.scene = this.texture.getScene();
        }
        return e;
    }

    public remove(e: SlikaElement): void {
        this.elements.remove(e);
        this.pickableElements.remove(e);
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
                    return;
                }
            }
        }
        this.setAimedElement(undefined);
    }

    public onPointerDown(x: number, y: number): void {
        if (this.aimedElement) {
            if (this.aimedElement.onPointerDown) {
                this.aimedElement.onPointerDown();
            }
        }
    }

    public onPointerUp(x: number, y: number): void {
        if (this.aimedElement) {
            if (this.aimedElement.onPointerUp) {
                this.aimedElement.onPointerUp();
            }
        }
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