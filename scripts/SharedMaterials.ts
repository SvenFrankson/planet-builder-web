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
            SharedMaterials.waterMaterial.alpha = 0.8;
        }
        return SharedMaterials.waterMaterial;
    }

    private static redMaterial: BABYLON.StandardMaterial;
    public static RedMaterial(): BABYLON.StandardMaterial {
        if (!SharedMaterials.redMaterial) {
            SharedMaterials.redMaterial = new BABYLON.StandardMaterial("redMaterial", Game.Scene);
            SharedMaterials.redMaterial.diffuseColor.copyFromFloats(1, 0, 0);
        }
        return SharedMaterials.redMaterial;
    }

    private static greenMaterial: BABYLON.StandardMaterial;
    public static GreenMaterial(): BABYLON.StandardMaterial {
        if (!SharedMaterials.greenMaterial) {
            SharedMaterials.greenMaterial = new BABYLON.StandardMaterial("greenMaterial", Game.Scene);
            SharedMaterials.greenMaterial.diffuseColor.copyFromFloats(0, 1, 0);
        }
        return SharedMaterials.greenMaterial;
    }

    private static blueMaterial: BABYLON.StandardMaterial;
    public static BlueMaterial(): BABYLON.StandardMaterial {
        if (!SharedMaterials.blueMaterial) {
            SharedMaterials.blueMaterial = new BABYLON.StandardMaterial("blueMaterial", Game.Scene);
            SharedMaterials.blueMaterial.diffuseColor.copyFromFloats(0, 0, 1);
        }
        return SharedMaterials.blueMaterial;
    }

    private static magentaMaterial: BABYLON.StandardMaterial;
    public static MagentaMaterial(): BABYLON.StandardMaterial {
        if (!SharedMaterials.magentaMaterial) {
            SharedMaterials.magentaMaterial = new BABYLON.StandardMaterial("magentaMaterial", Game.Scene);
            SharedMaterials.magentaMaterial.diffuseColor.copyFromFloats(1, 0, 1);
        }
        return SharedMaterials.magentaMaterial;
    }

    private static yellowMaterial: BABYLON.StandardMaterial;
    public static YellowMaterial(): BABYLON.StandardMaterial {
        if (!SharedMaterials.yellowMaterial) {
            SharedMaterials.yellowMaterial = new BABYLON.StandardMaterial("yellowMaterial", Game.Scene);
            SharedMaterials.yellowMaterial.diffuseColor.copyFromFloats(1, 1, 0);
        }
        return SharedMaterials.yellowMaterial;
    }

    private static cyanMaterial: BABYLON.StandardMaterial;
    public static CyanMaterial(): BABYLON.StandardMaterial {
        if (!SharedMaterials.cyanMaterial) {
            SharedMaterials.cyanMaterial = new BABYLON.StandardMaterial("cyanMaterial", Game.Scene);
            SharedMaterials.cyanMaterial.diffuseColor.copyFromFloats(0, 1, 1);
        }
        return SharedMaterials.cyanMaterial;
    }
}
