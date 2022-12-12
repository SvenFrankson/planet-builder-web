interface ISlikaTextProperties {
    text?: string,
    x?: number,
    y?: number,
    textAlign?: string,
    fontSize?: number,
    fontFamily?: string
    color?: BABYLON.Color3,
    highlightRadius?: number
}

function DefaultSlikaTextProperties(prop: ISlikaTextProperties): void {
    if (!prop.text) {
        prop.text = "";
    }
    if (isNaN(prop.x)) {
        prop.x = 0;
    }
    if (isNaN(prop.y)) {
        prop.y = 0;
    }
    if (!prop.textAlign) {
        prop.textAlign = "left";
    }
    if (isNaN(prop.fontSize)) {
        prop.fontSize = 12;
    }
    if (!prop.color) {
        prop.color = BABYLON.Color3.White();
    }
    if (isNaN(prop.highlightRadius)) {
        prop.highlightRadius = 0;
    }
}

class SlikaText extends SlikaElement {

    constructor(public prop: ISlikaTextProperties) {
        super();
        DefaultSlikaTextProperties(this.prop);
        this.animatePosX = AnimationFactory.CreateNumber(this, this.prop, "x",
            () => {
                if (this.slika) {
                    this.slika.needRedraw = true;
                }
            }
        );
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        let hsf = Config.performanceConfiguration.holoScreenFactor;

        let colorString = this.prop.color.toHexString();
        let alphaString = Math.floor(this.alpha * 255).toString(16).padStart(2, "0");

        context.fillStyle = colorString + alphaString;
        context.font = (this.prop.fontSize * hsf) + "px " + this.prop.fontFamily;
        context.shadowBlur = this.prop.highlightRadius * hsf;
        context.shadowColor = colorString + alphaString;
        let offsetX = 0;
        if (this.prop.textAlign === "center") {
            offsetX = context.measureText(this.prop.text).width * 0.5 / hsf;
        }
        else if (this.prop.textAlign === "end") {
            offsetX = context.measureText(this.prop.text).width / hsf;
        }
        context.lineWidth = 6 * hsf;
        context.strokeStyle = "#000000" + alphaString;
        context.strokeText(this.prop.text, (this.prop.x - offsetX) * hsf, this.prop.y * hsf);
        context.fillText(this.prop.text, (this.prop.x - offsetX) * hsf, this.prop.y * hsf);
    }

    public animatePosX = AnimationFactory.EmptyNumberCallback;
}