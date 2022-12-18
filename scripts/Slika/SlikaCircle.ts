interface ISlikaCircleProperties {
    x: number,
    y: number,
    r: number,
    color?: BABYLON.Color3,
    alpha?: number,
    width?: number,
    highlightColor?: BABYLON.Color3,
    highlightRadius?: number,
    outlineColor?: BABYLON.Color3,
    outlineAlpha?: number,
    outlineWidth?: number,
}

function DefaultSlikaCircleProperties(prop: ISlikaCircleProperties): void {
    if (!prop.color) {
        prop.color = BABYLON.Color3.White();
    }
    if (isNaN(prop.alpha)) {
        prop.alpha = 1;
    }
    if (isNaN(prop.width)) {
        prop.width = 1;
    }
    if (!prop.highlightColor) {
        prop.highlightColor = prop.color.clone();
    }
    if (isNaN(prop.highlightRadius)) {
        prop.highlightRadius = 0;
    }
    if (!prop.outlineColor) {
        prop.outlineColor = BABYLON.Color3.Black();
    }
    if (isNaN(prop.outlineAlpha)) {
        prop.outlineAlpha = 1;
    }
    if (isNaN(prop.outlineWidth)) {
        prop.outlineWidth = 0;
    }
}

class SlikaCircle extends SlikaElement {

    constructor(public prop: ISlikaCircleProperties) {
        super();
        DefaultSlikaCircleProperties(this.prop);
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        let hsf = Config.performanceConfiguration.holoScreenFactor;

        let strokeStyle = this.prop.color.toHexString() + Math.floor((this.prop.alpha * this.alpha) * 255).toString(16).padStart(2, "0");
        let outlineStyle = this.prop.outlineColor.toHexString() + Math.floor((this.prop.outlineAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
        
        context.shadowBlur = this.prop.highlightRadius * hsf;
        context.shadowColor = this.prop.highlightColor.toHexString();

        let lineWidth = this.prop.width * hsf;
        context.beginPath();
        context.arc(this.prop.x * hsf, this.prop.y * hsf, this.prop.r * hsf, 0, 2 * Math.PI, true);

        if (this.prop.outlineWidth > 0) {
            context.lineWidth = lineWidth + this.prop.outlineWidth * 2 * hsf;
            context.strokeStyle = outlineStyle;
            context.stroke();
        }

        context.lineWidth = lineWidth;
        context.strokeStyle = strokeStyle;
        context.stroke();
    }
}