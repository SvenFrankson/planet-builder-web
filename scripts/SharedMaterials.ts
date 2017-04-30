/// <reference path="../lib/babylon.2.4.d.ts"/>
class SharedMaterials {
  private static mainMaterial: BABYLON.StandardMaterial;
  public static MainMaterial(): BABYLON.StandardMaterial {
    if (!SharedMaterials.mainMaterial) {
      SharedMaterials.mainMaterial = new BABYLON.StandardMaterial("mainMaterial", Game.Scene);
      SharedMaterials.mainMaterial.diffuseTexture = new BABYLON.Texture(
        "./resources/textures/mainTexture.png",
        Game.Scene
      );
      SharedMaterials.mainMaterial.specularColor = BABYLON.Color3.Black();
    }
    return SharedMaterials.mainMaterial;
  }

  private static skyMaterial: BABYLON.StandardMaterial;
  public static SkyMaterial(): BABYLON.StandardMaterial {
    if (!SharedMaterials.skyMaterial) {
      SharedMaterials.skyMaterial = new BABYLON.StandardMaterial("mainMaterial", Game.Scene);
      SharedMaterials.skyMaterial.emissiveTexture = new BABYLON.Texture(
        "./resources/textures/sky.png",
        Game.Scene
      );
      SharedMaterials.skyMaterial.diffuseColor = BABYLON.Color3.Black();
      SharedMaterials.skyMaterial.specularColor = BABYLON.Color3.Black();
    }
    return SharedMaterials.skyMaterial;
  }
}
