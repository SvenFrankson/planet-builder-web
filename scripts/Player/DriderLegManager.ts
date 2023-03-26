class DriderLegManager {

    public positions: BABYLON.Vector3[];
    public legs: DriderLeg[];
    
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
        this.positions = [
            new BABYLON.Vector3(-0.15, -0.02, -0.11),
            new BABYLON.Vector3(-0.17, 0, 0),
            new BABYLON.Vector3(-0.17, 0.02, 0.11),
            new BABYLON.Vector3(0.17, 0.02, 0.11),
            new BABYLON.Vector3(0.17, 0, 0),
            new BABYLON.Vector3(0.15 -0.02, -0.11)
        ];

        this.legs = [];
        for (let i = 0; i < 6; i++) {
            this.legs[i] = new DriderLeg(true, this.drider.scene);
            this.legs[i].initialize();
            this.legs[i].instantiate();
            this.legs[i].targetPosition.copyFrom(this.drider.evaluatedFootTargets[i]);
            BABYLON.Vector3.TransformCoordinatesToRef(this.positions[i], this.drider.torsoLow.getWorldMatrix(), this.legs[i].position);
        }

        this.drider.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        for (let i = 0; i < 6; i++) {
            this.legs[i].dispose();
        }
        this.drider.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    private _timer: number = 0;
    private _steping: number = 0;
    private _step: number = 0;
    private _update = () => {
        this._timer += this.scene.getEngine().getDeltaTime() / 1000;

        for (let i = 0; i < 6; i++) {
            BABYLON.Vector3.TransformCoordinatesToRef(this.positions[i], this.drider.torsoLow.getWorldMatrix(), this.legs[i].position);
            this.legs[i].rotationQuaternion.copyFrom(this.drider.rotationQuaternion);
        }

        if (this._steping === 0) {
            this._step = (this._step + 1) % 2;
            let dist = 0;
            for (let i = 0; i < 3; i++) {
                this.drider.evaluateTarget(2 * i + this._step);
            }
            for (let i = 0; i < 3; i++) {
                dist += BABYLON.Vector3.DistanceSquared(this.legs[2 * i + this._step].targetPosition, this.drider.evaluatedFootTargets[2 * i + this._step]);
            }
            if (dist > 0.03) {
                this._steping = 3;
                for (let i = 0; i < 3; i++) {
                    this.step(this.legs[2 * i + this._step], this.drider.evaluatedFootTargets[2 * i + this._step]).then(() => { this._steping--; });
                }
            }
        }
    }

    private async step(leg: DriderLeg, target: BABYLON.Vector3): Promise<void> {
        return new Promise<void>(resolve => {
            let origin = leg.targetPosition.clone();
            let destination = target.clone();
            let dist = BABYLON.Vector3.Distance(origin, destination);
            let up = this.drider.up;
            let duration = Math.min(dist, 0.5);
            let t = 0;
            let animationCB = () => {
                t += this.scene.getEngine().getDeltaTime() / 1000;
                let f = t / duration;
                f = f * f;
                if (f < 1) {
                    let p = origin.scale(1 - f).addInPlace(destination.scale(f));
                    p.addInPlace(up.scale(0.2 * dist * Math.sin(f * Math.PI)));
                    leg.targetPosition.copyFrom(p);
                }
                else {
                    leg.targetPosition.copyFrom(destination);
                    this.scene.onBeforeRenderObservable.removeCallback(animationCB);
                    resolve();
                }
            }
            this.scene.onBeforeRenderObservable.add(animationCB);
        })
    }
}