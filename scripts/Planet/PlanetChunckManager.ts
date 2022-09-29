class PlanetChunckRedrawRequest {

    constructor(
        public chunck: PlanetChunck,
        public callback?: () => void
    ) {

    }
}

class PlanetChunckManager {

    public static USE_LAYER: boolean = true;
    
    private _viewpoint: BABYLON.Vector3;
    private _chuncks: PlanetChunck[] = [];
    private _needRedraw: PlanetChunckRedrawRequest[] = [];
    private _lodLayersCount: number = 6;
    private _lodLayers: PlanetChunck[][];
    private _lodLayersCursors: number[];
    private _lodLayersSqrDistances: number[];

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
            let d = (i + 1) * 70;
            this._lodLayers[i] = [];
            this._lodLayersCursors[i] = 0;
            this._lodLayersSqrDistances[i] = d * d;
        }
        this._lodLayers[this._lodLayersCount - 1] = [];
        this._lodLayersCursors[this._lodLayersCount - 1] = 0;
        this._lodLayersSqrDistances[this._lodLayersCount - 1] = Infinity;

        setTimeout(() => {
            console.log(this._lodLayers);
            //debugger;
        }, 5000);

        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    public registerChunck(chunck: PlanetChunck): void {
        if (PlanetChunckManager.USE_LAYER) {
            if (!chunck.isEmptyOrHidden()) {
                chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.GetBaryCenter());
                let layerIndex = this._getLayerIndex(chunck.sqrDistanceToViewpoint);
                if (this._lodLayers[layerIndex].indexOf(chunck) === -1) {
                    this._lodLayers[layerIndex].push(chunck);
                    if (layerIndex === 0) {
                        this.requestDraw(chunck);
                    }
                }
            }
        }
        else {
            if (this._chuncks.indexOf(chunck) === -1) {
                if (!chunck.isEmptyOrHidden()) {
                    chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.GetBaryCenter());
                    if (this._chuncks.length > 0) {
                        let i = 0;
                        let ithChunck = this._chuncks[i];
                        while (ithChunck && ithChunck.sqrDistanceToViewpoint > chunck.sqrDistanceToViewpoint) {
                            i++;
                            ithChunck = this._chuncks[i];
                        }
                        this._chuncks.splice(i, 0, chunck);
                    }
                    else {
                        this._chuncks.push(chunck);
                    }
                }
            }
        }
    }

    public requestDrawLastN(n: number): void {
        let l = this._chuncks.length;
        for (let i = l - n; i < l; i++) {
            this.requestDraw(this._chuncks[i]);
        }
    }

    public async requestDraw(chunck: PlanetChunck): Promise<void> {
        return new Promise<void>(resolve => {
            if (!this._needRedraw.find(request => { return request.chunck === chunck; })) {
                this._needRedraw.push(new PlanetChunckRedrawRequest(chunck, resolve));
            }
        });
    }

    public chunckSort: number = 0;
    private _maxChunckCount = 12 * 12 * 12;
    private _chunckIndexDistCompute: number = 0;
    private _chunckIndexSortLod0: number = 0;
    private _chunckIndexSortLod1: number = 0;
    private _chunckIndexRefreshLod0: number = 0;
    private _chunckIndexRefreshLod1: number = 0;
    private _maxActivity: number = 30;
    private _activity: number = this._maxActivity;

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

        let l = this._chuncks.length;
        
        let t0 = performance.now();
        let t = t0;

        let sortedCount = 0;
        let unsortedCount = 0;

        if (PlanetChunckManager.USE_LAYER) {
            let duration = 0.5 + 150 * (1 - this.chunckSort);
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
                            
                            if (newLayerIndex === 0) {
                                this.requestDraw(chunck);
                            }
                            else if (i === 0) {
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
        }
        else {
            /*
            while (this._chuncks.length > 0 && (t - t0) < 1) {
                let chunck = this._chuncks[this._chunckIndexDistCompute];
                chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.GetBaryCenter());
                this._chunckIndexDistCompute = (this._chunckIndexDistCompute + 1) % l;
                t = performance.now();
            }
            */

            if (false) {
                t0 = performance.now();
                t = t0;
                let duration = 0.5 + 150 * (1 - this.chunckSort);
                duration = Math.min(duration, 1000 / 24);
                while (this._chuncks.length > 0 && (t - t0) < duration) {
                    let n1 = Math.floor(Math.random() * l);
                    let n2 = Math.floor(Math.random() * l);
                    let nMin = Math.min(n1, n2);
                    let nMax = Math.max(n1, n2);
                    let chunckMin = this._chuncks[nMin];
                    chunckMin.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunckMin.GetBaryCenter());
                    let chunckMax = this._chuncks[nMax];
                    chunckMax.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunckMax.GetBaryCenter());
                    if (chunckMax.sqrDistanceToViewpoint > chunckMin.sqrDistanceToViewpoint) {
                        this._chuncks[nMin] = chunckMax;
                        this._chuncks[nMax] = chunckMin;
                        unsortedCount++;
                    }
                    else {
                        sortedCount++;
                    }
                    t = performance.now();
                }
            }
            else {
                t0 = performance.now();
                t = t0;
                let duration = 0.5 + 150 * (1 - this.chunckSort);
                duration = Math.min(duration, 1000 / 24);
                while (this._chuncks.length > 0 && (t - t0) < duration) {
                    let ns = [];
                    let chuncks: PlanetChunck[] = [];
                    for (let i = 0; i < 10; i++) {
                        ns[i] = Math.floor(Math.random() * l);
                    }
                    ns = ns.sort((a, b) => { return b - a; });
                    for (let i = 0; i < 10; i++) {
                        chuncks[i] = this._chuncks[ns[i]];
                        chuncks[i].sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chuncks[i].GetBaryCenter());
                    }
                    chuncks = chuncks.sort((c1, c2) => { return c1.sqrDistanceToViewpoint - c2.sqrDistanceToViewpoint; });

                    for (let i = 0; i < 10; i++) {
                        if (this._chuncks[ns[i]] != chuncks[i]) {
                            this._chuncks[ns[i]] = chuncks[i];
                            unsortedCount++;
                        }
                        else {
                            sortedCount++;
                        }
                    }
                    t = performance.now();
                }
            }
            
            /*
            t0 = performance.now();
            t = t0;
            let chunck = this._chuncks[this._chunckIndexSortLod0];
            chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.GetBaryCenter());
            while (this._chuncks.length > 0 && (t - t0) < 0.5 + 1 * this._activity / this._maxActivity) {
                let index = l - this._maxChunckCount + this._chunckIndexSortLod0;
                let chunck = this._chuncks[index];
                let nextChunck = this._chuncks[index + 1];
                nextChunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, nextChunck.GetBaryCenter());
                if (nextChunck.sqrDistanceToViewpoint > chunck.sqrDistanceToViewpoint) {
                    this._chuncks[index] = nextChunck;
                    this._chuncks[index + 1] = chunck;
                    unsortedCount++;
                }
                else {
                    sortedCount++;
                }
                this._chunckIndexSortLod0 = (this._chunckIndexSortLod0 + 1) % (this._maxChunckCount - 1);
                t = performance.now();
            }

            t0 = performance.now();
            t = t0;
            let chunck = this._chuncks[this._chunckIndexSortLod1];
            chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.GetBaryCenter());
            while (this._chuncks.length > 0 && (t - t0) < 1 + 1 * this._activity / this._maxActivity) {
                let chunck = this._chuncks[this._chunckIndexSortLod1];
                let nextChunck = this._chuncks[this._chunckIndexSortLod1 + 1];
                nextChunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, nextChunck.GetBaryCenter());
                if (nextChunck.sqrDistanceToViewpoint > chunck.sqrDistanceToViewpoint) {
                    this._chuncks[this._chunckIndexSortLod1] = nextChunck;
                    this._chuncks[this._chunckIndexSortLod1 + 1] = chunck;
                    unsortedCount++;
                }
                else {
                    sortedCount++;
                }
                this._chunckIndexSortLod1 = (this._chunckIndexSortLod1 + 1) % (l - 1);
                t = performance.now();
            }
            */

            t0 = performance.now();
            t = t0;
            while (this._chuncks.length > 0 && (t - t0) < 0.5 + 1 * this._activity / this._maxActivity) {
                let chunck = this._chuncks[this._chunckIndexRefreshLod0 + (l - this._maxChunckCount)];
                if (chunck && !chunck.isMeshDrawn()) {
                    this.requestDraw(chunck);
                }
                this._chunckIndexRefreshLod0 = (this._chunckIndexRefreshLod0 + 1) % this._maxChunckCount;
                t = performance.now();
            }

            t0 = performance.now();
            t = t0;
            while (this._chuncks.length > 0 && (t - t0) < 0.5 + 1 * this._activity / this._maxActivity) {
                let chunck = this._chuncks[this._chunckIndexRefreshLod1];
                if (this._chunckIndexRefreshLod1 > l - this._maxChunckCount) {
                    if (!chunck.isMeshDrawn()) {
                        this.requestDraw(chunck);
                    }
                }
                else if (this._chunckIndexRefreshLod1 < l - this._maxChunckCount * 1.2) {
                    if (!chunck.isMeshDisposed()) {
                        chunck.disposeMesh();
                    }
                }
                this._chunckIndexRefreshLod1 = (this._chunckIndexRefreshLod1 + 1) % l;
                t = performance.now();
            }
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

        t0 = performance.now();
        t = t0;
        while (this._needRedraw.length > 0 && (t - t0) < 0.5 + 1 * this._activity / this._maxActivity) {
            let request = this._needRedraw.pop();
            request.chunck.initialize();
            t = performance.now();
        }

        this.chunckSort = (this.chunckSort + sortedCount / (sortedCount + unsortedCount))* 0.5;
        (document.getElementById("chunck-sort") as DebugDisplayFrameValue).addValue(this.chunckSort * 100);
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