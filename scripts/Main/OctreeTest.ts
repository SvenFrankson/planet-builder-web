/// <reference path="../../lib/babylon.d.ts"/>

class Vertex {

	public point: BABYLON.Vector3;
	public tmp: BABYLON.Vector3;
	public edges: Edge[] = [];
	public triangles: Triangle[] = [];

	constructor(public mesh: HeavyMesh, x: number, y: number, z: number) {
		this.point = new BABYLON.Vector3(x, y, z);
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

class Edge {

	public v0: Vertex;
	public v1: Vertex;
	public triangles: Triangle[] = [];

	constructor(public mesh: HeavyMesh, v0: Vertex, v1: Vertex) {
		this.v0 = v0;
		this.v1 = v1;
		this.mesh.edges.push(this);
	}

	public static Connect(v0: Vertex, v1: Vertex): Edge {
		let edge = v0.getEdge(v1);
		if (!edge) {
			edge = new Edge(v0.mesh, v0, v1);
			v0.edges.push(edge);
			v1.edges.push(edge);
		}
		return edge;
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

	public collapse(): void {

		//console.log("start");
		//console.log("verticesCount = " + this.mesh.vertices.length);
		//console.log("edgesCount = " + this.mesh.edges.length);
		//console.log("triangleCount = " + this.mesh.triangles.length);

		this.mesh.vertices.remove(this.v1);
		this.triangles.forEach(tri => {
			this.mesh.triangles.remove(tri);
		})
		this.mesh.edges.remove(this);
		
		let affectedTriangles = new UniqueList<Triangle>();
		this.v0.triangles.forEach(tri => {
			affectedTriangles.push(tri);
		});
		this.v1.triangles.forEach(tri => {
			affectedTriangles.push(tri);
		});
		this.triangles.forEach(tri => {
			affectedTriangles.remove(tri);
		})
		//console.log("AffectedTriangles " + affectedTriangles.length);

		let Aedges: Edge[] = [];
		let Bedges: Edge[] = [];

		this.triangles.forEach(tri => {
			Aedges.push(tri.getEdgeWithout(this.v1));
			let bEdge = tri.getEdgeWithout(this.v0);
			this.mesh.edges.remove(bEdge);
			Bedges.push(bEdge);
		});

		//console.log("Aedges " + Aedges.length);
		//console.log("Bedges " + Bedges.length);

		if (Aedges.length != Bedges.length) {
			debugger;
		}
		if (Aedges.length > 2 || Bedges.length > 2) {
			debugger;
		}

		affectedTriangles.forEach(tri => {
			tri.replace(this.v1, this.v0);
			for (let i = 0; i < Aedges.length; i++) {
				tri.replaceEdge(Bedges[i], Aedges[i]);
			}
		});

		this.v1.edges.forEach(edge => {
			edge.replace(this.v1, this.v0);
		});

		// sanity check
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
		
		//console.log("verticesCount = " + this.mesh.vertices.length);
		//console.log("edgesCount = " + this.mesh.edges.length);
		//console.log("triangleCount = " + this.mesh.triangles.length);
		//console.log("end");
	}
}

class Triangle {

	public vertices: Vertex[];
	public edges: Edge[];

	constructor(public mesh: HeavyMesh, v0: Vertex, v1: Vertex, v2: Vertex) {
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
		if (this.edges[0].triangles.length > 2) {
			console.warn("!");
		}
		if (this.edges[1].triangles.length > 2) {
			console.warn("!");
		}
		if (this.edges[2].triangles.length > 2) {
			console.warn("!");
		}
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

	public replaceEdge(eOld: Edge, eNew: Edge) {
		if (this.edges[0] === eOld) {
			this.edges[0] = eNew;
		}
		else if (this.edges[1] === eOld) {
			this.edges[1] = eNew;
		}
		else if (this.edges[2] === eOld) {
			this.edges[2] = eNew;
		}
	}
}

class HeavyMesh {

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
			this.triangles.push(new Triangle(this, this.vertices.get(v0), this.vertices.get(v1), this.vertices.get(v2)));
		}
	}

	public rebuildEdges(): void {
		this.edges = new UniqueList<Edge>();
		this.triangles.forEach(tri => {
			tri.edges.forEach(edge => {
				this.edges.push(edge);
			})
		})
	}

	public getPositions(): number[] {
		let positions = [];
		for (let i = 0; i < this.vertices.length; i++) {
			positions.push(this.vertices.get(i).point.x, this.vertices.get(i).point.y, this.vertices.get(i).point.z);
		}
		return positions;
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
			let others = vertex.others(2);
			others.forEach(other => {
				vertex.tmp.addInPlace(other.point);
			});
			vertex.tmp.scaleInPlace(1 / (f + others.length));
		}

		for (let i = 0; i < this.vertices.length; i++) {
			let vertex = this.vertices.get(i);
			vertex.point.copyFrom(vertex.tmp);
		}
	}
}

class OctreeToMesh {

