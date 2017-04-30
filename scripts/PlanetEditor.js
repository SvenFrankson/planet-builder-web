var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PlanetEditor = (function (_super) {
    __extends(PlanetEditor, _super);
    function PlanetEditor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PlanetEditor.GetHitWorldPos = function (remove) {
        if (remove === void 0) { remove = false; }
        var pickInfo = Game.Scene.pick(Game.Canvas.width / 2, Game.Canvas.height / 2);
        if (pickInfo.hit) {
            if (pickInfo.pickedMesh instanceof PlanetChunck) {
                return pickInfo.pickedPoint.add(BABYLON.Vector3.Normalize(pickInfo.pickedPoint.subtract(Player.Position())).multiply(MeshTools.FloatVector(0.2)));
            }
        }
        return undefined;
    };
    PlanetEditor.OnClick = function (planet) {
        var worldPos = PlanetEditor.GetHitWorldPos(true);
        console.log("WorldPos : " + worldPos);
        if (worldPos) {
            var planetSide = PlanetTools.WorldPositionToPlanetSide(planet, worldPos);
            console.log("PlanetSide : " + Side[planetSide.GetSide()]);
            if (planetSide) {
                var global = PlanetTools.WorldPositionToGlobalIJK(planetSide, worldPos);
                console.log("Globals : " + JSON.stringify(global));
                var local = PlanetTools.GlobalIJKToLocalIJK(planetSide, global);
                console.log("Chunck : " + JSON.stringify(local.planetChunck.Position()));
                console.log("Block : I=" + local.i + " , J=" + local.j + " , K=" + local.k);
                local.planetChunck.SetData(local.i, local.j, local.k, 0);
                local.planetChunck.SetMesh();
            }
        }
    };
    return PlanetEditor;
}(BABYLON.Mesh));
