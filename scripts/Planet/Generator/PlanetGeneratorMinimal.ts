class PlanetGeneratorMinimal extends PlanetGenerator {

    constructor(planet: Planet) {
        super(planet);

        this.altitudeMap = PlanetHeightMap.CreateConstantMap(planet.degree, 0);
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
        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalI = i + chunck.iPos * PlanetTools.CHUNCKSIZE;
                    let globalJ = j + chunck.jPos * PlanetTools.CHUNCKSIZE;
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                    if ((globalI === 1 && globalJ === 1) || globalK <= 0) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                    if (globalI > 0 && globalI <= 5 && globalJ > 0 && globalJ <= 5 && globalK % PlanetTools.CHUNCKSIZE === (PlanetTools.CHUNCKSIZE - 1)) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                }
            }
        }
    }
}