class AIDriderManager {

    public debugWalking: boolean = false;

    public get scene(): BABYLON.Scene {
        return this.drider.scene;
    }

    public wait = AnimationFactory.EmptyVoidCallback;

    constructor(
        public drider: Drider,
        public player: Player
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
    private targetDir: BABYLON.Vector3;
    private _update = () => {
        let dt = this.scene.getEngine().getDeltaTime() / 1000;
        this._timer += dt;

        if (this._timer > 3) {
            let p = new BABYLON.Vector3(Math.random() - 0.5, Math.random() + 1, Math.random() * 0.6 + 0.6);
            p.copyFromFloats(0, 0.3, 0.5)
            BABYLON.Vector3.TransformCoordinatesToRef(p, this.drider.torsoHigh.getWorldMatrix(), p);
            this.drider.armManager.aimedPosition = p;
            this.drider.armManager.aimedNormal = this.drider.up;
            this.drider.armManager.aimedInteractionMode = InteractionMode.Point;
            this._timer = 0;
        }

        this.drider.targetLook = this.player.head.absolutePosition.clone();

        let dir = this.player.position.subtract(this.drider.position);
        let dist = dir.length();
        let alpha = VMath.AngleFromToAround(this.drider.forward, dir, this.drider.up);
        if (Math.abs(alpha) > Math.PI / 6) {
            this.targetDir = dir;
        }

        if (this.targetDir) {
            let beta = VMath.AngleFromToAround(this.drider.forward, dir, this.drider.up);
            let db = Math.sign(beta) * dt * Math.PI / 8;
            if (Math.abs(db) > Math.abs(beta)) {
                db = beta;
                this.targetDir = undefined;
            }
            this.drider.rotate(BABYLON.Axis.Y, db, BABYLON.Space.LOCAL);
        }

        this.drider.velocity = BABYLON.Vector3.Zero();
        if (dist > 5) {
            this.drider.position.addInPlace(this.drider.forward.scale(1 * dt));
            this.drider.velocity = this.drider.forward.clone();
        }
        else if (dist < 3) {
            this.drider.position.subtractInPlace(this.drider.forward.scale(1 * dt));
            this.drider.velocity = this.drider.forward.clone();
        } 

    }
}