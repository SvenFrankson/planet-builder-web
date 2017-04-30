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
        var pickInfo = Game.Scene.pick(Game.Canvas.width / 2, Game.Canvas.height / 2, function (mesh) {
            return !(mesh instanceof Water);
        });
        if (pickInfo.hit) {
            if (pickInfo.pickedMesh instanceof PlanetChunck) {
                var offset = -0.2;
                if (remove) {
                    offset = 0.2;
                }
                return pickInfo.pickedPoint.add(BABYLON.Vector3.Normalize(pickInfo.pickedPoint.subtract(Player.Position())).multiply(MeshTools.FloatVector(offset)));
            }
        }
        return undefined;
    };
    PlanetEditor.OnClick = function (planet) {
        var removeMode = PlanetEditor.data === 0;
        var worldPos = PlanetEditor.GetHitWorldPos(removeMode);
        console.log("WorldPos : " + worldPos);
        if (worldPos) {
            if (PlanetEditor.data === 0 || worldPos.subtract(Player.Instance.PositionHead()).lengthSquared() < 1) {
                if (PlanetEditor.data === 0 || worldPos.subtract(Player.Instance.PositionLeg()).lengthSquared() < 1) {
                    var planetSide = PlanetTools.WorldPositionToPlanetSide(planet, worldPos);
                    console.log("PlanetSide : " + Side[planetSide.GetSide()]);
                    if (planetSide) {
                        var global = PlanetTools.WorldPositionToGlobalIJK(planetSide, worldPos);
                        console.log("Globals : " + JSON.stringify(global));
                        var local = PlanetTools.GlobalIJKToLocalIJK(planetSide, global);
                        console.log("Chunck : " + JSON.stringify(local.planetChunck.Position()));
                        console.log("Block : I=" + local.i + " , J=" + local.j + " , K=" + local.k);
                        local.planetChunck.SetData(local.i, local.j, local.k, PlanetEditor.data);
                        local.planetChunck.SetMesh();
                    }
                }
            }
        }
    };
    PlanetEditor.RegisterControl = function () {
        var scene = Game.Scene;
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (event) {
            if ((event.sourceEvent.keyCode === 48) || (event.sourceEvent.keyCode === 88)) {
                PlanetEditor.data = 0;
                $(".inventory-item").attr("disabled", true);
                $("#remove").attr("disabled", false);
            }
            if (event.sourceEvent.keyCode === 49) {
                PlanetEditor.data = 129;
                $(".inventory-item").attr("disabled", true);
                $("#grass").attr("disabled", false);
            }
            if (event.sourceEvent.keyCode === 50) {
                PlanetEditor.data = 130;
                $(".inventory-item").attr("disabled", true);
                $("#dirt").attr("disabled", false);
            }
            if (event.sourceEvent.keyCode === 51) {
                PlanetEditor.data = 131;
                $(".inventory-item").attr("disabled", true);
                $("#sand").attr("disabled", false);
            }
            if (event.sourceEvent.keyCode === 52) {
                PlanetEditor.data = 132;
                $(".inventory-item").attr("disabled", true);
                $("#rock").attr("disabled", false);
            }
        }));
    };
    return PlanetEditor;
}(BABYLON.Mesh));
PlanetEditor.data = 0;
