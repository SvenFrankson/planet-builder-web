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
    public get needRedrawCount(): number {
        return this._needRedraw.length;
    }

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

    public registerChunck(chunck: PlanetChunck): boolean {
        if (!chunck.isEmptyOrHidden()) {
            chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.GetBaryCenter());
            let layerIndex = this._getLayerIndex(chunck.sqrDistanceToViewpoint);
            if (this._lodLayers[layerIndex].indexOf(chunck) === -1) {
                this._lodLayers[layerIndex].push(chunck);
                chunck.lod = layerIndex;
                if (layerIndex <= 1) {
                    this.requestDraw(chunck, layerIndex);
                }
                return true;
            }
        }
        return false;
    }

    public async requestDraw(chunck: PlanetChunck, prio: number): Promise<void> {
        return new Promise<void>(resolve => {
            if (!this._needRedraw.find(request => { return request.chunck === chunck; })) {
                if (prio === 0) {
                    this._needRedraw.push(new PlanetChunckRedrawRequest(chunck, resolve));
                }
                else {
                    this._needRedraw.splice(0, 0, new PlanetChunckRedrawRequest(chunck, resolve));
                }
            }
        });
    }

    public cancelDraw(chunck: PlanetChunck): void {
        let index = this._needRedraw.findIndex(request => { return request.chunck === chunck; });
        if (index != - 1) {
            this._needRedraw.splice(index, 1);
        }
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
            for (let prevLayerIndex = 0; prevLayerIndex < this._lodLayersCount; prevLayerIndex++) {
                let cursor = this._lodLayersCursors[prevLayerIndex];
                let chunck = this._lodLayers[prevLayerIndex][cursor];
                if (chunck) {
                    chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.GetBaryCenter());
                    let newLayerIndex = this._getLayerIndex(chunck.sqrDistanceToViewpoint);
                    if (newLayerIndex != prevLayerIndex) {
                        let adequateLayerCursor = this._lodLayersCursors[newLayerIndex];
                        this._lodLayers[prevLayerIndex].splice(cursor, 1);
                        this._lodLayers[newLayerIndex].splice(adequateLayerCursor, 0, chunck);
                        chunck.lod = newLayerIndex;
                        
                        if (newLayerIndex <= 1) {
                            if (newLayerIndex === 1 && prevLayerIndex === 0) {
                                continue;
                            }
                            this.requestDraw(chunck, newLayerIndex);
                        }
                        else if (newLayerIndex > 1) {
                            chunck.disposeMesh();
                            this.cancelDraw(chunck);
                        }

                        this._lodLayersCursors[newLayerIndex]++;
                        if (this._lodLayersCursors[newLayerIndex] >= this._lodLayers[newLayerIndex].length) {
                            this._lodLayersCursors[newLayerIndex] = 0;
                        }
                        unsortedCount++;
                    }
                    else {
                        this._lodLayersCursors[prevLayerIndex]++;
                        if (this._lodLayersCursors[prevLayerIndex] >= this._lodLayers[prevLayerIndex].length) {
                            this._lodLayersCursors[prevLayerIndex] = 0;
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
        t0 = performance.now();
        while (this._needRedraw.length > 0 && (t - t0) < 1000 / (60 * 1.5)) {
            let request = this._needRedraw.pop();
            if (request.chunck.lod <= 1) {
                request.chunck.initialize();
            }
            else {
                request.chunck.disposeMesh();
            }
            t = performance.now();
        }

        this.chunckSortedRatio = (this.chunckSortedRatio + sortedCount / (sortedCount + unsortedCount))* 0.5;
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