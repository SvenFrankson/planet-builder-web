/// <reference path="../lib/babylon.2.4.d.ts"/>
class SharedMaterials {
  private static mainMaterialTexturesLoaded: boolean = false;
  private static mainMaterial: BABYLON.StandardMaterial;

  public static AsyncSetMainMaterial(planetChunck: PlanetChunck): void {
    if (!SharedMaterials.mainMaterial) {
      SharedMaterials.LoadMainMaterial();
    }
    SharedMaterials.TrySetMainMaterial(planetChunck);
  }

  private static TrySetMainMaterial(planetChunck: PlanetChunck): void {
    if (!SharedMaterials.mainMaterialTexturesLoaded) {
      setTimeout(SharedMaterials.TrySetMainMaterial, 1000, planetChunck);
    } else {
      planetChunck.material = SharedMaterials.mainMaterial;
    }
  }

  private static LoadMainMaterial(): void {
    SharedMaterials.mainMaterial = new BABYLON.StandardMaterial("mainMaterial", Game.Instance.getScene());
    SharedMaterials.mainMaterial.diffuseTexture = new BABYLON.Texture(
      "./resources/textures/mainTexture.png",
      Game.Instance.getScene(),
      undefined,
      undefined,
      undefined,
      () => {
        SharedMaterials.mainMaterialTexturesLoaded = true;
      }
    );
  }
}
