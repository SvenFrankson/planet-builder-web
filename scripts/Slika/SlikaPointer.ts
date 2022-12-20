interface ISlikaPointerProperties {
    x: number,
    y: number,
    xMin?: number,
    yMin?: number,
    xMax?: number,
    yMax?: number,
    radius?: number,
    color?: BABYLON.Color3
}

function DefaultSlikaPointerProperties(prop: ISlikaPointerProperties): void {
    if (isNaN(prop.xMin)) {
        prop.xMin = 1;
    }
    if (isNaN(prop.yMin)) {
        prop.yMin = 1;
    }
    if (isNaN(prop.xMax)) {
        prop.xMax = 1;
    }
    if (isNaN(prop.yMax)) {
        prop.yMax = 1;
    }
    if (isNaN(prop.radius)) {
        prop.radius = 1;
    }
    if (!prop.color) {
        prop.color = BABYLON.Color3.White();
    }
}

class SlikaPointer extends SlikaElement {

    protected _lines: SlikaLine[] = [];
    protected _circle: SlikaCircle;
    protected _width: number = 4;
    public XToDY: (x: number) => number;
    public YToDX: (y: number) => number;

    constructor(public prop: ISlikaPointerProperties) {
        super();
        DefaultSlikaPointerProperties(prop);

        this._lines.push(new SlikaLine({ x0: 0, y0: 0, x1: 0, y1: 0, color: this.prop.color, alpha: 1, width: this._width, outlineWidth: 2 }));
        this._lines.push(new SlikaLine({ x0: 0, y0: 0, x1: 0, y1: 0, color: this.prop.color, alpha: 1, width: this._width, outlineWidth: 2 }));
        this._lines.push(new SlikaLine({ x0: 0, y0: 0, x1: 0, y1: 0, color: this.prop.color, alpha: 1, width: this._width, outlineWidth: 2 }));
        this._lines.push(new SlikaLine({ x0: 0, y0: 0, x1: 0, y1: 0, color: this.prop.color, alpha: 1, width: this._width, outlineWidth: 2 }));
        
        this._circle = new SlikaCircle({ x: 0, y: 0, r: this.prop.radius, color: this.prop.color, alpha: 1, width: this._width, outlineWidth: 2 });
    }

    public setPosition(x: number, y: number): void {
        this.prop.x = x;
        this.prop.x = Math.max(this.prop.xMin + this.prop.radius, Math.min(this.prop.xMax - this.prop.radius, this.prop.x));
        this.prop.y = y;
        this.prop.y = Math.max(this.prop.xMin + this.prop.radius, Math.min(this.prop.yMax - this.prop.radius, this.prop.y));

        this._updatePosition();
    }

    protected _updatePosition(): void {
        let dx = 0;
        if (this.YToDX) {
            dx = this.YToDX(this.prop.y);
        }
        let dy = 0;
        if (this.XToDY) {
            dy = this.XToDY(this.prop.x);
        }

        this._lines[0].prop.x0 = this.prop.xMin + dx;
        this._lines[0].prop.y0 = this.prop.y;
        this._lines[0].prop.x1 = this.prop.x - this.prop.radius - 3 * this._width;
        this._lines[0].prop.y1 = this.prop.y;

        this._lines[0].display = this._lines[0].prop.x0 < this._lines[0].prop.x1;
        
        this._lines[1].prop.x0 = this.prop.x;
        this._lines[1].prop.y0 = this.prop.xMin + dy;
        this._lines[1].prop.x1 = this.prop.x;
        this._lines[1].prop.y1 = this.prop.y - this.prop.radius - 3 * this._width;
        
        this._lines[1].display = this._lines[1].prop.y0 < this._lines[1].prop.y1;
        
        this._lines[2].prop.x0 = this.prop.x + this.prop.radius + 3 * this._width;
        this._lines[2].prop.y0 = this.prop.y;
        this._lines[2].prop.x1 = this.prop.xMax - dx;
        this._lines[2].prop.y1 = this.prop.y;
        
        this._lines[2].display = this._lines[2].prop.x0 < this._lines[2].prop.x1;
        
        this._lines[3].prop.x0 = this.prop.x;
        this._lines[3].prop.y0 = this.prop.y + this.prop.radius + 3 * this._width;
        this._lines[3].prop.x1 = this.prop.x;
        this._lines[3].prop.y1 = this.prop.yMax - dy;
        
        this._lines[3].display = this._lines[3].prop.y0 < this._lines[3].prop.y1;

        this._circle.prop.x = this.prop.x;
        this._circle.prop.y = this.prop.y;

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

class SlikaPointerLite extends SlikaPointer {

    constructor(public prop: ISlikaPointerProperties) {
        super(prop);
        
        this._circle = new SlikaCircle({ x: 0, y: 0, r: this.prop.radius, color: this.prop.color, alpha: 1, width: this._width, outlineWidth: 2 });

        this.animateRadius = AnimationFactory.CreateNumber(this, this._circle.prop, "r",
            () => {
                if (this.slika) {
                    this.slika.needRedraw = true;
                }
            }
        );
    }

    protected _updatePosition(): void {
        this._circle.prop.x = this.prop.x;
        this._circle.prop.y = this.prop.y;

        if (this.slika) {
            this.slika.needRedraw = true;
        }
    }

    public redraw(context: BABYLON.ICanvasRenderingContext): void {
        this._circle.redraw(context);
    }

    public animateRadius = AnimationFactory.EmptyNumberCallback;
}