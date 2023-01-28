interface ISlikaPathProperties {
    points?: number[],
    close?: boolean,
    fillColor?: BABYLON.Color3,
    fillAlpha?: number,
    strokeColor?: BABYLON.Color3,
    strokeAlpha?: number,
    width?: number,
    highlightColor?: BABYLON.Color3,
    highlightRadius?: number,
    outlineColor?: BABYLON.Color3,
    outlineAlpha?: number,
    outlineWidth?: number,
}

function DefaultSlikaPathProperties(prop: ISlikaPathProperties): void {
    if (isNaN(prop.fillAlpha)) {
        prop.fillAlpha = 1;
    }
    if (isNaN(prop.strokeAlpha)) {
        prop.strokeAlpha = 1;
    }
    if (isNaN(prop.width)) {
        prop.width = 1;
    }
    if (!prop.highlightColor) {
        if (prop.fillColor) {
            prop.highlightColor = prop.fillColor.clone();
        }
        else if (prop.strokeColor) {
            prop.highlightColor = prop.strokeColor.clone();
        }
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

class SlikaPath extends SlikaElement {

    public posX: number = 0;
    public posY: number = 0;

    public static CreateParenthesis(
        x0: number,
        x1: number,
        y0: number,
        H: number,
        flip: boolean,
        prop: ISlikaPathProperties
    ): SlikaPath {
        DefaultSlikaPathProperties(prop);

        let yUp = y0 + (x1 - x0);
        let yBottom = y0 + H - (x1 - x0);
        
        if (flip) {
            let tmp = x1;
            x1 = x0;
            x0 = tmp;
        }
        
        prop.points = [
            x1, y0,
            x0, yUp,
            x0, yBottom,
            x1, y0 + H
        ];
        prop.close = true;

        return new SlikaPath(prop);
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
        prop: ISlikaPathProperties
    ): SlikaPath {
        DefaultSlikaPathProperties(prop);
        
        let sign = flip ? - 1 : 1;

        if (bigRight) {
            let xBottom = x1 - (x1 - x0) * ratio;
            let xUp = xBottom - (H - thickness);

            prop.points = [
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

            prop.points = [
                x0, y0,
                x1, y0,
                x1, y0 + sign * thickness,
                xUp, y0 + sign * thickness,
                xBottom, y0 + sign * H,
                x0, y0 + sign * H
            ];
        }
        prop.close = true;

        return new SlikaPath(prop);
    }

    constructor(public prop: ISlikaPathProperties) {
        super();
        DefaultSlikaPathProperties(this.prop);
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        let hsf = Config.performanceConfiguration.holoScreenFactor;

        if (this.prop.points.length > 0) {

            let fillStyle = "none";
            if (this.prop.fillColor) {
                fillStyle = this.prop.fillColor.toHexString() + Math.floor((this.prop.fillAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
            }
            let strokeStyle = "none";
            if (this.prop.strokeColor) {
                strokeStyle = this.prop.strokeColor.toHexString() + Math.floor((this.prop.strokeAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
            }
            let outlineStyle = "none";
            if (this.prop.outlineWidth > 0) {
                outlineStyle = this.prop.outlineColor.toHexString() + Math.floor((this.prop.outlineAlpha * this.alpha) * 255).toString(16).padStart(2, "0");
            }
            
            context.shadowBlur = this.prop.highlightRadius * hsf;
            context.shadowColor = this.prop.highlightColor.toHexString();
    
            let lineWidth = this.prop.width * hsf;

            context.beginPath();
            context.moveTo((this.prop.points[0] + this.posX) * hsf, (this.prop.points[1] + this.posY) * hsf);
            for (let i = 1; i < this.prop.points.length / 2; i++) {
                context.lineTo((this.prop.points[2 * i] + this.posX) * hsf, (this.prop.points[2 * i + 1] + this.posY) * hsf);
            }
            if (this.prop.close) {
                context.closePath();
            }

            if (outlineStyle != "none") {
                context.lineWidth = lineWidth + this.prop.outlineWidth * 2 * hsf;
                context.strokeStyle = outlineStyle;
                context.stroke();
            }
            if (fillStyle != "none") {
                context.fillStyle = fillStyle;
                context.fill();
            }
            if (strokeStyle != "none") {
                context.strokeStyle = strokeStyle;
                context.lineWidth = lineWidth;
                context.stroke();
            }
        }
    }
}