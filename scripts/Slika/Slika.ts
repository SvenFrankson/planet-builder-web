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
    public display: boolean = true;
    public hitBox : SRect;

    private _alpha: number = 1;
    public get alpha(): number {
        return this._alpha;
    }
    public setAlpha(v: number): void {
        this._alpha = v;
    }
    public get isVisible(): boolean {
        return this.display && this._alpha != 0;
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
                        let f = Easing.easeOutCubic(t / duration);
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

class Slika {

    private elements: UniqueList<SlikaElement> = new UniqueList<SlikaElement>();
    private pickableElements: UniqueList<SlikaElement> = new UniqueList<SlikaElement>();
    private _needRedraw: boolean = true;
    public get needRedraw(): boolean {
        return this._needRedraw;
    }
    public set needRedraw(v: boolean) {
        this._needRedraw = v;
    }
    public aimedElement: SlikaElement;

    constructor(
        private width: number,
        private height: number,
        public context: BABYLON.ICanvasRenderingContext,
        public texture: BABYLON.DynamicTexture
    ) {
        if (texture) {
            this.texture.getScene().onBeforeRenderObservable.add(this._update);
        }
    }

    private _update = () => {
        if (this.needRedraw) {
            this._redraw();
            if (this.texture) {
                this.texture.update();
            }
            this.needRedraw = false;
        }
    }

    public add<T extends SlikaElement>(e: T): T {
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

    private _redraw(): void {
        this.context.clearRect(0, 0, this.width, this.height);
        for (let i = 0; i < this.elements.length; i++) {
            let e = this.elements.get(i);
            if (e.isVisible) {
                this.elements.get(i).redraw(this.context);
            }
        }
    }

    public onPointerEnter(x: number, y: number): void {
        this.onPointerMove(x, y);
    }

    public onPointerMove(x: number, y: number): void {
        for (let i = 0; i < this.pickableElements.length; i++) {
            let e = this.pickableElements.get(i);
            if (e.isVisible) {
                if (x > e.hitBox.x0 && x < e.hitBox.x1) {
                    if (y > e.hitBox.y0 && y < e.hitBox.y1) {
                        this.setAimedElement(e);
                        return;
                    }
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