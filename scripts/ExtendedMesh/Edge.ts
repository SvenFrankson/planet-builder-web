class Edge {

	public v0: Vertex;
	public v1: Vertex;
	public triangles: Triangle[] = [];
	public cost: number;

	constructor(public mesh: ExtendedMesh, v0: Vertex, v1: Vertex) {
		this.v0 = v0;
		this.v1 = v1;
		this.mesh.edges.push(this);
	}

	public static Connect(v0: Vertex, v1: Vertex): Edge {
		if (BABYLON.Vector3.DistanceSquared(v0.point, v1.point) === 0) {
			debugger;
		}
		let edge = v0.getEdge(v1);
		if (!edge) {
			edge = new Edge(v0.mesh, v0, v1);
			v0.edges.push(edge);
			v1.edges.push(edge);
		}
		return edge;
	}

	public computeCost(): void {

		if (this.v0.triangles.length === 2) {
			this.cost = 0;
			let tmp = this.v1;
			this.v1 = this.v0;
			this.v0 = tmp;
			console.log(".");
		}
		else if (this.v1.triangles.length === 2) {
			this.cost = 0;
			console.log(".");
		}
		else {
			this.cost = BABYLON.Vector3.Distance(this.v0.point, this.v1.point);
	
			// case collapse v0 into v1
			let dotV0IntoV1 = 1;
			this.v0.triangles.forEach(v0Tri => {
				let dot = BABYLON.Vector3.Dot(v0Tri.normal, this.triangles[0].normal);
				for (let i = 1; i < this.triangles.length; i++) {
					dot = Math.min(dot, BABYLON.Vector3.Dot(v0Tri.normal, this.triangles[i].normal))
				}
				dotV0IntoV1 = Math.min(dotV0IntoV1, dot);
			})
			dotV0IntoV1 = Math.max(0, dotV0IntoV1);
			let costV0IntoV1 = this.cost * (1 - dotV0IntoV1 * 1);
			
			// case collapse v1 into v0
			let dotV1IntoV0 = 1;
			this.v1.triangles.forEach(v1Tri => {
				let dot = BABYLON.Vector3.Dot(v1Tri.normal, this.triangles[0].normal);
				for (let i = 1; i < this.triangles.length; i++) {
					dot = Math.min(dot, BABYLON.Vector3.Dot(v1Tri.normal, this.triangles[i].normal))
				}
				dotV1IntoV0 = Math.min(dotV1IntoV0, dot);
			})
			dotV1IntoV0 = Math.max(0, dotV1IntoV0);
			let costV1IntoV0 = this.cost * (1 - dotV1IntoV0 * 1);
	
			if (costV0IntoV1 > costV1IntoV0) {
				this.cost = costV0IntoV1;
			}
			else {
				this.cost = costV1IntoV0;
				let tmp = this.v1;
				this.v1 = this.v0;
				this.v0 = tmp;
			}
		}
	}

	public other(v: Vertex): Vertex {
		if (v === this.v0) {
			return this.v1;
		}
		return this.v0;
	}

	public otherTriangle(t: Triangle): Triangle {
		if (this.triangles.length === 2) {
			if (this.triangles[0] === t) {
				return this.triangles[1];
			}
			return this.triangles[0];
		}
	}

	public replace(vOld: Vertex, vNew: Vertex) {
		if (this.v0 === vOld) {
			this.v0 = vNew;
		}
		if (this.v1 === vOld) {
			this.v1 = vNew;
		}
	}

	public delete(): void {
		this.v0.edges.splice(this.v0.edges.indexOf(this), 1);
		this.v1.edges.splice(this.v1.edges.indexOf(this), 1);

		this.triangles.forEach(tri => {
			this.mesh.triangles.remove(tri);
			tri.vertices.forEach(vertex => {
				vertex.triangles.splice(vertex.triangles.indexOf(tri), 1);
			})
			tri.edges.forEach(edge => {
				if (edge != this) {
					edge.triangles.splice(edge.triangles.indexOf(tri), 1);
				}
			})
		})
		this.mesh.edges.remove(this);

		// sanity check
		/*
		*/
	}

	public isStretched(): boolean {
		if (this.triangles.length === 2) {
			let pivot = this.triangles[0].getVertexWithout(this);
			let last = this.triangles[1].getVertexWithout(this);
			let sqrLen = BABYLON.Vector3.DistanceSquared(pivot.point, last.point);

			if (sqrLen > BABYLON.Vector3.DistanceSquared(this.v0.point, this.v1.point)) {
				return true;
			}
		}
		return false;
	}

	public cross(): void {
		if (this.triangles.length === 2) {

			let tri = [...this.triangles[0].vertices];
			let pivot = this.triangles[0].getVertexWithout(this);

			let last = this.triangles[1].getVertexWithout(this);


			if (tri.indexOf(pivot) === 0) {
				this.delete();
				this.mesh.triangles.push(new Triangle(this.mesh, tri[1], last, tri[0]));
				this.mesh.triangles.push(new Triangle(this.mesh, tri[0], last, tri[2]));
			}
			else if (tri.indexOf(pivot) === 1) {
				//this.delete();
				//this.mesh.triangles.push(new Triangle(this.mesh, tri[2], last, tri[1]));
				//this.mesh.triangles.push(new Triangle(this.mesh, tri[1], last, tri[0]));
			}
			else if (tri.indexOf(pivot) === 2) {
				//this.delete();
				//this.mesh.triangles.push(new Triangle(this.mesh, tri[0], last, tri[2]));
				//this.mesh.triangles.push(new Triangle(this.mesh, tri[2], last, tri[1]));
			}
		}
	}

	public collapse(): void {

		//this.delete();
		//return;

		//console.log("start");
		//console.log("verticesCount = " + this.mesh.vertices.length);
		//console.log("edgesCount = " + this.mesh.edges.length);
		//console.log("triangleCount = " + this.mesh.triangles.length);

		let affectedTriangles = new UniqueList<Triangle>();
		
		this.v1.triangles.forEach(tri => {
			affectedTriangles.push(tri);
		});
		this.triangles.forEach(tri => {
			affectedTriangles.remove(tri);
		});

		//this.v0.point.scaleInPlace(0.8).addInPlace(this.v1.point.scale(0.2));

		let needToRebuildTriangles: Vertex[] = [];
		affectedTriangles.forEach(tri => {
			needToRebuildTriangles.push(...tri.vertices);
		});

		for (let i = 0; i < needToRebuildTriangles.length; i++) {
			if (needToRebuildTriangles[i] === this.v1) {
				needToRebuildTriangles[i] = this.v0;
			}
		}

		this.v1.delete();
		
		for (let i = 0; i < needToRebuildTriangles.length / 3; i++) {
			let tri = new Triangle(this.mesh, needToRebuildTriangles[3 * i], needToRebuildTriangles[3 * i + 1], needToRebuildTriangles[3 * i + 2]);
			this.mesh.triangles.push(tri);
		}

		this.v0.triangles.forEach(tri => {
			tri.computeNormal();
		})

		let others = this.v0.others(1);
	
		others.forEach(vertex => {
			vertex.computeNormal();
		})
		others.forEach(vertex => {
			vertex.computeLocalAltitude();
		})
		
		let edges = new UniqueList<Edge>();
		others.forEach(vertex => {
			vertex.edges.forEach(edge => {
				edges.push(edge);
			})
		});

		edges.forEach(edge => {
			edge.computeCost();
		});

		
		// sanity check
		/*
		this.mesh.triangles.forEach(tri => {
			tri.edges.forEach(edge => {
				if (!this.mesh.edges.contains(edge)) {
					debugger;
				}
			})
			tri.vertices.forEach(vertex => {
				if (!this.mesh.vertices.contains(vertex)) {
					debugger;
				}
			})
		})
		this.mesh.edges.forEach(edge => {
			edge.triangles.forEach(tri => {
				if (!this.mesh.triangles.contains(tri)) {
					debugger;
				}
			})
			if (!this.mesh.vertices.contains(edge.v0)) {
				debugger;
			}
			if (!this.mesh.vertices.contains(edge.v1)) {
				debugger;
			}
		})
		*/
		
		//console.log("verticesCount = " + this.mesh.vertices.length);
		//console.log("edgesCount = " + this.mesh.edges.length);
		//console.log("triangleCount = " + this.mesh.triangles.length);
		//console.log("end");
	}
}