	public blocks: number[][][] = [];
	public vertices: number[][][] = [];

	public get(i: number, j: number, k: number): number {
		if (this.blocks[i]) {
			if (this.blocks[i][j]) {
				return this.blocks[i][j][k];
			}
		}
	}

	public getVertex(i: number, j: number, k: number): number {
		if (this.vertices[i]) {
			if (this.vertices[i][j]) {
				return this.vertices[i][j][k];
			}
		}
	}

	public add(v: number, i: number, j: number, k: number): void {
		if (!this.blocks[i]) {
			this.blocks[i] = [];
		}
		if (!this.blocks[i][j]) {
			this.blocks[i][j] = [];
		}
		if (isNaN(this.blocks[i][j][k])) {
			this.blocks[i][j][k] = 0;
		}
		this.blocks[i][j][k] |= v;
	}

	public set(v: number, i: number, j: number, k: number): void {
		if (!this.blocks[i]) {
			this.blocks[i] = [];
		}
		if (!this.blocks[i][j]) {
			this.blocks[i][j] = [];
		}
		this.blocks[i][j][k] = v;
	}

	public setVertex(v: number, i: number, j: number, k: number): void {
		if (!this.vertices[i]) {
			this.vertices[i] = [];
		}
		if (!this.vertices[i][j]) {
			this.vertices[i][j] = [];
		}
		this.vertices[i][j][k] = v;
	}

