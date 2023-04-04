enum CameraMode {
    Sky,
    Player
}

class CameraManager {

    public get scene(): BABYLON.Scene {
        return this.main.scene;
    }

    public useOutline: boolean = true;

    public cameraMode: CameraMode = CameraMode.Sky;

    public arcRotateCamera: BABYLON.ArcRotateCamera;
    public freeCamera: BABYLON.FreeCamera;
    public noOutlineCamera: BABYLON.FreeCamera;
    public farCamera: BABYLON.FreeCamera;

    public player: Player;
    
    private _lookingForward: boolean = false;

    public get absolutePosition(): BABYLON.Vector3 {
        if (this.cameraMode === CameraMode.Sky) {
            return this.arcRotateCamera.position;
        }
        else {
            return this.freeCamera.globalPosition;
        }
    }

    public animateCameraPosZ = AnimationFactory.EmptyNumberCallback;

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
            "camera",
            BABYLON.Vector3.Zero(),
            this.main.scene
        );
        this.freeCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.freeCamera.minZ = 0.1;
        this.freeCamera.maxZ = 3000;

        if (this.useOutline) {
            const rtt = new BABYLON.RenderTargetTexture('render target', { width: this.main.engine.getRenderWidth(), height: this.main.engine.getRenderHeight() }, this.main.scene);
            rtt.samples = 1;
            this.freeCamera.outputRenderTarget = rtt;
    
            this.noOutlineCamera = new BABYLON.FreeCamera(
                "no-outline-camera",
                BABYLON.Vector3.Zero(),
                this.main.scene
            );

            this.noOutlineCamera.minZ = 0.1;
            this.noOutlineCamera.maxZ = 3000;
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

            this.main.engine.onResizeObservable.add(() => {
                //console.log("w " + this.main.engine.getRenderWidth());
                //console.log("h " + this.main.engine.getRenderHeight());
                //postProcess.getEffect().setFloat("width", this.main.engine.getRenderWidth());
                //postProcess.getEffect().setFloat("height", this.main.engine.getRenderHeight());
                rtt.resize({ width: this.main.engine.getRenderWidth(), height: this.main.engine.getRenderHeight() });
                postProcess.inputTexture.createDepthStencilTexture(0, true, false, 4);
                postProcess.inputTexture._shareDepth(rtt.renderTarget);
                this.freeCamera.outputRenderTarget = rtt;
                pp.inputTexture = rtt.renderTarget;
            });
        }

        this.animateCameraPosZ = AnimationFactory.CreateNumber(this, this.freeCamera.position, "z");

        this.scene.onBeforeRenderObservable.add(this._update);
    }

    private _update = () => {
        if (this.main.inputManager.inventoryOpened) {
            if (!this._lookingForward) {
                this._lookingForward = true;
                this.animateCameraPosZ(0.2, 0.5);
            }
        }
        else {
            if (this._lookingForward) {
                this._lookingForward = false;
                this.animateCameraPosZ(0.04, 0.5);
            }
        }
    }

    public setMode(newCameraMode: CameraMode): void {
        if (newCameraMode != this.cameraMode) {
            if (this.cameraMode === CameraMode.Sky) {
                this.arcRotateCamera.detachControl();
            }

            this.cameraMode = newCameraMode;

            if (this.cameraMode === CameraMode.Player) {
                this.freeCamera.parent = this.player.head;
                this.freeCamera.position.copyFromFloats(0, 0, 0.04);
                this.freeCamera.rotationQuaternion.copyFrom(BABYLON.Quaternion.Identity());
                this.freeCamera.computeWorldMatrix();
                if (this.useOutline) {
                    this.main.scene.activeCameras = [this.freeCamera, this.noOutlineCamera];
                }
                else {
                    this.main.scene.activeCameras = [this.freeCamera];
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