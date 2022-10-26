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
    private _degree: number = 0;
    public get degree(): number {
        return this._degree;
    }
    private _chunckCount: number = 0;
    public get chunckCount(): number {
        return this._chunckCount;
    }
    private _size: number = 0;
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
        public planetSide: PlanetSide
    ) {
        this._degree = PlanetTools.KPosToDegree(this.kPos);
        this._size = PlanetTools.DegreeToSize(this.degree);
        this._chunckCount = PlanetTools.DegreeToChuncksCount(this.degree);
    }

    public register(): void {
        if (!this.registered) {
            this._registered = this.chunckManager.registerChunck(this);
        }        
    }
}