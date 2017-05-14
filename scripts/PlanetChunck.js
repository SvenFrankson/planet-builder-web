var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Neighbour;
(function (Neighbour) {
    Neighbour[Neighbour["IPlus"] = 0] = "IPlus";
    Neighbour[Neighbour["JPlus"] = 1] = "JPlus";
    Neighbour[Neighbour["KPlus"] = 2] = "KPlus";
    Neighbour[Neighbour["IMinus"] = 3] = "IMinus";
    Neighbour[Neighbour["JMinus"] = 4] = "JMinus";
    Neighbour[Neighbour["KMinus"] = 5] = "KMinus";
})(Neighbour || (Neighbour = {}));
;
var PlanetChunck = (function (_super) {
    __extends(PlanetChunck, _super);
    function PlanetChunck(iPos, jPos, kPos, planetSide) {
        var _this = _super.call(this, "chunck-" + iPos + "-" + jPos + "-" + kPos, Game.Scene) || this;
        _this.dataLoaded = new Array();
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
        _this.dataLoaded[Neighbour.IMinus] = false;
        _this.dataLoaded[Neighbour.IPlus] = false;
        _this.dataLoaded[Neighbour.JMinus] = false;
        _this.dataLoaded[Neighbour.JPlus] = false;
        _this.dataLoaded[Neighbour.KMinus] = true;
        _this.dataLoaded[Neighbour.KPlus] = true;
        if (_this.iPos === 0) {
            _this.dataLoaded[Neighbour.IMinus] = true;
        }
        if (_this.iPos === (PlanetTools.DegreeToChuncksCount(_this.GetDegree()) - 1)) {
            _this.dataLoaded[Neighbour.IPlus] = true;
        }
        if (_this.jPos === 0) {
            _this.dataLoaded[Neighbour.JMinus] = true;
        }
        if (_this.jPos === (PlanetTools.DegreeToChuncksCount(_this.GetDegree()) - 1)) {
            _this.dataLoaded[Neighbour.JPlus] = true;
        }
        if (_this.kPos === 0) {
            _this.dataLoaded[Neighbour.KMinus] = true;
        }
        if (_this.kPos === _this.GetKPosMax()) {
            _this.dataLoaded[Neighbour.KPlus] = true;
        }
        return _this;
    }
    PlanetChunck.prototype.GetSide = function () {
        return this.planetSide.GetSide();
    };
    PlanetChunck.prototype.GetDegree = function () {
        return PlanetTools.KPosToDegree(this.kPos);
    };
    PlanetChunck.prototype.GetSize = function () {
        return PlanetTools.DegreeToSize(this.GetDegree());
    };
    PlanetChunck.prototype.GetPlanetName = function () {
        return this.planetSide.GetPlanetName();
    };
    PlanetChunck.prototype.GetKPosMax = function () {
        return this.planetSide.GetKPosMax();
    };
    PlanetChunck.prototype.Position = function () {
        return {
            i: this.iPos,
            j: this.jPos,
            k: this.kPos
        };
    };
    PlanetChunck.prototype.GetData = function (i, j, k) {
        if (this.data[i]) {
            if (this.data[i][j]) {
                if (this.data[i][j][k]) {
                    return this.data[i][j][k];
                }
            }
        }
        return 0;
    };
    PlanetChunck.prototype.GetDataGlobal = function (iGlobal, jGlobal, kGlobal) {
        return this.planetSide.GetData(iGlobal, jGlobal, kGlobal);
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
    PlanetChunck.prototype.SetDataLoaded = function (neighbour) {
        this.dataLoaded[neighbour] = true;
        this.SetMeshIfAllDataLoaded();
    };
    PlanetChunck.prototype.PushToBuffer = function () {
        var sqrDist = Player.Position().subtract(this.barycenter).lengthSquared();
        if (sqrDist < PlanetTools.DISTANCELIMITSQUARED) {
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
            _this.SetMeshIfAllDataLoaded();
            _this.ForwardDataLoadedToNeighbours();
        });
    };
    PlanetChunck.prototype.ForwardDataLoadedToNeighbours = function () {
        this.planetSide.SetDataLoaded(Neighbour.IPlus, this.iPos - 1, this.jPos, this.kPos);
        this.planetSide.SetDataLoaded(Neighbour.IMinus, this.iPos + 1, this.jPos, this.kPos);
        this.planetSide.SetDataLoaded(Neighbour.JPlus, this.iPos, this.jPos - 1, this.kPos);
        this.planetSide.SetDataLoaded(Neighbour.JMinus, this.iPos, this.jPos + 1, this.kPos);
        this.planetSide.SetDataLoaded(Neighbour.KPlus, this.iPos, this.jPos, this.kPos - 1);
        this.planetSide.SetDataLoaded(Neighbour.KMinus, this.iPos, this.jPos, this.kPos + 1);
    };
    PlanetChunck.prototype.RandomInitialize = function () {
        this.data = PlanetTools.RandomData();
        this.SetMesh();
        PlanetChunck.initializedBuffer.push(this);
    };
    PlanetChunck.prototype.SetMeshIfAllDataLoaded = function () {
        for (var i = 0; i < this.dataLoaded.length; i++) {
            if (!this.dataLoaded[i]) {
                return;
            }
        }
        this.SetMesh();
    };
    PlanetChunck.prototype.SetMesh = function () {
        var vertexData = PlanetChunckMeshBuilder
            .BuildVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, this.data);
        vertexData.applyToMesh(this);
        this.material = SharedMaterials.MainMaterial();
        if (this.kPos === this.planetSide.GetKPosMax()) {
            vertexData = PlanetChunckMeshBuilder
                .BuildWaterVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, this.GetRadiusWater());
            vertexData.applyToMesh(this.water);
            this.water.material = SharedMaterials.WaterMaterial();
        }
        if (this.kPos === 0) {
            vertexData = PlanetChunckMeshBuilder
                .BuildBedrockVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, 8, this.data);
            vertexData.applyToMesh(this.bedrock);
            this.bedrock.material = SharedMaterials.BedrockMaterial();
        }
        PlanetChunck.initializedBuffer.push(this);
    };
    PlanetChunck.prototype.Dispose = function () {
        PlanetTools.EmptyVertexData().applyToMesh(this);
        PlanetTools.EmptyVertexData().applyToMesh(this.water);
        PlanetTools.EmptyVertexData().applyToMesh(this.bedrock);
    };
    PlanetChunck.InitializeLoop = function () {
        var chunck = PlanetChunck.initializationBuffer.pop();
        if (chunck) {
            chunck.Initialize();
        }
        for (var i = 0; i < 5; i++) {
            if (PlanetChunck.delayBuffer.length > 0) {
                var delayedChunck = PlanetChunck.delayBuffer.splice(0, 1)[0];
                delayedChunck.PushToBuffer();
            }
        }
        for (var i = 0; i < 5; i++) {
            if (PlanetChunck.initializedBuffer.length > 0) {
                var initializedChunck = PlanetChunck.initializedBuffer.splice(0, 1)[0];
                var sqrDist = Player.Position().subtract(initializedChunck.barycenter).lengthSquared();
                if (sqrDist > 4 * PlanetTools.DISTANCELIMITSQUARED) {
                    initializedChunck.Dispose();
                    PlanetChunck.delayBuffer.push(initializedChunck);
                }
                else {
                    PlanetChunck.initializedBuffer.push(initializedChunck);
                }
            }
        }
    };
    return PlanetChunck;
}(BABYLON.Mesh));
PlanetChunck.initializationBuffer = new Array();
PlanetChunck.delayBuffer = new Array();
PlanetChunck.initializedBuffer = new Array();
