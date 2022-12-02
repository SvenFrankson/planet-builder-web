/// <reference path="../../lib/babylon.d.ts"/>

class PlanetToy extends Main {

	public camera: BABYLON.ArcRotateCamera;
	public planet: BABYLON.Mesh;

	public createScene(): void {
		super.createScene();

		let light = new BABYLON.HemisphericLight(
			"light",
			new BABYLON.Vector3(0.6, 1, 0.3),
			this.scene
		);
		light.diffuse = new BABYLON.Color3(1, 1, 1);
		light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);

		this.camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, BABYLON.Vector3.Zero(), this.scene);
		this.camera.radius = 20;
		this.camera.attachControl(this.canvas);

		this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
	}

    public async initialize(): Promise<void> {
		return new Promise<void>(resolve => {
			let core = BABYLON.MeshBuilder.CreateSphere("core", { diameter: 19.5 }, this.scene);
			let blackMat = new BABYLON.StandardMaterial("black", this.scene);
			blackMat.diffuseColor = BABYLON.Color3.Black();
			blackMat.specularColor = BABYLON.Color3.Black();
			core.material = blackMat;
			
			/*
			let XMesh = BABYLON.MeshBuilder.CreateLines(
				"XAxis",
				{
					points: [new BABYLON.Vector3(1, 0, 0), new BABYLON.Vector3(14, 0, 0), new BABYLON.Vector3(14, 0, 1), new BABYLON.Vector3(15, 0, 0), new BABYLON.Vector3(14, 0, - 1)]
				}
			)
			let ZMesh = BABYLON.MeshBuilder.CreateLines(
				"ZAxis",
				{
					points: [new BABYLON.Vector3(0, 0, 1), new BABYLON.Vector3(0, 0, 14), new BABYLON.Vector3(1, 0, 14), new BABYLON.Vector3(0, 0, 15), new BABYLON.Vector3(-1, 0, 14)]
				}
			)
			let YMesh = BABYLON.MeshBuilder.CreateLines(
				"YAxis",
				{
					points: [new BABYLON.Vector3(0, -100, 0), new BABYLON.Vector3(0, 100, 0)]
				}
			)
			*/

			let vertices = [];
			let n = 8;
			for (let i = 0; i <= n; i++) {
				vertices[i] = [];
				for (let j = 0; j <= n; j++) {
					vertices[i][j] = PlanetTools.EvaluateVertex(n, i, j);
				}
			}
			let lines = [];
			let colors = [];
			for (let i = 0; i < n - 0; i++) {
				for (let j = 0; j < n - 0; j++) {
					let v0 = vertices[i][j].clone();
					let v1 = vertices[i + 1][j].clone();
					let v2 = vertices[i + 1][j + 1].clone();
					let v3 = vertices[i][j + 1].clone();
					let h = Math.floor(Math.random() * 3) * 0.3;
					v0.scaleInPlace(10);
					v1.scaleInPlace(10);
					v2.scaleInPlace(10);
					v3.scaleInPlace(10);
					lines.push([v0, v1, v2, v3, v0]);
					
					let c = new BABYLON.Color4(1, 1, 1, 1);
					colors.push([c, c, c, c, c]);
				}
			}

			this.planet = new BABYLON.Mesh("planet", this.scene);
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
				face.parent = this.planet;
			}
			resolve();
		})
	}

	public periodPlanet = 7 * 1.5;
	private _tPlanet: number = 0;
	
	public periodCamera = 11 * 1.5;
	private _tCamera: number = 0;

	public update(): void {
		/*
		this._tPlanet += this.engine.getDeltaTime() / 1000;
		if (this._tPlanet > this.periodPlanet) {
			this._tPlanet -= this.periodPlanet;
		}
		this.planet.rotation.y = Math.PI * 2 * (this._tPlanet / this.periodPlanet);

		this._tCamera += this.engine.getDeltaTime() / 1000;
		if (this._tCamera > this.periodCamera) {
			this._tCamera -= this.periodCamera;
		}
		this.camera.beta = Math.PI / 2 + Math.PI / 6 * Math.sin(this._tCamera / this.periodCamera * 2 * Math.PI);
		*/
	}
}
