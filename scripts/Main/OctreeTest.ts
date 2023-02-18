/// <reference path="../../lib/babylon.d.ts"/>

class OctreeToMesh {

	public blocks: number[][][] = [];

	public get(i: number, j: number, k: number): number {
		if (this.blocks[i]) {
			if (this.blocks[i][j]) {
				return this.blocks[i][j][k];
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
								console.log(value.toString(2));
								let extendedpartVertexData = PlanetChunckVertexData.Get(2, value);
								if (extendedpartVertexData) {
									let vData = extendedpartVertexData.vertexData;
									let l = positions.length / 3;
									for (let p = 0; p < vData.positions.length / 3; p++) {
										positions.push(vData.positions[3 * p] + i);
										positions.push(vData.positions[3 * p + 1] + j);
										positions.push(vData.positions[3 * p + 2] + k);
	
										normals.push(vData.normals[3 * p]);
										normals.push(vData.normals[3 * p + 1]);
										normals.push(vData.normals[3 * p + 2]);
									}
									indices.push(...vData.indices.map(index => { return index + l; }));
								}
							}
						}
					}
				}
			}
		}

		vertexData.positions = positions;
		vertexData.indices = indices;
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
		let pMax = BABYLON.Vector3.Maximize(p0, p1);
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
						root.set(42, pMin.x + i, pMin.y + j, pMin.z + k);
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
			let prev = new BABYLON.Vector3(Math.floor(Math.random() * S), Math.floor(Math.random() * S), Math.floor(Math.random() * S));
			for (let n = 0; n < 80; n++) {
				let next = new BABYLON.Vector3(Math.floor(Math.random() * S), Math.floor(Math.random() * S), Math.floor(Math.random() * S));
				this.makeLine(
					root,
					prev,
					next,
					1 + 2 * Math.random()
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
