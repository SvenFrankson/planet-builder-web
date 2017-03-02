/// <reference path="../lib/babylon.2.4.d.ts"/>
class PlanetChunckMeshBuilder {
  public static BuildVertexData(
    iPos: number,
    jPos: number,
    kPos: number,
    size: number,
    data: Array<Array<Array<number>>>,
  ): BABYLON.VertexData {

    let vertexData: BABYLON.VertexData = new BABYLON.VertexData();
    let vertices: Array<BABYLON.Vector3> = new Array<BABYLON.Vector3>();
    let positions: Array<number> = new Array<number>();
    let indices: Array<number> = new Array<number>();

    for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
      for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
        for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
          let y: number = j + jPos * PlanetTools.CHUNCKSIZE;
          let z: number = k + iPos * PlanetTools.CHUNCKSIZE;
          // following vertices should be lazy-computed
          vertices[0] = PlanetTools.EvaluateVertex(size, y, z);
          vertices[1] = PlanetTools.EvaluateVertex(size, y, z + 1);
          vertices[2] = PlanetTools.EvaluateVertex(size, y + 1, z);
          vertices[3] = PlanetTools.EvaluateVertex(size, y + 1, z + 1);

          vertices[4] = vertices[0].multiply(MeshTools.FloatVector(k + kPos + 1));
          vertices[5] = vertices[1].multiply(MeshTools.FloatVector(k + kPos + 1));
          vertices[6] = vertices[2].multiply(MeshTools.FloatVector(k + kPos + 1));
          vertices[7] = vertices[3].multiply(MeshTools.FloatVector(k + kPos + 1));

          vertices[0].multiplyInPlace(MeshTools.FloatVector(k + kPos));
          vertices[1].multiplyInPlace(MeshTools.FloatVector(k + kPos));
          vertices[2].multiplyInPlace(MeshTools.FloatVector(k + kPos));
          vertices[3].multiplyInPlace(MeshTools.FloatVector(k + kPos));

          if (data[i][j][k] != null) {
            if (i - 1 < 0 || data[i - 1][j][k] === 0) {
              MeshTools.PushQuad(vertices, 0, 2, 6, 4, positions, indices);
            }
            if (j - 1 < 0 || data[i][j - 1][k] === 0) {
              MeshTools.PushQuad(vertices, 1, 7, 4, 5, positions, indices);
            }
            if (k - 1 < 0 || data[i][j][k - 1] === 0) {
              MeshTools.PushQuad(vertices, 0, 1, 3, 2, positions, indices);
            }
          }
        }
      }
    }

    return vertexData;
  }
}
