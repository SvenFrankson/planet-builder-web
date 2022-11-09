class PlanetMaterial extends BABYLON.ShaderMaterial {

    private _globalColor: BABYLON.Color3 = BABYLON.Color3.Black();
    private _terrainColors: BABYLON.Color3[];
    private _useSeaLevelTexture: number;
    private _seaLevelTexture: BABYLON.Texture;

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
        this.setVector3("lightInvDirW", (new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());

        this._terrainColors = [];
        this._terrainColors[BlockType.None] = new BABYLON.Color3(0, 0, 0);
        this._terrainColors[BlockType.Water] = new BABYLON.Color3(0.0, 0.5, 1.0);
        this._terrainColors[BlockType.Grass] = new BABYLON.Color3(0.216, 0.616, 0.165);
        this._terrainColors[BlockType.Dirt] = new BABYLON.Color3(0.451, 0.263, 0.047);
        this._terrainColors[BlockType.Sand] = new BABYLON.Color3(0.761, 0.627, 0.141);
        this._terrainColors[BlockType.Rock] = new BABYLON.Color3(0.522, 0.522, 0.522);
        this._terrainColors[BlockType.Wood] = new BABYLON.Color3(0.600, 0.302, 0.020);
        this._terrainColors[BlockType.Leaf] = new BABYLON.Color3(0.431, 0.839, 0.020);

        //this.setFlatColors();

        this.setColor3("globalColor", this._globalColor);
        this.setColor3Array("terrainColors", this._terrainColors);
        this.setSeaLevelTexture(undefined);
    }

    public getGlobalColor(): BABYLON.Color3 {
        return this._globalColor;
    }

    public setGlobalColor(color: BABYLON.Color3): void {
        this._globalColor.copyFrom(color);
        this.setColor3("globalColor", this._globalColor);
    }

    public getColor(blockType: BlockType): BABYLON.Color3 {
        return this._terrainColors[blockType];
    }

    public setColor(blockType: BlockType, color: BABYLON.Color3): void {
        this._terrainColors[blockType].copyFrom(color);
        this.setColor3Array("terrainColors", this._terrainColors);
    }

    public setSeaLevelTexture(texture: BABYLON.Texture): void {
        this._seaLevelTexture = texture;
        this._useSeaLevelTexture = this._seaLevelTexture ? 1 : 0;
        this.setInt("useSeaLevelTexture", this._useSeaLevelTexture);
        if (this._seaLevelTexture) {
            this.setTexture("seaLevelTexture", this._seaLevelTexture);
        }
    }

    private setFlatColors(): void {
        this._terrainColors[BlockType.None] = new BABYLON.Color3(0, 0, 0);
        this._terrainColors[BlockType.Water] = new BABYLON.Color3(0.224, 0.451, 0.675);
        this._terrainColors[BlockType.Grass] = new BABYLON.Color3(0.294, 0.608, 0.255);
        this._terrainColors[BlockType.Dirt] = new BABYLON.Color3(0.659, 0.463, 0.243);
        this._terrainColors[BlockType.Sand] = new BABYLON.Color3(0.780, 0.667, 0.263);
        this._terrainColors[BlockType.Rock] = new BABYLON.Color3(0.420, 0.420, 0.420);
        
        this.setColor3Array("terrainColors", this._terrainColors);
    }
}