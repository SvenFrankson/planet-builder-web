class DebugTerrainColor {

    private _initialized: boolean = false;
    public get initialized(): boolean {
        return this._initialized;
    }

    public container: HTMLDivElement;

    public initialize(): void {
        this.container = document.querySelector("#debug-terrain-color");

        for (let i = 1; i < BlockTypeCount; i++) {
            let blockType: BlockType = i;
            let input = document.querySelector("#terrain-" + BlockTypeNames[blockType].toLowerCase() + "-color") as DebugDisplayColorInput;
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