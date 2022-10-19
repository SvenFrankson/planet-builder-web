enum CameraMode {
    Sky,
    Player
}

class CameraManager {

    public cameraMode: CameraMode = CameraMode.Sky;

    public arcRotateCamera: BABYLON.ArcRotateCamera;
    public freeCamera: BABYLON.FreeCamera;
    public noOutlineCamera: BABYLON.FreeCamera;

    public player: Player;

    public get absolutePosition(): BABYLON.Vector3 {
        if (this.cameraMode === CameraMode.Sky) {
            return this.arcRotateCamera.position;
        }
        else {
            return this.freeCamera.globalPosition;
        }
    }

    constructor(public game: Game) {
        this.arcRotateCamera = new BABYLON.ArcRotateCamera(
            "Camera",
            0,
            Math.PI / 2,
            100,
            BABYLON.Vector3.Zero(),
            Game.Scene
        );
        this.arcRotateCamera.attachControl(this.game.canvas);
        
        this.freeCamera = new BABYLON.FreeCamera(
            "Camera",
            BABYLON.Vector3.Zero(),
            Game.Scene
        );
        this.freeCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.freeCamera.minZ = 0.1;
        this.noOutlineCamera = new BABYLON.FreeCamera(
            "Camera",
            BABYLON.Vector3.Zero(),
            game.scene
        );
        this.noOutlineCamera.layerMask = 0x10000000;
        this.noOutlineCamera.parent = this.freeCamera;

        OutlinePostProcess.AddOutlinePostProcess(this.freeCamera);
    }

    public setMode(newCameraMode: CameraMode): void {
        if (newCameraMode != this.cameraMode) {
            if (this.cameraMode === CameraMode.Sky) {
                this.arcRotateCamera.detachControl(this.game.canvas);
            }

            this.cameraMode = newCameraMode;

            if (this.cameraMode === CameraMode.Player) {
                this.freeCamera.parent = this.player.camPos;
                this.freeCamera.position.copyFromFloats(0, 0, - 5);
                this.freeCamera.rotationQuaternion.copyFrom(BABYLON.Quaternion.Identity());
                this.freeCamera.computeWorldMatrix();
                Game.Scene.activeCameras.push(this.freeCamera, this.noOutlineCamera);
            }
            if (this.cameraMode === CameraMode.Sky) {
                Game.Scene.activeCamera = this.arcRotateCamera;
                this.arcRotateCamera.attachControl(this.game.canvas);
            }
        }
    }
}