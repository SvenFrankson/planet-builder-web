class PlanetGeneratorFlat extends PlanetGenerator {

    private _craterMap: PlanetHeightMap;

    public spheres: GeneratorSphere[] = [];

    constructor(planet: Planet) {
        super(planet);

        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio);

        this._craterMap = PlanetHeightMap.CreateConstantMap(planet.degree, 0);
        for (let i = 0; i < 200; i++) {
            this._craterMap.setRandomDisc(1, 2, 4);
        }
        this._craterMap.smooth();
        this._craterMap.smooth();

        for (let i = 0; i < 5; i++) {
            let p = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
            p.normalize();
            p.scaleInPlace(planet.seaAltitude);
            this.spheres.push(new GeneratorSphere(BlockType.Leaf, p, 3));
        }
    }
    

    public getTexture(side: Side, size: number = 256): BABYLON.Texture {
        let texture = new BABYLON.DynamicTexture("texture-" + side, size);
        let context = texture.getContext();

        let color = SharedMaterials.MainMaterial().getColor(BlockType.Rock);

        context.fillStyle = "rgb(" + (color.r * 255).toFixed(0) + ", " + (color.g * 255).toFixed(0) + ", " + (color.b * 255).toFixed(0) + ")";
        context.fillRect(0, 0, size, size);

        texture.update(false);

        return texture;
    }

    public makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void {
        let f = Math.pow(2, this._craterMap.degree - chunck.degree);

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                let craterDepth = this._craterMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f) * 3;

                refData[i - chunck.firstI][j - chunck.firstJ] = [];

                let altitude = this.planet.seaLevel - craterDepth;
                
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                    let pPos = PlanetTools.LocalIJKToPlanetPosition(chunck, i, j, k, true);
                    
                    for (let n = 0; n < this.spheres.length; n++) {
                        let sV = this.spheres[n].getData(pPos);
                        if (sV != BlockType.Unknown) {
                            console.log("!");
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = sV;
                        }
                    }

                    if (globalK <= altitude) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                }
            }
        }
    }
}