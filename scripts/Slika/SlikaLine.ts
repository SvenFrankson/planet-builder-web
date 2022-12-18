interface ISlikaLineProperties {
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    color?: BABYLON.Color3,
    alpha?: number,
    width?: number,
    highlightColor?: BABYLON.Color3,
    highlightRadius?: number,
    outlineColor?: BABYLON.Color3,
    outlineAlpha?: number,
    outlineWidth?: number,
}

function DefaultSlikaLineProperties(prop: ISlikaLineProperties): void {
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

class SlikaLine extends SlikaElement {

    constructor(public prop: ISlikaLineProperties) {
        super();
        DefaultSlikaLineProperties(this.prop);
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        if (!this.isVisible) {
            return;
        }
        let hsf = Config.performanceConfiguration.holoScreenFactor;

        let strokeStyle = this.prop.color.toHexString() + Math.floor((this.prop.alpha * this.alpha) * 255).toString(16).padStart(2, "0");
        let outlineStyle = this.prop.outlineColor.toHexString() + Math.floor((this.prop.outlineAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
        
        context.shadowBlur = this.prop.highlightRadius * hsf;
        context.shadowColor = this.prop.highlightColor.toHexString();

        let lineWidth = this.prop.width * hsf;
        let dx = this.prop.x1 - this.prop.x0;
        let dy = this.prop.y1 - this.prop.y0;
        let l = Math.sqrt(dx * dx + dy * dy);
        let ux = dx / l;
        let uy = dy / l;
        

        if (this.prop.outlineWidth > 0) {
            context.beginPath();
            context.moveTo((this.prop.x0 - ux * this.prop.outlineWidth) * hsf, (this.prop.y0 - uy * this.prop.outlineWidth) * hsf);
            context.lineTo((this.prop.x1 + ux * this.prop.outlineWidth) * hsf, (this.prop.y1 + uy * this.prop.outlineWidth) * hsf);

            context.lineWidth = lineWidth + this.prop.outlineWidth * 2 * hsf;
            context.strokeStyle = outlineStyle;
            context.stroke();
        }

        context.beginPath();
        context.moveTo((this.prop.x0) * hsf, (this.prop.y0) * hsf);
        context.lineTo((this.prop.x1) * hsf, (this.prop.y1) * hsf);

        context.lineWidth = lineWidth;
        context.strokeStyle = strokeStyle;
        context.stroke();
    }
}