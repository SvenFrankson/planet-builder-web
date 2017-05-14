var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Side;
(function (Side) {
    Side[Side["Right"] = 0] = "Right";
    Side[Side["Left"] = 1] = "Left";
    Side[Side["Top"] = 2] = "Top";
    Side[Side["Bottom"] = 3] = "Bottom";
    Side[Side["Front"] = 4] = "Front";
    Side[Side["Back"] = 5] = "Back";
})(Side || (Side = {}));
var PlanetSide = (function (_super) {
    __extends(PlanetSide, _super);
    function PlanetSide(side, planet) {
        var _this = this;
        var name = "side-" + side;
        _this = _super.call(this, name, Game.Scene) || this;
        _this.planet = planet;
        _this.side = side;
        _this.rotationQuaternion = PlanetTools.QuaternionForSide(_this.side);
        _this.chuncks = new Array();
        for (var k = 0; k <= _this.GetKPosMax(); k++) {
            _this.chuncks[k] = new Array();
            var chuncksCount = PlanetTools.DegreeToChuncksCount(PlanetTools.KPosToDegree(k));
            for (var i = 0; i < chuncksCount; i++) {
                _this.chuncks[k][i] = new Array();
                for (var j = 0; j < chuncksCount; j++) {
                    _this.chuncks[k][i][j] = new PlanetChunck(i, j, k, _this);
                    _this.chuncks[k][i][j].parent = _this;
                }
            }
        }
        return _this;
    }
    PlanetSide.prototype.GetSide = function () {
        return this.side;
    };
    PlanetSide.prototype.GetPlanetName = function () {
        return this.planet.GetPlanetName();
    };
    PlanetSide.prototype.GetRadiusWater = function () {
        return this.planet.GetRadiusWater();
    };
    PlanetSide.prototype.GetKPosMax = function () {
        return this.planet.GetKPosMax();
    };
    PlanetSide.prototype.GetChunck = function (i, j, k) {
        return this.chuncks[k][i][j];
    };
    PlanetSide.prototype.GetData = function (iGlobal, jGlobal, kGlobal) {
        var iPos = Math.floor(iGlobal / PlanetTools.CHUNCKSIZE);
        var jPos = Math.floor(jGlobal / PlanetTools.CHUNCKSIZE);
        var kPos = Math.floor(kGlobal / PlanetTools.CHUNCKSIZE);
        if (this.chuncks[kPos]) {
            if (this.chuncks[kPos][iPos]) {
                if (this.chuncks[kPos][iPos][jPos]) {
                    var i = iGlobal - iPos * PlanetTools.CHUNCKSIZE;
                    var j = jGlobal - jPos * PlanetTools.CHUNCKSIZE;
                    var k = kGlobal - kPos * PlanetTools.CHUNCKSIZE;
                    return this.chuncks[kPos][iPos][jPos].GetData(i, j, k);
                }
            }
        }
        return 0;
    };
    PlanetSide.prototype.SetDataLoaded = function (neighbourSource, i, j, k) {
        if (this.chuncks[k]) {
            if (this.chuncks[k][i]) {
                if (this.chuncks[k][i][j]) {
                    this.chuncks[k][i][j].SetDataLoaded(neighbourSource);
                }
            }
        }
    };
    PlanetSide.prototype.Initialize = function () {
        for (var i = 0; i < this.chuncksLength; i++) {
            for (var j = 0; j < this.chuncksLength; j++) {
                for (var k = 0; k < this.chuncksLength / 2; k++) {
                    this.chuncks[i][j][k].Initialize();
                }
            }
        }
    };
    PlanetSide.prototype.AsyncInitialize = function () {
        for (var k = 0; k < this.chuncks.length; k++) {
            for (var i = 0; i < this.chuncks[k].length; i++) {
                for (var j = 0; j < this.chuncks[k][i].length; j++) {
                    this.chuncks[k][i][j].AsyncInitialize();
                }
            }
        }
    };
    return PlanetSide;
}(BABYLON.Mesh));
