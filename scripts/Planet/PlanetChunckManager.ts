class PlanetChunckRedrawRequest {

    constructor(
        public chunck: PlanetChunck,
        public callback?: () => void
    ) {

    }
}

class PlanetChunckManager {
    
    private _viewpoint: BABYLON.Vector3;
    private _needRedraw: PlanetChunckRedrawRequest[] = [];

    private _lodLayersCount: number = 6;
    private _lodLayers: PlanetChunck[][];
    private _lodLayersCursors: number[];
    private _lodLayersSqrDistances: number[];

    // estimated percentage of chuncks in the adequate layer
    public chunckSortedRatio: number = 0;

    // activity increase while manager is redrawing Chuncks.
    private _maxActivity: number = 10;
    private _activity: number = this._maxActivity;

    constructor(
        public scene: BABYLON.Scene
    ) {

    }

    public initialize(): void {
        this._viewpoint = this.scene.activeCamera.globalPosition.clone();
        
        this._lodLayers = [];
        this._lodLayersCursors = [];
        this._lodLayersSqrDistances = [];
        for (let i = 0; i < this._lodLayersCount - 1; i++) {
            let d = (i + 1) * 60;
            this._lodLayers[i] = [];
            this._lodLayersCursors[i] = 0;
            this._lodLayersSqrDistances[i] = d * d;
        }
        this._lodLayers[this._lodLayersCount - 1] = [];
        this._lodLayersCursors[this._lodLayersCount - 1] = 0;
        this._lodLayersSqrDistances[this._lodLayersCount - 1] = Infinity;

        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    public registerChunck(chunck: PlanetChunck): void {
        if (!chunck.isEmptyOrHidden()) {
            chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.GetBaryCenter());
            let layerIndex = this._getLayerIndex(chunck.sqrDistanceToViewpoint);
            if (this._lodLayers[layerIndex].indexOf(chunck) === -1) {
                this._lodLayers[layerIndex].push(chunck);
                chunck.lod = layerIndex;
                if (layerIndex <= 1) {
                    this.requestDraw(chunck);
                }
            }
        }
    }

    public async requestDraw(chunck: PlanetChunck): Promise<void> {
        return new Promise<void>(resolve => {
            if (!this._needRedraw.find(request => { return request.chunck === chunck; })) {
                this._needRedraw.push(new PlanetChunckRedrawRequest(chunck, resolve));
            }
        });
    }

    private _getLayerIndex(sqrDistance: number): number {
        for (let i = 0; i < this._lodLayersCount - 1; i++) {
            if (sqrDistance < this._lodLayersSqrDistances[i]) {
                return i;
            }
        }
        return this._lodLayersCount - 1;
    }

    private _update = () => {
        this._viewpoint.copyFrom(this.scene.activeCamera.globalPosition);
        
        let t0 = performance.now();
        let t = t0;

        let sortedCount = 0;
        let unsortedCount = 0;

        let duration = 0.5 + 150 * (1 - this.chunckSortedRatio);
        duration = Math.min(duration, 1000 / 24);
        while ((t - t0) < duration) {
            for (let i = 0; i < this._lodLayersCount; i++) {
                let cursor = this._lodLayersCursors[i];
                let chunck = this._lodLayers[i][cursor];
                if (chunck) {
                    chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.GetBaryCenter());
                    let newLayerIndex = this._getLayerIndex(chunck.sqrDistanceToViewpoint);
                    if (newLayerIndex != i) {
                        let adequateLayerCursor = this._lodLayersCursors[newLayerIndex];
                        this._lodLayers[i].splice(cursor, 1);
                        this._lodLayers[newLayerIndex].splice(adequateLayerCursor, 0, chunck);
                        chunck.lod = newLayerIndex;
                        
                        if (newLayerIndex <= 1) {
                            this.requestDraw(chunck);
                        }
                        else if (i > 1) {
                            chunck.disposeMesh();
                        }

                        this._lodLayersCursors[newLayerIndex]++;
                        if (this._lodLayersCursors[newLayerIndex] >= this._lodLayers[newLayerIndex].length) {
                            this._lodLayersCursors[newLayerIndex] = 0;
                        }
                        unsortedCount++;
                    }
                    else {
                        this._lodLayersCursors[i]++;
                        if (this._lodLayersCursors[i] >= this._lodLayers[i].length) {
                            this._lodLayersCursors[i] = 0;
                        }
                        sortedCount++;
                    }
                }
            }
            t = performance.now();
        }
        
        if (this._needRedraw.length > 0) {
            this._activity ++;
            this._activity = Math.min(this._activity, this._maxActivity);
        }
        else {
            this._activity--;
            this._activity = Math.max(this._activity, 0);
            if (this._activity < 1) {
                if (this._onNextInactiveCallback) {
                    this._onNextInactiveCallback();
                    this._onNextInactiveCallback = undefined;
                }
            }
        }

        // Recalculate chunck meshes.
        while (this._needRedraw.length > 0 && (t - t0) < 1000 / 60) {
            let request = this._needRedraw.pop();
            request.chunck.initialize();
        }

        this.chunckSortedRatio = (this.chunckSortedRatio + sortedCount / (sortedCount + unsortedCount))* 0.5;
        (document.getElementById("chunck-sort") as DebugDisplayFrameValue).addValue(this.chunckSortedRatio * 100);
    }

    public isActive(): boolean {
        return this._activity > 1;
    }

    private _onNextInactiveCallback: () => void;
    public onNextInactive(callback: () => void): void {
        if (!this.isActive()) {
            console.log("direct onNextInactive")
            callback();
        }
        else {
            this._onNextInactiveCallback = callback;
        }
    }
}