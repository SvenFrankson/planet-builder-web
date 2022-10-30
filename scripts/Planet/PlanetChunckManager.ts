class PlanetChunckRedrawRequest {

    constructor(
        public chunck: PlanetChunck,
        public callback?: () => void,
        public info: string = ""
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
    private _lodLayers: AbstractPlanetChunck[][];
    public lodLayerCount(layerIndex: number): number {
        return this._lodLayers[layerIndex].length;
    }
    private _lodLayersCursors: number[];
    private _lodLayersSqrDistances: number[];

    // estimated percentage of chuncks in the adequate layer
    public chunckSortedRatio: number = 0;

    // activity increase while manager is redrawing Chuncks.
    private _maxActivity: number = 20;
    private _activity: number = this._maxActivity;

    constructor(
        public scene: BABYLON.Scene
    ) {

    }

    public initialize(): void {
        if (this.scene.activeCameras && this.scene.activeCameras.length > 0) {
            this._viewpoint = this.scene.activeCameras[0].globalPosition.clone();
        }
        else {
            this._viewpoint = this.scene.activeCamera.globalPosition.clone();
        }
        
        this._lodLayers = [];
        this._lodLayersCursors = [];
        this._lodLayersSqrDistances = [];
        let distances = [50, 90, 130, 170, 210];
        for (let i = 0; i < this._lodLayersCount - 1; i++) {
            this._lodLayers[i] = [];
            this._lodLayersCursors[i] = 0;
            this._lodLayersSqrDistances[i] = distances[i] * distances[i];
        }
        this._lodLayers[this._lodLayersCount - 1] = [];
        this._lodLayersCursors[this._lodLayersCount - 1] = 0;
        this._lodLayersSqrDistances[this._lodLayersCount - 1] = Infinity;

        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    public registerChunck(chunck: AbstractPlanetChunck): boolean {
        while (this.unregister(chunck)) {

        }
        if (this._lodLayers[this._lodLayersCount - 1].indexOf(chunck) === -1) {
            this._lodLayers[this._lodLayersCount - 1].push(chunck);
            chunck.lod = this._lodLayersCount - 1;
        }
        return true;
    }

    public unregister(chunck: AbstractPlanetChunck): boolean {
        for (let layerIndex = 0; layerIndex < this._lodLayers.length; layerIndex++) {
            let index = this._lodLayers[layerIndex].indexOf(chunck);
            if (index != -1) {
                this._lodLayers[layerIndex].splice(index, 1);
                return true;
            }
        }
        return false;
    }

    public async requestDraw(chunck: PlanetChunck, prio: number, info: string): Promise<void> {
        prio = 0;
        return new Promise<void>(resolve => {
            if (!this._needRedraw.find(request => { return request.chunck === chunck; })) {
                if (prio === 0) {
                    this._needRedraw.push(new PlanetChunckRedrawRequest(chunck, resolve, info));
                }
                else {
                    this._needRedraw.splice(0, 0, new PlanetChunckRedrawRequest(chunck, resolve, info));
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

    private onChunckMovedToLayer(chunck: AbstractPlanetChunck, layerIndex: number): void {
        if (layerIndex === 0) {
            if (chunck instanceof PlanetChunck) {
                this.requestDraw(chunck, 0, "ChunckManager.update");
            }
            else if (chunck instanceof PlanetChunckGroup) {
                chunck.subdivide();
            }
        }
        else if (layerIndex === 1) {
            if (chunck instanceof PlanetChunck) {
                chunck.disposeMesh();
                this.cancelDraw(chunck);
            }
            else if (chunck instanceof PlanetChunckGroup) {
                chunck.subdivide();
            }
        }
        else if (layerIndex === 2) {
            if (chunck instanceof PlanetChunck) {
                chunck.disposeMesh();
                this.cancelDraw(chunck);
            }
            else if (chunck instanceof PlanetChunckGroup) {
                if (chunck.level > 1) {
                    chunck.subdivide();
                }
            }
        }
        else if (layerIndex === 3) {
            if (chunck instanceof PlanetChunck) {
                chunck.disposeMesh();
                this.cancelDraw(chunck);
                chunck.collapse();
            }
            else if (chunck instanceof PlanetChunckGroup) {
                if (chunck.level < 1) {
                    chunck.collapse();
                }
                else if (chunck.level > 2) {
                    chunck.subdivide();
                }
            }
        }
        else if (layerIndex === 4) {
            if (chunck instanceof PlanetChunck) {
                chunck.disposeMesh();
                this.cancelDraw(chunck);
                chunck.collapse();
            }
            else if (chunck instanceof PlanetChunckGroup) {
                if (chunck.level < 2) {
                    chunck.collapse();
                }
                else if (chunck.level > 3) {
                    chunck.subdivide();
                }
            }
        }
        else if (layerIndex === 5) {
            if (chunck instanceof PlanetChunck) {
                chunck.disposeMesh();
                this.cancelDraw(chunck);
                chunck.collapse();
            }
            else if (chunck instanceof PlanetChunckGroup) {
                if (chunck.level < 3) {
                    chunck.collapse();
                }
                else if (chunck.level > 4) {
                    chunck.subdivide();
                }
            }
        }
        else {
            debugger;
        }
    }

    private _update = () => {
        if (this.scene.activeCameras && this.scene.activeCameras.length > 0) {
            this._viewpoint.copyFrom(this.scene.activeCameras[0].globalPosition);
        }
        else {
            this._viewpoint.copyFrom(this.scene.activeCamera.globalPosition);
        }
        
        let t0 = performance.now();
        let t = t0;

        let sortedCount = 0;
        let unsortedCount = 0;

        let todo = [];
        while ((t - t0) < 1 && todo.length < 50) {
            for (let prevLayerIndex = 0; prevLayerIndex < this._lodLayersCount; prevLayerIndex++) {
                let cursor = this._lodLayersCursors[prevLayerIndex];
                let chunck = this._lodLayers[prevLayerIndex][cursor];
                if (chunck) {
                    chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.barycenter);
                    let newLayerIndex = this._getLayerIndex(chunck.sqrDistanceToViewpoint);
                    if (newLayerIndex != prevLayerIndex) {
                        let adequateLayerCursor = this._lodLayersCursors[newLayerIndex];
                        this._lodLayers[prevLayerIndex].splice(cursor, 1);
                        this._lodLayers[newLayerIndex].splice(adequateLayerCursor, 0, chunck);
                        chunck.lod = newLayerIndex;
                        
                        todo.push(chunck);

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
                else {
                    this._lodLayersCursors[prevLayerIndex] = 0;
                    if (prevLayerIndex === this._lodLayersCount) {
                        break;
                    }
                }
            }
            t = performance.now();
        }

        for (let i = 0; i < todo.length; i++) {
            this.onChunckMovedToLayer(todo[i], todo[i].lod);
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
        while (this._needRedraw.length > 0 && (t - t0) < 1000 / 120) {
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
        if (isNaN(this.chunckSortedRatio)) {
            this.chunckSortedRatio = 1;
        }
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