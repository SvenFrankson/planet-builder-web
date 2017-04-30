var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Water = (function (_super) {
    __extends(Water, _super);
    function Water(name) {
        return _super.call(this, name, Game.Scene) || this;
    }
    return Water;
}(BABYLON.Mesh));
