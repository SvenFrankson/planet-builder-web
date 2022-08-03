abstract class PlanetGenerator {

    public heightMaps: PlanetHeightMap[];

    constructor(
        public planet: Planet
    ) {

    }

    public abstract makeData(chunck: PlanetChunck): number[][][];

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

class PlanetGeneratorChaos extends PlanetGenerator {

    constructor(planet: Planet) {
        super(planet);

        let hMax = this.planet.kPosMax * PlanetTools.CHUNCKSIZE;

        let heightMap1 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(this.planet.kPosMax), hMax * 0.5, hMax * 0.15);
        
        let heightMap2 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(this.planet.kPosMax), hMax * 0.5, hMax * 0.25, {
            firstNoiseDegree: 4,
            postComputation: (v) => {
                if (v > hMax * 0.60) {
                    return (v - hMax * 0.60) * 1.5;
                }
                return 0;
            }
        });

        let heightMap3 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(5), hMax * 0.5, hMax * 0.25, {
            firstNoiseDegree: 3,
            postComputation: (v) => {
                let delta = Math.abs(hMax * 0.5 - v);
                if (delta > 2) {
                    return 0;
                }
                return 3 - delta;
            }
        });

        this.heightMaps = [heightMap1, heightMap2, heightMap3];

        if (Game.ShowDebugPlanetHeightMap) {
            this.showDebug()
        }
    }

    public makeData(chunck: PlanetChunck): number[][][] {
        let f = Math.pow(2, this.heightMaps[0].degree - PlanetTools.KPosToDegree(chunck.kPos));
        let hMax = this.planet.kPosMax * PlanetTools.CHUNCKSIZE;

        return PlanetTools.Data(
            (i, j, k) => {
                
                let h1 = this.heightMaps[0].getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let h2 = this.heightMaps[1].getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let h3 = this.heightMaps[2].getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                let hGround = h1 - h3;
                
                if (globalK < hGround) {
                    if (h3 > 0) {
                        return BlockType.RedRock;
                    }
                    if (globalK < hMax * 0.5) {
                        return BlockType.RedDust;
                    }
                    return BlockType.RedDirt;
                }
                if (globalK < hGround + h2) {
                    return BlockType.RedRock;
                }

                return 0;
            }
        );
    }
}

class PlanetGeneratorDebug extends PlanetGenerator {

    constructor(planet: Planet) {
        super(planet);
    }

    public makeData(chunck: PlanetChunck): number[][][] {
        return PlanetTools.Data(
            (i, j, k) => {
                let iGlobal = i + chunck.iPos * PlanetTools.CHUNCKSIZE;
                let jGlobal = j + chunck.jPos * PlanetTools.CHUNCKSIZE;
                let kGlobal = k + chunck.kPos * PlanetTools.CHUNCKSIZE;

                let h = 50;
                if (chunck.side === Side.Front) {
                    h = 60;
                }
                if (chunck.side === Side.Right) {
                    h = 40;
                }
                if (jGlobal < 5) {
                    h += 5;
                }
                if (kGlobal < h) {
                    if (iGlobal < 5) {
                        return BlockType.RedDirt;
                    }
                    if (jGlobal < 5) {
                        return BlockType.RedRock;
                    }
                    return BlockType.RedDust;
                }
                return 0;
            }
        );
    }
}