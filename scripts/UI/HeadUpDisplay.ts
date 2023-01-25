class HeadUpDisplay extends BABYLON.Mesh {

    constructor(public player: Player, public cameraManager: CameraManager) {
        super("head-up-display");
    }

    public async instantiate(): Promise<void> {
        let camera = this.cameraManager.noOutlineCamera;
        let yAngle = camera.fov;
        let w = camera.getEngine().getRenderWidth();
        let h = camera.getEngine().getRenderHeight();
        let ratio = w / h;
        let dist = (h * 0.5) / Math.tan(yAngle * 0.5);
        let xAngle = 2 * Math.atan((h * ratio * 0.5) / (dist));
        //console.log("xAngle = " + (xAngle / Math.PI * 180).toFixed(1) + " | yAngle = " + (yAngle / Math.PI * 180).toFixed(1));

        /*
        let debug = BABYLON.MeshBuilder.CreatePlane("debug", { size: 0.1 });
        let a = xAngle * 0.5 - 0.06;
        debug.position.x = - Math.sin(a);
        debug.position.z = Math.cos(a);
        debug.rotationQuaternion = BABYLON.Quaternion.Identity();
        VMath.QuaternionFromZYAxisToRef(debug.position, BABYLON.Axis.Y, debug.rotationQuaternion);
        debug.parent = this;
        
        let debug2 = BABYLON.MeshBuilder.CreatePlane("debug2", { size: 0.1 });
        let a2 = xAngle * 0.25;
        debug2.position.x = - Math.sin(a2);
        debug2.position.z = Math.cos(a2);
        debug2.rotationQuaternion = BABYLON.Quaternion.Identity();
        VMath.QuaternionFromZYAxisToRef(debug2.position, BABYLON.Axis.Y, debug2.rotationQuaternion);
        debug2.parent = this;
        */

        for (let b = 0; b <= 0.6; b += 0.08) {
            let debug3 = BABYLON.MeshBuilder.CreatePlane("debug3", { size: 0.06 });
            debug3.position.y = Math.sin(b);
            debug3.position.z = Math.cos(b);
            debug3.rotationQuaternion = BABYLON.Quaternion.Identity();
            VMath.QuaternionFromZYAxisToRef(debug3.position, BABYLON.Axis.Y, debug3.rotationQuaternion);
            debug3.parent = this;
            debug3.rotateAround(BABYLON.Vector3.Zero(), BABYLON.Axis.Y, - (xAngle * 0.5 - 0.06));
        }

        this.parent = this.player.camPos;
    }
}