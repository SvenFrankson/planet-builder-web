interface ISlikaTextBoxProperties {
    text?: string,
    x?: number,
    y?: number,
    w?: number,
    h?: number,
    fontSize?: number,
    fontFamily?: string
    color?: BABYLON.Color3,
    highlightRadius?: number
}

function DefaultSlikaTextBoxProperties(prop: ISlikaTextBoxProperties): void {
    if (!prop.text) {
        prop.text = "";
    }
    if (isNaN(prop.x)) {
        prop.x = 0;
    }
    if (isNaN(prop.y)) {
        prop.y = 0;
    }
    if (isNaN(prop.w)) {
        prop.w = 100;
    }
    if (isNaN(prop.h)) {
        prop.h = 100;
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

class SlikaTextBox extends SlikaElement {

    private _strokes: (SlikaPath | SlikaLine)[] = [];
    private _fills: SlikaPath[] = [];

    public setAlpha(v: number): void {
        super.setAlpha(v * 0.7);
        this._strokes.forEach(s => {
            s.setAlpha(this.alpha);
        });
        this._fills.forEach(f => {
            f.setAlpha(this.alpha);
        });
    }

    constructor(public prop: ISlikaTextBoxProperties) {
        super();
        DefaultSlikaTextBoxProperties(this.prop);
        
        this._strokes.push(
            new SlikaPath(
                new SPoints([
                    this.prop.x, this.prop.y,
                    this.prop.x + this.prop.w, this.prop.y,
                    this.prop.x + this.prop.w, this.prop.y + this.prop.h,
                    this.prop.x, this.prop.y + this.prop.h
                ], true),
                new SlikaShapeStyle(this.prop.color.toHexString(), 1, "none", 1, 1, this.prop.color.toHexString(), 20)
        ));
        
        this._fills.push(
            new SlikaPath(
                new SPoints([
                    this.prop.x, this.prop.y,
                    this.prop.x + this.prop.w, this.prop.y,
                    this.prop.x + this.prop.w, this.prop.y + this.prop.h,
                    this.prop.x, this.prop.y + this.prop.h
                ], true),
                new SlikaShapeStyle("none", 1, this.prop.color.toHexString(), 0.05, 0, this.prop.color.toHexString(), 20)
        ));
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        let hsf = Config.performanceConfiguration.holoScreenFactor;

        this._fills.forEach(f => {
            f.redraw(context);
        })

        this._strokes.forEach(s => {
            s.redraw(context);
        })
        
        let colorString = this.prop.color.toHexString();
        let outlineColorString = this.prop.color.scale(0.6).toHexString();
        let alphaString = Math.floor(this.alpha * 255).toString(16).padStart(2, "0");

        context.fillStyle = colorString + alphaString;
        context.font = (this.prop.fontSize * hsf) + "px " + this.prop.fontFamily;
        context.shadowBlur = this.prop.highlightRadius;
        context.shadowColor = outlineColorString + alphaString;
        context.lineWidth = this.prop.highlightRadius * 0.2;

        let l = "";
        let i = 1;
        let lineSplit = this.prop.text.split("\n");
        for (let n = 0; n < lineSplit.length; n++) {
            let split = lineSplit[n].split(" ");
            while (split.length > 0) {
                let v = split[0];
                if (l === "" || context.measureText(l + v).width < this.prop.w * hsf) {
                    l += " " + v;
                    split.splice(0, 1);
                }
                else {
                    context.fillText(l, this.prop.x * hsf, (this.prop.y + i * this.prop.fontSize) * hsf);
                    l = "";
                    i++
                }
            }
            context.fillText(l, this.prop.x * hsf, (this.prop.y + i * this.prop.fontSize) * hsf);
            l = "";
            i++;
        }
    }
}