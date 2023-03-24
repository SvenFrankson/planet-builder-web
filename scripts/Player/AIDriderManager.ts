class AIDriderManager {

    public debugWalking: boolean = false;
    public armManager: HumanArmManager;
    public legManager: DriderLegManager;

    public get scene(): BABYLON.Scene {
        return this.drider.scene;
    }

    public wait = AnimationFactory.EmptyVoidCallback;

    constructor(
        public drider: Drider
    ) {
        this.wait = AnimationFactory.CreateWait(this);
        this.armManager = new HumanArmManager(drider);
        this.armManager.leftParent = drider.torsoHigh;
        this.armManager.leftPos = new BABYLON.Vector3(- 0.18, 0.29, 0);
        this.armManager.rightParent = drider.torsoHigh;
        this.armManager.rightPos = new BABYLON.Vector3(0.18, 0.29, 0);
        this.legManager = new DriderLegManager(drider);
    }

    public initialize(): void {
        this.armManager.initialize();
        this.legManager.initialize();
        this.drider.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.armManager.dispose();
        this.legManager.dispose();
        this.drider.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    private _timer: number = 0;
    private _update = () => {
        this._timer += this.scene.getEngine().getDeltaTime() / 1000;
        if (this._timer > 3) {
            let p = new BABYLON.Vector3(Math.random() - 0.5, Math.random() + 1, Math.random() * 0.6 + 0.6);
            BABYLON.Vector3.TransformCoordinatesToRef(p, this.drider.getWorldMatrix(), p);
            this.armManager.aimedPosition = p;
            this.armManager.aimedNormal = this.drider.up;
            this.armManager.aimedInteractionMode = InteractionMode.Point;
            this._timer = 0;
        }
        if (this.debugWalking) {
            this.drider.position.addInPlace(this.drider.forward.scale(1/60 * 1));
        }
        this.drider.rotate(BABYLON.Axis.Y, Math.PI / 60 * 0.05, BABYLON.Space.LOCAL);

        let footCenter = BABYLON.Vector3.Zero();
        for (let i = 0; i < 6; i++) {
            footCenter.addInPlace(this.legManager.legs[i].foot.absolutePosition);
        }
        footCenter.scaleInPlace(1 / 6);
        footCenter.addInPlace(this.drider.up.scale(0.7));
        this.drider.torsoLow.position.scaleInPlace(0.9).addInPlace(footCenter.scale(0.1));
        this.drider.torsoLow.rotationQuaternion.copyFrom(this.drider.rotationQuaternion);
    }
}