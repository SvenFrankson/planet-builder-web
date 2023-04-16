abstract class AbstractPlanetChunck {

    public get scene(): BABYLON.Scene {
        return this.planetSide.getScene();
    }

    public name: string;

    public get side(): Side {
        return this.planetSide.side;
    }

    public get planet(): Planet {
        return this.planetSide.planet;
    }
    
    public get chunckManager(): PlanetChunckManager {
        return this.planetSide.chunckManager;
    }
    protected _degree: number = 0;
    public get degree(): number {
        return this._degree;
    }
    public get chunckCount(): number {
        return this.planetSide.chunckCount;
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

    public isShellLevel: boolean = false;

    private _registered: boolean = false;
    public get registered(): boolean {
        return this._registered;
    }
    public sqrDistanceToViewpoint: number;
    public lod: number = NaN;

    // Barycenter relative to world origin
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

    public getUniqueName(): string {
        return this.planet.galaxy.universe.name + "-" + this.planet.galaxy.name + "-" + this.planet.name + "." + this.side + ":" + this.iPos + "-" + this.jPos	+ "-" + this.kPos;
    }

    public canCollapse(): boolean {
        if (this.parentGroup) {
            let siblings = this.parentGroup.children;
            let level = 0;
            if (this instanceof PlanetChunckGroup) {
                level = this.level;
            }
            for (let i = 0; i < siblings.length; i++) {
                let sib = siblings[i];
                if (sib.lod - 1 <= level) {
                    return false;
                }
            }
        }
        return true;
    }

    public abstract collapse(): void;
}