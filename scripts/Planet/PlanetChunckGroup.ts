class PlanetChunckGroup extends AbstractPlanetChunck {

    public children: AbstractPlanetChunck[] = [];
    public kOffset: number;
    public kOffsetNext: number;

    constructor(
        iPos: number,
        jPos: number,
        kPos: number,
        planetSide: PlanetSide,
        public level: number
    ) {
        super(iPos, jPos, kPos, planetSide);
        this.kOffset = PlanetTools.DegreeToKOffset(this.degree);
        this.kOffsetNext = PlanetTools.DegreeToKOffset(this.degree + 1);

        let levelCoef = Math.pow(2, level);
        this._barycenter = PlanetTools.EvaluateVertex(
            this.size,
            PlanetTools.CHUNCKSIZE * (this.iPos * levelCoef + 0.5),
            PlanetTools.CHUNCKSIZE * (this.jPos * levelCoef + 0.5)
        ).scale(
            PlanetTools.KGlobalToAltitude((this.kOffsetNext + this.kPos * levelCoef + 0.5) * PlanetTools.CHUNCKSIZE)
        );
        this._barycenter = BABYLON.Vector3.TransformCoordinates(
            this._barycenter,
            planetSide.computeWorldMatrix(true)
        );
    }

    public subdivide(): void {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++) {
                for (let k = 0; k < 2; k++) {
                    let childKPos: number = this.kPos * 2 + k;
                    if (childKPos < this.kOffsetNext) {
                        if (this.level === 1) {
                            let chunck = new PlanetChunck(this.iPos * 2 + i, this.jPos * 2 + j, this.kPos * 2 + k, this.planetSide);
                            chunck.register();
                        }
                        else {
                            let chunck = new PlanetChunckGroup(this.iPos * 2 + i, this.jPos * 2 + j, this.kOffset + this.kPos * 2 + k, this.planetSide, this.level - 1);
                            chunck.register();
                        }
                    }
                }
            }
        }
        this.chunckManager.unregister(this);
    }
}