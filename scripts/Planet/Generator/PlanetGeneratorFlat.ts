class PlanetGeneratorFlat extends PlanetGenerator {

    constructor(planet: Planet) {
        super(planet);

        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, this.planet.seaLevelRatio);
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

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];

                let di = (i - PlanetTools.CHUNCKSIZE * 0.5) / (PlanetTools.CHUNCKSIZE * 0.5);
                let dj = (j - PlanetTools.CHUNCKSIZE * 0.5) / (PlanetTools.CHUNCKSIZE * 0.5);
                let s = 3 * (1 - Math.floor(di * di + dj * dj));
                let altitude = this.planet.seaLevel + Math.floor(s * Math.random());
                
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                    if (globalK <= altitude) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                }
            }
        }
    }
}