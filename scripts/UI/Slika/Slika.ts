class SlikaPosition {

    public x: number = 0;
    public y: number = 0;

    constructor(
        x?: number,
        y?: number
    ) {
        if (isFinite(x)) {
            this.x = x;
        }
        if (isFinite(y)) {
            this.y = y;
        }
    }
}

class SlikaShapeStyle {

    constructor(
        public color: string = "white",
        public width: number = 1,
        public highlightColor: string = "white",
        public highlightRadius: number = 20
    ) {

    }
}

class SlikaTextStyle {

    public color: string = "white";
    public size: number = 20;
    public fontFamily: string = "Consolas";
    public highlightColor: string = "white";
    public highlightRadius: number = 20;

    constructor(
        color?: string,
        size?: number,
        fontFamily?: string
    ) {
        if (color) {
            this.color = color;
        }
        if (isFinite(size)) {
            this.size = size;
        }
        if (fontFamily) {
            this.fontFamily = fontFamily;
        }
        if (this.highlightRadius) {
            this.highlightRadius = this.highlightRadius;
        }
    }
}

abstract class SlikaElement {

    constructor() {

    }

    public abstract redraw(context: BABYLON.ICanvasRenderingContext): void;
}

class SlikaPath extends SlikaElement {

    constructor() {
        super();
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        
    }
}

class SlikaLine extends SlikaElement {

    constructor(
        public pStart: SlikaPosition = new SlikaPosition(),
        public pEnd: SlikaPosition = new SlikaPosition(),
        public style: SlikaShapeStyle = new SlikaShapeStyle()
    ) {
        super();
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        context.strokeStyle = this.style.color;
        context.shadowBlur = this.style.highlightRadius;
        context.shadowColor = this.style.highlightColor;
        context.strokeStyle = this.style.highlightColor;
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
        context.strokeText(this.text, this.position.x, this.position.y);
        context.fillText(this.text, this.position.x, this.position.y);
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