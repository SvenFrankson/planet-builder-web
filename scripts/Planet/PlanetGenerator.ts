abstract class PlanetGenerator {

    public heightMaps: PlanetHeightMap[];

    constructor(
        public planet: Planet
    ) {

    }

    public abstract makeData(chunck: PlanetChunck): number[][][];

    public showDebug(): void {
        for (let i = 0; i < this.heightMaps.length; i++) {
            let x = - 3.5 + Math.floor(i / 3) * 7;
            if (i === 1) {
                x -= 1;
            }
            if (i === 4) {
                x += 1;
            }
		    Utils.showDebugPlanetHeightMap(this.heightMaps[i], x, 1.5 - 1.5 * (i % 3));
        }
    }
}

class PlanetGeneratorEarth extends PlanetGenerator {

    private _mainHeightMap: PlanetHeightMap;

    constructor(planet: Planet, private _seaLevel: number, private _mountainHeight: number) {
        super(planet);
        this._mainHeightMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(planet.kPosMax));
        this.heightMaps = [this._mainHeightMap];
    }

    public makeData(chunck: PlanetChunck): number[][][] {
        let f = Math.pow(2, this._mainHeightMap.degree - PlanetTools.KPosToDegree(chunck.kPos));

        return PlanetTools.Data(
            (i, j, k) => {
                
                let v = this._mainHeightMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let altitude = Math.floor((this._seaLevel + v * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                if (globalK <= altitude) {
                    if (globalK > altitude - 2) {
                        if (globalK < this._seaLevel * (this.planet.kPosMax * PlanetTools.CHUNCKSIZE) + 1) {
                            return BlockType.Sand;
                        }
                        return BlockType.Grass;
                    }
                    return BlockType.Rock;
                }

                return 0;
            }
        );
    }
}

class PlanetGeneratorDebug extends PlanetGenerator {

    constructor(planet: Planet) {
        super(planet);
    }

    public makeData(chunck: PlanetChunck): number[][][] {
        return PlanetTools.Data(
            (i, j, k) => {
                let iGlobal = i + chunck.iPos * PlanetTools.CHUNCKSIZE;
                let jGlobal = j + chunck.jPos * PlanetTools.CHUNCKSIZE;
                let kGlobal = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                let h = 25;
                if (chunck.side === Side.Front) {
                    h = 28;
                }
                if (jGlobal < 5) {
                    h = 30;
                }
                if (kGlobal < h) {
                    if (iGlobal < 5) {
                        return BlockType.RedDirt;
                    }
                    if (jGlobal < 5) {
                        return BlockType.RedRock;
                    }
                    return BlockType.RedDust;
                }
                return 0;
            }
        );
    }
}

class PlanetGeneratorDebug2 extends PlanetGenerator {

    constructor(planet: Planet) {
        super(planet);
    }

    public makeData(chunck: PlanetChunck): number[][][] {
        let c = Math.floor(Math.random() * 7 + 1)
        return PlanetTools.Data(
            (i, j, k) => {
                return c;
            }
        );
    }
}

class PlanetGeneratorDebug3 extends PlanetGenerator {

    constructor(planet: Planet) {
        super(planet);
    }

    public makeData(chunck: PlanetChunck): number[][][] {
        return PlanetTools.Data(
            (i, j, k) => {
                let c = Math.floor(Math.random() * 7 + 1)
                return c;
            }
        );
    }
}