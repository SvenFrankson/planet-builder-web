/// <reference path="../../lib/babylon.d.ts"/>

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

	public exMesh: ExtendedMesh;

	public buildMesh(smoothCount: number, maxTriangles: number = Infinity, minCost: number = 0): BABYLON.VertexData {
		this.vertices = [];

		let vertexData = new BABYLON.VertexData();
		let positions: number[] = [];
		let indices: number[] = [];

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

										let existingIndex = this.getVertex(Math.round(10 * x), Math.round(10 * y), Math.round(10 * z));
										if (isFinite(existingIndex)) {
											partIndexes[p] = existingIndex;
										}
										else {
											let l = positions.length / 3;
											partIndexes[p] = l;
											positions.push(x, y, z);
											this.setVertex(l, Math.round(10 * x), Math.round(10 * y), Math.round(10 * z))
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

		for (let i = 0; i < positions.length; i++) {
			//positions[i] += (Math.random() - 0.5) * 0.2;
		}

		this.exMesh = new ExtendedMesh(positions, indices);

		console.log("initial tri count = " + this.exMesh.triangles.length);
		let l = this.exMesh.triangles.length;

		for (let n = 0; n < smoothCount; n++) {
			this.exMesh.scaleAltitude(0.5);
		}

		this.exMesh.smooth(0);
		this.exMesh.smooth(0);
		this.exMesh.sortEdges();

		let t0 = performance.now();
		while (this.exMesh.triangles.length > maxTriangles) {
			this.exMesh.edges.get(0).collapse();
			this.exMesh.sortEdges();
		}
		while (this.exMesh.edges.get(0).cost < minCost) {
			this.exMesh.edges.get(0).collapse();
			this.exMesh.sortEdges();
		}
		let t1 = performance.now();
		console.log((t1 - t0).toFixed(3));

		this.exMesh.sanityCheck();
		
		this.exMesh.triangles.forEach(tri => {
			tri.computeNormal();
		});
		this.exMesh.vertices.forEach(vertex => {
			vertex.computeNormal();
		});
		this.exMesh.edges.forEach(edge => {
			edge.computeCost();
		});
		this.exMesh.sortEdges();

		//this.heavyMesh.edges.get(0).delete();

		console.log("decimated min cost = " + this.exMesh.edges.get(0).cost);
		console.log("decimated tri count = " + this.exMesh.triangles.length);

		//this.heavyMesh.smooth(0.5);

		vertexData.positions = this.exMesh.getPositions();
		vertexData.indices = this.exMesh.getIndices();
		vertexData.normals = this.exMesh.getNormals();

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
			new BABYLON.Vector3(0, 1, 0),
			this.scene
		);
		light.diffuse = new BABYLON.Color3(1, 1, 1);
		light.groundColor = new BABYLON.Color3(0, 0, 0);

		this.camera = new BABYLON.ArcRotateCamera("camera", 5 * Math.PI / 4, Math.PI / 4, 20, BABYLON.Vector3.Zero(), this.scene);
		this.camera.attachControl(this.canvas);

		this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
	}

	public makeBall(root: OctreeNode<number>, center: BABYLON.Vector3, radius: number): void {
		let n = Math.ceil(radius);
		let rr = radius * radius;

		for (let i = - n; i <= n; i++) {
			for (let j = - n; j <= n; j++) {
				for (let k = - n; k <= n; k++) {
					let sqrDist = i * i + j * j + k * k;
					
					if (sqrDist <= rr) {
						let I = center.x + i;
						let J = center.y + j;
						let K = center.z + k;
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

	public makeLine(root: OctreeNode<number>, p0: BABYLON.Vector3, p1: BABYLON.Vector3, d: number): void {
		let l = BABYLON.Vector3.Distance(p0, p1);

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
					let ok = false;

					let p = new BABYLON.Vector3(i, j, k);
					p.addInPlace(pMin).subtractInPlace(p0);
					let dot = BABYLON.Vector3.Dot(p, n);
					if (dot >= 0 && dot <= l) {
						let p2 = n.scale(dot);
						let pDist = BABYLON.Vector3.Distance(p, p2);
						if (pDist <= d) {
							ok = true;
						}
					}
					else {
						if (BABYLON.Vector3.Distance(p, p0) <= d) {
							ok = true;
						}
						if (BABYLON.Vector3.Distance(p, p1) <= d) {
							ok = true;
						}
					}
					
					if (ok) {
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
			

			this.makeBall(
				root,
				new BABYLON.Vector3(Math.floor(0.5 * S), Math.floor(0.5 * S), Math.floor(0.5 * S)),
				8
			);

			let prev = new BABYLON.Vector3(Math.floor(0.5 * S), Math.floor(0.5 * S), Math.floor(0.5 * S));
			prev.x = Math.round(prev.x);
			prev.y = Math.round(prev.y);
			prev.z = Math.round(prev.z);
			
			let points = [prev.clone()];
			for (let n = 0; n < 24; n++) {
				let next = prev.clone();
				next.x += Math.random() * 16 - 8;
				next.y += Math.random() * 16 - 8;
				next.z += Math.random() * 16 - 8;
				next.x = Math.round(next.x);
				next.y = Math.round(next.y);
				next.z = Math.round(next.z);
				points.push(next.clone());
				this.makeLine(
					root,
					prev,
					next,
					2
				);
				prev = points[Math.floor(Math.random() * points.length)];
			}
			
			//root.set(42, Math.floor(S * 0.5), Math.floor(S * 0.5), Math.floor(S * 0.5));
            
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

			/*
			let data = meshMaker.buildMesh(0);
			let mesh = new BABYLON.Mesh("mesh");
			mesh.position.x -= S;
			mesh.position.y -= S * 0.5;
			mesh.position.z -= S * 0.5;
			data.applyToMesh(mesh);

			mesh.enableEdgesRendering(1);
			mesh.edgesWidth = 4.0;
			mesh.edgesColor = new BABYLON.Color4(0, 0, 1, 1);

			let data2 = meshMaker.buildMesh(0, 1000);
			let mesh2 = new BABYLON.Mesh("mesh2");
			mesh2.position.x = 0;
			mesh2.position.y -= S * 0.5;
			mesh2.position.z -= S * 0.5;
			data2.applyToMesh(mesh2);

			mesh2.enableEdgesRendering(1);
			mesh2.edgesWidth = 4.0;
			mesh2.edgesColor = new BABYLON.Color4(0, 0, 1, 1);
			*/

			let data3 = meshMaker.buildMesh(0, Infinity, 0.5);
			let mesh3 = new BABYLON.Mesh("mesh3");
			mesh3.position.x -= S * 0.5;
			mesh3.position.y -= S * 0.5;
			mesh3.position.z -= S * 0.5;
			data3.applyToMesh(mesh3);

			mesh3.enableEdgesRendering(1);
			mesh3.edgesWidth = 4.0;
			mesh3.edgesColor = new BABYLON.Color4(0, 0, 1, 1);

			console.log(serial);
			console.log(clonedSerial);
			console.log(serial === clonedSerial);

			meshMaker.exMesh.vertices.forEach(vertex => {
				let cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 0.1 });
				cube.position.copyFrom(vertex.point);
				cube.position.x -= S * 0.5;
				cube.position.y -= S * 0.5;
				cube.position.z -= S * 0.5;
				cube.rotation.x = Math.random() * Math.PI;
				cube.rotation.y = Math.random() * Math.PI;
				cube.rotation.z = Math.random() * Math.PI;
			});

			resolve();
		})
	}

	public update(): void {
        
	}
}
