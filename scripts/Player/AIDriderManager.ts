class AIDriderManager {

    public debugWalking: boolean = false;

    public get scene(): BABYLON.Scene {
        return this.drider.scene;
    }

    public wait = AnimationFactory.EmptyVoidCallback;

    constructor(
        public drider: Drider
    ) {
        this.wait = AnimationFactory.CreateWait(this);
    }

    public initialize(): void {
        this.drider.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.drider.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    private _timer: number = 0;
    private _update = () => {
        this._timer += this.scene.getEngine().getDeltaTime() / 1000;
        if (this._timer > 3) {
            let p = new BABYLON.Vector3(Math.random() - 0.5, Math.random() + 1, Math.random() * 0.6 + 0.6);
            BABYLON.Vector3.TransformCoordinatesToRef(p, this.drider.getWorldMatrix(), p);
            this.drider.armManager.aimedPosition = p;
            this.drider.armManager.aimedNormal = this.drider.up;
            this.drider.armManager.aimedInteractionMode = InteractionMode.Point;
            this._timer = 0;
        }
        if (this.debugWalking) {
            this.drider.position.addInPlace(this.drider.forward.scale(1/60 * 1));
        }
        this.drider.rotate(BABYLON.Axis.Y, Math.PI / 60 * 0.05, BABYLON.Space.LOCAL);
    }
}