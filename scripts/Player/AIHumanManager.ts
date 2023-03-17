class AIHumanManager {

    public armManager: HumanArmManager;

    public get scene(): BABYLON.Scene {
        return this.human.scene;
    }

    public wait = AnimationFactory.EmptyVoidCallback;

    constructor(
        public human: Human
    ) {
        this.wait = AnimationFactory.CreateWait(this);
        this.armManager = new HumanArmManager(human);
    }

    public initialize(): void {
        this.armManager.initialize();
        this.human.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.armManager.dispose();
        this.human.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    private _timer: number = 0;
    private _update = () => {
        this._timer += this.scene.getEngine().getDeltaTime() / 1000;
        if (this._timer > 3) {
            let p = new BABYLON.Vector3(Math.random() - 0.5, Math.random() + 1, Math.random() * 0.6 + 0.6);
            BABYLON.Vector3.TransformCoordinatesToRef(p, this.human.getWorldMatrix(), p);
            this.armManager.aimedPosition = p;
            this.armManager.aimedNormal = this.human.up;
            this.armManager.aimedInteractionMode = InteractionMode.Point;
            this._timer = 0;
        }
    }
}