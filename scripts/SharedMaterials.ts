class SharedMaterials {
    private static mainMaterial: PlanetMaterial;
    public static MainMaterial(): PlanetMaterial {
        if (!SharedMaterials.mainMaterial) {
            SharedMaterials.mainMaterial = new PlanetMaterial("mainMaterial", Game.Scene);
        }
        return SharedMaterials.mainMaterial;
    }
    
    private static highlightChunckMaterial: PlanetMaterial;
    public static HighlightChunckMaterial(): PlanetMaterial {
        if (!SharedMaterials.highlightChunckMaterial) {
            SharedMaterials.highlightChunckMaterial = new PlanetMaterial("highlightChunckMaterial", Game.Scene);
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
            SharedMaterials.waterMaterial.diffuseColor = SharedMaterials.MainMaterial().getColor(BlockType.Water);
            SharedMaterials.waterMaterial.specularColor = BABYLON.Color3.Black();
        }
        return SharedMaterials.waterMaterial;
    }
}
