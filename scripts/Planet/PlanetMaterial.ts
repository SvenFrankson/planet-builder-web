class TerrainToonMaterial extends BABYLON.ShaderMaterial {

    private _grassColor: BABYLON.Color3 = new BABYLON.Color3(0.384, 0.651, 0.349);

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
        this.setColor3("colGrass", this._grassColor);
        this.setColor3("colDirt", BABYLON.Color3.FromHexString("#a86f32"));
        this.setColor3("colRock", BABYLON.Color3.FromHexString("#8c8c89"));
        this.setColor3("colSand", BABYLON.Color3.FromHexString("#dbc67b"));
    }

    public getColor(blockType: BlockType): BABYLON.Color3 {
        if (blockType === BlockType.Grass) {
            return this._grassColor;
        }
    }

    public setColor(blockType: BlockType, color: BABYLON.Color3): void {
        if (blockType === BlockType.Grass) {
            this.setColor3("colGrass", color);
        }
    }
}