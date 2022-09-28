class DebugDisplayFrameValue extends HTMLElement {
    
    public static get observedAttributes() {
        return [
            "label",
            "min",
            "max"
        ];
    }

    public size: number = 2;
    public frameCount: number = 300;

    private _minValue: number = 0;
    private _maxValue: number = 100;
    private _values: number[] = [];
    private _label: string;
    
    private _minElement: HTMLSpanElement;
    private _maxElement: HTMLSpanElement;
    private _labelElement: HTMLSpanElement;
    private _valuesElement: SVGPathElement;

    public connectedCallback() {
        this.initialize();
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (this._initialized) {
            if (name === "min") {
                let v = parseFloat(newValue);
                if (isFinite(v)) {
                    this._minValue = v;
                    this._minElement.textContent = this._minValue.toFixed(0);
                }
            }
            if (name === "max") {
                let v = parseFloat(newValue);
                if (isFinite(v)) {
                    this._maxValue = v;
                    this._maxElement.textContent = this._maxValue.toFixed(0);
                }
            }
            if (name === "label") {
                this._label = newValue;
                this._labelElement.textContent = this._label;
            }
        }
    }

    private _initialized: boolean = false;
    public initialize(): void {
        if (!this._initialized) {
            this.style.position = "relative";

            this._labelElement = document.createElement("div");
            this._labelElement.style.display = "inline-block";
            this._labelElement.style.width = "33%";
            this._labelElement.style.marginRight = "2%";
            this.appendChild(this._labelElement);
            
            this._minElement = document.createElement("span");
            this._minElement.style.position = "absolute";
            this._minElement.style.bottom = "0%";
            this._minElement.style.right = "1%";
            this._minElement.style.fontSize = "80%";
            this.appendChild(this._minElement);
            
            this._maxElement = document.createElement("span");
            this._maxElement.style.position = "absolute";
            this._maxElement.style.top = "0%";
            this._maxElement.style.right = "1%";
            this._maxElement.style.fontSize = "80%";
            this.appendChild(this._maxElement);

            let container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            container.style.display = "inline-block";
            container.style.verticalAlign = "middle";
            container.style.width = "57%";
            container.style.marginRight = "8%";
            container.setAttribute("viewBox", "0 0 600 100");
            this.appendChild(container);

            this._valuesElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this._valuesElement.setAttribute("stroke", "#00FF00");
            this._valuesElement.setAttribute("stroke-width", "2");
            container.appendChild(this._valuesElement);

            this._initialized = true;

            for (let i = 0; i < DebugDisplayFrameValue.observedAttributes.length; i++) {
                let name = DebugDisplayFrameValue.observedAttributes[i];
                let value = this.getAttribute(name);
                this.attributeChangedCallback(name, value + "_forceupdate", value);
            }
        }
    }
    
    private _redraw(): void {
        let d = "";
        for (let i = 0; i < this._values.length; i++) {
            let x = (i * this.size).toFixed(1);
            d += "M" + x + " 100 L" + x + " " + (100 - (this._values[i] - this._minValue) / (this._maxValue - this._minValue) * 100).toFixed(1) + " "; 
        }
        this._valuesElement.setAttribute("d", d);
    }

    public addValue(v: number) {
        if (isFinite(v)) {
            this._values.push(v);
            while (this._values.length > this.frameCount) {
                this._values.splice(0, 1);
            }
            this._redraw();
        }
    }
}

customElements.define("debug-display-frame-value", DebugDisplayFrameValue);