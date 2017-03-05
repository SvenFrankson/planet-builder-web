/// <reference path="../lib/babylon.2.4.d.ts"/>
class SharedMaterials {
  public static MainMaterial(): BABYLON.Material {
    var material: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("mainMaterial", Game.Instance.getScene());
    material.diffuseTexture = new BABYLON.Texture("./resources/textures/mainTexture.png", Game.Instance.getScene());
    return material;
  }
}
