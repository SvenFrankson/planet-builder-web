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
        console.log("Canvas Width : " + Game.Canvas.width);
        console.log("Canvas Height : " + Game.Canvas.height);
        var pickInfo = Game.Scene.pick(Game.Canvas.width / 2, Game.Canvas.height / 2, function (mesh) {
            return !(mesh instanceof Water);
        });
        if (pickInfo.hit) {
            if (pickInfo.pickedMesh instanceof PlanetChunck) {
                var offset = 0.25;
                if (remove) {
                    offset = -0.25;
                }
                return pickInfo.pickedPoint.add(pickInfo.getNormal(true, false).multiply(MeshTools.FloatVector(offset)));
            }
        }
        return undefined;
    };
    PlanetEditor.OnClick = function (planet) {
        var removeMode = PlanetEditor.data === 0;
        var worldPos = PlanetEditor.GetHitWorldPos(removeMode);
        console.log("WorldPos : " + worldPos);
        if (worldPos) {
            if (PlanetEditor.data === 0 || worldPos.subtract(Player.Instance.PositionHead()).lengthSquared() > 1) {
                if (PlanetEditor.data === 0 || worldPos.subtract(Player.Instance.PositionLeg()).lengthSquared() > 1) {
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
                PlanetEditor.SetData(0);
            }
            if (event.sourceEvent.keyCode === 49) {
                PlanetEditor.SetData(129);
            }
            if (event.sourceEvent.keyCode === 50) {
                PlanetEditor.SetData(130);
            }
            if (event.sourceEvent.keyCode === 51) {
                PlanetEditor.SetData(131);
            }
            if (event.sourceEvent.keyCode === 52) {
                PlanetEditor.SetData(132);
            }
            if (event.sourceEvent.keyCode === 53) {
                PlanetEditor.SetData(133);
            }
            if (event.sourceEvent.keyCode === 54) {
                PlanetEditor.SetData(134);
            }
            if (event.sourceEvent.keyCode === 55) {
                PlanetEditor.SetData(135);
            }
            if (event.sourceEvent.keyCode === 17) {
                PlanetEditor.SetData(PlanetEditor.data - 1);
            }
            if (event.sourceEvent.keyCode === 16) {
                PlanetEditor.SetData(PlanetEditor.data + 1);
            }
        }));
    };
    PlanetEditor.SetData = function (newData) {
        if (newData < 0) {
            newData = 0;
        }
        if (newData > 0 && newData < 129) {
            if (newData > PlanetEditor.data) {
                newData = 129;
            }
            else {
                newData = 0;
            }
        }
        if (newData > 135) {
            newData = 0;
        }
        PlanetEditor.data = newData;
        $(".inventory-item").attr("disabled", true);
        if (PlanetEditor.data === 0) {
            $("#remove").attr("disabled", false);
        }
        if (PlanetEditor.data === 129) {
            $("#grass").attr("disabled", false);
        }
        if (PlanetEditor.data === 130) {
            $("#dirt").attr("disabled", false);
        }
        if (PlanetEditor.data === 131) {
            $("#sand").attr("disabled", false);
        }
        if (PlanetEditor.data === 132) {
            $("#rock").attr("disabled", false);
        }
        if (PlanetEditor.data === 133) {
            $("#trunc").attr("disabled", false);
        }
        if (PlanetEditor.data === 134) {
            $("#leaf").attr("disabled", false);
        }
        if (PlanetEditor.data === 135) {
            $("#snow").attr("disabled", false);
        }
    };
    return PlanetEditor;
}(BABYLON.Mesh));
PlanetEditor.data = 0;
