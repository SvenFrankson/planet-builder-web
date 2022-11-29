enum ArmManagerMode {
    Idle,
    Aim,
    Lean
}

class PlayerArmManager {

    public leftArm: PlayerArm;
    public rightArm: PlayerArm;

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
    }

    private _aimingArm: PlayerArm;
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
            if (this._aimingArm.handMode != HandMode.Idle) {
                this._aimingArm.setHandMode(HandMode.Idle);
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
        if (d < 0.9) {
            this._aimingArm.setTarget(this.inputManager.aimedPosition);
        }
        else {
            let tmp = new BABYLON.Vector3();
            VMath.StepToRef(this._aimingArm.absolutePosition, this.inputManager.aimedPosition, 0.7, tmp);
            tmp.subtractInPlace(this.rightArm.up.scale(0.2));
            this._aimingArm.setTarget(tmp);
        }
        if (this._aimingArm.handMode === HandMode.Grab) {
            this._aimingArm.targetUp.copyFrom(this.inputManager.aimedNormal);
        }
    }
}