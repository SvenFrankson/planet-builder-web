abstract class PlanetGenerator {

    public heightMaps: PlanetHeightMap[];

    constructor(
        public planet: Planet
    ) {

    }

    public abstract makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void;

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
    private _treeMap: PlanetHeightMap;
    private _rockMap: PlanetHeightMap;

    constructor(planet: Planet, private _seaLevel: number, private _mountainHeight: number) {
        super(planet);
        this._mainHeightMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(planet.kPosMax));
        this._treeMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(planet.kPosMax), { firstNoiseDegree : PlanetTools.KPosToDegree(planet.kPosMax) - 2 });
        this._rockMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(planet.kPosMax), { firstNoiseDegree : PlanetTools.KPosToDegree(planet.kPosMax) - 3});
        this.heightMaps = [this._mainHeightMap];
    }

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {
        let f = Math.pow(2, this._mainHeightMap.degree - chunck.degree);
        let maxTree = 1;
        let treeCount = 0;

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];

                let v = this._mainHeightMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let tree = this._treeMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let rock = this._rockMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let altitude = Math.floor((this._seaLevel + v * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                let rockAltitude = altitude + Math.round((rock - 0.4) * this._mountainHeight * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);

                if (tree > 0.6 && treeCount < maxTree) {
                    let localK = altitude + 1 - chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if (localK >= 0 && localK < PlanetTools.CHUNCKSIZE) {
                        let tree = new ProceduralTree();
                        tree.chunck = chunck;
                        tree.i = i;
                        tree.j = j;
                        tree.k = localK;
                        refProcedural.push(tree);
                        treeCount++;
                    }
                }

                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                    if (globalK <= altitude) {
                        if (globalK > altitude - 2) {
                            if (globalK < this._seaLevel * (this.planet.kPosMax * PlanetTools.CHUNCKSIZE) + 1) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Sand;
                            }
                            else {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Grass;
                            }
                        }
                        else {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                        }
                    }
                    else if (globalK <= rockAltitude) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                }
            }
        }
    }
}

class PlanetGeneratorFlat extends PlanetGenerator {

    constructor(planet: Planet, private _seaLevel: number, private _mountainHeight: number) {
        super(planet);
    }

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];

                let altitude = Math.floor(this._seaLevel * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);

                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                    if (globalK <= altitude) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Grass;
                    }
                }
            }
        }
    }
}

class PlanetGeneratorDebug extends PlanetGenerator {

    constructor(planet: Planet) {
        super(planet);
    }

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {
        PlanetTools.Data(
            refData,
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
                        return BlockType.Grass;
                    }
                    if (jGlobal < 5) {
                        return BlockType.Rock;
                    }
                    return BlockType.Sand;
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

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {
        let c = Math.floor(Math.random() * 7 + 1)
        PlanetTools.Data(
            refData,
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

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {
        PlanetTools.Data(
            refData,
            (i, j, k) => {
                let c = Math.floor(Math.random() * 7 + 1)
                return c;
            }
        );
    }
}

class PlanetGeneratorDebug4 extends PlanetGenerator {

    constructor(planet: Planet) {
        super(planet);
    }

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {
        PlanetTools.Data(
            refData,
            (i, j, k) => {
                let iGlobal = i + chunck.iPos * PlanetTools.CHUNCKSIZE;
                let jGlobal = j + chunck.jPos * PlanetTools.CHUNCKSIZE;
                let kGlobal = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                let h = this.planet.kPosMax * PlanetTools.CHUNCKSIZE * 0.7 + 3 * Math.random();
                if (iGlobal === 0 || iGlobal === PlanetTools.DegreeToSize(chunck.degree) - 1) {
                    if (jGlobal === 0 || jGlobal === PlanetTools.DegreeToSize(chunck.degree) - 1) {
                        //h = this.planet.kPosMax * PlanetTools.CHUNCKSIZE * 0.7 + 4;
                    }
                }
                
                if (kGlobal < h) {
                    return BlockType.Rock;
                }
                return BlockType.None;
            }
        );
    }
}