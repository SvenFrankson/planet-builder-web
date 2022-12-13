enum PlanetGeneratorType {
    Moon,
    Earth,
    Mars
}

class PlanetGeneratorFactory {

    public static Counter: number = 0;

    public static Create(position: BABYLON.Vector3, type: PlanetGeneratorType, kPosMax: number, scene: BABYLON.Scene): Planet {
        let name = "paulita-" + Math.floor(Math.random() * 1000).toString(16) + "-" + PlanetGeneratorFactory.Counter.toFixed(0);
        PlanetGeneratorFactory.Counter++;
        let planet = new Planet(
            name,
            position,
            kPosMax,
            0.6,
            scene, 
            (p) => {
                if (type === PlanetGeneratorType.Moon) {
                    return new PlanetGeneratorMoon(p);
                }
                else if (type === PlanetGeneratorType.Earth) {
                    return new PlanetGeneratorEarth(p, 0.15);
                }
                else if (type === PlanetGeneratorType.Mars) {
                    return new PlanetGeneratorMars(p, 0.1);
                }
                else {
                    debugger;
                }
            }
        )
        return planet;
    }
}

abstract class PlanetGenerator {

    public heightMaps: PlanetHeightMap[];
    public altitudeMap: PlanetHeightMap;

    public elements: GeneratorElement[] = [];

    constructor(
        public planet: Planet
    ) {

    }

    public getIntersectingElements(chunck: PlanetChunck): GeneratorElement[] {
        let intersectingElements: GeneratorElement[] = [];
        for (let i = 0; i < this.elements.length; i++) {
            let e = this.elements[i];
            if (chunck.aabbMax.x < e.aabbMin.x) {
                continue;
            }
            if (chunck.aabbMax.y < e.aabbMin.y) {
                continue;
            }
            if (chunck.aabbMax.z < e.aabbMin.z) {
                continue;
            }
            if (chunck.aabbMin.x > e.aabbMax.x) {
                continue;
            }
            if (chunck.aabbMin.y > e.aabbMax.y) {
                continue;
            }
            if (chunck.aabbMin.z > e.aabbMax.z) {
                continue;
            }
            intersectingElements.push(e);
        }
        return intersectingElements;
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

class PlanetGeneratorHole extends PlanetGenerator {

    private _mainHeightMap: PlanetHeightMap;
    private _sqrRadius: number = 0;

    constructor(planet: Planet, number, private _mountainHeight: number, private _holeWorldPosition: BABYLON.Vector3, private _holeRadius: number) {
        super(planet);
        console.log("Generator Degree = " + planet.degree);
        this._mainHeightMap = PlanetHeightMap.CreateMap(planet.degree);
        this._sqrRadius = this._holeRadius * this._holeRadius;
    }

    public makeData(chunck: PlanetChunck, refData: number[][][]): void {
        let f = Math.pow(2, this._mainHeightMap.degree - chunck.degree);
        let seaLevel = Math.floor(this.planet.seaLevel * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];

                let v = this._mainHeightMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let altitude = Math.floor((this.planet.seaLevel + v * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);

                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    let worldPos = PlanetTools.LocalIJKToPlanetPosition(chunck, i, j, k, true);
                    let sqrDist = BABYLON.Vector3.DistanceSquared(this._holeWorldPosition, worldPos);
                    if (sqrDist < this._sqrRadius) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.None;
                    }
                    else {
                        if (globalK <= altitude) {
                            if (globalK > altitude - 2) {
                                if (globalK < this.planet.seaLevel * (this.planet.kPosMax * PlanetTools.CHUNCKSIZE)) {
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
                    }
    
                    if (refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] === BlockType.None && globalK < seaLevel * 0.5) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Water;
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