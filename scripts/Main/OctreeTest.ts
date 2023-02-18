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

			let N = 3;

            let root = new OctreeNode<number>(N);
            root.set(42, 0, 0, 0);
			for (let i = 0; i < 1024; i++) {
				root.set(42, Math.floor(Math.random() * 8), Math.floor(Math.random() * 8), Math.floor(Math.random() * 8));
			}
            
			let serial = root.serializeToString();
			let clonedRoot = OctreeNode.DeserializeFromString(serial);
			let clonedSerial = clonedRoot.serializeToString();
			
            clonedRoot.forEachNode((node) => {
				let cube = BABYLON.MeshBuilder.CreateBox("cube", {size: node.size * 0.99});
				let material = new BABYLON.StandardMaterial("cube-material");
				material.alpha = (1 - node.degree / (N + 1)) * 0.5;
				cube.material = material;
				cube.position.x = node.i * node.size + node.size * 0.5;
				cube.position.y = node.k * node.size + node.size * 0.5;
				cube.position.z = node.j * node.size + node.size * 0.5;
            });
            
            clonedRoot.forEach((v, i, j, k) => {
                if (v > 0) {
                    let cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 0.99 });
                    cube.position.x = i + 0.5;
                    cube.position.y = k + 0.5;
                    cube.position.z = j + 0.5;
                }
            });


			console.log(serial);
			console.log(clonedSerial);
			console.log(serial === clonedSerial);

			resolve();
		})
	}

	public update(): void {
        
	}
}
