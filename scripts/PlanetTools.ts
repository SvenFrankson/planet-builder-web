/// <reference path="../lib/babylon.2.4.d.ts"/>
class PlanetTools {
  public static readonly CHUNCKSIZE = 32;

  public static EvaluateVertex(size: number, i: number, j: number): BABYLON.Vector3 {
    let xRad: number = 45.0;
    let yRad: number = -45.0 + 90.0 * (i / size);
    let zRad: number = -45.0 + 90.0 * (j / size);

    xRad = xRad / 180.0 * Math.PI;
    yRad = yRad / 180.0 * Math.PI;
    zRad = zRad / 180.0 * Math.PI;

    return new BABYLON.Vector3(
      Math.sin(xRad) / Math.cos(xRad),
      Math.sin(yRad) / Math.cos(yRad),
      Math.sin(zRad) / Math.cos(zRad)
    ).normalize();
  }
}
