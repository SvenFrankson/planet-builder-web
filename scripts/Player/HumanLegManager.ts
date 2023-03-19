enum LegManagerMode {
    Walk
}

class HumanLegManager {

    public leftLeg: HumanLeg;
    public rightLeg: HumanLeg;
    public other(leg: HumanLeg): HumanLeg {
        if (leg === this.leftLeg) {
            return this.rightLeg;
        }
        return this.leftLeg;
    }
    
    public get scene(): BABYLON.Scene {
        return this.human.scene;
    }

    public wait = AnimationFactory.EmptyVoidCallback;

    constructor(
        public human: Human
    ) {
        this.wait = AnimationFactory.CreateWait(this);
    }

    public initialize(): void {
        this.leftLeg = new HumanLeg(true, this.human.scene);
        this.leftLeg.initialize();
        this.leftLeg.instantiate();
        this.leftLeg.targetPosition.copyFrom(this.human.position);

        this.rightLeg = new HumanLeg(false, this.human.scene);
        this.rightLeg.initialize();
        this.rightLeg.instantiate();
        this.rightLeg.targetPosition.copyFrom(this.human.position);

        this.human.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.leftLeg.dispose();
        this.rightLeg.dispose();
        this.human.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    private _timer: number = 0;
    private _steping: boolean = false;
    private _update = () => {
        this._timer += this.scene.getEngine().getDeltaTime() / 1000;

        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(- 0.11, 0, 0), this.human.torsoLow.getWorldMatrix(), this.leftLeg.position);
        this.leftLeg.rotationQuaternion.copyFrom(this.human.rotationQuaternion);
        
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0.11, 0, 0), this.human.torsoLow.getWorldMatrix(), this.rightLeg.position);
        this.rightLeg.rotationQuaternion.copyFrom(this.human.rotationQuaternion);

        if (!this._steping) {
            let dL = BABYLON.Vector3.Distance(this.leftLeg.foot.absolutePosition, this.human.footTargetL.absolutePosition);
            let dR = BABYLON.Vector3.Distance(this.rightLeg.foot.absolutePosition, this.human.footTargetR.absolutePosition);
            console.log(dL + " " + dR);
            if (dL > dR) {
                if (dL > 0.01) {
                    this._steping = true;
                    this.step(this.leftLeg, this.human.footTargetL.absolutePosition).then(() => { this._steping = false; });
                }
            }
            else {
                if (dR > 0.01) {
                    this._steping = true;
                    this.step(this.rightLeg, this.human.footTargetR.absolutePosition).then(() => { this._steping = false; });
                }
            }
        }
    }

    private async step(leg: HumanLeg, target: BABYLON.Vector3): Promise<void> {
        return new Promise<void>(resolve => {
            let origin = leg.targetPosition.clone();
            let destination = target.clone();
            let up = this.human.up;
            let duration = 1;
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