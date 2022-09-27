class PlanetChunckRedrawRequest {

    constructor(
        public chunck: PlanetChunck,
        public callback?: () => void
    ) {

    }
}

class PlanetChunckManager {
    
    private _viewpoint: BABYLON.Vector3;
    private _chuncks: PlanetChunck[] = [];
    private _needRedraw: PlanetChunckRedrawRequest[] = [];

    constructor(
        public scene: BABYLON.Scene
    ) {

    }

    public initialize(): void {
        this._viewpoint = this.scene.activeCamera.globalPosition.clone();
        console.log(this._viewpoint.asArray());
        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    public registerChunck(chunck: PlanetChunck): void {
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

    private _maxChunckCount = 12 * 12 * 12;
    private _chunckIndexDistCompute: number = 0;
    private _chunckIndexSortLod0: number = 0;
    private _chunckIndexSortLod1: number = 0;
    private _chunckIndexRefreshLod0: number = 0;
    private _chunckIndexRefreshLod1: number = 0;
    private _maxActivity: number = 30;
    private _activity: number = this._maxActivity;
    private _update = () => {
        this._viewpoint.copyFrom(this.scene.activeCamera.globalPosition);
        console.log(this._viewpoint.asArray());

        let l = this._chuncks.length;
        
        let t0 = performance.now();
        let t = t0;
        /*
        while (this._chuncks.length > 0 && (t - t0) < 1) {
            let chunck = this._chuncks[this._chunckIndexDistCompute];
            chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.GetBaryCenter());
            this._chunckIndexDistCompute = (this._chunckIndexDistCompute + 1) % l;
            t = performance.now();
        }
        */

        t0 = performance.now();
        t = t0;
        while (this._chuncks.length > 0 && (t - t0) < 0.5 + 1 * this._activity / this._maxActivity) {
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
            }
            t = performance.now();
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
            }
            this._chunckIndexSortLod0 = (this._chunckIndexSortLod0 + 1) % (this._maxChunckCount - 1);
            t = performance.now();
        }

        t0 = performance.now();
        t = t0;
        chunck = this._chuncks[this._chunckIndexSortLod1];
        chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.GetBaryCenter());
        while (this._chuncks.length > 0 && (t - t0) < 1 + 1 * this._activity / this._maxActivity) {
            let chunck = this._chuncks[this._chunckIndexSortLod1];
            let nextChunck = this._chuncks[this._chunckIndexSortLod1 + 1];
            nextChunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, nextChunck.GetBaryCenter());
            if (nextChunck.sqrDistanceToViewpoint > chunck.sqrDistanceToViewpoint) {
                this._chuncks[this._chunckIndexSortLod1] = nextChunck;
                this._chuncks[this._chunckIndexSortLod1 + 1] = chunck;
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

        if (this._needRedraw.length > 0) {
            this._activity ++;
            this._activity = Math.min(this._activity, this._maxActivity);
            console.log("active");
        }
        else {
            this._activity--;
            this._activity = Math.max(this._activity, 0);
            console.log(this._activity.toFixed(3));
            if (this._activity < 1) {
                console.log("inactive");
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