enum CameraMode {
    Sky,
    Player
}

class CameraManager {

    public cameraMode: CameraMode = CameraMode.Sky;

    public arcRotateCamera: BABYLON.ArcRotateCamera;
    public freeCamera: BABYLON.FreeCamera;

    public player: Player;

    public get absolutePosition(): BABYLON.Vector3 {
        if (this.cameraMode === CameraMode.Sky) {
            return this.arcRotateCamera.position;
        }
        else {
            return this.freeCamera.globalPosition;
        }
    }

    constructor() {
        this.arcRotateCamera = new BABYLON.ArcRotateCamera(
            "Camera",
            0,
            Math.PI / 2,
            100,
            BABYLON.Vector3.Zero(),
            Game.Scene
        );
        this.arcRotateCamera.attachControl(Game.Canvas);
        
        this.freeCamera = new BABYLON.FreeCamera(
            "Camera",
            BABYLON.Vector3.Zero(),
            Game.Scene
        );
        this.freeCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.freeCamera.minZ = 0.1;

        OutlinePostProcess.AddOutlinePostProcess(this.freeCamera);
    }

    public setMode(newCameraMode: CameraMode): void {
        if (newCameraMode != this.cameraMode) {
            if (this.cameraMode === CameraMode.Sky) {
                this.arcRotateCamera.detachControl(Game.Canvas);
            }

            this.cameraMode = newCameraMode;

            if (this.cameraMode === CameraMode.Player) {
                this.freeCamera.parent = this.player.camPos;
                this.freeCamera.position.copyFromFloats(0, 0, 0);
                this.freeCamera.rotationQuaternion.copyFrom(BABYLON.Quaternion.Identity());
                this.freeCamera.computeWorldMatrix();
                Game.Scene.activeCamera = this.freeCamera;
            }
            if (this.cameraMode === CameraMode.Sky) {
                Game.Scene.activeCamera = this.arcRotateCamera;
                this.arcRotateCamera.attachControl(Game.Canvas);
            }
        }
    }
}