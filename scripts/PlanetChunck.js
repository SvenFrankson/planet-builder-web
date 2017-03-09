var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PlanetChunck = (function (_super) {
    __extends(PlanetChunck, _super);
    function PlanetChunck(iPos, jPos, kPos, planetSide) {
        var _this = this;
        var name = "chunck-" + iPos + "-" + jPos + "-" + kPos;
        _this = _super.call(this, name, Game.Instance.getScene()) || this;
        _this.planetSide = planetSide;
        _this.iPos = iPos;
        _this.jPos = jPos;
        _this.kPos = kPos;
        var dataUrl = "./chunck" +
            "/" + _this.GetPlanetName() +
            "/" + Side[_this.GetSide()] +
            "/" + _this.iPos +
            "/" + _this.jPos +
            "/" + _this.kPos +
            "/data.txt";
        $.get(dataUrl, function (data) {
            _this.data = PlanetTools.DataFromHexString(data);
            _this.Initialize();
        });
        return _this;
    }
    PlanetChunck.prototype.GetSide = function () {
        return this.planetSide.GetSide();
    };
    PlanetChunck.prototype.GetSize = function () {
        return this.planetSide.GetSize();
    };
    PlanetChunck.prototype.GetPlanetName = function () {
        return this.planetSide.GetPlanetName();
    };
    PlanetChunck.prototype.Initialize = function () {
        var data = PlanetChunckMeshBuilder
            .BuildVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, 5, this.data);
        data.applyToMesh(this);
        this.material = SharedMaterials.MainMaterial();
    };
    return PlanetChunck;
}(BABYLON.Mesh));
