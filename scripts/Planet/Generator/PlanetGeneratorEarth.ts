class PlanetGeneratorEarth extends PlanetGenerator {

    private _mainHeightMap: PlanetHeightMap;
    private _tunnelMap: PlanetHeightMap;
    private _tunnelAltitudeMap: PlanetHeightMap;
    private _rockMap: PlanetHeightMap;
    private _treeMap: PlanetHeightMap;

    constructor(planet: Planet, private _mountainHeight: number) {
        super(planet);
        console.log("Generator Degree = " + planet.degree);
        this._mainHeightMap = PlanetHeightMap.CreateMap(planet.degree);
        this._treeMap = PlanetHeightMap.CreateMap(planet.degree, { firstNoiseDegree : planet.degree - 2 });
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

        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, 0).addInPlace(this._mainHeightMap).multiplyInPlace(_mountainHeight).addInPlace(PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio));
        this.altitudeMap.maxInPlace(PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio - 0.01));
    }

    public getTexture(side: Side, size: number = 256): BABYLON.Texture {
        let texture = new BABYLON.DynamicTexture("texture-" + side, size);
        let context = texture.getContext();

        let f = Math.pow(2, this._mainHeightMap.degree) / size;

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                let v = Math.floor(this.altitudeMap.getForSide(side, Math.floor(i * f), Math.floor(j * f)) * PlanetTools.CHUNCKSIZE * this.planet.kPosMax);
                let color: BABYLON.Color3;
                if (v < this.planet.seaLevel - 1) {
                    color = SharedMaterials.MainMaterial().getColor(BlockType.Water);
                }
                else if (v < this.planet.seaLevel) {
                    color = SharedMaterials.MainMaterial().getColor(BlockType.Sand);
                }
                else {
                    color = SharedMaterials.MainMaterial().getColor(BlockType.Grass);
                }

                context.fillStyle = "rgb(" + (color.r * 255).toFixed(0) + ", " + (color.g * 255).toFixed(0) + ", " + (color.b * 255).toFixed(0) + ")";
                context.fillRect(i, j, 1, 1);
            }
        }

        texture.update(false);

        return texture;
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
                let altitude = this.planet.seaLevel + Math.floor((v * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                let rock = this._rockMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let rockAltitude = altitude + Math.round((rock - 0.4) * this._mountainHeight * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                let tree = this._treeMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                
                let tunnel = Math.floor(this._tunnelMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f) * 5);
                let tunnelV = this._tunnelAltitudeMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let tunnelAltitude = this.planet.seaLevel + Math.floor((2 * tunnelV * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);

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

                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                    if (globalK < this.planet.seaLevel) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Water;
                    }

                    if (globalK <= altitude) {
                        if (globalK > altitude - 2) {
                            if (globalK < this.planet.seaLevel) {
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
                    if (tunnel > 0) {
                        if (globalK >= tunnelAltitude - tunnel && globalK <= tunnelAltitude + tunnel) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.None;
                        }
                    }

                    if (refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] === BlockType.None && globalK < this.planet.seaLevel) {
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
