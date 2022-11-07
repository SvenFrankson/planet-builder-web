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
		this.scene.clearColor.copyFromFloats(1, 1, 1, 1);

		this.light = new BABYLON.HemisphericLight(
			"light",
			(new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize(),
			this.scene
		);

		this.light.diffuse = new BABYLON.Color3(1, 1, 1);
		this.light.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);
		
		this.camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 4, 10, BABYLON.Vector3.Zero());
		this.camera.attachControl();
	}

	public path: BABYLON.Vector3[] = [];

    public async initialize(): Promise<void> {
		return new Promise<void>(resolve => {
			PlanetChunckVertexData.InitializeData().then(
				() => {
					for (let i = 0; i < 16; i++) {
						for (let j = 0; j < 16; j++) {
							let ref = i + 16 * j;
							if (ref != 0b00000000 && ref != 0b11111111) {
								let part = PlanetChunckVertexData.Get(1, ref);
								let mesh = new BABYLON.Mesh("part-mesh");
								part.vertexData.colors = part.vertexData.colors.map((c: number) => { return 1; });
								part.vertexData.applyToMesh(mesh);
								mesh.position.x = i * 2 - 15;
								mesh.position.z = j * 2 - 15;
							}
						}
					}
					resolve();
				}
			);
		})
	}

	public update(): void {
		
	}
}
