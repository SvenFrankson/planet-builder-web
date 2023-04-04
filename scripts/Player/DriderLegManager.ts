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
            new BABYLON.Vector3(0.15, -0.02, -0.11)
        ];

        this.legs = [];
        for (let i = 0; i < 6; i++) {
            this.legs[i] = new DriderLeg(i, this.drider.scene);
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
    private _walking: UniqueList<number> = new UniqueList<number>();
    public doUpdate(): void {
        this._update();
    }
    private _update = () => {
        this._timer += this.scene.getEngine().getDeltaTime() / 1000;

        for (let i = 0; i < 6; i++) {
            BABYLON.Vector3.TransformCoordinatesToRef(this.positions[i], this.drider.torsoLow.getWorldMatrix(), this.legs[i].position);
            this.legs[i].rotationQuaternion.copyFrom(this.drider.rotationQuaternion);
        }

        if (true) {
            // Walking alternating 024 and 135
            if (this._steping === 0) {
                this._step = (this._step + 1) % 2;
                let dist = 0;
                for (let i = 0; i < 3; i++) {
                    this.drider.evaluateTarget(2 * i + this._step);
                }
                for (let i = 0; i < 3; i++) {
                    dist += BABYLON.Vector3.Distance(this.legs[2 * i + this._step].targetPosition, this.drider.evaluatedFootTargets[2 * i + this._step]);
                }
                if (dist > 0.6) {
                    this._steping = 3;
                    for (let i = 0; i < 3; i++) {
                        this.step(this.legs[2 * i + this._step], this.drider.evaluatedFootTargets[2 * i + this._step], this.drider.evaluatedFootNormals[2 * i + this._step]).then(() => { this._steping--; });
                    }
                }
            }
        }
        else {
            if (this._walking.length < 2) {
                let legs = [];
                for (let i = 0; i < 6; i++) {
                    if (!this._walking.contains(i)) {
                        this.drider.evaluateTarget(i);
                        this.legs[i].tmpDistance = BABYLON.Vector3.Distance(this.legs[i].targetPosition, this.drider.evaluatedFootTargets[i]);
                        legs.push(this.legs[i]);
                    }
                }
                legs = legs.sort((l1, l2) => { return l1.tmpDistance - l2.tmpDistance; });
                if (legs[legs.length - 1].tmpDistance > 0.2) {
                    while (this._walking.length < 1) {
                        let leg = legs.pop();
                        this._walking.push(leg.index);
                        this.step(leg, this.drider.evaluatedFootTargets[leg.index], this.drider.evaluatedFootNormals[leg.index]).then(() => { this._walking.remove(leg.index) });
                    }
                }
            }
        }
    }

    private async step(leg: DriderLeg, target: BABYLON.Vector3, targetNorm: BABYLON.Vector3): Promise<void> {
        return new Promise<void>(resolve => {
            let origin = leg.targetPosition.clone();
            let originNorm = leg.targetNormal.clone();
            let destination = target.clone();
            let destinationNorm = targetNorm.clone();
            let dist = BABYLON.Vector3.Distance(origin, destination);
            let hMax = Math.min(Math.max(0.3, dist * 0.5), 0.1)
            let duration = 0.5;
            let t = 0;
            let animationCB = () => {
                t += this.scene.getEngine().getDeltaTime() / 1000;
                let f = t / duration;
                let h = Math.sqrt(Math.sin(f * Math.PI)) * hMax;
                if (f < 1) {
                    let p = origin.scale(1 - f).addInPlace(destination.scale(f));
                    let n = originNorm.scale(1 - f).addInPlace(destinationNorm.scale(f)).normalize();
                    p.addInPlace(n.scale(h * dist * Math.sin(f * Math.PI)));
                    leg.targetPosition.copyFrom(p);
                    leg.targetNormal.copyFrom(n);
                }
                else {
                    leg.targetPosition.copyFrom(destination);
                    leg.targetNormal.copyFrom(destinationNorm);
                    this.scene.onBeforeRenderObservable.removeCallback(animationCB);
                    resolve();
                }
            }
            this.scene.onBeforeRenderObservable.add(animationCB);
        })
    }
}