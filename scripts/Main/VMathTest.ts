/// <reference path="../../lib/babylon.d.ts"/>

class VMathTest extends Main {

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
            let mesh = BABYLON.MeshBuilder.CreateIcoSphere("mesh", { radius: 3, subdivisions: 2, flat: false });
            mesh.enableEdgesRendering(1);

            let projection = BABYLON.MeshBuilder.CreateIcoSphere("projection", { radius: 0.1, subdivisions: 2, flat: false });
            projection.material = SharedMaterials.BlueMaterial();
            projection.rotationQuaternion = BABYLON.Quaternion.Identity();
            let axis = BABYLON.MeshBuilder.CreateBox("axis", { width: 0.01, height: 0.4, depth: 0.01 });
            axis.material = SharedMaterials.GreenMaterial();
            axis.parent = projection;
            axis.position.y = 0.2;

            this.scene.onBeforeRenderObservable.add(() => {
                let pickInfo = VCollision.closestPointOnMesh(this.camera.globalPosition, mesh);
                if (pickInfo.hit) {
                    projection.position.copyFrom(pickInfo.worldPoint);
                    VMath.QuaternionFromYZAxisToRef(pickInfo.worldNormal, projection.forward, projection.rotationQuaternion);
                }
            });

            resolve();
        })
    }

    public async initialize2(): Promise<void> {
		return new Promise<void>(resolve => {

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
            let a = 2 * Math.PI * Math.random();
            meshB.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, a);

            let meshC = BABYLON.MeshBuilder.CreateLines(
                "object-C",
                {
                    points: [BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, 0, 5)],
                    colors: [new BABYLON.Color4(0, 0, 1, 1), new BABYLON.Color4(0, 0, 1, 1)]
                },
                this.scene
            );
            meshC.rotationQuaternion = BABYLON.Quaternion.Slerp(meshA.rotationQuaternion, meshB.rotationQuaternion, 0.5);

            let angle = VMath.GetAngleBetweenQuaternions(meshA.rotationQuaternion, meshB.rotationQuaternion) / Math.PI * 180;
            let valueDisplay = new Number3D("angle", Math.round(angle), 1);
            valueDisplay.redraw();
            valueDisplay.position.z = 10;

            setInterval(() => {
                a += Math.PI * 0.003;
                meshB.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, a);
                
                meshC.rotationQuaternion = BABYLON.Quaternion.Slerp(meshA.rotationQuaternion, meshB.rotationQuaternion, 0.5);
    
                let angle = VMath.GetAngleBetweenQuaternions(meshA.rotationQuaternion, meshB.rotationQuaternion) / Math.PI * 180;
                valueDisplay.value = Math.round(angle);
                valueDisplay.redraw();
            }, 15);


			resolve();
		})
	}

	public update(): void {
        
	}
}
