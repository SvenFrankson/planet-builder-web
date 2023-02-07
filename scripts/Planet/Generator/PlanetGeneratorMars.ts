/// <reference path="PlanetGenerator.ts"/>

class PlanetGeneratorMars extends PlanetGenerator {

    private _mainHeightMap: PlanetHeightMap;
    private _rockMap: PlanetHeightMap;

    constructor(planet: Planet, private _mountainHeight: number) {
        super(planet);
        this.type = "Red";
        this._mainHeightMap = PlanetHeightMap.CreateMap(planet.degree, planet.main, planet.randSeed);
        this._rockMap = PlanetHeightMap.CreateMap(planet.degree, planet.main, planet.randSeed, { firstNoiseDegree : planet.degree - 3});

        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, 0).addInPlace(this._mainHeightMap).multiplyInPlace(_mountainHeight).addInPlace(PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio));
    }

    public getTexture(side: Side, size: number): BABYLON.Texture {
        let timers: number[];
        let logOutput: string;
        let useLog = DebugDefine.LOG_PLANETMAP_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "PlanetGeneratorMars getTexture for " + this.planet.name;
        }
        let texture = new BABYLON.DynamicTexture("texture-" + side, size);
        let context = texture.getContext();

        let f = Math.pow(2, this._mainHeightMap.degree) / size;

        let mainMaterial = SharedMaterials.MainMaterial();

        context.fillStyle = mainMaterial.getFillStyle(BlockType.Laterite);
        context.fillRect(0, 0, size, size);

        /*
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let v = Math.floor(this.altitudeMap.getForSide(side, Math.floor(i * f), Math.floor(j * f)) * PlanetTools.CHUNCKSIZE * this.planet.kPosMax);
                let blockType: BlockType = BlockType.None;
                
                if (blockType != BlockType.None) {
                    context.fillStyle = mainMaterial.getFillStyle(blockType);
                    context.fillRect(i, j, 1, 1);
                }
            }
        }
        */

        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n context filled in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }

        texture.update(false);

        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  texture updated in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
            logOutput += "\nPlanetGeneratorMars getTexture completed in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }

        return texture;
    }

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {
        let f = Math.pow(2, this._mainHeightMap.degree - chunck.degree);

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];

                let v = this._mainHeightMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let altitude = this.planet.seaLevel + Math.floor((v * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                let rock = this._rockMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let rockAltitude = altitude + Math.round((rock - 0.4) * this._mountainHeight * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                    if (globalK <= altitude) {
                        if (globalK > altitude - 2) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Laterite;
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

    public showDebug(): void {
        Utils.showDebugPlanetMap(this, - 3.5, 1.5);
    }
}