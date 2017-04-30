var SharedMaterials = (function () {
    function SharedMaterials() {
    }
    SharedMaterials.MainMaterial = function () {
        if (!SharedMaterials.mainMaterial) {
            SharedMaterials.mainMaterial = new BABYLON.StandardMaterial("mainMaterial", Game.Scene);
            SharedMaterials.mainMaterial.diffuseTexture = new BABYLON.Texture("./resources/textures/mainTexture.png", Game.Scene);
            SharedMaterials.mainMaterial.specularColor = BABYLON.Color3.Black();
        }
        return SharedMaterials.mainMaterial;
    };
    SharedMaterials.SkyMaterial = function () {
        if (!SharedMaterials.skyMaterial) {
            SharedMaterials.skyMaterial = new BABYLON.StandardMaterial("mainMaterial", Game.Scene);
            SharedMaterials.skyMaterial.emissiveTexture = new BABYLON.Texture("./resources/textures/sky.png", Game.Scene);
            SharedMaterials.skyMaterial.diffuseColor = BABYLON.Color3.Black();
            SharedMaterials.skyMaterial.specularColor = BABYLON.Color3.Black();
        }
        return SharedMaterials.skyMaterial;
    };
    return SharedMaterials;
}());
