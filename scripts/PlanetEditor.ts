class PlanetEditor extends BABYLON.Mesh {

  public static data: number = 0;

  public static GetHitWorldPos(remove: boolean = false): BABYLON.Vector3 {
    console.log("Canvas Width : " + Game.Canvas.width);
    console.log("Canvas Height : " + Game.Canvas.height);
    let pickInfo: BABYLON.PickingInfo = Game.Scene.pick(
      Game.Canvas.width / 2,
      Game.Canvas.height / 2,
      (mesh: BABYLON.Mesh) => {
        return !(mesh instanceof Water);
      }
    );
    if (pickInfo.hit) {
      if (pickInfo.pickedMesh instanceof PlanetChunck) {
        let offset: number = 0.25;
        if (remove) {
          offset = -0.25;
        }
        return pickInfo.pickedPoint.add(
          pickInfo.getNormal(true, false).scale(offset)
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
      if (PlanetEditor.data === 0 || worldPos.subtract(Player.Instance.PositionHead()).lengthSquared() > 1) {
        if (PlanetEditor.data === 0 || worldPos.subtract(Player.Instance.PositionLeg()).lengthSquared() > 1) {
          let planetSide: PlanetSide = PlanetTools.WorldPositionToPlanetSide(planet, worldPos);
          console.log("PlanetSide : " + Side[planetSide.side]);
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
        }
      )
    );
  }

  public static SetData(newData: number): void {
    if (newData < 0) {
      newData = 0;
    }
    if (newData > 0 && newData < 129) {
      if (newData > PlanetEditor.data) {
        newData = 129;
      } else {
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
  }
}
