/// <reference path="../lib/babylon.2.4.d.ts"/>
/// <reference path="../lib/jquery.d.ts"/>
class PlanetTools {
  public static readonly CHUNCKSIZE = 16;

  public static QuaternionForSide(side: Side): BABYLON.Quaternion {
    if (side === Side.Right) {
      return BABYLON.Quaternion.Identity();
    } else if (side === Side.Left) {
      return BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), Math.PI);
    } else if (side === Side.Front) {
      return BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), 3 * Math.PI / 2.0);
    } else if (side === Side.Back) {
      return BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), Math.PI / 2.0);
    } else if (side === Side.Top) {
      return BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), Math.PI / 2.0);
    } else if (side === Side.Bottom) {
      return BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), 3 * Math.PI / 2.0);
    }
  }

  public static EvaluateVertex(size: number, i: number, j: number): BABYLON.Vector3 {
    let xRad: number = 45.0;
    let yRad: number = -45.0 + 90.0 * (j / size);
    let zRad: number = -45.0 + 90.0 * (i / size);

    xRad = xRad / 180.0 * Math.PI;
    yRad = yRad / 180.0 * Math.PI;
    zRad = zRad / 180.0 * Math.PI;

    return new BABYLON.Vector3(
      Math.sin(xRad) / Math.cos(xRad),
      Math.sin(yRad) / Math.cos(yRad),
      Math.sin(zRad) / Math.cos(zRad)
    ).normalize();
  }

  public static DataFromHexString(hexString : string): Array<Array<Array<number>>> {
    if (hexString.length !== PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * 2) {
      console.log("Invalid HexString. Length is =" + hexString.length +
                  ". Expected length is = " + (PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * 2) + ".");
      return null;
    }
    let data: Array<Array<Array<number>>> = new Array<Array<Array<number>>>();
    for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
      data[i] = new Array<Array<number>>();
      for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
        data[i][j] = new Array<number>();
        for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
          let index: number = 2 * (i * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE + j * PlanetTools.CHUNCKSIZE + k);
          data[i][j][k] = parseInt(hexString.slice(index, index + 2), 16);
        }
      }
    }
    return data;
  }

  public static HexStringFromData(data: Array<Array<Array<number>>>): string {
    let hexString: string = "";
    for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
      for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
        for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
          hexString += data[i][j][k].toString(16);
        }
      }
    }
    return hexString;
  }
}
