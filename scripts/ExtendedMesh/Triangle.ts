class Triangle {

	private static _V3: BABYLON.Vector3[];
	private static get V3(): BABYLON.Vector3[] {
		if (!Triangle._V3) {
			Triangle._V3 = [
				BABYLON.Vector3.Zero(),
				BABYLON.Vector3.Zero()
			]
		}
		return Triangle._V3;
	}

	public vertices: Vertex[];
	public edges: Edge[];
	public normal: BABYLON.Vector3 = BABYLON.Vector3.Up();

	constructor(public mesh: ExtendedMesh, v0: Vertex, v1: Vertex, v2: Vertex) {
		if (v0 === v1 || v1 === v2 || v2 === v0) {
			debugger;
		}
		this.vertices = [v0, v1, v2];
		this.edges = [
			Edge.Connect(v0, v1),
			Edge.Connect(v1, v2),
			Edge.Connect(v2, v0)
		];
		this.vertices[0].triangles.push(this);
		this.vertices[1].triangles.push(this);
		this.vertices[2].triangles.push(this);
		this.edges[0].triangles.push(this);
		this.edges[1].triangles.push(this);
		this.edges[2].triangles.push(this);
	}

	public computeNormal(): void {
		Triangle.V3[0].copyFrom(this.vertices[1].point).subtractInPlace(this.vertices[0].point);
		Triangle.V3[1].copyFrom(this.vertices[2].point).subtractInPlace(this.vertices[0].point);
		BABYLON.Vector3.CrossToRef(Triangle.V3[1], Triangle.V3[0], this.normal);
		this.normal.normalize();
	}

	public getEdgeWithout(v: Vertex): Edge {
		for (let i = 0; i < this.edges.length; i++) {
			if (this.edges[i].v0 != v && this.edges[i].v1 != v) {
				return this.edges[i];
			}
		}
	}

	public replace(vOld: Vertex, vNew: Vertex) {
		if (this.vertices[0] === vOld) {
			this.vertices[0] = vNew;
		}
		if (this.vertices[1] === vOld) {
			this.vertices[1] = vNew;
		}
		if (this.vertices[2] === vOld) {
			this.vertices[2] = vNew;
		}
	}

	public replaceEdge(eOld: Edge, eNew: Edge): boolean {
		if (this.edges[0] === eOld) {
			this.edges[0] = eNew;
			return true;
		}
		else if (this.edges[1] === eOld) {
			this.edges[1] = eNew;
			return true;
		}
		else if (this.edges[2] === eOld) {
			this.edges[2] = eNew;
			return true;
		}
		return false;
	}
}