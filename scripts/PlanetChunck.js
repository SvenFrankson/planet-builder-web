var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PlanetChunck = (function (_super) {
    __extends(PlanetChunck, _super);
    function PlanetChunck(size, iPos, jPos, kPos) {
        var _this = this;
        var name = "chunck-" + iPos + "-" + jPos + "-" + kPos;
        _this = _super.call(this, name, Game.Instance.getScene()) || this;
        _this.size = size;
        _this.iPos = iPos;
        _this.jPos = jPos;
        _this.kPos = kPos;
        _this.data = new Array();
        for (var i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            _this.data[i] = new Array();
            for (var j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                _this.data[i][j] = new Array();
                for (var k = 1; k < PlanetTools.CHUNCKSIZE; k++) {
                    _this.data[i][j][k] = 0;
                }
                _this.data[i][j][0] = 1;
                var h = Math.floor(Math.random() * 4);
                for (var k = 0; k < h; k++) {
                    _this.data[i][j][k] = 1;
                }
            }
        }
        return _this;
    }
    PlanetChunck.prototype.Initialize = function () {
        var data = PlanetChunckMeshBuilder
            .BuildVertexData(this.size, this.iPos, this.jPos, this.kPos, 5, this.data);
        data.applyToMesh(this);
    };
    return PlanetChunck;
}(BABYLON.Mesh));
