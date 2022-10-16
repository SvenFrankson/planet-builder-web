class SharedMaterials {
    private static mainMaterial: TerrainToonMaterial;
    public static MainMaterial(): TerrainToonMaterial {
        if (!SharedMaterials.mainMaterial) {
            SharedMaterials.mainMaterial = new TerrainToonMaterial("mainMaterial", Game.Scene);
        }
        return SharedMaterials.mainMaterial;
    }

    private static debugMaterial: BABYLON.StandardMaterial;
    public static DebugMaterial(): BABYLON.StandardMaterial {
        if (!SharedMaterials.debugMaterial) {
            SharedMaterials.debugMaterial = new BABYLON.StandardMaterial("debugMaterial", Game.Scene);
        }
        return SharedMaterials.debugMaterial;
    }

    private static waterMaterial: BABYLON.StandardMaterial;
    public static WaterMaterial(): BABYLON.StandardMaterial {
        if (!SharedMaterials.waterMaterial) {
            SharedMaterials.waterMaterial = new BABYLON.StandardMaterial("waterMaterial", Game.Scene);
            SharedMaterials.waterMaterial.diffuseTexture = new BABYLON.Texture("./resources/textures/water.png", Game.Scene);
            SharedMaterials.waterMaterial.specularColor = BABYLON.Color3.Black();
            SharedMaterials.waterMaterial.alpha = 0.5;
        }
        return SharedMaterials.waterMaterial;
    }

    private static bedrockMaterial: BABYLON.StandardMaterial;
    public static BedrockMaterial(): BABYLON.StandardMaterial {
        if (!SharedMaterials.bedrockMaterial) {
            SharedMaterials.bedrockMaterial = new BABYLON.StandardMaterial("waterMaterial", Game.Scene);
            SharedMaterials.bedrockMaterial.diffuseTexture = new BABYLON.Texture("./resources/textures/bedrock.png", Game.Scene);
            SharedMaterials.bedrockMaterial.specularColor = BABYLON.Color3.Black();
        }
        return SharedMaterials.bedrockMaterial;
    }

    private static skyMaterial: BABYLON.StandardMaterial;
    public static SkyMaterial(): BABYLON.StandardMaterial {
        if (!SharedMaterials.skyMaterial) {
            SharedMaterials.skyMaterial = new BABYLON.StandardMaterial("skyMaterial", Game.Scene);
            SharedMaterials.skyMaterial.emissiveTexture = new BABYLON.Texture("./resources/textures/sky.png", Game.Scene);
            SharedMaterials.skyMaterial.diffuseColor = BABYLON.Color3.Black();
            SharedMaterials.skyMaterial.specularColor = BABYLON.Color3.Black();
        }
        return SharedMaterials.skyMaterial;
    }
}
