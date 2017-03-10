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
    PlanetChunck.prototype.GetRadiusZero = function () {
        return this.planetSide.GetRadiusZero();
    };
    PlanetChunck.prototype.AsyncInitialize = function () {
        PlanetChunck.initializationBuffer.push(this);
    };
    PlanetChunck.prototype.Initialize = function () {
        var _this = this;
        var dataUrl = "./chunck" +
            "/" + this.GetPlanetName() +
            "/" + Side[this.GetSide()] +
            "/" + this.iPos +
            "/" + this.jPos +
            "/" + this.kPos +
            "/data.txt";
        $.get(dataUrl, function (data) {
            _this.data = PlanetTools.DataFromHexString(data);
            _this.SetMesh();
        });
    };
    PlanetChunck.prototype.SetMesh = function () {
        var vertexData = PlanetChunckMeshBuilder
            .BuildVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, this.GetRadiusZero(), this.data);
        vertexData.applyToMesh(this);
        SharedMaterials.AsyncSetMainMaterial(this);
    };
    PlanetChunck.InitializeLoop = function () {
        var chunck = PlanetChunck.initializationBuffer.pop();
        if (chunck) {
            chunck.Initialize();
        }
    };
    return PlanetChunck;
}(BABYLON.Mesh));
PlanetChunck.initializationBuffer = new Array();
