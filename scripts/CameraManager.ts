enum CameraMode {
    Sky,
    Player
}

class CameraManager {

    public useOutline: boolean = true;

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

    constructor(public main: Main) {
        this.arcRotateCamera = new BABYLON.ArcRotateCamera(
            "Camera",
            0,
            Math.PI / 2,
            120,
            BABYLON.Vector3.Zero(),
            this.main.scene
        );
        this.arcRotateCamera.angularSensibilityX *= 5;
        this.arcRotateCamera.angularSensibilityY *= 5;
        this.arcRotateCamera.attachControl(this.main.canvas);
        
        this.freeCamera = new BABYLON.FreeCamera(
            "Camera",
            BABYLON.Vector3.Zero(),
            this.main.scene
        );
        this.freeCamera.fov *= 1.2;
        this.freeCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.freeCamera.minZ = 0.1;
        this.freeCamera.maxZ = 1000;
        if (this.useOutline) {
            const rtt = new BABYLON.RenderTargetTexture('render target', { width: this.main.engine.getRenderWidth(), height: this.main.engine.getRenderHeight() }, this.main.scene);
            rtt.samples = 1;
            this.freeCamera.outputRenderTarget = rtt;
    
            this.noOutlineCamera = new BABYLON.FreeCamera(
                "Camera",
                BABYLON.Vector3.Zero(),
                this.main.scene
            );
            this.noOutlineCamera.fov *= 1.2;
            this.noOutlineCamera.minZ = 0.1;
            this.noOutlineCamera.maxZ = 1000;
            this.noOutlineCamera.layerMask = 0x10000000;
            this.noOutlineCamera.parent = this.freeCamera;
    
            let postProcess = OutlinePostProcess.AddOutlinePostProcess(this.freeCamera);
            postProcess.onSizeChangedObservable.add(() => {
                if (!postProcess.inputTexture.depthStencilTexture) {
                    postProcess.inputTexture.createDepthStencilTexture(0, true, false, 4);
                    postProcess.inputTexture._shareDepth(rtt.renderTarget);
                }
            });
            
            const pp = new BABYLON.PassPostProcess("pass", 1, this.noOutlineCamera);
            pp.inputTexture = rtt.renderTarget;
            pp.autoClear = false;
        }
    }

    public setMode(newCameraMode: CameraMode): void {
        if (newCameraMode != this.cameraMode) {
            if (this.cameraMode === CameraMode.Sky) {
                this.arcRotateCamera.detachControl();
            }

            this.cameraMode = newCameraMode;

            if (this.cameraMode === CameraMode.Player) {
                this.freeCamera.parent = this.player.camPos;
                this.freeCamera.position.copyFromFloats(0, 0, 0);
                this.freeCamera.rotationQuaternion.copyFrom(BABYLON.Quaternion.Identity());
                this.freeCamera.computeWorldMatrix();
                if (this.useOutline) {
                    this.main.scene.activeCameras = [this.freeCamera, this.noOutlineCamera];
                }
                else {
                    this.main.scene.activeCamera = this.freeCamera;
                }
            }
            if (this.cameraMode === CameraMode.Sky) {
                if (this.useOutline) {
                    this.main.scene.activeCameras = [this.arcRotateCamera];
                }
                else {
                    this.main.scene.activeCamera = this.arcRotateCamera;
                }
                this.arcRotateCamera.attachControl(this.main.canvas);
            }
        }
    }
}