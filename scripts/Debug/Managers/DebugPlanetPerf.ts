class DebugPlanetPerf {
    
    private _initialized: boolean = false;
    public get initialized(): boolean {
        return this._initialized;
    }

    public container: HTMLDivElement;

    private _frameRate: DebugDisplayFrameValue;
    private _chunckSort: DebugDisplayFrameValue;
    private _drawRequestCount: DebugDisplayFrameValue;
    private _layerCounts: DebugDisplayTextValue[];

    public get scene(): BABYLON.Scene {
        return this.game.scene;
    }

    constructor(public game: Game | Demo, private _showLayer: boolean = false) {

    }

    public initialize(): void {
        this.container = document.querySelector("#debug-planet-perf");
        
        this._frameRate = document.querySelector("#frame-rate") as DebugDisplayFrameValue;
        this._chunckSort = document.querySelector("#chunck-sort") as DebugDisplayFrameValue;
        this._drawRequestCount = document.querySelector("#draw-request-count") as DebugDisplayFrameValue;
        if (this._showLayer) {
            this._layerCounts = [];
            for (let i = 0; i < 6; i++) {
                this._layerCounts[i] = document.querySelector("#layer-" + i + "-count") as DebugDisplayTextValue;
            }
        }

        this._initialized = true;
    }

    private _update = () => {
		this._frameRate.addValue(Game.Engine.getFps());
        this._chunckSort.addValue(this.game.chunckManager.chunckSortedRatio * 100);
        this._drawRequestCount.addValue(this.game.chunckManager.needRedrawCount);
        if (this._showLayer) {
            for (let i = 0; i < 6; i++) {
                this._layerCounts[i].setText(this.game.chunckManager.lodLayerCount(i).toFixed(0));
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