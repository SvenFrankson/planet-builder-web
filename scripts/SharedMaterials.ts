class SharedMaterials {
    private static mainMaterial: TerrainToonMaterial;
    public static MainMaterial(): TerrainToonMaterial {
        if (!SharedMaterials.mainMaterial) {
            SharedMaterials.mainMaterial = new TerrainToonMaterial("mainMaterial", Game.Scene);
        }
        return SharedMaterials.mainMaterial;
    }
    
    private static highlightChunckMaterial: TerrainToonMaterial;
    public static HighlightChunckMaterial(): TerrainToonMaterial {
        if (!SharedMaterials.highlightChunckMaterial) {
            SharedMaterials.highlightChunckMaterial = new TerrainToonMaterial("highlightChunckMaterial", Game.Scene);
            SharedMaterials.highlightChunckMaterial.setGlobalColor(new BABYLON.Color3(0, 1, 1));
        }
        return SharedMaterials.highlightChunckMaterial;
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
            SharedMaterials.waterMaterial.diffuseColor = new BABYLON.Color3(0, 0.5, 1);
            SharedMaterials.waterMaterial.specularColor = BABYLON.Color3.Black();
            SharedMaterials.waterMaterial.alpha = 0.7;
        }
        return SharedMaterials.waterMaterial;
    }
}
