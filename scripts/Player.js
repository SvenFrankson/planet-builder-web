var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Player = (function (_super) {
    __extends(Player, _super);
    function Player() {
        var _this = _super.call(this, "Player", Game.Instance.getScene()) || this;
        Player.instance = _this;
        return _this;
    }
    Player.Position = function () {
        return new BABYLON.Vector3(0, 100, 0);
    };
    return Player;
}(BABYLON.Mesh));
