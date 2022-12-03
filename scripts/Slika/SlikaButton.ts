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

    public setAlpha(v: number): void {
        super.setAlpha(v);
        if (this._text) {
            this._text.setAlpha(this.alpha);
        }
        this._strokes.forEach(s => {
            s.setAlpha(this.alpha);
        });
        this._fills.forEach(f => {
            f.setAlpha(this.alpha);
        });
    }

    constructor(
        public label: string,
        public position: SPosition,
        public color: BABYLON.Color3 = BABYLON.Color3.White()
    ) {
        super();
        this.isPickable = true;
        this.hitBox = SRect.WidthHeight(this.position.x, this.position.y, 360, 132);

        let hexColor = color.toHexString();

        let w = 360;
        let h = 160;

        this._text = new SlikaText(
            label,
            new SPosition(this.position.x + w * 0.5, this.position.y + h * 0.5 + 80 * 0.3, "center"),
            new SlikaTextStyle(hexColor, 80, "XoloniumRegular", color.scale(0.6).toHexString())
        );

        let L1 = w / 3;
        let L2 = 20;
        let L3 = 15;
        let L4 = 5;

        this._strokes.push(
            new SlikaPath(
                new SPoints([
                    this.position.x, this.position.y,
                    this.position.x + 2 * L1, this.position.y,
                    this.position.x + 2 * L1 + L2, this.position.y + L2,
                    this.position.x + w, this.position.y + L2,
                    this.position.x + w, this.position.y + h,
                    this.position.x + L1, this.position.y + h,
                    this.position.x + L1 - L4, this.position.y + h - L4,
                    this.position.x, this.position.y + h - L4,
                ], true),
                new SlikaShapeStyle(hexColor, 1, "none", 1, 3, hexColor, 20)
        ));
        
        this._fills.push(
            new SlikaPath(
                new SPoints([
                    7 + this.position.x + w, this.position.y,
                    7 + this.position.x + w + L3, this.position.y + L3,
                    7 + this.position.x + w + L3, this.position.y + h - L3,
                    7 + this.position.x + w, this.position.y + h,
                ], true),
                new SlikaShapeStyle("none", 1, hexColor, 0.5, 0, hexColor, 20)
        ));

        this._fills.push(
            new SlikaPath(
                new SPoints([
                    9 + this.position.x + 2 * L1, this.position.y - 1.5,
                    4 + this.position.x + 2 * L1 + L2, this.position.y + L2 - 8,
                    1.5 + this.position.x + w, this.position.y + L2 - 8,
                    1.5 + this.position.x + w, this.position.y - 1.5,
                ], true),
                new SlikaShapeStyle("none", 1, hexColor, 0.5, 0, hexColor, 20)
        ));
        
        this._fills.push(
            new SlikaPath(
                new SPoints([
                    - 7 + this.position.x, this.position.y,
                    - 7 + this.position.x - L4, this.position.y + L4,
                    - 7 + this.position.x - L4, this.position.y + h - L4 + 1.5,
                    - 7 + this.position.x, this.position.y + h - L4 + 1.5,
                ], true),
                new SlikaShapeStyle("none", 1, hexColor, 0.5, 0, hexColor, 20)
        ));
        
        /*
        this._fills.push(
            new SlikaPath(
                new SPoints([
                    - 7 + this.position.x, this.position.y + h * 0.5 + 3,
                    - 7 + this.position.x - L3, this.position.y + h * 0.5 + 3,
                    - 7 + this.position.x - L3, this.position.y + h - L3 - L2,
                    - 7 + this.position.x, this.position.y + h - L2,
                ], true),
                new SlikaShapeStyle("none", 1, hexColor, 0.5, 0, hexColor, 20)
        ));
        */
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
            f.style.fill = hexColor;
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