enum ArmManagerMode {
    Idle,
    Aim,
    Lean,
    WristWatch
}

class PlayerArmManager {

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

    public get inputManager(): InputManager {
        return this.player.inputManager;
    }

    public get scene(): BABYLON.Scene {
        return this.player.scene;
    }

    public wait = AnimationFactory.EmptyVoidCallback;

    constructor(
        public player: Player
    ) {
        this.wait = AnimationFactory.CreateWait(this);
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

    private _timer: number = 0;
    private _breathAmplitude: number = 0.02;
    private _breathPeriod: number = 6;
    private _update = () => {
        this._timer += this.scene.getEngine().getDeltaTime() / 1000;

        let breathY = Math.cos(this._timer / this._breathPeriod * 2 * Math.PI) * 0.5 * this._breathAmplitude;
        let breathYL = this.leftArm.handMode === HandMode.WristWatch ? breathY * 0.1 : breathY;
        let breathYR = this.rightArm.handMode === HandMode.WristWatch ? breathY * 0.1 : breathY;

        this._dpLeftArm.copyFrom(this.leftArm.position);
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(- 0.2, 1.55 + breathYL, 0), this.player.getWorldMatrix(), this._tmpDP);
        this.leftArm.position.copyFrom(this._tmpDP);
        this._dpLeftArm.subtractInPlace(this.leftArm.position).scaleInPlace(-1);
        this.leftArm.rotationQuaternion.copyFrom(this.player.rotationQuaternion);
        this.leftArm.targetPosition.addInPlace(this._dpLeftArm);

        this._dpRightArm.copyFrom(this.rightArm.position);
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0.2, 1.55 + breathYR, 0), this.player.getWorldMatrix(), this._tmpDP);
        this.rightArm.position.copyFrom(this._tmpDP);
        this._dpRightArm.subtractInPlace(this.rightArm.position).scaleInPlace(-1);
        this.rightArm.rotationQuaternion.copyFrom(this.player.rotationQuaternion);
        this.rightArm.targetPosition.addInPlace(this._dpRightArm);

        if (this.mode === ArmManagerMode.Idle) {
            this._updateIdle();
        }
        
        if (this.mode === ArmManagerMode.Aim) {
            this._updateAim();
        }
        
        if (this.mode === ArmManagerMode.WristWatch) {
            this.player.headMove = true;
            this._updateWristWatch();
        }
        else {
            this.player.headMove = false;
        }
    }

    private _updateIdle(): void {
        if (this.inputManager.aimedPosition && this.inputManager.aimedElement.interactionMode != InteractionMode.None) {
            if (this.mode != ArmManagerMode.Aim) {
                this._aimingDistance = 0.1;
                this._currentAimingDistance = 0.1;
            }
            this.mode = ArmManagerMode.Aim;
            return;
        }

        if (this.inputManager.inventoryOpened) {
            if (this.mode != ArmManagerMode.WristWatch) {
                this._aimingDistance = 0.05;
                this._currentAimingDistance = 0.05;
                this._aimingArm = this.rightArm;
                this._tmpPreviousCamPosRotationX = this.player.camPos.rotation.x;
                this.startPowerWristWatchAnimation();
                
            }
            this.mode = ArmManagerMode.WristWatch;
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
    private _updateAim(): void {

        if (!this.inputManager.aimedPosition) {
            this.mode = ArmManagerMode.Idle;
            return;
        }
        if (this.inputManager.aimedElement && this.inputManager.aimedElement.interactionMode === InteractionMode.None) {
            this.mode = ArmManagerMode.Idle;
            return;
        }

        // 1 - Track which arm should be used.
        if (!this._aimingArm) {
            this._aimingArm = this.rightArm;
        }
        let dx = BABYLON.Vector3.Dot(this.inputManager.aimedPosition.subtract(this.player.position), this.player.right);
        console.log("dx = " + dx.toFixed(3));
        if (this._aimingArm === this.leftArm && dx > 0.1) {
            this._aimingArm = this.rightArm;
            if (this.leftArm.handMode != HandMode.Idle) {
                this.leftArm.setHandMode(HandMode.Idle);
            }
        }
        else if (this._aimingArm === this.rightArm && dx < - 0.1) {
            this._aimingArm = this.leftArm;
            if (this.rightArm.handMode != HandMode.Idle) {
                this.rightArm.setHandMode(HandMode.Idle);
            }
        }

        let aimedPointClose = BABYLON.Vector3.Zero();
        VMath.StepToRef(this.player.camPos.absolutePosition.add(this._aimingArm.absolutePosition).scale(0.5), this.inputManager.aimedPosition, 0.9, aimedPointClose);
        // 2 - Update the way the hand should interact depending on aimed object.
        if (this.inputManager.aimedElement.interactionMode === InteractionMode.Point) {
            if (this._aimingArm.handMode != HandMode.Point && this._aimingArm.handMode != HandMode.PointPress) {
                this._aimingArm.setHandMode(HandMode.Point);
            }
        }
        else if (this.inputManager.aimedElement.interactionMode === InteractionMode.Touch) {
            if (this._aimingArm.handMode != HandMode.Touch && this._aimingArm.handMode != HandMode.TouchPress) {
                this._aimingArm.setHandMode(HandMode.Touch);
            }
        }
        else if (this.inputManager.aimedElement.interactionMode === InteractionMode.Grab) {
            if (this._aimingArm.handMode != HandMode.Grab) {
                this._aimingArm.setHandMode(HandMode.Grab);
            }
        }

        // 3 - Update arm target position.
        this._aimingArm.setTarget(aimedPointClose.add(this.inputManager.aimedNormal.scale(this._currentAimingDistance)));

        if (this._aimingArm.handMode === HandMode.Grab) {
            this._aimingArm.targetUp.copyFrom(this.inputManager.aimedNormal);
        }
        else if (this._aimingArm.handMode === HandMode.Touch || this._aimingArm.handMode === HandMode.TouchPress) {
            this._aimingArm.handUp.copyFrom(this.player.up);
        }
        this._updateRequestedTargetIdle(this.other(this._aimingArm));
    }

    private _updateWristWatch(): void {
        if (!this.inputManager.inventoryOpened) {
            this.mode = ArmManagerMode.Idle;
            this.player.animateCamPosRotX(this._tmpPreviousCamPosRotationX, 0.3);
            this.player.animateCamPosRotY(0, 0.3);
            return;
        }

        // 2 - Update the way the hand should interact depending on aimed object.
        if (this.leftArm.handMode != HandMode.WristWatch) {
            this.leftArm.setHandMode(HandMode.WristWatch);
        }
        if (this.rightArm.handMode != HandMode.Touch && this.rightArm.handMode != HandMode.TouchPress) {
            this.rightArm.setHandMode(HandMode.Touch);
        }

        let wristWatch = WristWatch.Instances.find(ww => { return ww.player === this.player; });

        // 3 - Update arm target position.
        let pos = BABYLON.Vector3.TransformCoordinates(PlayerArmManager.POS, this.player.getWorldMatrix());
        let right = this.player.right;
        let up = BABYLON.Vector3.Cross(right, this.player.camPos.absolutePosition.subtract(pos)).normalize();
        this.leftArm.setTarget(pos);
        this.leftArm.handUp = up;
        this.rightArm.handUp = this.player.up;
        
        if (wristWatch) {
            if (this.inputManager.aimedPosition && this.inputManager.aimedElement.interactionMode === InteractionMode.Touch) {
                let offset = this.inputManager.aimedNormal.add(this.player.right).normalize();
                let pos = this.inputManager.aimedPosition;
                if (this._pointerDown && this.inputManager.aimedElement.dragMode === DragMode.Static) {
                    pos = this._pointerDownAimedPosition;
                }
                this.rightArm.setTarget(pos.add(offset.scale(this._currentAimingDistance)));
            }
            else {
                if (this._currentAimingDistance === 0) {
                    this._currentAimingDistance = this._aimingDistance;
                }
                this.rightArm.setTarget(wristWatch.powerButton.absolutePosition.add(up.scale(this._currentAimingDistance)));
            }
        }

        // 4 - Update target look.
        if (wristWatch) {
            let pos = wristWatch.holoMesh.absolutePosition;
            this.player.targetLook = pos;
            this.player.targetLookStrength = 0.35;
        }
    }

    private _pointerDownAimedPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    public async pointerUpAnimation(pickable: IPickable, actionCallback?: () => void): Promise<void> {
        this._pointerDown = false;
        if (pickable && pickable.interactionMode === InteractionMode.Point) {
            if (this._aimingArm) {
                this._aimingArm.setHandMode(HandMode.PointPress);
                await this._animateAimingDistance(0.01, 0.2);
                if (actionCallback) {
                    actionCallback();
                }
                await this.wait(0.3);
                this._aimingArm.setHandMode(HandMode.Point);
                await this._animateAimingDistance(this._aimingDistance, 0.3);
            }
        }
        else if (pickable && pickable.interactionMode === InteractionMode.Touch) {
            if (this._aimingArm) {
                if (this._currentAimingDistance > 0) {
                    await this.pointerDownAnimation(pickable);
                    if (actionCallback) {
                        actionCallback();
                    }
                    await this.wait(0.3);
                }
                else {
                    if (actionCallback) {
                        actionCallback();
                    }
                }
                this._aimingArm.setHandMode(HandMode.Touch);
                await this._animateAimingDistance(this._aimingDistance, 0.1);
            }
        }
        else {
            if (actionCallback) {
                actionCallback();
            }
        }
    }

    public async pointerDownAnimation(pickable: IPickable, actionCallback?: () => void): Promise<void> {
        this._pointerDown = true;
        if (this.inputManager.aimedPosition) {
            this._pointerDownAimedPosition.copyFrom(this.inputManager.aimedPosition);
        }
        if (pickable && pickable.interactionMode === InteractionMode.Touch) {
            if (this._aimingArm) {
                this._aimingArm.setHandMode(HandMode.TouchPress);
                if (actionCallback) {
                    actionCallback();
                }
                await this._animateAimingDistance(0, 0.1);
            }
        }
        else {
            if (actionCallback) {
                actionCallback();
            }
        }
    }

    public async startPowerWristWatchAnimation(actionCallback?: () => void): Promise<void> {
        await this.wait(0.7);
        this.rightArm.setHandMode(HandMode.Touch);
        await this._animateAimingDistance(0.01, 0.3);
        if (actionCallback) {
            actionCallback();
        }
        await this.wait(0.3);
        this.rightArm.setHandMode(HandMode.TouchPress);
        await this._animateAimingDistance(0.05, 0.3);
    }

    private _animateAimingDistanceCB: () => void;
    private async _animateAimingDistance(distanceTarget: number, duration: number = 1): Promise<void> {
        if (this.player.scene) {
            if (this._animateAimingDistanceCB) {
                this.player.scene.onBeforeRenderObservable.removeCallback(this._animateAimingDistanceCB);
            }
            return new Promise<void>(resolve => {
                let distanceZero = this._currentAimingDistance;
                let t = 0;
                this._animateAimingDistanceCB = () => {
                    t += this.player.scene.getEngine().getDeltaTime() / 1000;
                    if (t < duration) {
                        let f = t / duration;
                        this._currentAimingDistance = distanceZero * (1 - f) + distanceTarget * f;
                    }
                    else {
                        this._currentAimingDistance = distanceTarget;
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