	public buildMesh(): BABYLON.VertexData {
		let vertexData = new BABYLON.VertexData();
		let positions: number[] = [];
		let indices: number[] = [];
		let normals: number[] = [];

		for (let i = 0; i < this.blocks.length; i++) {
			let iLine = this.blocks[i];
			if (iLine) {
				for (let j = 0; j < iLine.length; j++) {
					let jLine = iLine[j];
					if (jLine) {
						for (let k = 0; k < jLine.length; k++) {
							let value = jLine[k];
							if (isFinite(value) && value != 0 && value != 0b11111111) {
								//console.log(value.toString(2));
								let extendedpartVertexData = PlanetChunckVertexData.Get(2, value);
								if (extendedpartVertexData) {
									let vData = extendedpartVertexData.vertexData;
									let partIndexes = [];
									for (let p = 0; p < vData.positions.length / 3; p++) {
										let x = vData.positions[3 * p] + i;
										let y = vData.positions[3 * p + 1] + j;
										let z = vData.positions[3 * p + 2] + k;

										let existingIndex = this.getVertex(Math.round(2 * x), Math.round(2 * y), Math.round(2 * z));
										if (isFinite(existingIndex)) {
											partIndexes[p] = existingIndex;
										}
										else {
											let l = positions.length / 3;
											partIndexes[p] = l;
											positions.push(x, y, z);
											this.setVertex(l, Math.round(2 * x), Math.round(2 * y), Math.round(2 * z))
										}
	
									}
									//console.log(partIndexes);
									indices.push(...vData.indices.map(index => { return partIndexes[index]; }));
								}
							}
						}
					}
				}
			}
		}

		for (let n = 0; n < 0; n++) {
			let smoothedPositions = positions.map(v => { return 0; })
			let count = positions.map(v => { return 0; });
			let sf = 1;
			for (let t = 0; t < indices.length / 3; t++) {
				let p0 = indices[3 * t];
				let p1 = indices[3 * t + 1];
				let p2 = indices[3 * t + 2];
	
				let x0 = positions[3 * p0];
				let y0 = positions[3 * p0 + 1];
				let z0 = positions[3 * p0 + 2];
				let x1 = positions[3 * p1];
				let y1 = positions[3 * p1 + 1];
				let z1 = positions[3 * p1 + 2];
				let x2 = positions[3 * p2];
				let y2 = positions[3 * p2 + 1];
				let z2 = positions[3 * p2 + 2];
	
				smoothedPositions[3 * p0 + 0] += sf * x0 + x1 + x2;
				count[3 * p0 + 0] += 2 + sf;
				smoothedPositions[3 * p0 + 1] += sf * y0 + y1 + y2;
				count[3 * p0 + 1] += 2 + sf;
				smoothedPositions[3 * p0 + 2] += sf * z0 + z1 + z2;
				count[3 * p0 + 2] += 2 + sf;
	
				smoothedPositions[3 * p1 + 0] += x0 + sf * x1 + x2;
				count[3 * p1 + 0] += 2 + sf;
				smoothedPositions[3 * p1 + 1] += y0 + sf * y1 + y2;
				count[3 * p1 + 1] += 2 + sf;
				smoothedPositions[3 * p1 + 2] += z0 + sf * z1 + z2;
				count[3 * p1 + 2] += 2 + sf;
	
				smoothedPositions[3 * p2 + 0] += x0 + x1 + sf * x2;
				count[3 * p2 + 0] += 2 + sf;
				smoothedPositions[3 * p2 + 1] += y0 + y1 + sf * y2;
				count[3 * p2 + 1] += 2 + sf;
				smoothedPositions[3 * p2 + 2] += z0 + z1 + sf * z2;
				count[3 * p2 + 2] += 2 + sf;
			}
			positions = smoothedPositions.map((v, index) => { return v / count[index]; });
		}

		let mesh = new HeavyMesh(positions, indices);
		mesh.smooth(1);

		for (let n = 0; n < 100; n++) {
			let index = Math.floor(Math.random() * mesh.edges.length);
			mesh.edges.get(index).collapse();
		}

		mesh.smooth(1);

		vertexData.positions = mesh.getPositions();
		vertexData.indices = mesh.getIndices();

		BABYLON.VertexData.ComputeNormals(vertexData.positions, vertexData.indices, normals);
		vertexData.normals = normals;

		return vertexData;
	}
}

class OctreeTest extends Main {

	public camera: BABYLON.ArcRotateCamera;
	public planet: BABYLON.Mesh;

	public createScene(): void {
		
		Config.chunckPartConfiguration.setFilename("chunck-parts", false);
		Config.chunckPartConfiguration.useXZAxisRotation = true;
		Config.chunckPartConfiguration.setLodMin(2);
		Config.chunckPartConfiguration.setLodMax(2);

		Main.Scene = new BABYLON.Scene(Main.Engine);
		this.scene = Main.Scene;
        
        this.vertexDataLoader = new VertexDataLoader(this.scene);
        this.inputManager = new InputManager(this.scene, this.canvas, this);

		let light = new BABYLON.HemisphericLight(
			"light",
			new BABYLON.Vector3(0.6, 1, 0.3),
			this.scene
		);
		light.diffuse = new BABYLON.Color3(1, 1, 1);
		light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);

		this.camera = new BABYLON.ArcRotateCamera("camera", 5 * Math.PI / 4, Math.PI / 4, 20, BABYLON.Vector3.Zero(), this.scene);
		this.camera.attachControl(this.canvas);

		this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
	}

