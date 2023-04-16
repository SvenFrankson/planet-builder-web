var SideNames: string[] = [
    "Front",
    "Right",
    "Back",
    "Left",
    "Top",
    "Bottom"
];

enum Side {
    Front,
    Right,
    Back,
    Left,
    Top,
    Bottom
}

class PlanetSide extends BABYLON.Mesh {
    private _side: Side;
    public get side(): Side {
        return this._side;
    }
    public get chunckManager(): PlanetChunckManager {
        return this.planet.chunckManager;
    }
	
    public planet: Planet;
    public GetPlanetName(): string {
        return this.planet.GetPlanetName();
    }
    
    public get kPosMax(): number {
        return this.planet.kPosMax;
    }
    public get degree(): number {
        return this.planet.degree;
    }
    private _chunckCount: number = 0;
    public get chunckCount(): number {
        return this._chunckCount;
    }
    
    private chunckGroup: PlanetChunckGroup;

    public shellMaterial: BABYLON.Material;
    public onShellMaterialReady(callback: () => void): void {
        if (this.shellMaterial && this.shellMaterial.isReady()) {
            callback();
        }
        else {
            let attempt = () => {
                if (this.shellMaterial && this.shellMaterial.isReady()) {
                    callback();
                }
                else {
                    requestAnimationFrame(attempt);
                }
            }
            attempt();
        }
    }

