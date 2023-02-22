class Vertex {

	private static _V3: BABYLON.Vector3[];
	private static get V3(): BABYLON.Vector3[] {
		if (!Vertex._V3) {
			Vertex._V3 = [
				BABYLON.Vector3.Zero()
			]
		}
		return Vertex._V3;
	}

	public point: BABYLON.Vector3;
	public tmp: BABYLON.Vector3;
	public edges: Edge[] = [];
	public triangles: Triangle[] = [];
	public normal: BABYLON.Vector3 = BABYLON.Vector3.Up();
	public localAltitude: number;

	constructor(public mesh: ExtendedMesh, x: number, y: number, z: number) {
		this.point = new BABYLON.Vector3(x, y, z);
	}

	public computeNormal(): void {
		if (this.triangles.length < 2) {
			this.normal.copyFromFloats(0, 1, 0);
		}
		else if (this.triangles.length === 2) {
			let other0 = this.edges[0].other(this);
			let other1 = this.edges[1].other(this);
			this.normal.copyFrom(this.point).scaleInPlace(2).subtractInPlace(other0.point).subtractInPlace(other1.point);
		}
		else {
			this.normal.copyFromFloats(0, 0, 0);
			this.triangles.forEach(tri => {
				this.normal.addInPlace(tri.normal);
			})
		}
		this.normal.normalize();
	}

	public computeLocalAltitude(): void {
		this.localAltitude = 0;
		if (this.edges.length > 0) {
			this.edges.forEach(edge => {
				let other = edge.other(this);
				Vertex.V3[0].copyFrom(this.point);
				Vertex.V3[0].subtractInPlace(other.point);
				this.localAltitude += BABYLON.Vector3.Dot(Vertex.V3[0], this.normal);
			});
			this.localAltitude /= this.edges.length;
		}
	}

	public scaleAltitude(scale: number): void {
		Vertex.V3[0].copyFrom(this.normal);
		Vertex.V3[0].scaleInPlace(this.localAltitude * scale);
		this.point.subtractInPlace(Vertex.V3[0]);
	}

	public delete(): void {
		while (this.edges.length > 0) {
			this.edges[0].delete();
		}
		this.mesh.vertices.remove(this);
	}

	public getEdge(other: Vertex): Edge {
		for (let i = 0; i < this.edges.length; i++) {
			if (this.edges[i].other(this) === other) {
				return this.edges[i];
			}
		}
		return undefined;
	}

	public others(d: number): Vertex[] {
		let others: Vertex[] = [this];
		for (let n = 0; n < d; n++) {
			let prevOthers = [...others];
			prevOthers.forEach(prevOther => {
				for (let i = 0; i < prevOther.edges.length; i++) {
					let v = prevOther.edges[i].other(prevOther);
					if (others.indexOf(v) === - 1) {
						others.push(v);
					}
				}
			});
		}
		others.splice(0, 1);
		return others;
	}
}