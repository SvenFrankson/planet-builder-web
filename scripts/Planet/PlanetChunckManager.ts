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

    private _layersCount: number = 6;
    private _layers: AbstractPlanetChunck[][];
    public lodLayerCount(layerIndex: number): number {
        return this._layers[layerIndex].length;
    }
    private _layersCursors: number[];
    private _lodLayersSqrDistances: number[];

    // estimated percentage of chuncks in the adequate layer
    public chunckSortedRatio: number = 0;

    // activity increase while manager is redrawing Chuncks.
    //private _maxActivity: number = 20;
    //private _activity: number = this._maxActivity;

    constructor(
        public scene: BABYLON.Scene
    ) {

    }

    public initialize(): void {
        this._layersCount = Config.performanceConfiguration.lodRanges.length;
        if (this.scene.activeCameras && this.scene.activeCameras.length > 0) {
            this._viewpoint = this.scene.activeCameras[0].globalPosition.clone();
        }
        else {
            this._viewpoint = this.scene.activeCamera.globalPosition.clone();
        }
        
        this._layers = [];
        this._layersCursors = [];
        this._lodLayersSqrDistances = [];
        for (let i = 0; i < this._layersCount - 1; i++) {
            this._layers[i] = [];
            this._layersCursors[i] = 0;
            this._lodLayersSqrDistances[i] = Config.performanceConfiguration.lodRanges[i] * Config.performanceConfiguration.lodRanges[i];
        }
        this._layers[this._layersCount - 1] = [];
        this._layersCursors[this._layersCount - 1] = 0;
        this._lodLayersSqrDistances[this._layersCount - 1] = Infinity;

        this.scene.onBeforeRenderObservable.add(this._update);

        Config.performanceConfiguration.onLodConfigChangedCallbacks.push(() => {
            for (let layerIndex = 0; layerIndex < this._layersCount - 1; layerIndex++) {
                let layer = this._layers[layerIndex];
                if (layer && layer[0] && layer[0] instanceof PlanetChunck) {
                    this._layers[this._layers.length - 1].push(...layer);
                    layer.length = 0;
                }
            }
        });
    }

    public dispose(): void {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    public registerChunck(chunck: AbstractPlanetChunck): boolean {
        while (this.unregister(chunck)) {

        }
        if (this._layers[this._layersCount - 1].indexOf(chunck) === -1) {
            this._layers[this._layersCount - 1].push(chunck);
            chunck.lod = this._layersCount - 1;
        }
        return true;
    }

    public unregister(chunck: AbstractPlanetChunck): boolean {
        for (let layerIndex = 0; layerIndex < this._layers.length; layerIndex++) {
            let index = this._layers[layerIndex].indexOf(chunck);
            if (index != -1) {
                this._layers[layerIndex].splice(index, 1);
                return true;
            }
        }
        return false;
    }

    public async requestDraw(chunck: PlanetChunck, prio: number, info: string): Promise<void> {
        if (chunck.lod <= Config.performanceConfiguration.lodCount) {
            return new Promise<void>(resolve => {
                if (!this._needRedraw.find(request => { return request.chunck === chunck; })) {
                    this._needRedraw.push(new PlanetChunckRedrawRequest(chunck, resolve, info));
                }
            });
        }
        else {

        }
    }

    public cancelDraw(chunck: PlanetChunck): void {
        let index = this._needRedraw.findIndex(request => { return request.chunck === chunck; });
        if (index != - 1) {
            this._needRedraw.splice(index, 1);
        }
    }

    private _getLayerIndex(sqrDistance: number): number {
        for (let i = 0; i < this._layersCount - 1; i++) {
            if (sqrDistance < this._lodLayersSqrDistances[i]) {
                return i;
            }
        }
        return this._layersCount - 1;
    }

    private onChunckMovedToLayer(chunck: AbstractPlanetChunck, layerIndex: number): void {
        if (!chunck.registered) {
            return;
        }
        if (Math.random() < 1 / 100) {
            //console.log("chunck lod = " + chunck.lod + " " + chunck.sqrDistanceToViewpoint.toFixed(0) + " " + chunck.planetName);
        }
        if (layerIndex < Config.performanceConfiguration.lodCount) {
            if (chunck instanceof PlanetChunck) {
                this.requestDraw(chunck, 0, "ChunckManager.update");
            }
            else if (chunck instanceof PlanetChunckGroup) {
                if (Math.random() < 1 / 100) {
                    console.log("wtf !");
                }
                return chunck.subdivide();
            }
        }
        else {
            if (chunck instanceof PlanetChunck) {
                if (layerIndex < Config.performanceConfiguration.lodCount - 1) {
                    this.cancelDraw(chunck);
                    chunck.collapse();
                    return;
                }
            }
            else if (chunck instanceof PlanetChunckGroup) {
                let expectedLevel = layerIndex - (Config.performanceConfiguration.lodCount - 1);
                if (chunck.level > expectedLevel) {
                    //console.log("sub " + chunck.name + " expected " + expectedLevel + " " + chunck.sqrDistanceToViewpoint.toFixed(0));
                    chunck.subdivide();
                    return;
                }
                else if (chunck.level < expectedLevel - 1) {
                    //console.log("col " + chunck.name + " expected " + expectedLevel + " " + chunck.sqrDistanceToViewpoint.toFixed(0));
                    chunck.collapse();
                    return;
                }
            }
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
        while ((t - t0) < 1 && todo.length < 100) {
            for (let prevLayerIndex = 0; prevLayerIndex < this._layersCount; prevLayerIndex++) {
                let cursor = this._layersCursors[prevLayerIndex];
                let chunck = this._layers[prevLayerIndex][cursor];
                if (chunck) {
                    chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.barycenter);
                    let newLayerIndex = this._getLayerIndex(chunck.sqrDistanceToViewpoint);
                    if (newLayerIndex != prevLayerIndex) {
                        let adequateLayerCursor = this._layersCursors[newLayerIndex];
                        this._layers[prevLayerIndex].splice(cursor, 1);
                        this._layers[newLayerIndex].splice(adequateLayerCursor, 0, chunck);
                        chunck.lod = newLayerIndex;
                        
                        todo.push(chunck);

                        this._layersCursors[newLayerIndex]++;
                        if (this._layersCursors[newLayerIndex] >= this._layers[newLayerIndex].length) {
                            this._layersCursors[newLayerIndex] = 0;
                        }
                        unsortedCount++;
                    }
                    else {
                        this._layersCursors[prevLayerIndex]++;
                        if (this._layersCursors[prevLayerIndex] >= this._layers[prevLayerIndex].length) {
                            this._layersCursors[prevLayerIndex] = 0;
                        }
                        sortedCount++;
                    }
                }
                else {
                    this._layersCursors[prevLayerIndex] = 0;
                    if (prevLayerIndex === this._layersCount) {
                        break;
                    }
                }
            }
            t = performance.now();
        }

        for (let i = 0; i < todo.length; i++) {
            this.onChunckMovedToLayer(todo[i], todo[i].lod);
        }
        
        /*
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
        */

        this._needRedraw = this._needRedraw.sort((r1, r2) => { return r2.chunck.sqrDistanceToViewpoint - r1.chunck.sqrDistanceToViewpoint; });
        // Recalculate chunck meshes.
        t0 = performance.now();
        while (this._needRedraw.length > 0 && (t - t0) < 1000 / 60) {
            let request = this._needRedraw.pop();
            if (request.chunck.lod <= 1) {
                request.chunck.initialize();
            }
            else {
                request.chunck.disposeMesh();
            }
            t = performance.now();
        }
        if ((t - t0) > 100) {
            console.log(((t - t0)).toFixed(3));
        }

        this.chunckSortedRatio = (this.chunckSortedRatio + sortedCount / (sortedCount + unsortedCount))* 0.5;
        if (isNaN(this.chunckSortedRatio)) {
            this.chunckSortedRatio = 1;
        }
    }

    /*
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
    */
}