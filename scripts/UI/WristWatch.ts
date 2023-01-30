class WristWatch extends BABYLON.Mesh {

    public static Instances: WristWatch[] = [];

    public power: boolean = false;

    public holoMesh: BABYLON.Mesh;
    
    public animateMeshPosY = AnimationFactory.EmptyNumberCallback;
    public animateMeshScaleY = AnimationFactory.EmptyNumberCallback;

    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    constructor(public player: Player, public cameraManager: CameraManager) {
        super("head-up-display");
        this.holoMesh = new BABYLON.Mesh("wrist-watch-screen");
        this.animateMeshPosY = AnimationFactory.CreateNumber(this, this.holoMesh.position, "y");
        this.animateMeshScaleY = AnimationFactory.CreateNumber(this, this.holoMesh.scaling, "y");
        WristWatch.Instances.push(this);
    }

    public async instantiate(): Promise<void> {
        BABYLON.CreatePlaneVertexData({ size: 0.225 }).applyToMesh(this.holoMesh);
        this.holoMesh.position.y = 0.146;
        this.holoMesh.position.z = 0.148;
        this.holoMesh.rotation.y = - Math.PI * 0.5;
        this.holoMesh.parent = this.player.armManager.leftArm.foreArmMesh;

        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(doNotRecurse?: boolean, disposeMaterialAndTextures?: boolean): void {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
        this.holoMesh.dispose(doNotRecurse, disposeMaterialAndTextures);
        
        let index = WristWatch.Instances.indexOf(this);
        if (index != - 1) {
            WristWatch.Instances.splice(index, 1);
        }

        super.dispose(doNotRecurse, disposeMaterialAndTextures);
    }

    public async powerOn(): Promise<void> {
        this.power = true;
        this.holoMesh.isVisible = true;
        this.animateMeshPosY(0.146, 0.2);
        await this.animateMeshScaleY(1, 0.2);
    }

    public async powerOff(): Promise<void> {
        this.power = false;
        this.animateMeshPosY(0.51, 0.2);
        await this.animateMeshScaleY(0, 0.2);
        this.holoMesh.isVisible = false;
    }

    private _update = () => {
        if (this.power != this.player.inputManager.inventoryOpened) {
            if (this.player.inputManager.inventoryOpened) {
                this.powerOn();
            }
            else {
                this.powerOff();
            }
        }
    }
}