class PlanetSky {

    public scene: BABYLON.Scene;

    public invertLightDir: BABYLON.Vector3 = BABYLON.Vector3.Up();
    private _localUp: BABYLON.Vector3 = BABYLON.Vector3.Up();
    public zenithColor: BABYLON.Color3 = BABYLON.Color3.FromHexString("#00c3ff");
    public dawnColor: BABYLON.Color3 = BABYLON.Color3.FromHexString("#ff6f00");
    public nightColor: BABYLON.Color3 = BABYLON.Color3.FromHexString("#000230");
    private _skyColor: BABYLON.Color3 = BABYLON.Color3.Black();

    private _initialized: boolean = false;
    public get initialized(): boolean {
        return this._initialized;
    }

    public container: HTMLDivElement;

    public initialize(
        scene: BABYLON.Scene
    ): void {
        this.scene = scene;
        scene.onBeforeRenderObservable.add(this._update);
        this._initialized = true;
    }

    public setInvertLightDir(invertLightDir: BABYLON.Vector3) {
        this.invertLightDir = invertLightDir;
    }

    private _update = () => {
        if (this.scene.activeCamera) {
            this.scene.activeCamera.globalPosition.normalizeToRef(this._localUp);
            let factor = BABYLON.Vector3.Dot(this._localUp, this.invertLightDir);
            let sign = 0;
            if (factor != 0) {
                sign = factor / Math.abs(factor);
                factor = sign * Math.sqrt(Math.abs(factor));
            }
            if (sign >= 0) {
                BABYLON.Color3.LerpToRef(this.dawnColor, this.zenithColor, factor, this._skyColor);
                this.scene.clearColor.copyFromFloats(this._skyColor.r, this._skyColor.g, this._skyColor.b, 1);
            }
            else {
                BABYLON.Color3.LerpToRef(this.dawnColor, this.nightColor, Math.abs(factor), this._skyColor);
                this.scene.clearColor.copyFromFloats(this._skyColor.r, this._skyColor.g, this._skyColor.b, 1);
            }
        }
    }
}