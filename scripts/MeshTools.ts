// get shared VertexData from exposed arrays.
// obviously not the easiest way to get shapes: mostly an attempt at complete procedural generation.

class MeshTools {
  public static Angle(v1: BABYLON.Vector3, v2: BABYLON.Vector3): number {
	return Math.acos(
	  BABYLON.Vector3.Dot(
		BABYLON.Vector3.Normalize(v1),
		BABYLON.Vector3.Normalize(v2)
	  )
	);
  }

  // tool method to add a mesh triangle.
  public static PushTriangle(
	vertices: Array<Array<number>>,
	a: number,
	b: number,
	c: number,
	positions: Array<number>,
	indices: Array<number>
  ): void {
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
  public static PushQuad(
	vertices: Array<BABYLON.Vector3>,
	a: number,
	b: number,
	c: number,
	d: number,
	positions: Array<number>,
	indices: Array<number>
  ): void {
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
	let i: number = (block - 128 - 1) % 4;
	let j: number = Math.floor((block - 128 - 1) / 4);

	uvs.push(0 + i * 0.25);
	uvs.push(0.75 - j * 0.25);

	uvs.push(0 + i * 0.25);
	uvs.push(1 - j * 0.25);

	uvs.push(0.25 + i * 0.25);
	uvs.push(1 - j * 0.25);

	uvs.push(0.25 + i * 0.25);
	uvs.push(0.75 - j * 0.25);
  }

  public static PushSideQuadUvs(block: number, uvs: Array<number>): void {
	let i: number = (block - 128 - 1) % 4;
	let j: number = Math.floor((block - 128 - 1) / 4);

	uvs.push(0 + i * 0.25);
	uvs.push(0.25 - j * 0.25);

	uvs.push(0 + i * 0.25);
	uvs.push(0.5 - j * 0.25);

	uvs.push(0.25 + i * 0.25);
	uvs.push(0.5 - j * 0.25);

	uvs.push(0.25 + i * 0.25);
	uvs.push(0.25 - j * 0.25);
  }

  public static PushQuadColor(
	r: number,
	g: number,
	b: number,
	a: number,
	colors: Array<number>
  ): void {
	colors.push(r, g, b, a);
	colors.push(r, g, b, a);
	colors.push(r, g, b, a);
	colors.push(r, g, b, a);
  }

  public static PushWaterUvs(uvs: Array<number>): void {
	uvs.push(0);
	uvs.push(0);

	uvs.push(0);
	uvs.push(1);

	uvs.push(1);
	uvs.push(1);

	uvs.push(1);
	uvs.push(0);
  }

  public static VertexDataFromJSON(jsonData: string): BABYLON.VertexData {
	let tmp: BABYLON.VertexData = JSON.parse(jsonData);
	let vertexData: BABYLON.VertexData = new BABYLON.VertexData();
	vertexData.positions = tmp.positions;
	vertexData.normals = tmp.normals;
	vertexData.matricesIndices = tmp.matricesIndices;
	vertexData.matricesWeights = tmp.matricesWeights;
	vertexData.indices = tmp.indices;
	return vertexData;
  }
}
