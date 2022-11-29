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
        this.leftArm.position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(- 0.2, 0.7, 0), this.player.getWorldMatrix());
        this.leftArm.rotationQuaternion.copyFrom(this.player.rotationQuaternion);
        this.rightArm.position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0.2, 0.7, 0), this.player.getWorldMatrix());
        this.rightArm.rotationQuaternion.copyFrom(this.player.rotationQuaternion);

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
            VMath.StepToRef(this.leftArm.requestedTarget, target, dP, this.leftArm.requestedTarget);
        }
        else {
            let target = new BABYLON.Vector3(0.1, - this.rightArm.wristLength, 0);
            target.normalize().scaleInPlace(this.rightArm.wristLength);
            target = BABYLON.Vector3.TransformCoordinates(target, this.rightArm.getWorldMatrix());
            VMath.StepToRef(this.rightArm.requestedTarget, target, dP, this.rightArm.requestedTarget);
        }
    }

    private _aimingArm: PlayerArm;
    private _aimingStretch: number = 0.6;
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
                if (this._aimingArm.handMode != HandMode.Point) {
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
        VMath.StepToRef(this.player.camPos.absolutePosition, this.inputManager.aimedPosition, this._aimingStretch, tmp);
        this._aimingArm.setTarget(tmp);

        if (this._aimingArm.handMode === HandMode.Grab) {
            this._aimingArm.targetUp.copyFrom(this.inputManager.aimedNormal);
        }
        this._updateRequestedTargetIdle(this.other(this._aimingArm));
    }
}