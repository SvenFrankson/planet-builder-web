class GeneratorSegment {

    public l: number;
    public u: BABYLON.Vector3;

    constructor(
        public blockType: BlockType,
        public p0: BABYLON.Vector3,
        public p1: BABYLON.Vector3,
        public radius: number
    ) {
        this.l = BABYLON.Vector3.Distance(p0, p1);
        this.u = p1.subtract(p0).scaleInPlace(1 / this.l);
    }

    private _tmp1: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public getData(planetPos: BABYLON.Vector3): BlockType {
        this._tmp1.copyFrom(planetPos);
        this._tmp1.subtractInPlace(this.p0);
        let dP = BABYLON.Vector3.Dot(this._tmp1, this.u);
        if (dP >= 0) {
            this._tmp1.copyFrom(planetPos);
            this._tmp1.subtractInPlace(this.p1);
            let dP2 = BABYLON.Vector3.Dot(this._tmp1, this.u);
            if (dP2 <= 0) {
                this._tmp1.copyFrom(this.u).scaleInPlace(dP).addInPlace(this.p0);
                let sqrDist = BABYLON.Vector3.DistanceSquared(this._tmp1, planetPos);
                if (sqrDist < this.radius * this.radius) {
                    return this.blockType;
                }
            }
        }
        return BlockType.Unknown;
    }
}