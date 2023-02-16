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
			new BABYLON.Vector3(0.6, 1, 0.3),
			this.scene
		);
		light.diffuse = new BABYLON.Color3(1, 1, 1);
		light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);

		this.camera = new BABYLON.ArcRotateCamera("camera", 5 * Math.PI / 4, Math.PI / 4, 20, BABYLON.Vector3.Zero(), this.scene);
		this.camera.attachControl(this.canvas);

		this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
	}

    public async initialize(): Promise<void> {
		return new Promise<void>(resolve => {

            let root = new OctreeNode<number>(5);
            root.set(42, 0, 0, 0);
            root.set(42, 1, 0, 0);
            root.set(42, 45, 67, 13);
            
            root.forEach((v, i, j, k) => {
                if (v > 0) {
                    let cube = BABYLON.MeshBuilder.CreateBox("cube");
                    cube.position.x = i;
                    cube.position.y = k;
                    cube.position.z = j;
                }
            });

			resolve();
		})
	}

	public update(): void {
        
	}
}
