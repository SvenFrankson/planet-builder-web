/// <reference path="./GeneratorElement.ts"/>

class GeneratorSegment extends GeneratorElement {

    public l: number;
    public u: BABYLON.Vector3;

    constructor(
        public blockType: BlockType,
        public p0: BABYLON.Vector3,
        public p1: BABYLON.Vector3,
        public radius: number
    ) {
        super();
        this.aabbMin.x = Math.min(p0.x - radius, p1.x - radius, this.aabbMin.x);
        this.aabbMin.y = Math.min(p0.y - radius, p1.y - radius, this.aabbMin.y);
        this.aabbMin.z = Math.min(p0.z - radius, p1.z - radius, this.aabbMin.z);
        this.aabbMax.x = Math.max(p0.x + radius, p1.x + radius, this.aabbMax.x);
        this.aabbMax.y = Math.max(p0.y + radius, p1.y + radius, this.aabbMax.y);
        this.aabbMax.z = Math.max(p0.z + radius, p1.z + radius, this.aabbMax.z);

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