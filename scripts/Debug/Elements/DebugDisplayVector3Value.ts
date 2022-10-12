interface IVector3XYZValue {
    x: number;
    y: number;
    z: number;
}

interface IVector3IJKValue {
    i: number;
    j: number;
    k: number;
}

class DebugDisplayVector3Value extends HTMLElement {
    
    public static get observedAttributes() {
        return [
            "label",
            "useIJK",
            "decimals"
        ];
    }

    private _label: string = "";
    private _useIJK: boolean = false;
    private _decimals: number = 3;
    private _x: number = 0;
    private _y: number = 0;
    private _z: number = 0;
    
    private _labelElement: HTMLSpanElement;
    private _xElement: HTMLSpanElement;
    private _xLabelElement: HTMLSpanElement;
    private _yElement: HTMLSpanElement;
    private _yLabelElement: HTMLSpanElement;
    private _zElement: HTMLSpanElement;
    private _zLabelElement: HTMLSpanElement;

    public connectedCallback() {
        this.initialize();
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (this._initialized) {
            if (name === "label") {
                this._label = newValue;
                this._labelElement.textContent = this._label;
            }
            if (name === "useIJK") {
                this._useIJK = newValue === "true" ? true : false;
                if (this._useIJK) {
                    this._xLabelElement.textContent = "i";
                    this._yLabelElement.textContent = "j";
                    this._zLabelElement.textContent = "k";
                }
                else {
                    this._xLabelElement.textContent = "x";
                    this._yLabelElement.textContent = "y";
                    this._zLabelElement.textContent = "z";
                }
            }
            if (name === "decimals") {
                let value = parseInt(newValue);
                if (isFinite(value)) {
                    this._decimals = value;
                }
                this.setValue({
                    x: this._x,
                    y: this._y,
                    z: this._z
                });
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

            this._xLabelElement = document.createElement("div");
            this._xLabelElement.style.display = "inline-block";
            this._xLabelElement.style.width = "6%";
            this._xLabelElement.style.marginRight = "2%";
            this._xLabelElement.style.fontSize = "80%";
            this.appendChild(this._xLabelElement);

            this._xElement = document.createElement("div");
            this._xElement.style.display = "inline-block";
            this._xElement.style.textAlign = "left";
            this._xElement.style.width = "13.66%";
            this._xElement.textContent = "10";
            this.appendChild(this._xElement);

            this._yLabelElement = document.createElement("div");
            this._yLabelElement.style.display = "inline-block";
            this._yLabelElement.style.width = "6%";
            this._yLabelElement.style.marginRight = "2%";
            this._yLabelElement.style.fontSize = "80%";
            this.appendChild(this._yLabelElement);

            this._yElement = document.createElement("div");
            this._yElement.style.display = "inline-block";
            this._yElement.style.textAlign = "left";
            this._yElement.style.width = "13.66%";
            this._yElement.textContent = "10";
            this.appendChild(this._yElement);

            this._zLabelElement = document.createElement("div");
            this._zLabelElement.style.display = "inline-block";
            this._zLabelElement.style.width = "6%";
            this._zLabelElement.style.marginRight = "2%";
            this._zLabelElement.style.fontSize = "80%";
            this.appendChild(this._zLabelElement);

            this._zElement = document.createElement("div");
            this._zElement.style.display = "inline-block";
            this._zElement.style.textAlign = "left";
            this._zElement.style.width = "13.66%";
            this._zElement.textContent = "10";
            this.appendChild(this._zElement);

            this._initialized = true;

            for (let i = 0; i < DebugDisplayVector3Value.observedAttributes.length; i++) {
                let name = DebugDisplayVector3Value.observedAttributes[i];
                let value = this.getAttribute(name);
                this.attributeChangedCallback(name, value + "_forceupdate", value);
            }
        }
    }

    public setValue(vec3: IVector3XYZValue): void;
    public setValue(vec3: IVector3IJKValue): void;
    public setValue(i: number, j: number, k: number): void;
    public setValue(vec3: any, j?: number, k?: number): void {
        if (isFinite(j) && isFinite(k)) {
            this._x = vec3;
            this._y = j;
            this._z = k;
        }
        else {
            this._x = isFinite(vec3.x) ? vec3.x : vec3.i;
            this._y = isFinite(vec3.y) ? vec3.y : vec3.j;
            this._z = isFinite(vec3.z) ? vec3.z : vec3.k;
        }
        
        this._xElement.innerText = this._x.toFixed(this._decimals);
        this._yElement.innerText = this._y.toFixed(this._decimals);
        this._zElement.innerText = this._z.toFixed(this._decimals);
    }
}

customElements.define("debug-display-vector3-value", DebugDisplayVector3Value);