    public getChunck(iPos: number, jPos: number, kPos: number): PlanetChunck {
        if (iPos >= 0 && iPos < this.chunckCount) {
            if (jPos >= 0 && jPos < this.chunckCount) {
                if (kPos >= 0 && kPos < this.kPosMax) {
                    return this.chunckGroup.getPlanetChunck(iPos, jPos, kPos);
                }
            }
        }
        if (kPos >= 0 && kPos < this.kPosMax) {
            if (iPos < 0) {
                if (this.side <= Side.Left) {
                    let side = this.planet.GetSide((this.side + 1) % 4);
                    return side.getChunck(this.chunckCount + iPos, jPos, kPos);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Back);
                    return side.getChunck(this.chunckCount - 1 - jPos, this.chunckCount + iPos, kPos);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Back);
                    return side.getChunck(jPos, - 1 - iPos, kPos);
                }
            }
            else if (iPos >= this.chunckCount) {
                if (this.side <= Side.Left) {
                    let side = this.planet.GetSide((this.side + 3) % 4);
                    return side.getChunck(- this.chunckCount + iPos, jPos, kPos);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Front);
                    return side.getChunck(jPos, 2 * this.chunckCount - iPos - 1, kPos);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Front);
                    return side.getChunck(this.chunckCount - 1 - jPos, this.chunckCount - iPos, kPos);
                }
            }
            else if (jPos < 0) {
                if (this.side === Side.Front) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(this.chunckCount + jPos, this.chunckCount - 1 - iPos, kPos);
                }
                else if (this.side === Side.Right) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(iPos, this.chunckCount + jPos, kPos);
                }
                else if (this.side === Side.Back) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(- 1 - jPos, iPos, kPos);
                }
                else if (this.side === Side.Left) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(this.chunckCount - 1 - iPos, - 1 - jPos, kPos);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Right);
                    return side.getChunck(iPos, this.chunckCount + jPos, kPos);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Left);
                    return side.getChunck(this.chunckCount - 1 - iPos, - 1 - jPos, kPos);
                }
            }
            else if (jPos >= this.chunckCount) {
                if (this.side === Side.Front) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(2 * this.chunckCount - 1 - jPos, iPos, kPos);
                }
                else if (this.side === Side.Right) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(iPos, - this.chunckCount + jPos, kPos);
                }
                else if (this.side === Side.Back) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(- this.chunckCount + jPos, this.chunckCount - 1 - iPos, kPos);
                }
                else if (this.side === Side.Left) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(this.chunckCount - 1 - iPos, 2 * this.chunckCount - 1 - jPos, kPos);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Left);
                    return side.getChunck(this.chunckCount - 1 - iPos, 2 * this.chunckCount - 1 - jPos, kPos);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Right);
                    return side.getChunck(iPos, - this.chunckCount + jPos, kPos);
                }
            }
        }
    }

    public GetData(iGlobal: number, jGlobal: number, kGlobal: number, degree: number): number {
        let L = this.chunckCount * PlanetTools.CHUNCKSIZE;

        if (iGlobal < 0) {
            if (this.side <= Side.Left) {
                let side = this.planet.GetSide((this.side + 1) % 4);
                return side.GetData(L + iGlobal, jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Top) {
                let side = this.planet.GetSide(Side.Back);
                return side.GetData(L - 1 - jGlobal, L + iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Bottom) {
                let side = this.planet.GetSide(Side.Back);
                return side.GetData(jGlobal, - 1 - iGlobal, kGlobal, degree);
            }
        }
        else if (iGlobal >= L) {
            if (this.side <= Side.Left) {
                let side = this.planet.GetSide((this.side + 3) % 4);
                return side.GetData(- L + iGlobal, jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Top) {
                let side = this.planet.GetSide(Side.Front);
                return side.GetData(jGlobal, 2 * L - iGlobal - 1, kGlobal, degree);
            }
            else if (this.side === Side.Bottom) {
                let side = this.planet.GetSide(Side.Front);
                return side.GetData(L - 1 - jGlobal, L - iGlobal, kGlobal, degree);
            }
        }
        else if (jGlobal < 0) {
            if (this.side === Side.Front) {
                let side = this.planet.GetSide(Side.Bottom);
                return side.GetData(L + jGlobal, L - 1 - iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Right) {
                let side = this.planet.GetSide(Side.Bottom);
                return side.GetData(iGlobal, L + jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Back) {
                let side = this.planet.GetSide(Side.Bottom);
                return side.GetData(- 1 - jGlobal, iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Left) {
                let side = this.planet.GetSide(Side.Bottom);
                return side.GetData(L - 1 - iGlobal, - 1 - jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Top) {
                let side = this.planet.GetSide(Side.Right);
                return side.GetData(iGlobal, L + jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Bottom) {
                let side = this.planet.GetSide(Side.Left);
                return side.GetData(L - 1 - iGlobal, - 1 - jGlobal, kGlobal, degree);
            }
        }
        else if (jGlobal >= L) {
            if (this.side === Side.Front) {
                let side = this.planet.GetSide(Side.Top);
                return side.GetData(2 * L - 1 - jGlobal, iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Right) {
                let side = this.planet.GetSide(Side.Top);
                return side.GetData(iGlobal, - L + jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Back) {
                let side = this.planet.GetSide(Side.Top);
                return side.GetData(- L + jGlobal, L - 1 - iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Left) {
                let side = this.planet.GetSide(Side.Top);
                return side.GetData(L - 1 - iGlobal, 2 * L - 1 - jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Top) {
                let side = this.planet.GetSide(Side.Left);
                return side.GetData(L - 1 - iGlobal, 2 * L - 1 - jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Bottom) {
                let side = this.planet.GetSide(Side.Right);
                return side.GetData(iGlobal, - L + jGlobal, kGlobal, degree);
            }
        }
        
        let iChunck: number = Math.floor(iGlobal / PlanetTools.CHUNCKSIZE);
        let jChunck: number = Math.floor(jGlobal / PlanetTools.CHUNCKSIZE);
        let kChunck: number = Math.floor(kGlobal / PlanetTools.CHUNCKSIZE);

        if (iChunck >= 0 && iChunck < this.chunckCount) {
            if (jChunck >= 0 && jChunck < this.chunckCount) {
                if (kChunck >= 0 && kChunck < this.kPosMax) {
                    let group = this.chunckGroup[degree];
                    if (group) {
                        let i: number = iGlobal - iChunck * PlanetTools.CHUNCKSIZE;
                        let j: number = jGlobal - jChunck * PlanetTools.CHUNCKSIZE;
                        let k: number = kGlobal - kChunck * PlanetTools.CHUNCKSIZE;
                        let chunck = group.getPlanetChunck(iChunck, jChunck, kChunck);
                        if (chunck) {
                            return chunck.GetData(i, j, k);
                        }
                    }
                }
            }
        }
        return 0;
    }

    constructor(
        side: Side,
        planet: Planet
    ) {
        super(planet.name + "-side-" + side, Game.Scene);

        this.planet = planet;
        this.parent = planet;
        this._side = side;
        this._chunckCount = PlanetTools.DegreeToChuncksCount(this.degree);
        this.rotationQuaternion = PlanetTools.QuaternionForSide(this._side);
        this.freezeWorldMatrix();
    }

    public instantiate(): void {
        this.chunckGroup = new PlanetChunckGroup(0, 0, 0, this, undefined, this.degree, this.degree - (PlanetTools.DEGREEMIN - 1));

        let material = new PlanetMaterial(this.name, this.getScene());
        //let material = new BABYLON.StandardMaterial(this.name, this.getScene());
        material.setSeaLevelTexture(this.planet.generator.getTexture(this.side, Config.performanceConfiguration.shellMeshTextureSize));
        material.setPlanetPos(this.planet.position);
        this.shellMaterial = material;
    }
    
    public register(): number {
        let chunckCount: number = 0;
        this.chunckGroup.register();
        return chunckCount;
    }
}
