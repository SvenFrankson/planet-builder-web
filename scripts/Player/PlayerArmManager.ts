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
        this.leftArm.rotationQuaternion = this.player.rotationQuaternion;
        this.rightArm.position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0.2, 0.7, 0), this.player.getWorldMatrix());
        this.rightArm.rotationQuaternion = this.player.rotationQuaternion;

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
        
        if (!this._aimingArm) {
            this._aimingArm = this.rightArm;
        }
        
        if (this._aimingArm === this.leftArm && this.inputManager.aimedPosition.x > 0.2) {
            this._aimingArm = this.rightArm;
            if (this.leftArm.handMode != HandMode.Idle) {
                this.leftArm.setHandMode(HandMode.Idle);
            }
        }
        else if (this._aimingArm === this.rightArm && this.inputManager.aimedPosition.x < - 0.2) {
            this._aimingArm = this.leftArm;
            if (this.rightArm.handMode != HandMode.Idle) {
                this.rightArm.setHandMode(HandMode.Idle);
            }
        }
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
        this._aimingArm.setTarget(this.inputManager.aimedPosition);
        if (this._aimingArm.handMode === HandMode.Grab) {
            this._aimingArm.targetUp.copyFrom(this.inputManager.aimedNormal);
        }
    }
}