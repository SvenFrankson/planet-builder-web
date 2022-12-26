class PlanetGeneratorEarth extends PlanetGenerator {

    private _mainHeightMap: PlanetHeightMap;
    //private _tunnelMap: PlanetHeightMap;
    //private _tunnelAltitudeMap: PlanetHeightMap;
    //private _rockMap: PlanetHeightMap;

    public spheres: GeneratorSphere[] = [];

    constructor(planet: Planet, private _mountainHeight: number) {
        super(planet);
        this.type = "Sunny";
        let timers: number[];
        let logOutput: string;
        let useLog = DebugDefine.LOG_PLANETMAP_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "PlanetGeneratorEarth constructor for " + planet.name;
        }
        this._mainHeightMap = PlanetHeightMap.CreateMap(planet.degree);
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  _mainHeightMap created in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }
        this._mainHeightMap.addInPlace(PlanetHeightMap.CreateConstantMap(planet.degree, 1 / planet.kPosMax));

        /*
        this._tunnelMap = PlanetHeightMap.CreateMap(
            planet.degree,
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
        this._tunnelMap.smooth();
        this._tunnelMap.smooth();
        this._tunnelAltitudeMap = PlanetHeightMap.CreateMap(planet.degree);
        this._rockMap = PlanetHeightMap.CreateMap(planet.degree, { firstNoiseDegree : planet.degree - 3});
        */

        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, 0).addInPlace(this._mainHeightMap).multiplyInPlace(_mountainHeight).addInPlace(PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio));
        this.altitudeMap.maxInPlace(PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio));

        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  altitudeMap created in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }
        
        for (let i = 0; i < 100; i++) {
            let p = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            p.normalize();
            
            let side = PlanetTools.PlanetPositionToSide(p);
            let ij = PlanetTools.PlanetDirectionToGlobalIJ(side, PlanetTools.DegreeToSize(planet.degree), p);
            let kGlobal = Math.floor(this.altitudeMap.getForSide(side, ij.i, ij.j) * PlanetTools.CHUNCKSIZE * this.planet.kPosMax);

            if (kGlobal > planet.seaLevel + 1) {
                let pBase = p.scale(PlanetTools.KGlobalToAltitude(kGlobal));
                p.scaleInPlace(PlanetTools.KGlobalToAltitude(kGlobal + 7));
                this.elements.push(new GeneratorSegment(BlockType.Wood, pBase, p, 1));
                this.elements.push(new GeneratorSphere(BlockType.Leaf, p, 3));
                //BABYLON.MeshBuilder.CreateLines("line", { points: [p, pBase]});
            }
        }
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  segments and spheres created in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
            logOutput += "\nPlanetGeneratorEarth constructed in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }
    }

    public getTexture(side: Side, size: number): BABYLON.Texture {
        let timers: number[];
        let logOutput: string;
        let useLog = DebugDefine.LOG_PLANETMAP_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "PlanetGeneratorEarth getTexture for " + this.planet.name;
        }
        let texture = new BABYLON.DynamicTexture("texture-" + side, size);
        let context = texture.getContext();

        let f = Math.pow(2, this._mainHeightMap.degree) / size;

        let mainMaterial = SharedMaterials.MainMaterial();

        context.fillStyle = mainMaterial.getFillStyle(BlockType.Water);
        context.fillRect(0, 0, size, size);

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let v = Math.floor(this.altitudeMap.getForSide(side, Math.floor(i * f), Math.floor(j * f)) * PlanetTools.CHUNCKSIZE * this.planet.kPosMax);
                let blockType: BlockType = BlockType.None;
                if (v === this.planet.seaLevel + 1) {
                    blockType = BlockType.Sand;
                }
                else if (v > this.planet.seaLevel + 1) {
                    blockType = BlockType.Grass;
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
            logOutput += "\nPlanetGeneratorEarth getTexture completed in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }

        return texture;
    }

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {
        let f = Math.pow(2, this._mainHeightMap.degree - chunck.degree);

        let intersectingElements: GeneratorElement[] = this.getIntersectingElements(chunck);

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            //let globalI = i + chunck.iPos * PlanetTools.CHUNCKSIZE;
            refData[i - chunck.firstI] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];

                let v = this._mainHeightMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let altitude = this.planet.seaLevel + Math.floor((v * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                //let rock = this._rockMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                //let rockAltitude = altitude + Math.round((rock - 0.4) * this._mountainHeight * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);

                //let tree = this._treeMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f) * 4;
                
                //let tunnel = Math.floor(this._tunnelMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f) * 5);
                //let tunnelV = this._tunnelAltitudeMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                //let tunnelAltitude = this.planet.seaLevel + Math.floor((2 * tunnelV * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);

                /*
                if (tree > 0.7 && treeCount < maxTree) {
                    let localK = altitude + 1 - chunck.kPos * PlanetTools.CHUNCKSIZE;
                    let globalK = localK + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if (globalK > seaLevel) {
                        if (localK >= 0 && localK < PlanetTools.CHUNCKSIZE) {
                            let tree = new ProceduralTree(chunck.chunckManager);
                            tree.chunck = chunck;
                            tree.i = i;
                            tree.j = j;
                            tree.k = localK;
                            refProcedural.push(tree);
                            treeCount++;
                        }
                    }
                }
                */

                //let globalJ = j + chunck.jPos * PlanetTools.CHUNCKSIZE;
                //let latitude = PlanetTools.GlobalIJToLatitude(chunck.planetSide, chunck.size, globalI, globalJ);

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

                    if (globalK <= this.planet.seaLevel) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Water;
                    }

                    if (globalK <= altitude) {
                        if (globalK > altitude - 2) {
                            if (globalK <= this.planet.seaLevel) {
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
                    /*
                    else if (globalK <= rockAltitude) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                    if (tunnel > 0) {
                        if (globalK >= tunnelAltitude - tunnel && globalK <= tunnelAltitude + tunnel) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.None;
                        }
                    }
                    */
                    /*
                    if (tree > 0 && globalK > this.planet.seaLevel) {
                        if (globalK > altitude + 4 && globalK <= altitude + 4 + tree) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Leaf;
                        }
                        else if (tree > 3.9 && globalK > altitude && globalK <= altitude + 4) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Wood;
                        }
                    }
                    */

                    if (refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] === BlockType.None && globalK <= this.planet.seaLevel) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Water;
                    }
                }
            }
        }
    }

    public showDebug(): void {
        Utils.showDebugPlanetMap(this, - 3.5, 1.5);
    }
}
