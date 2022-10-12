class DebugDisplayTextValue extends HTMLElement {
    
    public static get observedAttributes() {
        return [
            "label"
        ];
    }

    private _label: string = "";
    
    private _labelElement: HTMLSpanElement;
    private _textElement: HTMLSpanElement;

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

            this._textElement = document.createElement("div");
            this._textElement.style.display = "inline-block";
            this._textElement.style.marginLeft = "5%";
            this._textElement.style.width = "60%";
            this._textElement.style.textAlign = "left";
            this.appendChild(this._textElement);

            this._initialized = true;

            for (let i = 0; i < DebugDisplayTextValue.observedAttributes.length; i++) {
                let name = DebugDisplayTextValue.observedAttributes[i];
                let value = this.getAttribute(name);
                this.attributeChangedCallback(name, value + "_forceupdate", value);
            }
        }
    }

    public setText(text: string): void {
        this._textElement.textContent = text;
    }
}

customElements.define("debug-display-text-value", DebugDisplayTextValue);