/// <reference path="../lib/babylon.2.4.d.ts"/>
class PlanetChunckMeshBuilder {
  public static BuildVertexData(
    size: number,
    iPos: number,
    jPos: number,
    kPos: number,
    r: number,
    data: Array<Array<Array<number>>>,
  ): BABYLON.VertexData {

    let vertexData: BABYLON.VertexData = new BABYLON.VertexData();
    let vertices: Array<BABYLON.Vector3> = new Array<BABYLON.Vector3>();
    let positions: Array<number> = new Array<number>();
    let indices: Array<number> = new Array<number>();
    let uvs: Array<number> = new Array<number>();

    for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
      for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
        for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
          if (data[i][j][k] !== 0) {
            let y: number = i + iPos * PlanetTools.CHUNCKSIZE;
            let z: number = j + jPos * PlanetTools.CHUNCKSIZE;
            // following vertices should be lazy-computed
            vertices[0] = PlanetTools.EvaluateVertex(size, y, z);
            vertices[1] = PlanetTools.EvaluateVertex(size, y, z + 1);
            vertices[2] = PlanetTools.EvaluateVertex(size, y + 1, z);
            vertices[3] = PlanetTools.EvaluateVertex(size, y + 1, z + 1);

            vertices[4] = vertices[0].multiply(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE + 1));
            vertices[5] = vertices[1].multiply(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE + 1));
            vertices[6] = vertices[2].multiply(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE + 1));
            vertices[7] = vertices[3].multiply(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE + 1));

            vertices[0].multiplyInPlace(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE));
            vertices[1].multiplyInPlace(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE));
            vertices[2].multiplyInPlace(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE));
            vertices[3].multiplyInPlace(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE));

            if (i - 1 < 0 || data[i - 1][j][k] === 0) {
              MeshTools.PushQuad(vertices, 1, 5, 4, 0, positions, indices);
              MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
            }
            if (j - 1 < 0 || data[i][j - 1][k] === 0) {
              MeshTools.PushQuad(vertices, 0, 4, 6, 2, positions, indices);
              MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
            }
            if (k - 1 < 0 || data[i][j][k - 1] === 0) {
              MeshTools.PushQuad(vertices, 0, 2, 3, 1, positions, indices);
              MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
            }
            if (i + 1 >= PlanetTools.CHUNCKSIZE || data[i + 1][j][k] === 0) {
              MeshTools.PushQuad(vertices, 2, 6, 7, 3, positions, indices);
              MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
            }
            if (j + 1 >= PlanetTools.CHUNCKSIZE || data[i][j + 1][k] === 0) {
              MeshTools.PushQuad(vertices, 3, 7, 5, 1, positions, indices);
              MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
            }
            if (k + 1 >= PlanetTools.CHUNCKSIZE || data[i][j][k + 1] === 0) {
              MeshTools.PushQuad(vertices, 4, 5, 7, 6, positions, indices);
              MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
            }
          }
        }
      }
    }
    let normals: Array<number> = new Array<number>();
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.normals = normals;
    vertexData.uvs = uvs;

    return vertexData;
  }
}
