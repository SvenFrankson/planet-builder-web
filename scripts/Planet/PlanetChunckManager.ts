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

    constructor(
        public scene: BABYLON.Scene
    ) {

    }

    public initialize(): void {
        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    public async requestDraw(chunck: PlanetChunck): Promise<void> {
        return new Promise<void>(resolve => {
            if (!this._needRedraw.find(request => { return request.chunck === chunck; })) {
                this._needRedraw.push(new PlanetChunckRedrawRequest(chunck, resolve));
            }
        });
    }

    private _update = () => {
        let t0 = performance.now();
        let t = t0;
        while (this._needRedraw.length > 0 && (t - t0) < 1) {
            let request = this._needRedraw.pop();
            request.chunck.initialize();
            t = performance.now();
        }
    }
}