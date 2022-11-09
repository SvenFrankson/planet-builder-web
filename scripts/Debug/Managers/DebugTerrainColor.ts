class DebugTerrainColor {

    private _initialized: boolean = false;
    public get initialized(): boolean {
        return this._initialized;
    }

    public container: HTMLDivElement;

    public initialize(): void {
        this.container = document.querySelector("#debug-terrain-color");
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "debug-terrain-color";
            this.container.classList.add("debug", "hidden");
            document.querySelector("#meshes-info").appendChild(this.container);
        }

        for (let i = 1; i < BlockTypeCount; i++) {
            let blockType: BlockType = i;
            let id = "#terrain-" + BlockTypeNames[blockType].toLowerCase() + "-color"
            let input = document.querySelector(id) as DebugDisplayColorInput;
            if (!input) {
                input = document.createElement("debug-display-color-input") as DebugDisplayColorInput;
                input.id = id;
                input.setAttribute("label", BlockTypeNames[blockType]);
                this.container.appendChild(input);
            }
            input.setColor(SharedMaterials.MainMaterial().getColor(blockType));
            input.onInput = (color) => {
                SharedMaterials.MainMaterial().setColor(blockType, color);
            }
        }

        this._initialized = true;
    }

    public show(): void {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
    }

    public hide(): void {
        this.container.classList.add("hidden");
    }
}