	public makeLine(root: OctreeNode<number>, p0: BABYLON.Vector3, p1: BABYLON.Vector3, d: number): void {
		let pMin = BABYLON.Vector3.Minimize(p0, p1);
		pMin.x -= d;
		pMin.y -= d;
		pMin.z -= d;
		let pMax = BABYLON.Vector3.Maximize(p0, p1);
		pMax.x += d;
		pMax.y += d;
		pMax.z += d;

		let n = p1.subtract(p0).normalize();

		let di = pMax.x - pMin.x;
		let dj = pMax.y - pMin.y;
		let dk = pMax.z - pMin.z;

		for (let i = 0; i <= di; i++) {
			for (let j = 0; j <= dj; j++) {
				for (let k = 0; k <= dk; k++) {
					let p = new BABYLON.Vector3(i, j, k);
					p.addInPlace(pMin).subtractInPlace(p0);
					let dot = BABYLON.Vector3.Dot(p, n);
					let p2 = n.scale(dot);
					let pDist = BABYLON.Vector3.Distance(p, p2);
					if (pDist <= d) {
						let I = pMin.x + i;
						let J = pMin.y + j;
						let K = pMin.z + k;
						if (I >= 0 && J >= 0 && K >= 0) {
							if (I < root.size && J < root.size && K < root.size) {
								root.set(42, I, J, K);
							}
						}
					}
				}
			}
		}
	}

    public async initialize(): Promise<void> {
		return new Promise<void>(async resolve => {
			await PlanetChunckVertexData.InitializeData();

			let N = 6;
			let S = Math.pow(2, N);

            let root = new OctreeNode<number>(N);
			let prev = new BABYLON.Vector3(Math.floor(0.5 * S), 0, Math.floor(0.5 * S));
			
			for (let n = 0; n < 12; n++) {
				let next = prev.clone();
				next.x += Math.random() * 10 - 5;
				next.y += 10;
				next.z += Math.random() * 10 - 5;
				this.makeLine(
					root,
					prev,
					next,
					2
				);
				prev = next;
			}
			
			root.set(42, Math.floor(S * 0.5), Math.floor(S * 0.5), Math.floor(S * 0.5));
            
			let serial = root.serializeToString();
			let clonedRoot = OctreeNode.DeserializeFromString(serial);
			let clonedSerial = clonedRoot.serializeToString();
			
			if (false) {
				clonedRoot.forEachNode((node) => {
					let cube = BABYLON.MeshBuilder.CreateBox("cube", {size: node.size * 0.99});
					let material = new BABYLON.StandardMaterial("cube-material");
					material.alpha = (1 - node.degree / (N + 1)) * 0.5;
					cube.material = material;
					cube.position.x = node.i * node.size + node.size * 0.5 - S * 0.5;
					cube.position.y = node.k * node.size + node.size * 0.5 - S * 0.5;
					cube.position.z = node.j * node.size + node.size * 0.5 - S * 0.5;
				});
			}
            
			let meshMaker = new OctreeToMesh();
            clonedRoot.forEach((v, i, j, k) => {
                if (v > 0) {
                    //let cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 0.99 });
                    //cube.position.x = i + 0.5 - S * 0.5;
                    //cube.position.y = k + 0.5 - S * 0.5;
                    //cube.position.z = j + 0.5 - S * 0.5;
					// v |= (0b1 << i);
					meshMaker.add(0b1 << 6, i, j, k);
					meshMaker.add(0b1 << 7, i + 1, j, k);
					meshMaker.add(0b1 << 4, i + 1, j, k + 1);
					meshMaker.add(0b1 << 5, i, j, k + 1);
					meshMaker.add(0b1 << 2, i, j + 1, k);
					meshMaker.add(0b1 << 3, i + 1, j + 1, k);
					meshMaker.add(0b1 << 0, i + 1, j + 1, k + 1);
					meshMaker.add(0b1 << 1, i, j + 1, k + 1);
                }
            });

			let data = meshMaker.buildMesh();
			let mesh = new BABYLON.Mesh("mesh");
			mesh.position.x -= S * 0.5;
			mesh.position.y -= S * 0.5;
			mesh.position.z -= S * 0.5;
			data.applyToMesh(mesh);

			console.log(serial);
			console.log(clonedSerial);
			console.log(serial === clonedSerial);

			resolve();
		})
	}

	public update(): void {
        
	}
}
