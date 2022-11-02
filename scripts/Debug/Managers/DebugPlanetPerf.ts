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