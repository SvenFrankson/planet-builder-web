class DebugPlanetPerf {
    
    private _initialized: boolean = false;
    public get initialized(): boolean {
        return this._initialized;
    }

    public debugContainer: HTMLDivElement;
    public container: HTMLDivElement;

    private _frameRate: DebugDisplayFrameValue;
    private _chunckSort: DebugDisplayFrameValue;
    private _drawRequestCount: DebugDisplayFrameValue;
    private _meshesCount: DebugDisplayTextValue;
    private _layerCounts: DebugDisplayTextValue[];

    public get scene(): BABYLON.Scene {
        return this.game.scene;
    }

    constructor(public game: Main, private _showLayer: boolean = false) {

    }

    public initialize(): void {
        this.debugContainer = document.querySelector("#debug-container");
        if (!this.debugContainer) {
            this.debugContainer = document.createElement("div");
            this.debugContainer.id = "debug-container";
            document.body.appendChild(this.debugContainer);
        }

        this.container = document.querySelector("#debug-planet-perf");
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "debug-planet-perf";
            this.container.classList.add("debug", "hidden");
            this.debugContainer.appendChild(this.container);
        }
        
        let frameRateId = "#frame-rate";
        this._frameRate = document.querySelector(frameRateId) as DebugDisplayFrameValue;
        if (!this._frameRate) {
            this._frameRate = document.createElement("debug-display-frame-value") as DebugDisplayFrameValue;
            this._frameRate.id = frameRateId;
            this._frameRate.setAttribute("label", "Frame Rate fps");
            this._frameRate.setAttribute("min", "0");
            this._frameRate.setAttribute("max", "60");
            this.container.appendChild(this._frameRate);
        }

        let chunckSortId = "#chunck-sort";
        this._chunckSort = document.querySelector("#chunck-sort") as DebugDisplayFrameValue;
        if (!this._chunckSort) {
            this._chunckSort = document.createElement("debug-display-frame-value") as DebugDisplayFrameValue;
            this._chunckSort.id = chunckSortId;
            this._chunckSort.setAttribute("label", "Chuncks Sort %");
            this._chunckSort.setAttribute("min", "0");
            this._chunckSort.setAttribute("max", "100");
            this.container.appendChild(this._chunckSort);
        }
        
        let drawRequestId = "#draw-request-count";
        this._drawRequestCount = document.querySelector(drawRequestId) as DebugDisplayFrameValue;
        if (!this._drawRequestCount) {
            this._drawRequestCount = document.createElement("debug-display-frame-value") as DebugDisplayFrameValue;
            this._drawRequestCount.id = drawRequestId;
            this._drawRequestCount.setAttribute("label", "Draw Requests");
            this._drawRequestCount.setAttribute("min", "0");
            this._drawRequestCount.setAttribute("max", "100");
            this.container.appendChild(this._drawRequestCount);
        }

        let meshesCountId = "#meshes-count";
        this._meshesCount = document.querySelector(meshesCountId) as DebugDisplayTextValue;
        if (!this._meshesCount) {
            this._meshesCount = document.createElement("debug-display-text-value") as DebugDisplayTextValue;
            this._meshesCount.id = meshesCountId;
            this._meshesCount.setAttribute("label", "Meshes Count");
            this.container.appendChild(this._meshesCount);
        }

        if (this._showLayer) {
            this._layerCounts = [];
            for (let i = 0; i < Config.performanceConfiguration.lodRanges.length; i++) {
                let id = "#layer-" + i + "-count";
                this._layerCounts[i] = document.querySelector(id) as DebugDisplayTextValue;
                if (!this._layerCounts[i]) {
                    this._layerCounts[i] = document.createElement("debug-display-text-value") as DebugDisplayTextValue;
                    this._layerCounts[i].id = id;
                    this._layerCounts[i].setAttribute("label", "Layer " + i);
                    this.container.appendChild(this._layerCounts[i]);
                }
            }
        }

        this._initialized = true;
    }

    private _update = () => {
		this._frameRate.addValue(Game.Engine.getFps());
        
        let sortRatio = 0;
        for (let i = 0; i < this.game.planets.length; i++) {
            sortRatio += this.game.planets[i].chunckManager.chunckSortedRatio * 100;
        }
        sortRatio /= this.game.planets.length;
        this._chunckSort.addValue(sortRatio);

        let needRedrawCount = 0;
        for (let i = 0; i < this.game.planets.length; i++) {
            needRedrawCount += this.game.planets[i].chunckManager.needRedrawCount;
        }
        this._drawRequestCount.addValue(needRedrawCount);

        this._meshesCount.setText(this.game.scene.meshes.length.toFixed(0));

        if (this._showLayer) {
            for (let i = 0; i < 6; i++) {
                let lodLayerCount = 0;
                for (let j = 0; j < this.game.planets.length; j++) {
                    lodLayerCount += this.game.planets[j].chunckManager.lodLayerCount(i);
                }
                this._layerCounts[i].setText(lodLayerCount.toFixed(0));
            }
        }
    }

    public show(): void {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public hide(): void {
        this.container.classList.add("hidden");
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
}