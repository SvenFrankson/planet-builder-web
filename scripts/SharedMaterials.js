var SharedMaterials = (function () {
    function SharedMaterials() {
    }
    SharedMaterials.AsyncSetMainMaterial = function (planetChunck) {
        if (!SharedMaterials.mainMaterial) {
            SharedMaterials.LoadMainMaterial();
        }
        SharedMaterials.TrySetMainMaterial(planetChunck);
    };
    SharedMaterials.TrySetMainMaterial = function (planetChunck) {
        if (!SharedMaterials.mainMaterialTexturesLoaded) {
            setTimeout(SharedMaterials.TrySetMainMaterial, 1000, planetChunck);
        }
        else {
            planetChunck.material = SharedMaterials.mainMaterial;
        }
    };
    SharedMaterials.LoadMainMaterial = function () {
        SharedMaterials.mainMaterial = new BABYLON.StandardMaterial("mainMaterial", Game.Instance.getScene());
        SharedMaterials.mainMaterial.diffuseTexture = new BABYLON.Texture("./resources/textures/mainTexture.png", Game.Instance.getScene(), undefined, undefined, undefined, function () {
            SharedMaterials.mainMaterialTexturesLoaded = true;
        });
    };
    return SharedMaterials;
}());
SharedMaterials.mainMaterialTexturesLoaded = false;
