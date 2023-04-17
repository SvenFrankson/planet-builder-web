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
    private currentBait: DriderBait;

    private _update = () => {
        let dt = this.scene.getEngine().getDeltaTime() / 1000;
        this._timer += dt;

        if (!this.currentBait) {
            let bait = DriderBait.Instances.get(0);
            if (bait && bait.activated) {
                DriderBait.Instances.remove(bait);
                this.currentBait = bait;
                console.log("find !");
            }
        }

        this.drider.armManager.useWait = true;

        let dir: BABYLON.Vector3;
        if (this.currentBait) {
            dir = this.currentBait.position.subtract(this.drider.position);
            this.drider.targetLook = this.currentBait.position.clone();
        }
        else {
            dir = this.player.position.subtract(this.drider.position);
            this.drider.targetLook = this.player.head.absolutePosition.clone();
        }
        let dist = dir.length();
        let alpha = VMath.AngleFromToAround(this.drider.forward, dir, this.drider.up);
        if (Math.abs(alpha) > Math.PI / 6) {
            this.targetDir = dir;
        }

        if (this.targetDir) {
            let beta = VMath.AngleFromToAround(this.drider.forward, dir, this.drider.up);
            let db = Math.sign(beta) * dt * Math.PI / 4;
            if (Math.abs(db) > Math.abs(beta)) {
                db = beta;
                this.targetDir = undefined;
            }
            this.drider.rotate(BABYLON.Axis.Y, db, BABYLON.Space.LOCAL);
        }

        this.drider.velocity = BABYLON.Vector3.Zero();
        if (this.currentBait) {
            if (dist > 1) {
                this.drider.position.addInPlace(this.drider.forward.scale(1 * dt));
                this.drider.velocity = this.drider.forward.clone();
            }
            if (dist < 2) {
                this.currentBait.dispose();
                this.currentBait = undefined;
            } 
        }
        else {
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
}