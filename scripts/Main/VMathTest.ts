/// <reference path="../../lib/babylon.d.ts"/>

class VMathTest extends Main {

	public camera: BABYLON.ArcRotateCamera;
	public planet: BABYLON.Mesh;

	public createScene(): void {
		Main.Scene = new BABYLON.Scene(Main.Engine);
		this.scene = Main.Scene;
        
        this.vertexDataLoader = new VertexDataLoader(this.scene);
        this.inputManager = new InputManager(this.scene, this.canvas);

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
            let ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 20, height: 20 });
            ground.position.y = - 1;

            let meshA = BABYLON.MeshBuilder.CreateLines(
                "object-A",
                {
                    points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 5)],
                    colors: [new BABYLON.Color4(1, 0, 0, 1), new BABYLON.Color4(1, 0, 0, 1)]
                },
                this.scene
            );
            meshA.rotationQuaternion = BABYLON.Quaternion.Identity();
            let meshB = BABYLON.MeshBuilder.CreateLines(
                "object-B",
                {
                    points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 5)],
                    colors: [new BABYLON.Color4(0, 1, 0, 1), new BABYLON.Color4(0, 1, 0, 1)]
                },
                this.scene
            );
            meshB.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, 2 * Math.PI * Math.random());

            let angle = VMath.GetAngleBetweenQuaternions(meshA.rotationQuaternion, meshB.rotationQuaternion) / Math.PI * 180;
            let value = new Number3D("angle", Math.round(angle), 1);
            value.redraw();
            value.position.z = 10;

			resolve();
		})
	}

	public update(): void {
        
	}
}
