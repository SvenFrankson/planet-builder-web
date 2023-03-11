/// <reference path="../../lib/babylon.d.ts"/>

class OctreeTest extends Main {

	public camera: BABYLON.ArcRotateCamera;
	public planet: BABYLON.Mesh;

	public createScene(): void {

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
								root.set(1, I, J, K);
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
								root.set(1, I, J, K);
							}
						}
					}
				}
			}
		}
	}

    public async initialize(): Promise<void> {

		let axisX = BABYLON.MeshBuilder.CreateBox("axisX", { width: 20, height: 0.05, depth: 0.05 });
		axisX.material = SharedMaterials.RedMaterial();

		let axisY = BABYLON.MeshBuilder.CreateBox("axisY", { width: 0.05, height: 20, depth: 0.05 });
		axisY.material = SharedMaterials.GreenMaterial();

		let axisZ = BABYLON.MeshBuilder.CreateBox("axisZ", { width: 0.05, height: 0.05, depth: 20 });
		axisZ.material = SharedMaterials.BlueMaterial();

		return new Promise<void>(async resolve => {
			await PlanetChunckVertexData.InitializeData();
			await VoxelVertexData.InitializeData();

			let meshMaker = new VoxelMesh(6);
			
			let x = 0;
			let y = 0;
			let z = 0;
			for (let n = 0; n < 0; n++) {
				meshMaker.addCube(
					1,
					new BABYLON.Vector3(x, y, z),
					1.9
				);
				y += 1;
			}

			meshMaker.addCube(
				1,
				BABYLON.Vector3.Zero(),
				3
			);

			meshMaker.addCube(
				1,
				BABYLON.Vector3.Zero(),
				2
			);

			meshMaker.addCube(
				1,
				BABYLON.Vector3.Zero(),
				1
			);

			let prev = BABYLON.Vector3.Zero();
			prev.x = Math.round(prev.x);
			prev.y = Math.round(prev.y);
			prev.z = Math.round(prev.z);
			
			let points = [prev.clone()];
			for (let n = 0; n < 0; n++) {
				let next = prev.clone();
				next.x += Math.random() * 16 - 8;
				next.y += Math.random() * 8;
				next.z += Math.random() * 16 - 8;
				next.x = Math.round(next.x);
				next.y = Math.round(next.y);
				next.z = Math.round(next.z);
				points.push(next.clone());
				this.makeLine(
					meshMaker.root,
					prev,
					next,
					1
				);
				prev = points[Math.floor(Math.random() * points.length)];
				prev = next;
			}
			
			//meshMaker.root.set(1, Math.floor(S * 0.5), Math.floor(S * 0.5), Math.floor(S * 0.5));
            
			let serial = meshMaker.root.serializeToString();
			let clonedRoot = OctreeNode.DeserializeFromString(serial);
			let clonedSerial = clonedRoot.serializeToString();
			
			if (false) {
				clonedRoot.forEachNode((node) => {
					let cube = BABYLON.MeshBuilder.CreateBox("cube", {size: node.size * 0.99});
					let material = new BABYLON.StandardMaterial("cube-material");
					material.alpha = (1 - node.degree / (meshMaker.degree + 1)) * 0.5;
					cube.material = material;
					cube.position.x = node.i * node.size + node.size * 0.5;
					cube.position.y = node.k * node.size + node.size * 0.5;
					cube.position.z = node.j * node.size + node.size * 0.5;
				});
			}

			let data3 = meshMaker.buildMesh(0, undefined, Infinity, 0);
			let mesh3 = new BABYLON.Mesh("mesh3");
			data3.applyToMesh(mesh3);

			let decimator = new BABYLON.QuadraticErrorSimplification(mesh3);
			decimator.simplify({ quality: 0.3, distance: 0 }, (simplifiedMesh: BABYLON.Mesh) => {
				console.log("done");
				simplifiedMesh.isVisible = true;
				simplifiedMesh.position.copyFrom(mesh3.position);
				simplifiedMesh.position.x += 10;
			});

			console.log(serial);
			console.log(clonedSerial);
			console.log(serial === clonedSerial);

			meshMaker.exMesh.vertices.forEach(vertex => {
				let cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 0.1 });
				cube.position.copyFrom(vertex.point);
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
