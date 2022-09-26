enum CameraMode {
    Sky,
    Player,
    Plane
}

class CameraManager {

    public cameraMode: CameraMode = CameraMode.Sky;

    public arcRotateCamera: BABYLON.ArcRotateCamera;
    public freeCamera: BABYLON.FreeCamera;

    public plane: Plane;
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

        Game.Scene.onBeforeRenderObservable.add(this._update);

        OutlinePostProcess.AddOutlinePostProcess(this.freeCamera);
    }

    public setMode(newCameraMode: CameraMode): void {
        if (newCameraMode != this.cameraMode) {
            if (this.plane) {
                this.plane.planeHud.hide();
            }
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
            if (this.cameraMode === CameraMode.Plane) {
                this.freeCamera.position.copyFrom(this.freeCamera.globalPosition);
                this.freeCamera.parent = undefined;
                this.plane.planeHud.show();
                Game.Scene.activeCamera = this.freeCamera;
            }
            if (this.cameraMode === CameraMode.Sky) {
                Game.Scene.activeCamera = this.arcRotateCamera;
                this.arcRotateCamera.attachControl(Game.Canvas);
            }
        }
    }

    private _update = () => {
        if (this.cameraMode === CameraMode.Plane) {
            this._planeCameraUpdate();
        }
    }

    private _planeCameraUpdate(): void {
        if (this.plane) {
            let targetPosition = this.plane.camPosition.absolutePosition;
            BABYLON.Vector3.LerpToRef(this.freeCamera.position, targetPosition, 0.05, this.freeCamera.position);
    
            let z = this.plane.camTarget.absolutePosition.subtract(this.plane.camPosition.absolutePosition).normalize();
            let y = this.plane.position.clone().normalize();
    
            let x = BABYLON.Vector3.Cross(y, z);
            y = BABYLON.Vector3.Cross(z, x);
    
            let targetQuaternion = BABYLON.Quaternion.RotationQuaternionFromAxis(x, y, z);
            BABYLON.Quaternion.SlerpToRef(this.freeCamera.rotationQuaternion, targetQuaternion, 0.05, this.freeCamera.rotationQuaternion);
        }
    }
}