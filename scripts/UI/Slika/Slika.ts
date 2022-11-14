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

class SlikaTextStyle {

    public color: string = "white";
    public size: number = 20;
    public fontFamily: string = "Consolas";

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