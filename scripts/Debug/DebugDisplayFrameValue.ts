class DebugDisplayFrameValue extends HTMLElement {
    
    public size: number = 2;
    public frameCount: number = 300;

    private _maxValue: number = 0;
    private _values: number[] = [];
    private _valuesElement: SVGPathElement;

    public connectedCallback() {
        this.initialize();
    }

    private _initialized: boolean = false;
    public initialize(): void {
        if (!this._initialized) {
            let container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            container.setAttribute("viewBox", "0 0 600 100");
            this.appendChild(container);

            this._valuesElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this._valuesElement.setAttribute("stroke", "#00FF00");
            this._valuesElement.setAttribute("stroke-width", "2");
            container.appendChild(this._valuesElement);

            this._initialized = true;
        }
    }
    
    private _redraw(): void {
        let d = "";
        for (let i = 0; i < this._values.length; i++) {
            let x = (i * this.size).toFixed(1);
            d += "M" + x + " 100 L" + x + " " + (100 - this._values[i] / this._maxValue * 100).toFixed(1) + " "; 
        }
        this._valuesElement.setAttribute("d", d);
    }

    public addValue(v: number) {
        if (isFinite(v)) {
            this._values.push(v);
            while (this._values.length > this.frameCount) {
                this._values.splice(0, 1);
            }
            this._maxValue = Math.max(...this._values);
            this._redraw();
        }
    }
}

customElements.define("debug-display-frame-value", DebugDisplayFrameValue);