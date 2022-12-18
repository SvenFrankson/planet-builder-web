class PlanetGeneratorMoon extends PlanetGenerator {

    private _moutainHeightMap: PlanetHeightMap;
    private _craterMap: PlanetHeightMap;

    constructor(planet: Planet) {
        super(planet);

        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio);

        this._moutainHeightMap = PlanetHeightMap.CreateMap(planet.degree).multiplyInPlace(4 / (this.planet.kPosMax * PlanetTools.CHUNCKSIZE));

        this._craterMap = PlanetHeightMap.CreateConstantMap(planet.degree, 0);
        for (let i = 0; i < 200; i++) {
            this._craterMap.setRandomDisc(3 / (this.planet.kPosMax * PlanetTools.CHUNCKSIZE), 2, 4);
        }
        this._craterMap.smooth();
        this._craterMap.smooth();

        this.altitudeMap.addInPlace(this._moutainHeightMap).substractInPlace(this._craterMap);
    }
    

    public getTexture(side: Side, size: number): BABYLON.Texture {
        let timers: number[];
        let logOutput: string;
        let useLog = DebugDefine.LOG_PLANETMAP_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "PlanetGeneratorMoon getTexture for " + this.planet.name;
        }
        let texture = new BABYLON.DynamicTexture("texture-" + side, size);
        let context = texture.getContext();

        //let f = Math.pow(2, this._mainHeightMap.degree) / size;

        let mainMaterial = SharedMaterials.MainMaterial();

        context.fillStyle = mainMaterial.getFillStyle(BlockType.Rock);
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
            logOutput += "\nPlanetGeneratorMoon getTexture completed in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }

        return texture;
    }

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {
        let f = Math.pow(2, this._craterMap.degree - chunck.degree);

        let intersectingElements: GeneratorElement[] = this.getIntersectingElements(chunck);

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                let altitude = this.altitudeMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f) * (this.planet.kPosMax * PlanetTools.CHUNCKSIZE);

                refData[i - chunck.firstI][j - chunck.firstJ] = [];

                //let altitude = this.planet.seaLevel;
                
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                    if (intersectingElements.length > 0) {
                        let pPos = PlanetTools.LocalIJKToPlanetPosition(chunck, i, j, k, true);
                        
                        for (let n = 0; n < intersectingElements.length; n++) {
                            let sV = intersectingElements[n].getData(pPos);
                            if (sV != BlockType.Unknown) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = sV;
                            }
                        }
                    }

                    if (globalK < altitude) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                }
            }
        }
    }
}