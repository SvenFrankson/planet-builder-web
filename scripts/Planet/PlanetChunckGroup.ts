class PlanetChunckGroup extends AbstractPlanetChunck {

    public children: AbstractPlanetChunck[] = [];

    constructor(
        iPos: number,
        jPos: number,
        kPos: number,
        planetSide: PlanetSide,
        public level: number
    ) {
        super(iPos, jPos, kPos, planetSide);
    }

    public subdivide(): void {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                for (let k = 0; k < 2; k++) {
                    if (this.level === 1) {
                        let chunck = new PlanetChunck(this.iPos * 2 + i, this.jPos * 2 + j, this.kPos * 2 + k, this.planetSide);
                        chunck.register();
                    }
                    else {
                        let chunck = new PlanetChunckGroup(this.iPos * 2 + i, this.jPos * 2 + j, this.kPos * 2 + k, this.planetSide, this.level - 1);
                        chunck.register();
                    }
                }
            }
        }
        this.chunckManager.unregister(this);
    }
}