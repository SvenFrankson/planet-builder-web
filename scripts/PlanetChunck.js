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
        _this.barycenter = PlanetTools.EvaluateVertex(_this.GetSize(), PlanetTools.CHUNCKSIZE * _this.iPos + PlanetTools.CHUNCKSIZE / 2, PlanetTools.CHUNCKSIZE * _this.jPos + PlanetTools.CHUNCKSIZE / 2).multiply(MeshTools.FloatVector(PlanetTools.CHUNCKSIZE * _this.kPos + PlanetTools.CHUNCKSIZE / 2));
        _this.barycenter = BABYLON.Vector3.TransformCoordinates(_this.barycenter, planetSide.computeWorldMatrix());
        _this.normal = BABYLON.Vector3.Normalize(_this.barycenter);
        _this.water = new Water(_this.name + "-water");
        _this.water.parent = _this;
        _this.bedrock = new BABYLON.Mesh(_this.name + "-bedrock", Game.Scene);
        _this.bedrock.parent = _this;
        return _this;
    }
    PlanetChunck.prototype.GetSide = function () {
        return this.planetSide.GetSide();
    };
    PlanetChunck.prototype.GetSize = function () {
        return PlanetTools.DegreeToSize(PlanetTools.KPosToDegree(this.kPos));
    };
    PlanetChunck.prototype.GetPlanetName = function () {
        return this.planetSide.GetPlanetName();
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
    PlanetChunck.prototype.GetNormal = function () {
        return this.normal;
    };
    PlanetChunck.prototype.GetRadiusWater = function () {
        return this.planetSide.GetRadiusWater();
    };
    PlanetChunck.prototype.PushToBuffer = function () {
        var alpha = MeshTools.Angle(this.GetNormal(), Player.Position().subtract(this.barycenter));
        if (alpha < PlanetTools.ALPHALIMIT) {
            this.PushToInitializationBuffer();
        }
        else {
            PlanetChunck.delayBuffer.push(this);
        }
    };
    PlanetChunck.prototype.PushToInitializationBuffer = function () {
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
    PlanetChunck.prototype.AsyncInitialize = function () {
        this.PushToBuffer();
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
            PlanetChunck.initializedBuffer.push(_this);
        });
    };
    PlanetChunck.prototype.RandomInitialize = function () {
        this.data = PlanetTools.RandomData();
        this.SetMesh();
        PlanetChunck.initializedBuffer.push(this);
    };
    PlanetChunck.prototype.SetMesh = function () {
        var vertexData = PlanetChunckMeshBuilder
            .BuildVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, this.data);
        vertexData.applyToMesh(this);
        this.material = SharedMaterials.MainMaterial();
        vertexData = PlanetChunckMeshBuilder
            .BuildWaterVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, this.GetRadiusWater());
        vertexData.applyToMesh(this.water);
        this.water.material = SharedMaterials.WaterMaterial();
        vertexData = PlanetChunckMeshBuilder
            .BuildBedrockVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, 8, this.data);
        vertexData.applyToMesh(this.bedrock);
        this.bedrock.material = SharedMaterials.BedrockMaterial();
    };
    PlanetChunck.prototype.Dispose = function () {
        PlanetTools.EmptyVertexData().applyToMesh(this);
        PlanetTools.EmptyVertexData().applyToMesh(this.water);
        PlanetTools.EmptyVertexData().applyToMesh(this.bedrock);
    };
    PlanetChunck.InitializeLoop = function () {
        var chunck = PlanetChunck.initializationBuffer.pop();
        if (chunck) {
            chunck.RandomInitialize();
        }
        if (PlanetChunck.delayBuffer.length > 0) {
            var delayedChunck = PlanetChunck.delayBuffer.splice(0, 1)[0];
            delayedChunck.PushToBuffer();
        }
        if (PlanetChunck.initializedBuffer.length > 0) {
            var initializedChunck = PlanetChunck.initializedBuffer.splice(0, 1)[0];
            var alpha = MeshTools.Angle(initializedChunck.GetNormal(), Player.Position().subtract(initializedChunck.GetBaryCenter()));
            if (alpha > PlanetTools.ALPHALIMIT * 1.1) {
                initializedChunck.Dispose();
                PlanetChunck.delayBuffer.push(initializedChunck);
            }
            else {
                PlanetChunck.initializedBuffer.push(initializedChunck);
            }
        }
    };
    return PlanetChunck;
}(BABYLON.Mesh));
PlanetChunck.initializationBuffer = new Array();
PlanetChunck.delayBuffer = new Array();
PlanetChunck.initializedBuffer = new Array();
