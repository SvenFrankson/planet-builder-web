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
        _this = _super.call(this, name, Game.Scene) || this;
        _this.planetSide = planetSide;
        _this.iPos = iPos;
        _this.jPos = jPos;
        _this.kPos = kPos;
        _this.barycenter = PlanetTools.EvaluateVertex(_this.GetSize(), PlanetTools.CHUNCKSIZE * _this.iPos + PlanetTools.CHUNCKSIZE / 2, PlanetTools.CHUNCKSIZE * _this.jPos + PlanetTools.CHUNCKSIZE / 2).multiply(MeshTools.FloatVector(_this.GetRadiusZero() + PlanetTools.CHUNCKSIZE * _this.kPos + PlanetTools.CHUNCKSIZE / 2));
        _this.barycenter = BABYLON.Vector3.TransformCoordinates(_this.barycenter, planetSide.computeWorldMatrix());
        _this.water = new Water(_this.name + "-water");
        _this.water.parent = _this;
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
    PlanetChunck.prototype.Position = function () {
        return {
            i: this.iPos,
            j: this.jPos,
            k: this.kPos
        };
    };
    PlanetChunck.prototype.SetData = function (i, j, k, value) {
        this.data[i][j][k] = value;
    };
    PlanetChunck.prototype.GetBaryCenter = function () {
        return this.barycenter;
    };
    PlanetChunck.prototype.GetRadiusWater = function () {
        return this.planetSide.GetRadiusWater();
    };
    PlanetChunck.prototype.AsyncInitialize = function () {
        var thisDistance = Player.Position().subtract(this.barycenter).lengthSquared();
        var lastIDistance = -1;
        for (var i = 0; i < PlanetChunck.initializationBuffer.length; i++) {
            var iDistance = Player.Position().subtract(PlanetChunck.initializationBuffer[i].GetBaryCenter()).lengthSquared();
            if (thisDistance > iDistance) {
                PlanetChunck.initializationBuffer.splice(i, 0, this);
                return;
            }
            lastIDistance = iDistance;
        }
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
        this.material = SharedMaterials.MainMaterial();
        vertexData = PlanetChunckMeshBuilder
            .BuildWaterVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, this.GetRadiusWater());
        vertexData.applyToMesh(this.water);
        this.water.material = SharedMaterials.WaterMaterial();
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
