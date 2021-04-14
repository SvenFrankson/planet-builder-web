class PlanetChunckMeshBuilder {
  private static cachedVertices: Array<Array<Array<BABYLON.Vector3>>>;

  private static GetVertex(
    size: number,
    i: number,
    j: number
  ): BABYLON.Vector3 {
    let out: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    return PlanetChunckMeshBuilder.GetVertexToRef(size, i, j, out);
  }

  private static GetVertexToRef(
    size: number,
    i: number,
    j: number,
    out: BABYLON.Vector3
  ): BABYLON.Vector3 {
    if (!PlanetChunckMeshBuilder.cachedVertices) {
      PlanetChunckMeshBuilder.cachedVertices = new Array<
        Array<Array<BABYLON.Vector3>>
      >();
    }
    if (!PlanetChunckMeshBuilder.cachedVertices[size]) {
      PlanetChunckMeshBuilder.cachedVertices[size] = new Array<
        Array<BABYLON.Vector3>
      >();
    }
    if (!PlanetChunckMeshBuilder.cachedVertices[size][i]) {
      PlanetChunckMeshBuilder.cachedVertices[size][
        i
      ] = new Array<BABYLON.Vector3>();
    }
    if (!PlanetChunckMeshBuilder.cachedVertices[size][i][j]) {
      PlanetChunckMeshBuilder.cachedVertices[size][i][
        j
      ] = PlanetTools.EvaluateVertex(size, i, j);
    }
    out.copyFrom(PlanetChunckMeshBuilder.cachedVertices[size][i][j]);
    return out;
  }

  public static BuildVertexData(
    size: number,
    iPos: number,
    jPos: number,
    kPos: number,
    data: Array<Array<Array<number>>>
  ): BABYLON.VertexData {
    let vertexData: BABYLON.VertexData = new BABYLON.VertexData();
    let vertices: Array<BABYLON.Vector3> = new Array<BABYLON.Vector3>();
    for (let i: number = 0; i < 8; i++) {
      vertices[i] = BABYLON.Vector3.Zero();
    }
    let height: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    let positions: Array<number> = new Array<number>();
    let indices: Array<number> = new Array<number>();
    let uvs: Array<number> = new Array<number>();
    let colors: Array<number> = new Array<number>();

    for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
      for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
        for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
          if (data[i][j][k] !== 0) {
            let y: number = i + iPos * PlanetTools.CHUNCKSIZE;
            let z: number = j + jPos * PlanetTools.CHUNCKSIZE;
            PlanetChunckMeshBuilder.GetVertexToRef(size, y, z, vertices[0]);
            PlanetChunckMeshBuilder.GetVertexToRef(size, y, z + 1, vertices[1]);
            PlanetChunckMeshBuilder.GetVertexToRef(size, y + 1, z, vertices[2]);
            PlanetChunckMeshBuilder.GetVertexToRef(
              size,
              y + 1,
              z + 1,
              vertices[3]
            );

            let h: number = k + kPos * PlanetTools.CHUNCKSIZE + 1;
            height.copyFromFloats(h, h, h);
            vertices[0].multiplyToRef(height, vertices[4]);
            vertices[1].multiplyToRef(height, vertices[5]);
            vertices[2].multiplyToRef(height, vertices[6]);
            vertices[3].multiplyToRef(height, vertices[7]);

            height.subtractFromFloatsToRef(1, 1, 1, height);
            vertices[0].multiplyInPlace(height);
            vertices[1].multiplyInPlace(height);
            vertices[2].multiplyInPlace(height);
            vertices[3].multiplyInPlace(height);

            let lum: number = h / 96;

            if (i - 1 < 0 || data[i - 1][j][k] === 0) {
              MeshTools.PushQuad(vertices, 1, 5, 4, 0, positions, indices);
              MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
              MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
            }
            if (j - 1 < 0 || data[i][j - 1][k] === 0) {
              MeshTools.PushQuad(vertices, 0, 4, 6, 2, positions, indices);
              MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
              MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
            }
            if (k - 1 < 0 || data[i][j][k - 1] === 0) {
              MeshTools.PushQuad(vertices, 0, 2, 3, 1, positions, indices);
              MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
              MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
            }
            if (i + 1 >= PlanetTools.CHUNCKSIZE || data[i + 1][j][k] === 0) {
              MeshTools.PushQuad(vertices, 2, 6, 7, 3, positions, indices);
              MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
              MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
            }
            if (j + 1 >= PlanetTools.CHUNCKSIZE || data[i][j + 1][k] === 0) {
              MeshTools.PushQuad(vertices, 3, 7, 5, 1, positions, indices);
              MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
              MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
            }
            if (k + 1 >= PlanetTools.CHUNCKSIZE || data[i][j][k + 1] === 0) {
              MeshTools.PushQuad(vertices, 4, 5, 7, 6, positions, indices);
              MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
              MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
            }
          }
        }
      }
    }
    let normals: Array<number> = [];
    vertexData.positions = positions;
    vertexData.indices = indices;
    vertexData.uvs = uvs;
    vertexData.colors = colors;
    BABYLON.VertexData.ComputeNormals(positions, indices, normals);
    vertexData.normals = normals;

    return vertexData;
  }

  public static BuildWaterVertexData(
    size: number,
    iPos: number,
    jPos: number,
    kPos: number,
    rWater: number
  ): BABYLON.VertexData {
    let vertexData: BABYLON.VertexData = new BABYLON.VertexData();
    let vertices: Array<BABYLON.Vector3> = new Array<BABYLON.Vector3>();
    let positions: Array<number> = new Array<number>();
    let indices: Array<number> = new Array<number>();
    let uvs: Array<number> = new Array<number>();

    for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
      for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
        let y: number = i + iPos * PlanetTools.CHUNCKSIZE;
        let z: number = j + jPos * PlanetTools.CHUNCKSIZE;
        // following vertices should be lazy-computed
        vertices[0] = PlanetChunckMeshBuilder.GetVertex(size, y, z);
        vertices[1] = PlanetChunckMeshBuilder.GetVertex(size, y, z + 1);
        vertices[2] = PlanetChunckMeshBuilder.GetVertex(size, y + 1, z);
        vertices[3] = PlanetChunckMeshBuilder.GetVertex(size, y + 1, z + 1);

        vertices[1].scaleInPlace(rWater);
        vertices[2].scaleInPlace(rWater);
        vertices[3].scaleInPlace(rWater);
        vertices[0].scaleInPlace(rWater);

        MeshTools.PushQuad(vertices, 0, 1, 3, 2, positions, indices);
        MeshTools.PushWaterUvs(uvs);

        MeshTools.PushQuad(vertices, 0, 2, 3, 1, positions, indices);
        MeshTools.PushWaterUvs(uvs);
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

  public static BuildBedrockVertexData(
    size: number,
    iPos: number,
    jPos: number,
    kPos: number,
    r: number,
    data: Array<Array<Array<number>>>
  ): BABYLON.VertexData {
    let vertexData: BABYLON.VertexData = new BABYLON.VertexData();
    let vertices: Array<BABYLON.Vector3> = new Array<BABYLON.Vector3>();
    let positions: Array<number> = new Array<number>();
    let indices: Array<number> = new Array<number>();
    let uvs: Array<number> = new Array<number>();

    if (kPos === 0) {
      for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
        for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
          let y: number = i + iPos * PlanetTools.CHUNCKSIZE;
          let z: number = j + jPos * PlanetTools.CHUNCKSIZE;
          // following vertices should be lazy-computed
          vertices[0] = PlanetChunckMeshBuilder.GetVertex(size, y, z);
          vertices[1] = PlanetChunckMeshBuilder.GetVertex(size, y, z + 1);
          vertices[2] = PlanetChunckMeshBuilder.GetVertex(size, y + 1, z);
          vertices[3] = PlanetChunckMeshBuilder.GetVertex(size, y + 1, z + 1);

          vertices[1].scaleInPlace(r);
          vertices[2].scaleInPlace(r);
          vertices[3].scaleInPlace(r);
          vertices[0].scaleInPlace(r);

          MeshTools.PushQuad(vertices, 0, 1, 3, 2, positions, indices);
          MeshTools.PushWaterUvs(uvs);
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
