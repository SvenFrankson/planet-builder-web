class SlikaPointer extends SlikaElement {

    private _lines: SlikaLine[] = [];
    private _circle: SlikaCircle;
    private _width: number = 4;

    constructor(
        public position: SPosition,
        public min: SPosition,
        public max: SPosition,
        public r: number,
        public color: BABYLON.Color3 = BABYLON.Color3.White(),
        public XToDY?: (x: number) => number,
        public YToDX?: (y: number) => number
    ) {
        super();

        this._lines.push(new SlikaLine({ x0: 0, y0: 0, x1: 0, y1: 0, color: color, alpha: 1, width: this._width, outlineWidth: 2 }));
        this._lines.push(new SlikaLine({ x0: 0, y0: 0, x1: 0, y1: 0, color: color, alpha: 1, width: this._width, outlineWidth: 2 }));
        this._lines.push(new SlikaLine({ x0: 0, y0: 0, x1: 0, y1: 0, color: color, alpha: 1, width: this._width, outlineWidth: 2 }));
        this._lines.push(new SlikaLine({ x0: 0, y0: 0, x1: 0, y1: 0, color: color, alpha: 1, width: this._width, outlineWidth: 2 }));
        
        this._circle = new SlikaCircle({ x: 0, y: 0, r: this.r, color: color, alpha: 1, width: this._width, outlineWidth: 2 });
    }

    public setPosition(x: number, y: number): void {
        this.position.x = x;
        this.position.x = Math.max(this.min.x + this.r, Math.min(this.max.x - this.r, this.position.x));
        this.position.y = y;
        this.position.y = Math.max(this.min.y + this.r, Math.min(this.max.y - this.r, this.position.y));

        this._updatePosition();
    }

    private _updatePosition(): void {
        let dx = 0;
        if (this.YToDX) {
            dx = this.YToDX(this.position.y);
        }
        let dy = 0;
        if (this.XToDY) {
            dy = this.XToDY(this.position.x);
        }

        this._lines[0].prop.x0 = this.min.x + dx;
        this._lines[0].prop.y0 = this.position.y;
        this._lines[0].prop.x1 = this.position.x - this.r - 3 * this._width;
        this._lines[0].prop.y1 = this.position.y;

        this._lines[0].display = this._lines[0].prop.x0 < this._lines[0].prop.x1;
        
        this._lines[1].prop.x0 = this.position.x;
        this._lines[1].prop.y0 = this.min.y + dy;
        this._lines[1].prop.x1 = this.position.x;
        this._lines[1].prop.y1 = this.position.y - this.r - 3 * this._width;
        
        this._lines[1].display = this._lines[1].prop.y0 < this._lines[1].prop.y1;
        
        this._lines[2].prop.x0 = this.position.x + this.r + 3 * this._width;
        this._lines[2].prop.y0 = this.position.y;
        this._lines[2].prop.x1 = this.max.x - dx;
        this._lines[2].prop.y1 = this.position.y;
        
        this._lines[2].display = this._lines[2].prop.x0 < this._lines[2].prop.x1;
        
        this._lines[3].prop.x0 = this.position.x;
        this._lines[3].prop.y0 = this.position.y + this.r + 3 * this._width;
        this._lines[3].prop.x1 = this.position.x;
        this._lines[3].prop.y1 = this.max.y - dy;
        
        this._lines[3].display = this._lines[3].prop.y0 < this._lines[3].prop.y1;

        this._circle.prop.x = this.position.x;
        this._circle.prop.y = this.position.y;

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