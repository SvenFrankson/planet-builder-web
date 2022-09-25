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
    private chuncksLength: number;
    private chuncks: Array<Array<Array<PlanetChunck>>>;

    public getChunck(iPos: number, jPos: number, kPos: number, degree: number): PlanetChunck {
        if (PlanetTools.KPosToDegree(kPos) < degree) {
            return this.getChunck(Math.floor(iPos / 2), Math.floor(jPos / 2), kPos, degree - 1);
        }
        if (this.chuncks[kPos]) {
            if (this.chuncks[kPos][iPos]) {
                let chunck = this.chuncks[kPos][iPos][jPos];
                if (chunck && chunck.degree === degree) {
                    return chunck;
                }
            }
        }
        if (kPos >= 0 && kPos < this.kPosMax) {
            let chunckCount = this.chuncks[kPos].length;
            if (iPos < 0) {
                if (this.side <= Side.Left) {
                    let side = this.planet.GetSide((this.side + 3) % 4);
                    return side.getChunck(chunckCount + iPos, jPos, kPos, degree);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Back);
                    return side.getChunck(chunckCount - 1 - jPos, chunckCount + iPos, kPos, degree);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Back);
                    return side.getChunck(jPos, - 1 - iPos, kPos, degree);
                }
            }
            else if (iPos >= chunckCount) {
                if (this.side <= Side.Left) {
                    let side = this.planet.GetSide((this.side + 3) % 4);
                    return side.getChunck(- chunckCount + iPos, jPos, kPos, degree);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Front);
                    return side.getChunck(jPos, 2 * chunckCount - iPos - 1, kPos, degree);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Front);
                    return side.getChunck(chunckCount - 1 - jPos, chunckCount - iPos, kPos, degree);
                }
            }
            else if (jPos < 0) {
                if (this.side === Side.Front) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(chunckCount + jPos, chunckCount - 1 - iPos, kPos, degree);
                }
                else if (this.side === Side.Right) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(iPos, chunckCount + jPos, kPos, degree);
                }
                else if (this.side === Side.Back) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(- 1 - jPos, iPos, kPos, degree);
                }
                else if (this.side === Side.Left) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(chunckCount - 1 - iPos, - 1 - jPos, kPos, degree);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Right);
                    return side.getChunck(iPos, chunckCount + jPos, kPos, degree);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Left);
                    return side.getChunck(chunckCount - 1 - iPos, - 1 - jPos, kPos, degree);
                }
            }
            else if (jPos >= chunckCount) {
                if (this.side === Side.Front) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(2 * chunckCount - 1 - jPos, iPos, kPos, degree);
                }
                else if (this.side === Side.Right) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(iPos, - chunckCount + jPos, kPos, degree);
                }
                else if (this.side === Side.Back) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(- chunckCount + jPos, chunckCount - 1 - iPos, kPos, degree);
                }
                else if (this.side === Side.Left) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(chunckCount - 1 - iPos, 2 * chunckCount - 1 - jPos, kPos, degree);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Left);
                    return side.getChunck(chunckCount - 1 - iPos, 2 * chunckCount - 1 - jPos, kPos, degree);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Right);
                    return side.getChunck(iPos, - chunckCount + jPos, kPos, degree);
                }
            }
        }
    }

    public GetData(iGlobal: number, jGlobal: number, kGlobal: number): number {
        let chuncksCount: number = PlanetTools.DegreeToChuncksCount(PlanetTools.KGlobalToDegree(kGlobal));
        let L = chuncksCount * PlanetTools.CHUNCKSIZE;

        if (iGlobal < 0) {
            if (this.side <= Side.Left) {
                let chunck = this.planet.GetSide((this.side + 3) % 4);
                return chunck.GetData(iGlobal + L, jGlobal, kGlobal);
            }
            else if (this.side === Side.Top) {
                return this.planet.GetSide(Side.Back).GetData(L - 1 - jGlobal, L + iGlobal, kGlobal);
            }
            else if (this.side === Side.Bottom) {
                return this.planet.GetSide(Side.Back).GetData(jGlobal, - 1 - iGlobal, kGlobal);
            }
        }
        else if (iGlobal >= L) {
            if (this.side <= Side.Left) {
                let chunck = this.planet.GetSide((this.side + 1) % 4);
                return chunck.GetData(iGlobal - L, jGlobal, kGlobal);
            }
            else if (this.side === Side.Top) {
                return this.planet.GetSide(Side.Front).GetData(jGlobal, 2 * L - 1 - iGlobal, kGlobal);
            }
            else if (this.side === Side.Bottom) {
                return this.planet.GetSide(Side.Front).GetData(L - 1 - jGlobal, iGlobal - L, kGlobal);
            }
        }
        if (jGlobal < 0) {

        }
        else if (jGlobal >= L) {
            
        }
        let iChunck: number = Math.floor(iGlobal / PlanetTools.CHUNCKSIZE);
        let jChunck: number = Math.floor(jGlobal / PlanetTools.CHUNCKSIZE);
        let kChunck: number = Math.floor(kGlobal / PlanetTools.CHUNCKSIZE);

        if (this.chuncks[kChunck]) {
            if (this.chuncks[kChunck][iChunck]) {
                if (this.chuncks[kChunck][iChunck][jChunck]) {
                    let i: number = iGlobal - iChunck * PlanetTools.CHUNCKSIZE;
                    let j: number = jGlobal - jChunck * PlanetTools.CHUNCKSIZE;
                    let k: number = kGlobal - kChunck * PlanetTools.CHUNCKSIZE;
                    return this.chuncks[kChunck][iChunck][jChunck].GetData(i, j, k);
                }
            }
        }
        return 0;
    }

    constructor(
        side: Side,
        planet: Planet
    ) {
        let name: string = "side-" + side;
        super(name, Game.Scene);

        this.planet = planet;
        this._side = side;
        this.rotationQuaternion = PlanetTools.QuaternionForSide(this._side);
        this.computeWorldMatrix();
        this.freezeWorldMatrix();

        this.chuncks = new Array<Array<Array<PlanetChunck>>>();
        for (let k: number = 0; k <= this.kPosMax; k++) {
            this.chuncks[k] = new Array<Array<PlanetChunck>>();
            let chuncksCount: number = PlanetTools.DegreeToChuncksCount(
                PlanetTools.KPosToDegree(k)
            );
            for (let i: number = 0; i < chuncksCount; i++) {
                this.chuncks[k][i] = new Array<PlanetChunck>();
                for (let j: number = 0; j < chuncksCount; j++) {
                    this.chuncks[k][i][j] = new PlanetChunck(i, j, k, this);
                }
            }
        }
    }
}
