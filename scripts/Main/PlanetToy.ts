/// <reference path="../../lib/babylon.d.ts"/>
/// <reference path="Main.ts"/>

class PlanetToy extends Main {

	public createScene(): void {
		super.createScene();

		let light = new BABYLON.HemisphericLight(
			"light",
			new BABYLON.Vector3(0.6, 1, 0.3),
			this.scene
		);
		light.diffuse = new BABYLON.Color3(1, 1, 1);
		light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);

		let camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, BABYLON.Vector3.Zero(), this.scene);
		camera.setPosition(new BABYLON.Vector3(5, 10, -15));
		camera.attachControl(this.canvas);

		this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
	}

    public async initialize(): Promise<void> {
		return new Promise<void>(resolve => {
			let core = BABYLON.MeshBuilder.CreateSphere("core", { diameter: 20 }, this.scene);
			let blackMat = new BABYLON.StandardMaterial("black", this.scene);
			blackMat.diffuseColor = BABYLON.Color3.Black();
			blackMat.specularColor = BABYLON.Color3.Black();
			core.material = blackMat;
			
			let XMesh = BABYLON.MeshBuilder.CreateLines(
				"XAxis",
				{
					points: [new BABYLON.Vector3(1, 0, 0), new BABYLON.Vector3(14, 0, 0), new BABYLON.Vector3(14, 0, 1), new BABYLON.Vector3(15, 0, 0), new BABYLON.Vector3(14, 0, - 1)]
				}
			)
			let YMesh = BABYLON.MeshBuilder.CreateLines(
				"YAxis",
				{
					points: [new BABYLON.Vector3(0, 1, 0), new BABYLON.Vector3(0, 14, 0),  new BABYLON.Vector3(1, 14, 0),  new BABYLON.Vector3(0, 15, 0), new BABYLON.Vector3(-1, 14, 0)]
				}
			)
			let ZMesh = BABYLON.MeshBuilder.CreateLines(
				"ZAxis",
				{
					points: [new BABYLON.Vector3(0, 0, 1), new BABYLON.Vector3(0, 0, 14), new BABYLON.Vector3(1, 0, 14), new BABYLON.Vector3(0, 0, 15), new BABYLON.Vector3(-1, 0, 14)]
				}
			)

			let vertices = [];
			for (let i = 0; i <= 16; i++) {
				vertices[i] = [];
				for (let j = 0; j <= 16; j++) {
					vertices[i][j] = PlanetTools.EvaluateVertex(16, i, j);
				}
			}
			let lines = [];
			let colors = [];
			let n = 16;
			for (let i = 0; i < n; i++) {
				for (let j = 0; j < n; j++) {
					let v0 = vertices[i][j].clone();
					let v1 = vertices[i + 1][j].clone();
					let v2 = vertices[i + 1][j + 1].clone();
					let v3 = vertices[i][j + 1].clone();
					let center = v0.add(v1).add(v2).add(v3).scale(0.25).scale(0.1);
					v0.scaleInPlace(0.9).addInPlace(center).scaleInPlace(10);
					v1.scaleInPlace(0.9).addInPlace(center).scaleInPlace(10);
					v2.scaleInPlace(0.9).addInPlace(center).scaleInPlace(10);
					v3.scaleInPlace(0.9).addInPlace(center).scaleInPlace(10);
					lines.push([v0, v1, v2, v3, v0]);
					if (j === 0) {
						v0 = vertices[i][j].clone();
						v1 = vertices[i + 1][j].clone();
						v2 = vertices[i + 1][j + 1].clone();
						v3 = vertices[i][j + 1].clone();
						center = v0.add(v1).add(v2).add(v3).scale(0.25).scale(0.5);
						v0.scaleInPlace(0.5).addInPlace(center).scaleInPlace(10);
						v1.scaleInPlace(0.5).addInPlace(center).scaleInPlace(10);
						v2.scaleInPlace(0.5).addInPlace(center).scaleInPlace(10);
						v3.scaleInPlace(0.5).addInPlace(center).scaleInPlace(10);
						lines.push([v0, v1, v2, v3, v0]);
					}

					let d = i + j;
					let r = 1;
					let g = 1;
					let b = 1;
					if (d <= n - 1) {
						g = d / n;
					}
					else if (d > n - 1) {
						r = 1 - (d - n) / n;
					}
					let c = new BABYLON.Color4(r, g, b, 1);
					colors.push([c, c, c, c, c]);
					if (j === 0) {
						colors.push([c, c, c, c, c]);
					}
				}
			}
			for (let i = 0; i < 6; i++) {
				let face = BABYLON.MeshBuilder.CreateLineSystem(
					"Top",
					{
						lines: lines,
						colors: colors
					},
					this.scene
				);
				face.rotationQuaternion = PlanetTools.QuaternionForSide(i);
				face.computeWorldMatrix(true);
				face.position.addInPlace(face.up);
			}
			resolve();
		})
	}

	public update(): void {
		
	}
}
