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

        this.rightLeg = new HumanLeg(false, this.human.scene);
        this.rightLeg.initialize();
        this.rightLeg.instantiate();

        this.human.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.leftLeg.dispose();
        this.rightLeg.dispose();
        this.human.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    private _timer: number = 0;
    private _update = () => {
        this._timer += this.scene.getEngine().getDeltaTime() / 1000;

        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(- 0.11, 0, 0), this.human.torsoLow.getWorldMatrix(), this.leftLeg.position);
        this.leftLeg.rotationQuaternion.copyFrom(this.human.torsoLow.rotationQuaternion);
        
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0.11, 0, 0), this.human.torsoLow.getWorldMatrix(), this.rightLeg.position);
        this.rightLeg.rotationQuaternion.copyFrom(this.human.torsoLow.rotationQuaternion);
    }
}