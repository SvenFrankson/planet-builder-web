class TerrainToonMaterial extends BABYLON.ShaderMaterial {

    private _terrainColors: BABYLON.Color3[];

    constructor(name: string, scene: BABYLON.Scene) {
        super(
            name,
            scene,
            {
                vertex: "terrainToon",
                fragment: "terrainToon",
            },
            {
                attributes: ["position", "normal", "uv", "color"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
            }
        );
        this.setVector3("lightInvDirW", (new BABYLON.Vector3(0.5 + Math.random(), 2.5 + Math.random(), 1.5 + Math.random())).normalize());

        this._terrainColors = [];
        this._terrainColors[BlockType.None] = new BABYLON.Color3(0, 0, 0);
        this._terrainColors[BlockType.Grass] = new BABYLON.Color3(0.384, 0.651, 0.349);
        this._terrainColors[BlockType.Dirt] = new BABYLON.Color3(0, 0, 0);
        this._terrainColors[BlockType.Sand] = new BABYLON.Color3(0.761, 0.627, 0.141);
        this._terrainColors[BlockType.Rock] = new BABYLON.Color3(0, 0, 0);
        this._terrainColors[BlockType.Wood] = new BABYLON.Color3(0.600, 0.302, 0.020);
        this._terrainColors[BlockType.Leaf] = new BABYLON.Color3(0.431, 0.839, 0.020);

        this.setColor3Array("terrainColors", this._terrainColors);
    }

    public getColor(blockType: BlockType): BABYLON.Color3 {
        return this._terrainColors[blockType];
    }

    public setColor(blockType: BlockType, color: BABYLON.Color3): void {
        this._terrainColors[blockType].copyFrom(color);
        this.setColor3Array("terrainColors", this._terrainColors);
    }
}