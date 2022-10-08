class DebugDisplayColor extends HTMLElement {
    
    public static get observedAttributes() {
        return [
            "label"
        ];
    }

    private _label: string;
    
    private _labelElement: HTMLSpanElement;
    private _colorInput: HTMLInputElement;
    private _colorFloat: HTMLSpanElement;

    public connectedCallback() {
        this.initialize();
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (this._initialized) {
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

            this._colorInput = document.createElement("input");
            this._colorInput.setAttribute("type", "color");
            this._colorInput.style.display = "inline-block";
            this._colorInput.style.verticalAlign = "middle";
            this._colorInput.style.width = "65%";
            this._colorInput.value = SharedMaterials.MainMaterial().getColor(BlockType.Grass).toHexString();
            this.appendChild(this._colorInput);

            this._colorInput.oninput = this._onInput;

            this._colorFloat = document.createElement("span");
            this._colorFloat.innerText = "0.324, 0.123, 0.859";
            this._colorFloat.style.display = "block";
            this._colorFloat.style.verticalAlign = "middle";
            this._colorFloat.style.width = "100%";
            this._colorFloat.style.userSelect = "none";
            let color = BABYLON.Color3.FromHexString(this._colorInput.value);
            this._colorFloat.innerText = color.r.toFixed(3) + ", " + color.g.toFixed(3) + ", " + color.b.toFixed(3);
            this._colorFloat.onclick = () => {
                navigator.clipboard.writeText(this._colorFloat.innerText);
            }
            this.appendChild(this._colorFloat);

            this._initialized = true;

            for (let i = 0; i < DebugDisplayFrameValue.observedAttributes.length; i++) {
                let name = DebugDisplayFrameValue.observedAttributes[i];
                let value = this.getAttribute(name);
                this.attributeChangedCallback(name, value + "_forceupdate", value);
            }
        }
    }

    private _onInput = () => {
        let color = BABYLON.Color3.FromHexString(this._colorInput.value);
        this._colorFloat.innerText = color.r.toFixed(3) + ", " + color.g.toFixed(3) + ", " + color.b.toFixed(3);
        SharedMaterials.MainMaterial().setColor(BlockType.Grass, color);
    }
}

customElements.define("debug-display-color", DebugDisplayColor);