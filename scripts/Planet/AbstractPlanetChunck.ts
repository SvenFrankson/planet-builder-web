abstract class AbstractPlanetChunck {

    public get scene(): BABYLON.Scene {
        return this.planetSide.getScene();
    }

    public name: string;

    public get side(): Side {
        return this.planetSide.side;
    }
    public get chunckManager(): PlanetChunckManager {
        return this.planetSide.chunckManager;
    }
    protected _degree: number = 0;
    public get degree(): number {
        return this._degree;
    }
    protected _chunckCount: number = 0;
    public get chunckCount(): number {
        return this._chunckCount;
    }
    protected _size: number = 0;
    public get size(): number {
        return this._size;
    }
    public get planetName(): string {
        return this.planetSide.GetPlanetName();
    }
    public get kPosMax(): number {
        return this.planetSide.kPosMax;
    }

    private _registered: boolean = false;
    public get registered(): boolean {
        return this._registered;
    }
    public sqrDistanceToViewpoint: number;
    public lod: number = 2;

    protected _barycenter: BABYLON.Vector3;
    public get barycenter(): BABYLON.Vector3 {
        return this._barycenter;
    }
    protected _normal: BABYLON.Vector3;
    public get normal(): BABYLON.Vector3 {
        return this._normal;
    }

    constructor(
        public iPos: number,
        public jPos: number,
        public kPos: number,
        public planetSide: PlanetSide,
        public parentGroup: PlanetChunckGroup
    ) {
        
    }

    public register(): void {
        if (!this.registered) {
            this._registered = this.chunckManager.registerChunck(this);
        }        
    }

    public unregister(): void {
        if (this.registered) {
            this.chunckManager.unregister(this);
            this._registered = false;
        }   
    }

    public abstract collapse(): void;
}