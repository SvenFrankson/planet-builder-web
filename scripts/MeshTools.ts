/// <reference path="../lib/babylon.2.4.d.ts"/>
// get shared VertexData from exposed arrays.
// obviously not the easiest way to get shapes: mostly an attempt at complete procedural generation.
class MeshTools {

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
  public static PushQuad(vertices: Array<Array<number>>,
                          a: number, b: number, c: number, d: number,
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
    for (let n in vertices[d]) {
      if (vertices[d] != null) {
        positions.push(vertices[d][n]);
      }
    }
    indices.push(index);
    indices.push(index + 2);
    indices.push(index + 1);
    indices.push(index + 3);
    indices.push(index + 2);
    indices.push(index);
  }
}
