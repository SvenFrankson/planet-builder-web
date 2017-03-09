/// <reference path="../lib/babylon.2.4.d.ts"/>
// get shared VertexData from exposed arrays.
// obviously not the easiest way to get shapes: mostly an attempt at complete procedural generation.
class MeshTools {
  public static FloatVector(size: number): BABYLON.Vector3 {
    return new BABYLON.Vector3(size, size, size);
  }
  // tool method to add a mesh triangle.
  public static PushTriangle(vertices: Array<Array<number>>,
                          a: number, b: number, c: number,
                          positions: Array<number>,
                          indices: Array<number>): void {
    let index: number = positions.length / 3;
    for (let n in vertices[a]) {
      if (vertices[a] != null) {
        positions.push(vertices[a][n]);
      }
    }
    for (let n in vertices[b]) {
      if (vertices[b] != null) {
        positions.push(vertices[b][n]);
      }
    }
    for (let n in vertices[c]) {
      if (vertices[c] != null) {
        positions.push(vertices[c][n]);
      }
    }
    indices.push(index);
    indices.push(index + 1);
    indices.push(index + 2);
  }

  // tool method to add two triangles forming a mesh quad.
  public static PushQuad(vertices: Array<BABYLON.Vector3>,
                          a: number, b: number, c: number, d: number,
                          positions: Array<number>,
                          indices: Array<number>): void {
    let index: number = positions.length / 3;

    positions.push(vertices[a].x);
    positions.push(vertices[a].y);
    positions.push(vertices[a].z);
    positions.push(vertices[b].x);
    positions.push(vertices[b].y);
    positions.push(vertices[b].z);
    positions.push(vertices[c].x);
    positions.push(vertices[c].y);
    positions.push(vertices[c].z);
    positions.push(vertices[d].x);
    positions.push(vertices[d].y);
    positions.push(vertices[d].z);

    indices.push(index);
    indices.push(index + 2);
    indices.push(index + 1);
    indices.push(index + 3);
    indices.push(index + 2);
    indices.push(index);
  }

  public static PushTopQuadUvs(block: number, uvs: Array<number>): void {
    uvs.push(0 + (block - 1) * 0.25);
    uvs.push(0.75);

    uvs.push(0 + (block - 1) * 0.25);
    uvs.push(1);

    uvs.push(0.25 + (block - 1) * 0.25);
    uvs.push(1);

    uvs.push(0.25 + (block - 1) * 0.25);
    uvs.push(0.75);
  }

  public static PushSideQuadUvs(block: number, uvs: Array<number>): void {
    uvs.push(0 + (block - 1) * 0.25);
    uvs.push(0.25);

    uvs.push(0 + (block - 1) * 0.25);
    uvs.push(0.5);

    uvs.push(0.25 + (block - 1) * 0.25);
    uvs.push(0.5);

    uvs.push(0.25 + (block - 1) * 0.25);
    uvs.push(0.25);
  }
}
