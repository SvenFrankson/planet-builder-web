/// <reference path="../lib/babylon.2.4.d.ts"/>

class PlanetEditor extends BABYLON.Mesh {

  public static GetHitWorldPos(remove: boolean = false): BABYLON.Vector3 {
    let pickInfo: BABYLON.PickingInfo = Game.Scene.pick(Game.Canvas.width / 2, Game.Canvas.height / 2);
    if (pickInfo.hit) {
      if (pickInfo.pickedMesh instanceof PlanetChunck) {
        return pickInfo.pickedPoint.add(
          BABYLON.Vector3.Normalize(pickInfo.pickedPoint.subtract(Player.Position())).multiply(MeshTools.FloatVector(0.2))
        );
      }
    }
    return undefined;
  }

  public static OnClick(planet: Planet): void {
    let worldPos: BABYLON.Vector3 = PlanetEditor.GetHitWorldPos(true);
    console.log("WorldPos : " + worldPos);
    if (worldPos) {
      let planetSide: PlanetSide = PlanetTools.WorldPositionToPlanetSide(planet, worldPos);
      console.log("PlanetSide : " + Side[planetSide.GetSide()]);
      if (planetSide) {
        let global: {i: number, j: number, k: number} = PlanetTools.WorldPositionToGlobalIJK(planetSide, worldPos);
        console.log("Globals : " + JSON.stringify(global));
        let local: {planetChunck: PlanetChunck, i: number, j: number, k: number} = PlanetTools.GlobalIJKToLocalIJK(planetSide, global);
        console.log("Chunck : " + JSON.stringify(local.planetChunck.Position()));
        console.log("Block : I=" + local.i + " , J=" + local.j + " , K=" + local.k);
        local.planetChunck.SetData(local.i, local.j, local.k, 0);
        local.planetChunck.SetMesh();
      }
    }
  }
}
