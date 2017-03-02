/// <reference path="../lib/babylon.2.4.d.ts"/>
class PlanetToolsTest {
  public static Run(): void {
    if (PlanetToolsTest.Corner00()) {
      console.log("PASS : Corner00");
    } else {
      console.log("FAIL : Corner00");
    }
    if (PlanetToolsTest.Corner01()) {
      console.log("PASS : Corner10");
    } else {
      console.log("FAIL : Corner10");
    }
    if (PlanetToolsTest.Corner11()) {
      console.log("PASS : Corner11");
    } else {
      console.log("FAIL : Corner11");
    }
    if (PlanetToolsTest.Corner01()) {
      console.log("PASS : Corner01");
    } else {
      console.log("FAIL : Corner01");
    }
  }

  public static Corner00(): boolean {
    return PlanetTools.EvaluateVertex(8, 0, 0).subtract(new BABYLON.Vector3(1, -1, -1).normalize()).lengthSquared() < 0.0001;
  }

  public static Corner10(): boolean {
    return PlanetTools.EvaluateVertex(8, 0, 8).subtract(new BABYLON.Vector3(1, -1, 1).normalize()).lengthSquared() < 0.0001;
  }

  public static Corner11(): boolean {
    return PlanetTools.EvaluateVertex(8, 8, 8).subtract(new BABYLON.Vector3(1, 1, 1).normalize()).lengthSquared() < 0.0001;
  }

  public static Corner01(): boolean {
    return PlanetTools.EvaluateVertex(8, 8, 0).subtract(new BABYLON.Vector3(1, 1, -1).normalize()).lengthSquared() < 0.0001;
  }
}

window.addEventListener("DOMContentLoaded", () => {
  console.log("TEST : PlanetToolsTest");
  PlanetToolsTest.Run();
});
