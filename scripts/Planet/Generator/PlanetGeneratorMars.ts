/// <reference path="PlanetGenerator.ts"/>

class PlanetGeneratorMars extends PlanetGenerator {

    private _mainHeightMap: PlanetHeightMap;
    private _rockMap: PlanetHeightMap;

    constructor(planet: Planet, private _mountainHeight: number) {
        super(planet);
        this._mainHeightMap = PlanetHeightMap.CreateMap(planet.degree);
        this._rockMap = PlanetHeightMap.CreateMap(planet.degree, { firstNoiseDegree : planet.degree - 3});

        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, 0).addInPlace(this._mainHeightMap).multiplyInPlace(_mountainHeight).addInPlace(PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio));
    }

    public getTexture(side: Side, size: number = 256): BABYLON.Texture {
        let texture = new BABYLON.DynamicTexture("texture-" + side, size);
        let context = texture.getContext();

        let f = Math.pow(2, this._mainHeightMap.degree) / size;

        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                //let v = Math.floor(this.altitudeMap.getForSide(side, Math.floor(i * f), Math.floor(j * f)) * PlanetTools.CHUNCKSIZE * this.planet.kPosMax);
                let color: BABYLON.Color3;
                if (true) {
                    color = SharedMaterials.MainMaterial().getColor(BlockType.Laterite);
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