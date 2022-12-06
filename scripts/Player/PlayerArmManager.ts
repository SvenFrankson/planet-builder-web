enum ArmManagerMode {
    Idle,
    Aim,
    Lean
}

class PlayerArmManager {

    public leftArm: PlayerArm;
    public rightArm: PlayerArm;
    public other(arm: PlayerArm): PlayerArm {
        if (arm === this.leftArm) {
            return this.rightArm;
        }
        return this.leftArm;
    }

    private _tmpDP: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _dpLeftArm: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _dpRightArm: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public get inputManager(): InputManager {
        return this.player.inputManager;
    }

    constructor(
        public player: Player
    ) {
        
    }

    public initialize(): void {
        this.leftArm = new PlayerArm(true, this.player.scene);
        this.leftArm.initialize();
        this.leftArm.instantiate();

        this.rightArm = new PlayerArm(false, this.player.scene);
        this.rightArm.initialize();
        this.rightArm.instantiate();

        this.player.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.leftArm.dispose();
        this.rightArm.dispose();
        this.player.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    private mode: ArmManagerMode = ArmManagerMode.Idle;

    private _update = () => {
        this._dpLeftArm.copyFrom(this.leftArm.position);
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(- 0.2, 0.7, 0), this.player.getWorldMatrix(), this._tmpDP);
        this.leftArm.position.copyFrom(this._tmpDP);
        this._dpLeftArm.subtractInPlace(this.leftArm.position).scaleInPlace(-1);
        this.leftArm.rotationQuaternion.copyFrom(this.player.rotationQuaternion);
        this.leftArm.targetPosition.addInPlace(this._dpLeftArm);

        this._dpRightArm.copyFrom(this.rightArm.position);
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0.2, 0.7, 0), this.player.getWorldMatrix(), this._tmpDP);
        this.rightArm.position.copyFrom(this._tmpDP);
        this._dpRightArm.subtractInPlace(this.rightArm.position).scaleInPlace(-1);
        this.rightArm.rotationQuaternion.copyFrom(this.player.rotationQuaternion);
        this.rightArm.targetPosition.addInPlace(this._dpRightArm);

        if (this.mode === ArmManagerMode.Idle) {
            this._updateIdle();
        }
        else if (this.mode === ArmManagerMode.Aim) {
            this._updateAim();
        }
    }

    private _updateIdle(): void {
        if (this.inputManager.aimedPosition) {
            this.mode = ArmManagerMode.Aim;
            return;
        }

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
        let dP = 2 * this.player.scene.getEngine().getDeltaTime() / 1000;
        if (arm === this.leftArm) {
            let target = new BABYLON.Vector3(- 0.1, - this.leftArm.wristLength, 0);
            target.normalize().scaleInPlace(this.leftArm.wristLength);
            target = BABYLON.Vector3.TransformCoordinates(target, this.leftArm.getWorldMatrix());
            VMath.StepToRef(this.leftArm.targetPosition, target, dP, this.leftArm.targetPosition);
        }
        else {
            let target = new BABYLON.Vector3(0.1, - this.rightArm.wristLength, 0);
            target.normalize().scaleInPlace(this.rightArm.wristLength);
            target = BABYLON.Vector3.TransformCoordinates(target, this.rightArm.getWorldMatrix());
            VMath.StepToRef(this.rightArm.targetPosition, target, dP, this.rightArm.targetPosition);
        }
    }

    private _aimingArm: PlayerArm;
    private _aimingStretch: number = 0.6;
    private _aimingDistance: number = 0.1;
    private _updateAim(): void {

        if (!this.inputManager.aimedPosition) {
            this.mode = ArmManagerMode.Idle;
            return;
        }

        // 1 - Track which arm should be used.
        if (!this._aimingArm) {
            this._aimingArm = this.rightArm;
        }
        let dx = BABYLON.Vector3.Dot(this.inputManager.aimedPosition, this.player.right)
        if (this._aimingArm === this.leftArm && dx > 0.2) {
            this._aimingArm = this.rightArm;
            if (this.leftArm.handMode != HandMode.Idle) {
                this.leftArm.setHandMode(HandMode.Idle);
            }
        }
        else if (this._aimingArm === this.rightArm && dx < - 0.2) {
            this._aimingArm = this.leftArm;
            if (this.rightArm.handMode != HandMode.Idle) {
                this.rightArm.setHandMode(HandMode.Idle);
            }
        }

        let d = BABYLON.Vector3.Distance(this.inputManager.aimedPosition, this._aimingArm.absolutePosition);
        // 2 - Update the way the hand should interact depending on aimed object.
        if (d > 0.9) {
            if (this._aimingArm.handMode != HandMode.Point) {
                this._aimingArm.setHandMode(HandMode.Point);
            }
        }
        else {
            if (this.inputManager.aimedElement.interactionMode === InteractionMode.Point) {
                if (this._aimingArm.handMode != HandMode.Point && this._aimingArm.handMode != HandMode.PointPress) {
                    this._aimingArm.setHandMode(HandMode.Point);
                }
            }
            else if (this.inputManager.aimedElement.interactionMode === InteractionMode.Grab) {
                if (this._aimingArm.handMode != HandMode.Grab) {
                    this._aimingArm.setHandMode(HandMode.Grab);
                }
            }
        }

        // 3 - Update arm target position.
        let dP = 0.5 * this.player.scene.getEngine().getDeltaTime() / 1000;
        if (d < 0.9) {
            this._aimingStretch += dP;
        }
        else {
            this._aimingStretch -= dP;
        }
        this._aimingStretch = Math.max(Math.min(this._aimingStretch, this._aimingArm.fullLength), 0.4);
        
        let tmp = new BABYLON.Vector3();
        VMath.StepToRef(this.player.camPos.absolutePosition.add(this._aimingArm.absolutePosition).scale(0.5), this.inputManager.aimedPosition.add(this.inputManager.aimedNormal.scale(this._aimingDistance)), this._aimingStretch, tmp);
        this._aimingArm.setTarget(tmp);

        if (this._aimingArm.handMode === HandMode.Grab) {
            this._aimingArm.targetUp.copyFrom(this.inputManager.aimedNormal);
        }
        this._updateRequestedTargetIdle(this.other(this._aimingArm));
    }

    public async startActionAnimation(): Promise<void> {
        if (this._aimingArm) {
            this._aimingArm.setHandMode(HandMode.PointPress);
            await this._animateAimingDistance(0.01, 0.3);
            this._aimingArm.setHandMode(HandMode.Point);
            await this._animateAimingDistance(0.1, 0.3);
        }
    }

    private _animateAimingDistanceCB: () => void;
    private async _animateAimingDistance(distanceTarget: number, duration: number = 1): Promise<void> {
        if (this.player.scene) {
            if (this._animateAimingDistanceCB) {
                this.player.scene.onBeforeRenderObservable.removeCallback(this._animateAimingDistanceCB);
            }
            return new Promise<void>(resolve => {
                let distanceZero = this._aimingDistance;
                let t = 0;
                this._animateAimingDistanceCB = () => {
                    t += this.player.scene.getEngine().getDeltaTime() / 1000;
                    if (t < duration) {
                        let f = t / duration;
                        this._aimingDistance = distanceZero * (1 - f) + distanceTarget * f;
                    }
                    else {
                        this._aimingDistance = distanceTarget;
                        this.player.scene.onBeforeRenderObservable.removeCallback(this._animateAimingDistanceCB);
                        this._animateAimingDistanceCB = undefined;
                        resolve();
                    }
                }
                this.player.scene.onBeforeRenderObservable.add(this._animateAimingDistanceCB);
            });
        }
    }
}