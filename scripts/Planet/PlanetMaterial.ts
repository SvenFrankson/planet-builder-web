class PlanetMaterial extends BABYLON.ShaderMaterial {

    private _globalColor: BABYLON.Color3 = BABYLON.Color3.Black();
    private _terrainColors: BABYLON.Color3[];
    private _terrainFillStyles: string[];
    private _useSeaLevelTexture: number;
    private _seaLevelTexture: BABYLON.Texture;
    private _useVertexColor: number;
    private _planetPos: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    constructor(name: string, scene: BABYLON.Scene) {
        super(
            name,
            scene,
            {
                vertex: "terrainToon",
                fragment: "terrainToon",
            },
            {
                attributes: ["position", "normal", "uv", "uv2", "color"],
                uniforms: [
                    "world", "worldView", "worldViewProjection", "view", "projection",
                    "useSeaLevelTexture", "useVertexColor",
                    "seaLevelTexture",
                    "planetPos",
                    "voidTexture",
                    "dirtSideTexture",
                    "dirtTopTexture",
                    "grassTexture",
                    "rockTexture",
                    "woodTexture",
                    "sandTexture",
                    "leafTexture",
                    "iceTexture",
                ]
            }
        );
        this.setVector3("lightInvDirW", BABYLON.Vector3.One().normalize());

        this._terrainColors = [];
        this._terrainColors[BlockType.None] = new BABYLON.Color3(0, 0, 0);
        this._terrainColors[BlockType.Water] = new BABYLON.Color3(0.0, 0.5, 1.0);
        this._terrainColors[BlockType.Grass] = new BABYLON.Color3(0.216, 0.616, 0.165);
        this._terrainColors[BlockType.Dirt] = new BABYLON.Color3(0.451, 0.263, 0.047);
        this._terrainColors[BlockType.Sand] = new BABYLON.Color3(0.761, 0.627, 0.141);
        this._terrainColors[BlockType.Rock] = new BABYLON.Color3(0.522, 0.522, 0.522);
        this._terrainColors[BlockType.Wood] = new BABYLON.Color3(0.600, 0.302, 0.020);
        this._terrainColors[BlockType.Leaf] = new BABYLON.Color3(0.431, 0.839, 0.020);
        this._terrainColors[BlockType.Laterite] = new BABYLON.Color3(0.839, 0.431, 0.020);
        this._terrainColors[BlockType.Basalt] = BABYLON.Color3.FromHexString("#1f1916");
        this._terrainColors[BlockType.Snow] = BABYLON.Color3.FromHexString("#efffff");
        this._terrainColors[BlockType.Ice] = BABYLON.Color3.FromHexString("#95e4f0");

        this._terrainFillStyles = [];
        for (let i = 0; i < this._terrainColors.length; i++) {
            let color = this._terrainColors[i];
            let fillStyle = "rgb(" + (color.r * 255).toFixed(0) + ", " + (color.g * 255).toFixed(0) + ", " + (color.b * 255).toFixed(0) + ")";
            this._terrainFillStyles[i] = fillStyle;

        }
        
        let voidTexture = new BABYLON.Texture("datas/images/void-texture.png");
        voidTexture.wrapU = 1;
        voidTexture.wrapV = 1;
        
        let dirtSideTexture = new BABYLON.Texture("datas/images/dirt-side.png");
        dirtSideTexture.wrapU = 1;
        dirtSideTexture.wrapV = 1;
        
        let dirtTopTexture = new BABYLON.Texture("datas/images/dirt-top.png");
        dirtTopTexture.wrapU = 1;
        dirtTopTexture.wrapV = 1;
        
        let grassTexture = new BABYLON.Texture("datas/images/grass.png");
        grassTexture.wrapU = 1;
        grassTexture.wrapV = 1;
        
        let rockTexture = new BABYLON.Texture("datas/images/rock.png");
        rockTexture.wrapU = 1;
        rockTexture.wrapV = 1;
        
        let woodTexture = new BABYLON.Texture("datas/images/wood.png");
        woodTexture.wrapU = 1;
        woodTexture.wrapV = 1;
        
        let sandTexture = new BABYLON.Texture("datas/images/sand.png");
        sandTexture.wrapU = 1;
        sandTexture.wrapV = 1;
        
        let leafTexture = new BABYLON.Texture("datas/images/leaf.png");
        leafTexture.wrapU = 1;
        leafTexture.wrapV = 1;
        
        let iceTexture = new BABYLON.Texture("datas/images/ice.png");
        iceTexture.wrapU = 1;
        iceTexture.wrapV = 1;

        this.setColor3("globalColor", this._globalColor);
        this.setColor3Array("terrainColors", this._terrainColors);
        this.setSeaLevelTexture(undefined);
        this.setInt("useVertexColor", 0);
        this.setTexture("seaLevelTexture", voidTexture);
        this.setTexture("voidTexture", voidTexture);
        this.setTexture("dirtSideTexture", dirtSideTexture);
        this.setTexture("dirtTopTexture", dirtTopTexture);
        this.setTexture("grassTexture", grassTexture);
        this.setTexture("rockTexture", rockTexture);
        this.setTexture("woodTexture", woodTexture);
        this.setTexture("sandTexture", sandTexture);
        this.setTexture("leafTexture", leafTexture);
        this.setTexture("iceTexture", iceTexture);
        this.setPlanetPos(BABYLON.Vector3.Zero());
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
        let fillStyle = "rgb(" + (color.r * 255).toFixed(0) + ", " + (color.g * 255).toFixed(0) + ", " + (color.b * 255).toFixed(0) + ")";
        this._terrainFillStyles[blockType] = fillStyle;
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

    public setUseVertexColor(useVertexColor: boolean): void {
        this._useVertexColor = useVertexColor ? 1 : 0;
        this.setInt("useVertexColor", this._useVertexColor);
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

    public getPlanetPos(): BABYLON.Vector3 {
        return this._planetPos;
    }

    public setPlanetPos(p: BABYLON.Vector3): void {
        this._planetPos.copyFrom(p);
        this.setVector3("planetPos", this._planetPos);
    }

    public getFillStyle(blockType: BlockType): string {
        return this._terrainFillStyles[blockType];
    }
}