/// <reference path="./GeneratorElement.ts"/>

class GeneratorBox extends GeneratorElement {

    public right: BABYLON.Vector3 = BABYLON.Vector3.Right();
    private _l: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _w2: number;
    private _h2: number;
    private _d2: number;

    constructor(
        public blockType: BlockType,
        public position: BABYLON.Vector3,
        public up: BABYLON.Vector3,
        public forward: BABYLON.Vector3,
        public w: number,
        public h: number,
        public d: number,
    ) {
        super();
        this._w2 = this.w * 0.5;
        this._h2 = this.h * 0.5;
        this._d2 = this.d * 0.5;
        BABYLON.Vector3.CrossToRef(this.up, this.forward, this.right);
        this.right.normalize();
        BABYLON.Vector3.CrossToRef(this.right, this.up, this.forward);
        let max = Math.max(this.w, this.h, this.d);
        this.aabbMin.copyFrom(position);
        this.aabbMin.x -= max;
        this.aabbMin.y -= max;
        this.aabbMin.z -= max;
        this.aabbMax.copyFrom(position);
        this.aabbMax.x += max;
        this.aabbMax.y += max;
        this.aabbMax.z += max;
    }

    public getData(planetPos: BABYLON.Vector3): BlockType {
        this._l.copyFrom(planetPos).subtractInPlace(this.position);
        let dx = BABYLON.Vector3.Dot(this._l, this.right);
        let dy = BABYLON.Vector3.Dot(this._l, this.up);
        let dz = BABYLON.Vector3.Dot(this._l, this.forward);
        if (Math.abs(dx) < this._w2 && Math.abs(dy) < this._h2 && Math.abs(dz) < this._d2) {
            return this.blockType;
        }
        return BlockType.Unknown;
    }
}