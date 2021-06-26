class PlaneHud {

    public svg: SVGSVGElement;
    public target: SVGCircleElement;
    public mainFrame: SVGCircleElement;
    public airspeedValue: SVGPathElement;
    public targetAirspeedValue: SVGPathElement;

    private _alphaRadiusToX(a: number, r: number): number {
        return 500 + r * Math.cos(a);
    }

    private _alphaRadiusToY(a: number, r: number): number {
        return 500 - r * Math.sin(a);
    }

    private _makeArc(a0: number, a1: number, radius: number): SVGPathElement {
        let arc = document.createElementNS("http://www.w3.org/2000/svg", "path");

        let x0 = this._alphaRadiusToX(a0, radius);
        let y0 = this._alphaRadiusToY(a0, radius);
        let x1 = this._alphaRadiusToX(a1, radius);
        let y1 = this._alphaRadiusToY(a1, radius);

        arc.setAttribute("d", "M " + x0 + " " + y0 + " A " + radius + " " + radius + " 0 0 1 " + x1 + " " + y1);

        return arc;
    }

    private _makeThickArc(a0: number, a1: number, radius: number, thickness: number, arc?: SVGPathElement): SVGPathElement {
        if (!arc) {
            arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
        }

        let x00 = this._alphaRadiusToX(a0, radius);
        let y00 = this._alphaRadiusToY(a0, radius);
        let x10 = this._alphaRadiusToX(a1, radius);
        let y10 = this._alphaRadiusToY(a1, radius);
        let x01 = this._alphaRadiusToX(a0, radius + thickness);
        let y01 = this._alphaRadiusToY(a0, radius + thickness);
        let x11 = this._alphaRadiusToX(a1, radius + thickness);
        let y11 = this._alphaRadiusToY(a1, radius + thickness);

        arc.setAttribute(
            "d",
            "M " + x00 + " " + y00 + " A " + radius + " " + radius + " 0 0 1 " + x10 + " " + y10 + " " + 
            "L " + x11 + " " + y11 + " " +
            "A " + (radius + thickness) + " " + (radius + thickness) + " 0 0 0 " + x01 + " " + y01 + " " + 
            "L " + x00 + " " + y00 + " "
        );

        return arc;
    }

    private _setStyleBase(e: SVGElement): void {
        e.setAttribute("stroke", "white");
        e.setAttribute("stroke-width", "4");
        e.setAttribute("fill", "none");
    }

    public instantiate(): void {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 1000 1000");
        this.svg.style.position = "fixed";
        this.svg.style.zIndex = "1";
        this.svg.style.pointerEvents = "none";
        this.svg.style.overflow = "visible";
        document.body.appendChild(this.svg);

        this.mainFrame = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.mainFrame.setAttribute("cx", "500");
        this.mainFrame.setAttribute("cy", "500");
        this.mainFrame.setAttribute("r", "500");
        this._setStyleBase(this.mainFrame);
        this.svg.appendChild(this.mainFrame);

        this.target = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.target.setAttribute("cx", "500");
        this.target.setAttribute("cy", "500");
        this.target.setAttribute("r", "50");
        this._setStyleBase(this.target);
        this.svg.appendChild(this.target);

        this.targetAirspeedValue = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.targetAirspeedValue.setAttribute(
            "d",
            "M 1050 500 L 1025 515 L 1025 485 L 1050 500"
        );
        this._setStyleBase(this.targetAirspeedValue);
        this.svg.appendChild(this.targetAirspeedValue);

        this.airspeedValue = this._makeThickArc(Math.PI / 6, - Math.PI / 6, 550, 100);
        this.airspeedValue.setAttribute("stroke", "none");
        this.airspeedValue.setAttribute("fill", "cyan");
        
        this.svg.appendChild(this.airspeedValue);

        let airspeedFrame = this._makeThickArc(Math.PI / 6, - Math.PI / 6, 550, 100);
        this._setStyleBase(airspeedFrame);
        this.svg.appendChild(airspeedFrame);
        
        this.resize();
    }

    public updateAirspeed(v: number): void {
        this._makeThickArc(- Math.PI / 6 + v / 20 * (Math.PI / 3), - Math.PI / 6, 550, 100, this.airspeedValue);
    }

    public updateTargetAirspeed(v: number): void {
        let a = (10 - v) / 10 * Math.PI / 6;
        a = a / Math.PI * 180;
        this.targetAirspeedValue.setAttribute("transform", "rotate(" + a + ", 500, 500)");
    }

    public show(): void {
        this.svg.style.display = "block";
    }

    public hide(): void {
        this.svg.style.display = "none";
    }

    public resize(): void {
        let w = window.innerWidth;
        let h = window.innerHeight;

        if (w > h) {
            this.svg.style.width = (h * 0.5).toFixed(0) + "px";
            this.svg.style.height = (h * 0.5).toFixed(0) + "px";
            this.svg.style.top = (h * 0.25).toFixed(0) + "px";
            this.svg.style.left = ((w - h * 0.5) * 0.5).toFixed(0) + "px";
        }
        else {
            this.svg.style.width = (w * 0.5).toFixed(0) + "px";
            this.svg.style.height = (w * 0.5).toFixed(0) + "px";
            this.svg.style.left = (w * 0.25).toFixed(0) + "px";
            this.svg.style.left = ((h - w * 0.5) * 0.5).toFixed(0) + "px";
        }
    }
}