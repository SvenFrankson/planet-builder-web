/// <reference path="../lib/babylon.2.4.d.ts"/>

class PlanetEditor extends BABYLON.Mesh {

  public static data: number = 0;

  public static GetHitWorldPos(remove: boolean = false): BABYLON.Vector3 {
    let pickInfo: BABYLON.PickingInfo = Game.Scene.pick(
      Game.Canvas.width / 2,
      Game.Canvas.height / 2,
      (mesh: BABYLON.Mesh) => {
        return !(mesh instanceof Water);
      }
    );
    if (pickInfo.hit) {
      if (pickInfo.pickedMesh instanceof PlanetChunck) {
        let offset: number = -0.2;
        if (remove) {
          offset = 0.2;
        }
        return pickInfo.pickedPoint.add(
          BABYLON.Vector3.Normalize(pickInfo.pickedPoint.subtract(Player.Position())).multiply(MeshTools.FloatVector(offset))
        );
      }
    }
    return undefined;
  }

  public static OnClick(planet: Planet): void {
    let removeMode: boolean = PlanetEditor.data === 0;
    let worldPos: BABYLON.Vector3 = PlanetEditor.GetHitWorldPos(removeMode);
    console.log("WorldPos : " + worldPos);
    if (worldPos) {
      if (PlanetEditor.data === 0 || worldPos.subtract(Player.Instance.PositionHead()).lengthSquared() < 1) {
        if (PlanetEditor.data === 0 || worldPos.subtract(Player.Instance.PositionLeg()).lengthSquared() < 1) {
          let planetSide: PlanetSide = PlanetTools.WorldPositionToPlanetSide(planet, worldPos);
          console.log("PlanetSide : " + Side[planetSide.GetSide()]);
          if (planetSide) {
            let global: {i: number, j: number, k: number} = PlanetTools.WorldPositionToGlobalIJK(planetSide, worldPos);
            console.log("Globals : " + JSON.stringify(global));
            let local: {planetChunck: PlanetChunck, i: number, j: number, k: number} = PlanetTools.GlobalIJKToLocalIJK(planetSide, global);
            console.log("Chunck : " + JSON.stringify(local.planetChunck.Position()));
            console.log("Block : I=" + local.i + " , J=" + local.j + " , K=" + local.k);
            local.planetChunck.SetData(local.i, local.j, local.k, PlanetEditor.data);
            local.planetChunck.SetMesh();
          }
        }
      }
    }
  }

  public static RegisterControl(): void {
    let scene: BABYLON.Scene = Game.Scene;
    scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyDownTrigger,
        (event: BABYLON.ActionEvent) => {
          if ((event.sourceEvent.keyCode === 48) || (event.sourceEvent.keyCode === 88) ) {
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
        }
      )
    );
  }
}
