enum ArmManagerMode {
    Idle,
    Aim,
    Contact
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
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(- 0.2, 1.6, 0), this.player.getWorldMatrix(), this._tmpDP);
        this.leftArm.position.copyFrom(this._tmpDP);
        this._dpLeftArm.subtractInPlace(this.leftArm.position).scaleInPlace(-1);
        this.leftArm.rotationQuaternion.copyFrom(this.player.rotationQuaternion);
        this.leftArm.targetPosition.addInPlace(this._dpLeftArm);

        this._dpRightArm.copyFrom(this.rightArm.position);
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0.2, 1.6, 0), this.player.getWorldMatrix(), this._tmpDP);
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
        else if (this.mode === ArmManagerMode.Contact) {
            this._updateContact();
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
            this.leftArm.targetPosition.copyFrom(target);
        }
        else {
            let target = new BABYLON.Vector3(0.1, - this.rightArm.wristLength, 0);
            target.normalize().scaleInPlace(this.rightArm.wristLength);
            target = BABYLON.Vector3.TransformCoordinates(target, this.rightArm.getWorldMatrix());
            this.rightArm.targetPosition.copyFrom(target);
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
        if (d < 0.9) {
            this._aimingStretch = 1;
        }
        else {
            this._aimingStretch = 0.4;
        }
        
        let tmp = new BABYLON.Vector3();
        VMath.StepToRef(this.player.camPos.absolutePosition.add(this._aimingArm.absolutePosition).scale(0.5), this.inputManager.aimedPosition.add(this.inputManager.aimedNormal.scale(this._aimingDistance)), this._aimingStretch, tmp);
        this._aimingArm.setTarget(tmp);

        if (this._aimingArm.handMode === HandMode.Grab) {
            this._aimingArm.targetUp.copyFrom(this.inputManager.aimedNormal);
        }
        this._updateRequestedTargetIdle(this.other(this._aimingArm));
    }

    private _contactArm: PlayerArm;
    private _contactPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _contactNormal: BABYLON.Vector3 = BABYLON.Vector3.One();
    private _updateContact(): void {
        // 1 - Track which arm should be used.
        if (!this._contactArm) {
            this._contactArm = this.rightArm;
        }
        let dx = BABYLON.Vector3.Dot(this._contactPosition, this.player.right)
        if (this._contactArm === this.leftArm && dx > 0.2) {
            this._contactArm = this.rightArm;
            if (this.leftArm.handMode != HandMode.Contact) {
                this.leftArm.setHandMode(HandMode.Contact);
            }
        }
        else if (this._contactArm === this.rightArm && dx < - 0.2) {
            this._contactArm = this.leftArm;
            if (this.rightArm.handMode != HandMode.Contact) {
                this.rightArm.setHandMode(HandMode.Contact);
            }
        }

        // 2 - Update the way the hand should interact depending on aimed object.
        if (this._contactArm.handMode != HandMode.Contact) {
            this._contactArm.setHandMode(HandMode.Contact);
        }

        // 3 - Update arm target position.
        this._aimingArm.setTarget(this._contactPosition);
        this._aimingArm.targetUp.copyFrom(this._contactNormal);

        this._updateRequestedTargetIdle(this.other(this._contactArm));
    }

    public async startActionAnimation(actionCallback?: () => void): Promise<void> {
        if (this._aimingArm) {
            this._aimingArm.setHandMode(HandMode.PointPress);
            await this._animateAimingDistance(0.01, 0.3);
            if (actionCallback) {
                actionCallback();
            }
            this._aimingArm.setHandMode(HandMode.Point);
            await this._animateAimingDistance(0.1, 0.3);
        }
    }

    public async startWallContactAnimation(contactPoint: BABYLON.Vector3, contactNormal: BABYLON.Vector3): Promise<void> {
        if (this.mode != ArmManagerMode.Contact) {
            this.mode = ArmManagerMode.Contact;
            this._contactPosition.copyFrom(contactPoint);
            this._contactNormal.copyFrom(contactNormal);
            await this._wait(2);
            this.mode = ArmManagerMode.Idle;
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

    private _waitCB: () => void;
    private async _wait(duration: number = 1): Promise<void> {
        if (this.player.scene) {
            if (this._waitCB) {
                this.player.scene.onBeforeRenderObservable.removeCallback(this._waitCB);
            }
            return new Promise<void>(resolve => {
                let t = 0;
                this._waitCB = () => {
                    t += this.player.scene.getEngine().getDeltaTime() / 1000;
                    if (t < duration) {
                        // wait
                    }
                    else {
                        this.player.scene.onBeforeRenderObservable.removeCallback(this._waitCB);
                        this._waitCB = undefined;
                        resolve();
                    }
                }
                this.player.scene.onBeforeRenderObservable.add(this._waitCB);
            });
        }
    }
}