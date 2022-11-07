/// <reference path="../../lib/babylon.d.ts"/>
/// <reference path="Main.ts"/>

class ChunckTest extends Main {

	public static DEBUG_INSTANCE: ChunckTest;

	public light: BABYLON.HemisphericLight;
	public camera: BABYLON.ArcRotateCamera;

	constructor(canvasElement: string) {
		super(canvasElement);
		ChunckTest.DEBUG_INSTANCE = this;
	}

	public createScene(): void {
		super.createScene();
		this.scene.clearColor = BABYLON.Color4.FromHexString("#218db5ff");

		this.light = new BABYLON.HemisphericLight(
			"light",
			(new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize(),
			this.scene
		);

		this.light.diffuse = new BABYLON.Color3(0.7, 0.7, 0.7);
		this.light.groundColor = new BABYLON.Color3(0.3, 0.3, 0.3);
		
		this.camera = new BABYLON.ArcRotateCamera("camera", - 3 * Math.PI / 4, Math.PI / 4, 50, BABYLON.Vector3.Zero());
		this.camera.attachControl();
	}

	public path: BABYLON.Vector3[] = [];

    public async initialize(): Promise<void> {
		let mainMaterial = new BABYLON.StandardMaterial("main-material");
		mainMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
		mainMaterial.diffuseColor.copyFromFloats(181 / 256, 60 / 256, 33 / 256);
		let sideMaterial = new BABYLON.StandardMaterial("side-material");
		sideMaterial.specularColor.copyFromFloats(0.1, 0.1, 0.1);
		sideMaterial.diffuseColor.copyFromFloats(90 / 256, 30 / 256, 16 / 256);
		
		return new Promise<void>(resolve => {
			PlanetChunckVertexData.InitializeData().then(
				() => {
					for (let i = 0; i < 16; i++) {
						for (let j = 0; j < 16; j++) {
							let mainRef = i + 16 * j;
							if (mainRef != 0b00000000 && mainRef != 0b11111111) {
								let grid = [
									[
										[0, 0, 0, 0],
										[0, 0, 0, 0],
										[0, 0, 0, 0],
										[0, 0, 0, 0]
									],
									[
										[0, 0, 0, 0],
										[0, mainRef & 0b1 << 0, mainRef & 0b1 << 1, 0],
										[0, mainRef & 0b1 << 3, mainRef & 0b1 << 2, 0],
										[0, 0, 0, 0]
									],
									[
										[0, 0, 0, 0],
										[0, mainRef & 0b1 << 4, mainRef & 0b1 << 5, 0],
										[0, mainRef & 0b1 << 7, mainRef & 0b1 << 6, 0],
										[0, 0, 0, 0]
									],
									[
										[0, 0, 0, 0],
										[0, 0, 0, 0],
										[0, 0, 0, 0],
										[0, 0, 0, 0]
									]
								];

								for (let ii = 0; ii < 3; ii++) {
									for (let jj = 0; jj < 3; jj++) {
										for (let kk = 0; kk < 3; kk++) {
											let ref = 0b0;
											let d0 = grid[ii][jj][kk];
											if (d0) {
												ref |= 0b1 << 0;
											}
											let d1 = grid[ii + 1][jj][kk];
											if (d1) {
												ref |= 0b1 << 1;
											}
											let d2 = grid[ii + 1][jj + 1][kk];
											if (d2) {
												ref |= 0b1 << 2;
											}
											let d3 = grid[ii][jj + 1][kk];
											if (d3) {
												ref |= 0b1 << 3;
											}
											let d4 = grid[ii][jj][kk + 1];
											if (d4) {
												ref |= 0b1 << 4;
											}
											let d5 = grid[ii + 1][jj][kk + 1];
											if (d5) {
												ref |= 0b1 << 5;
											}
											let d6 = grid[ii + 1][jj + 1][kk + 1];
											if (d6) {
												ref |= 0b1 << 6;
											}
											let d7 = grid[ii][jj + 1][kk + 1];
											if (d7) {
												ref |= 0b1 << 7;
											}
											if (ref != 0b00000000 && ref != 0b11111111) {
												let part = PlanetChunckVertexData.Get(1, ref);
												if (part) {
													let mesh = new BABYLON.Mesh("part-mesh");
													part.vertexData.colors = part.vertexData.colors.map((c: number) => { return 1; });
													part.vertexData.applyToMesh(mesh);
													if (ii === 1 && jj === 1 && kk === 1) {
														mesh.material = mainMaterial;
													}
													else {
														mesh.material = sideMaterial;
													}
													mesh.position.x = i * 3 - 23 - 1 + ii;
													mesh.position.y = - 1 + kk;
													mesh.position.z = j * 3 - 23 - 1 + jj;
													mesh.freezeWorldMatrix();
												}
											}
										}
									}
								}
							}
						}
					}
					resolve();
				}
			);
		})
	}

	public update(): void {
		this.camera.target.y = 0;
	}
}
