class GeneratorSphere {

    constructor(
        public blockType: BlockType,
        public position: BABYLON.Vector3,
        public radius: number
    ) {

    }

    public getData(planetPos: BABYLON.Vector3): BlockType {
        let sqrDist = BABYLON.Vector3.DistanceSquared(planetPos, this.position);
        if (sqrDist < this.radius * this.radius) {
            return this.blockType;
        }
        return BlockType.Unknown;
    }
}