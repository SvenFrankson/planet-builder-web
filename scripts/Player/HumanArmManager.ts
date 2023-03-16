class HumanArmManager {

    public static POS: BABYLON.Vector3 = new BABYLON.Vector3(0.12, 1.33, 0.4);

    public leftArm: PlayerArm;
    public rightArm: PlayerArm;
    public other(arm: PlayerArm): PlayerArm {
        if (arm === this.leftArm) {
            return this.rightArm;
        }
        return this.leftArm;
    }
    
    private _aimingDistance: number = 0.1;
    private _currentAimingDistance: number = 0.1;

    private _tmpDP: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _dpLeftArm: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _dpRightArm: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _tmpPreviousCamPosRotationX: number = 0;
    private _pointerDown: boolean = false;

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
        this.leftArm = new PlayerArm(true, this.human.scene);
        this.leftArm.initialize();
        this.leftArm.instantiate();

        this.rightArm = new PlayerArm(false, this.human.scene);
        this.rightArm.initialize();
        this.rightArm.instantiate();

        this.human.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.leftArm.dispose();
        this.rightArm.dispose();
        this.human.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    private mode: ArmManagerMode = ArmManagerMode.Idle;

    private _timer: number = 0;
    private _breathAmplitude: number = 0.02;
    private _breathPeriod: number = 6;
    private _update = () => {
        this._timer += this.scene.getEngine().getDeltaTime() / 1000;

        let breathY = Math.cos(this._timer / this._breathPeriod * 2 * Math.PI) * 0.5 * this._breathAmplitude;
        let breathYL = this.leftArm.handMode === HandMode.WristWatch ? breathY * 0.1 : breathY;
        let breathYR = this.rightArm.handMode === HandMode.WristWatch ? breathY * 0.1 : breathY;

        this._dpLeftArm.copyFrom(this.leftArm.position);
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(- 0.2, 1.55 + breathYL, 0), this.human.getWorldMatrix(), this._tmpDP);
        this.leftArm.position.copyFrom(this._tmpDP);
        this._dpLeftArm.subtractInPlace(this.leftArm.position).scaleInPlace(-1);
        this.leftArm.rotationQuaternion.copyFrom(this.human.rotationQuaternion);
        this.leftArm.targetPosition.addInPlace(this._dpLeftArm);

        this._dpRightArm.copyFrom(this.rightArm.position);
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0.2, 1.55 + breathYR, 0), this.human.getWorldMatrix(), this._tmpDP);
        this.rightArm.position.copyFrom(this._tmpDP);
        this._dpRightArm.subtractInPlace(this.rightArm.position).scaleInPlace(-1);
        this.rightArm.rotationQuaternion.copyFrom(this.human.rotationQuaternion);
        this.rightArm.targetPosition.addInPlace(this._dpRightArm);

        if (this.mode === ArmManagerMode.Idle) {
            this._updateIdle();
        }
    }

    private _updateIdle(): void {
        if (this.leftArm.handMode != HandMode.Idle) {
            this.leftArm.setHandMode(HandMode.Idle);
        }
        if (this.rightArm.handMode != HandMode.Idle) {
            this.rightArm.setHandMode(HandMode.Idle);
        }

        this._updateRequestedTargetIdle(this.leftArm);
        this._updateRequestedTargetIdle(this.rightArm);
    }

    private _updateRequestedTargetIdle(arm: PlayerArm): void {
        let dP = 2 * this.human.scene.getEngine().getDeltaTime() / 1000;
        if (arm === this.leftArm) {
            let target = new BABYLON.Vector3(- 0.1, - this.leftArm.wristLength, 0);
            target.normalize().scaleInPlace(this.leftArm.wristLength);
            target = BABYLON.Vector3.TransformCoordinates(target, this.leftArm.getWorldMatrix());
            this.leftArm.targetPosition.copyFrom(target);
        }
        else {
            let target = new BABYLON.Vector3(0.1, - this.rightArm.wristLength, 0);
            target.normalize().scaleInPlace(this.rightArm.wristLength);
            target = BABYLON.Vector3.TransformCoordinates(target, this.rightArm.getWorldMatrix());
            this.rightArm.targetPosition.copyFrom(target);
        }
    }
}