class PlanetSky {

    public invertLightDir: BABYLON.Vector3 = BABYLON.Vector3.Up();
    public zenithColor: BABYLON.Color3 = new BABYLON.Color3(0.478, 0.776, 1.000);
    public dawnColor: BABYLON.Color3 = new BABYLON.Color3(0.702, 0.373, 0.000);
    public nightColor: BABYLON.Color3 = new BABYLON.Color3(0.000, 0.008, 0.188);
    private _skyColor: BABYLON.Color3 = BABYLON.Color3.Black();

    private _initialized: boolean = false;
    public get initialized(): boolean {
        return this._initialized;
    }

    public player: Player;

    constructor(public skybox: BABYLON.Mesh, public scene: BABYLON.Scene) {

    }
    

    public initialize(): void {
        this.scene.onBeforeRenderObservable.add(this._update);
        this._initialized = true;
    }

    public setInvertLightDir(invertLightDir: BABYLON.Vector3) {
        this.invertLightDir = invertLightDir;
    }

    private _update = () => {
        if (this.player) {
            let factor = BABYLON.Vector3.Dot(this.player.upDirection, this.invertLightDir);

            let atmoLimit = 50;
            let d = (atmoLimit - this.player.altitudeOnPlanet) / 25;
            d = Math.max(Math.min(d, 1), 0);

            if (this.skybox) {
                let skyAlpha = (1 - factor) / 4;
                skyAlpha = Math.max(Math.min(skyAlpha, 1), 0);
                this.skybox.material.alpha = Math.max(skyAlpha, 1 - d);
            }

            let sign = 0;
            if (factor != 0) {
                sign = factor / Math.abs(factor);
                factor = sign * Math.sqrt(Math.sqrt(Math.abs(factor)));
            }
            if (sign >= 0) {
                BABYLON.Color3.LerpToRef(this.dawnColor, this.zenithColor, factor, this._skyColor);
                this._skyColor.r *= d;
                this._skyColor.g *= d;
                this._skyColor.b *= d;
                this.scene.clearColor.copyFromFloats(this._skyColor.r, this._skyColor.g, this._skyColor.b, 1);
            }
            else {
                BABYLON.Color3.LerpToRef(this.dawnColor, this.nightColor, Math.abs(factor), this._skyColor);
                this._skyColor.r *= d;
                this._skyColor.g *= d;
                this._skyColor.b *= d;
                this.scene.clearColor.copyFromFloats(this._skyColor.r, this._skyColor.g, this._skyColor.b, 1);
            }
        }
    }
}