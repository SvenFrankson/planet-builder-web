var SharedMaterials = (function () {
    function SharedMaterials() {
    }
    SharedMaterials.MainMaterial = function () {
        var material = new BABYLON.StandardMaterial("mainMaterial", Game.Instance.getScene());
        material.diffuseTexture = new BABYLON.Texture("./resources/textures/mainTexture.png", Game.Instance.getScene());
        return material;
    };
    return SharedMaterials;
}());
