var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Planet = (function (_super) {
    __extends(Planet, _super);
    function Planet(name, size) {
        var _this = _super.call(this, name, Game.Scene) || this;
        _this.size = size;
        _this.radiusZero = Math.floor((2 / Math.PI - 1 / 8) * _this.size);
        _this.totalRadiusWaterSquared = _this.GetRadiusWater() * _this.GetRadiusWater();
        console.log(_this.totalRadiusWaterSquared);
        _this.sides = new Array();
        _this.sides[Side.Right] = new PlanetSide(Side.Right, _this);
        _this.sides[Side.Left] = new PlanetSide(Side.Left, _this);
        _this.sides[Side.Front] = new PlanetSide(Side.Front, _this);
        _this.sides[Side.Back] = new PlanetSide(Side.Back, _this);
        _this.sides[Side.Top] = new PlanetSide(Side.Top, _this);
        _this.sides[Side.Bottom] = new PlanetSide(Side.Bottom, _this);
        return _this;
    }
    Planet.prototype.GetSide = function (side) {
        return this.sides[side];
    };
    Planet.prototype.GetSize = function () {
        return this.size;
    };
    Planet.prototype.GetRadiusZero = function () {
        return this.radiusZero;
    };
    Planet.prototype.GetRadiusWater = function () {
        return this.GetRadiusZero() + this.GetSize() / 4 - 3 - 0.2;
    };
    Planet.prototype.GetTotalRadiusWaterSquared = function () {
        return this.totalRadiusWaterSquared;
    };
    Planet.prototype.GetPlanetName = function () {
        return this.name;
    };
    Planet.prototype.Initialize = function () {
        for (var i = 0; i < this.sides.length; i++) {
            this.sides[i].Initialize();
        }
    };
    Planet.prototype.AsyncInitialize = function () {
        for (var i = 0; i < this.sides.length; i++) {
            this.sides[i].AsyncInitialize();
        }
    };
    return Planet;
}(BABYLON.Mesh));
