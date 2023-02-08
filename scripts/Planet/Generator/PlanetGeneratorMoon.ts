class PlanetGeneratorMoon extends PlanetGenerator {

    private _moutainHeightMap: PlanetHeightMap;
    private _craterMap: PlanetHeightMap;
    private _iceMap: PlanetHeightMap;

    constructor(planet: Planet) {
        super(planet);
        this.type = "Moon";

        console.log("!!");
        console.log(planet.randSeed.values.toString());

        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio);

        this._moutainHeightMap = PlanetHeightMap.CreateMap(planet.degree, planet.main, planet.randSeed).multiplyInPlace(4 / (this.planet.kPosMax * PlanetTools.CHUNCKSIZE));

        this._craterMap = PlanetHeightMap.CreateConstantMap(planet.degree, 0);
        let randIndex: number = 0;
        for (let n = 0; n < 200; n++) {
            let i = planet.main.rand.getValue1D(planet.randSeed, randIndex++);
            let j = planet.main.rand.getValue1D(planet.randSeed, randIndex++);
            let k = planet.main.rand.getValue1D(planet.randSeed, randIndex++);
            if (i >= j && i >= k) {
                i = 1;
            }
            else if (j >= i && j >= k) {
                j = 1;
            }
            else if (k >= i && k >= j) {
                k = 1;
            }
    
            if (planet.main.rand.getValue1D(planet.randSeed, randIndex++) > 0.5) {
                i = - i;
            }
            if (planet.main.rand.getValue1D(planet.randSeed, randIndex++) > 0.5) {
                j = - j;
            }
            if (planet.main.rand.getValue1D(planet.randSeed, randIndex++) > 0.5) {
                k = - k;
            }
    
            i = 0.5 - 0.5 * i;
            j = 0.5 - 0.5 * j;
            k = 0.5 - 0.5 * k;
    
            i = Math.round(i * this._craterMap.size);
            j = Math.round(j * this._craterMap.size);
            k = Math.round(k * this._craterMap.size);
    
            let r = 2 * planet.main.rand.getValue1D(planet.randSeed, randIndex++) + 2;
            this._craterMap.setRandomDisc(3 / (this.planet.kPosMax * PlanetTools.CHUNCKSIZE), i, j, k, r);
        }
        this._craterMap.smooth();
        this._craterMap.smooth();

        this._iceMap = PlanetHeightMap.CreateMap(
            planet.degree,
            planet.main,
            planet.randSeed,
            {
                firstNoiseDegree : planet.degree - 5,
                lastNoiseDegree: planet.degree - 1,
                postComputation: (v) => {
                    if (Math.abs(v) < 0.08) {
                        return 1;
                    }
                    return -1;
                }
            }
        );
        this._iceMap.smooth();
        this._iceMap.smooth();

        this.heightMaps = [this._moutainHeightMap, this._craterMap, this._iceMap];

        this.altitudeMap.addInPlace(this._moutainHeightMap).substractInPlace(this._craterMap);

        let center = Math.floor(this._iceMap.size * 0.5);
        for (let i = - 3; i <= 3; i++) {
            for (let j = -3; j <= 3; j++) {
                this.altitudeMap.setValue(this.planet.seaLevelRatio, center + i, this.altitudeMap.size, center + j);
                this._iceMap.setValue(-1, center + i, this._iceMap.size, center + j);
            }
        }
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

        let f = Math.pow(2, this.altitudeMap.degree) / size;

        let mainMaterial = SharedMaterials.MainMaterial();

        context.fillStyle = mainMaterial.getFillStyle(BlockType.Regolith);
        context.fillRect(0, 0, size, size);

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let ice = this._iceMap.getForSide(side, Math.floor(i * f), Math.floor(j * f));

                let blockType: BlockType = BlockType.None;
                if (ice > 0) {
                    blockType = BlockType.Ice;
                }
                
                if (blockType != BlockType.None) {
                    context.fillStyle = mainMaterial.getFillStyle(blockType);
                    context.fillRect(i, j, 1, 1);
                }
            }
        }

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
                let ice = Math.floor(this._iceMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f));

                refData[i - chunck.firstI][j - chunck.firstJ] = [];

                //let altitude = this.planet.seaLevel;
                
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;


                    if (globalK <= altitude) {
                        if (ice < 0) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Regolith;
                        }
                        else {
                            if (globalK <= altitude - 4) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Regolith;
                            }
                            else if (globalK <= altitude - 2) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Ice;
                            }
                        }
                    }

                    if (intersectingElements.length > 0) {
                        let pPos = PlanetTools.LocalIJKToPlanetPosition(chunck, i, j, k, true);
                        
                        for (let n = 0; n < intersectingElements.length; n++) {
                            let sV = intersectingElements[n].getData(pPos);
                            if (sV != BlockType.Unknown) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = sV;
                            }
                        }
                    }
                }
            }
        }
    }

    public showDebug(): void {
        Utils.showDebugPlanetMap(this, - 3.5, 1.5);
    }
}