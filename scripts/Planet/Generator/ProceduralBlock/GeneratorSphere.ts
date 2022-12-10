class GeneratorSphere extends GeneratorElement {

    constructor(
        public blockType: BlockType,
        public position: BABYLON.Vector3,
        public radius: number
    ) {
        super();
        this.aabbMin.copyFrom(position);
        this.aabbMin.x -= this.radius;
        this.aabbMin.y -= this.radius;
        this.aabbMin.z -= this.radius;
        this.aabbMax.copyFrom(position);
        this.aabbMax.x += this.radius;
        this.aabbMax.y += this.radius;
        this.aabbMax.z += this.radius;
    }

    public getData(planetPos: BABYLON.Vector3): BlockType {
        let sqrDist = BABYLON.Vector3.DistanceSquared(planetPos, this.position);
        if (sqrDist < this.radius * this.radius) {
            return this.blockType;
        }
        return BlockType.Unknown;
    }
}