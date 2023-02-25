class ExtendedMesh {

	public vertices: UniqueList<Vertex> = new UniqueList<Vertex>();
	public triangles: UniqueList<Triangle> = new UniqueList<Triangle>();
	public edges: UniqueList<Edge> = new UniqueList<Edge>();
	
	constructor(positions: number[], indices: number[]) {
		for (let i = 0; i < positions.length / 3; i++) {
			let x = positions[3 * i];
			let y = positions[3 * i + 1];
			let z = positions[3 * i + 2];
			this.vertices.push(new Vertex(this, x, y, z));
		}

		for (let i = 0; i < indices.length / 3; i++) {
			let v0 = indices[3 * i];
			let v1 = indices[3 * i + 1];
			let v2 = indices[3 * i + 2];
			if (v0 != v1 && v1 != v2 && v2 != v0) {
				this.triangles.push(new Triangle(this, this.vertices.get(v0), this.vertices.get(v1), this.vertices.get(v2)));
			}
		}

		this.triangles.forEach(tri => {
			tri.computeNormal();
		});
		this.vertices.forEach(vertex => {
			vertex.computeNormal();
		});
		this.edges.forEach(edge => {
			edge.computeCost();
		});
		this.sortEdges();
	}

	public sanityCheck(): void {
		this.triangles.forEach(tri => {
			tri.edges.forEach(edge => {
				if (!this.edges.contains(edge)) {
					debugger;
				}
			})
			tri.vertices.forEach(vertex => {
				if (!this.vertices.contains(vertex)) {
					debugger;
				}
			})
		})
		this.edges.forEach(edge => {
			edge.triangles.forEach(tri => {
				if (!this.triangles.contains(tri)) {
					debugger;
				}
			})
			if (!this.vertices.contains(edge.v0)) {
				debugger;
			}
			if (!this.vertices.contains(edge.v1)) {
				debugger;
			}
		})
		this.vertices.forEach(vertex => {
			vertex.edges.forEach(edge => {
				if (!this.edges.contains(edge)) {
					debugger;
				}
			})
			vertex.triangles.forEach(tri => {
				if (!this.triangles.contains(tri)) {
					debugger;
				}
			})
			if (vertex.triangles.length === 2) {
				debugger;
			}
		})
	}

	public sortEdges(): void {
		this.edges.sort((e1, e2) => { return e1.cost - e2.cost; });
	}

	public getPositions(): number[] {
		let positions = [];
		for (let i = 0; i < this.vertices.length; i++) {
			positions.push(this.vertices.get(i).point.x, this.vertices.get(i).point.y, this.vertices.get(i).point.z);
		}
		return positions;
	}

	public getColors(c: BABYLON.Color3): number[] {
		let colors = [];
		for (let i = 0; i < this.vertices.length; i++) {
			colors.push(c.r, c.g, c.b, 1);
		}
		return colors;
	}

	public getNormals(): number[] {
		let normals = [];
		for (let i = 0; i < this.vertices.length; i++) {
			normals.push(this.vertices.get(i).normal.x, this.vertices.get(i).normal.y, this.vertices.get(i).normal.z);
		}
		return normals;
	}

	public getIndices(): number[] {
		let indices = [];
		for (let i = 0; i < this.triangles.length; i++) {
			indices.push(
				this.vertices.indexOf(this.triangles.get(i).vertices[0]),
				this.vertices.indexOf(this.triangles.get(i).vertices[1]),
				this.vertices.indexOf(this.triangles.get(i).vertices[2]),
			);
		}
		return indices;
	}

	public smooth(f: number): void {
		for (let i = 0; i < this.vertices.length; i++) {
			let vertex = this.vertices.get(i);
			vertex.tmp = vertex.point.clone();
			vertex.tmp.scaleInPlace(f);
		}
		
		for (let i = 0; i < this.vertices.length; i++) {
			let vertex = this.vertices.get(i);
			let others = vertex.others(1);
			others.forEach(other => {
				vertex.tmp.addInPlace(other.point);
			});
			vertex.tmp.scaleInPlace(1 / (f + others.length));
		}

		for (let i = 0; i < this.vertices.length; i++) {
			let vertex = this.vertices.get(i);
			vertex.point.copyFrom(vertex.tmp);
		}

		this.triangles.forEach(tri => {
			tri.computeNormal();
		});
		this.vertices.forEach(vertex => {
			vertex.computeNormal();
		});
		this.edges.forEach(edge => {
			edge.computeCost();
		});
	}

	public scaleAltitude(scale: number): void {
		this.vertices.forEach(vertex => {
			vertex.computeLocalAltitude();
		});
		this.vertices.forEach(vertex => {
			vertex.scaleAltitude(scale);
		});

		this.triangles.forEach(tri => {
			tri.computeNormal();
		});
		this.vertices.forEach(vertex => {
			vertex.computeNormal();
		});
		this.edges.forEach(edge => {
			edge.computeCost();
		});
	}
}