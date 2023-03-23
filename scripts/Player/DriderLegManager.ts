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
            this.legs[i].targetPosition.copyFrom(this.drider.position);
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
    private _steping: boolean = false;
    private _update = () => {
        this._timer += this.scene.getEngine().getDeltaTime() / 1000;

        for (let i = 0; i < 6; i++) {
            BABYLON.Vector3.TransformCoordinatesToRef(this.positions[i], this.drider.torsoLow.getWorldMatrix(), this.legs[i].position);
            this.legs[i].rotationQuaternion.copyFrom(this.drider.rotationQuaternion);
        }

        if (!this._steping) {
            let maxD = 0;
            let maxIndex = - 1;
            for (let i = 0; i < 6; i++) {
                let d = BABYLON.Vector3.Distance(this.legs[i].targetPosition, this.drider.footTargets[i].absolutePosition);
                if (d > maxD) {
                    maxD = d;
                    maxIndex = i;
                }
            }
            if (maxD > 0.02 && maxIndex != -1) {
                this._steping = true;
                this.step(this.legs[maxIndex], this.drider.footTargets[maxIndex].absolutePosition).then(() => { this._steping = false; });
            }
        }
    }

    private async step(leg: DriderLeg, target: BABYLON.Vector3): Promise<void> {
        return new Promise<void>(resolve => {
            let origin = leg.targetPosition.clone();
            let destination = target.clone();
            let up = this.drider.up;
            let duration = 0.15;
            let t = 0;
            let animationCB = () => {
                t += this.scene.getEngine().getDeltaTime() / 1000;
                let f = t / duration;
                if (f < 1) {
                    let p = origin.scale(1 - f).addInPlace(destination.scale(f));
                    p.addInPlace(up.scale(0.3 * Math.sin(f * Math.PI)));
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