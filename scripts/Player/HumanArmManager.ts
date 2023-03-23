enum ArmManagerMode {
    Idle,
    Aim,
    Lean,
    WristWatch
}

class HumanArmManager {

    public static POS: BABYLON.Vector3 = new BABYLON.Vector3(0.12, 1.33, 0.4);

    public leftArm: HumanArm;
    public rightArm: HumanArm;
    public other(arm: HumanArm): HumanArm {
        if (arm === this.leftArm) {
            return this.rightArm;
        }
        return this.leftArm;
    }
    
    public leftParent: BABYLON.Mesh;
    public leftPos: BABYLON.Vector3;
    public rightParent: BABYLON.Mesh;
    public rightPos: BABYLON.Vector3;
    
    public aimedPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public aimedNormal: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public aimedInteractionMode: InteractionMode = InteractionMode.None;
    public aimedDragMode: DragMode = DragMode.Static;
    public useWristWatch: boolean = false;

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
        public human: Player | Human | Drider
    ) {
        this.wait = AnimationFactory.CreateWait(this);
    }

    public initialize(): void {
        this.leftArm = new HumanArm(true, this.human.scene);
        this.leftArm.initialize();
        this.leftArm.instantiate();

        this.rightArm = new HumanArm(false, this.human.scene);
        this.rightArm.initialize();
        this.rightArm.instantiate();

        if (!this.leftParent) {
            this.leftParent = this.human;
        }
        if (!this.leftPos) {
            this.leftPos = new BABYLON.Vector3(- 0.2, 1.55, 0);
        }
        if (!this.rightParent) {
            this.rightParent = this.human;
        }
        if (!this.rightPos) {
            this.rightPos = new BABYLON.Vector3(0.2, 1.55, 0);
        }

        this.human.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.leftArm.dispose();
        this.rightArm.dispose();
        this.human.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    private mode: ArmManagerMode = ArmManagerMode.Idle;

    private _timer: number = 0;
    private _update = () => {
        this._timer += this.scene.getEngine().getDeltaTime() / 1000;

        this._dpLeftArm.copyFrom(this.leftArm.position);
        BABYLON.Vector3.TransformCoordinatesToRef(this.leftPos, this.leftParent.getWorldMatrix(), this._tmpDP);
        this.leftArm.position.copyFrom(this._tmpDP);
        this._dpLeftArm.subtractInPlace(this.leftArm.position).scaleInPlace(-1);
        this.leftArm.rotationQuaternion.copyFrom(this.human.rotationQuaternion);
        this.leftArm.targetPosition.addInPlace(this._dpLeftArm);

        this._dpRightArm.copyFrom(this.rightArm.position);
        BABYLON.Vector3.TransformCoordinatesToRef(this.rightPos, this.rightParent.getWorldMatrix(), this._tmpDP);
        this.rightArm.position.copyFrom(this._tmpDP);
        this._dpRightArm.subtractInPlace(this.rightArm.position).scaleInPlace(-1);
        this.rightArm.rotationQuaternion.copyFrom(this.human.rotationQuaternion);
        this.rightArm.targetPosition.addInPlace(this._dpRightArm);

        if (this.mode === ArmManagerMode.Idle) {
            this._updateIdle();
        }
        
        if (this.mode === ArmManagerMode.Aim) {
            this._updateAim();
        }
        
        if (this.mode === ArmManagerMode.WristWatch) {
            this._updateWristWatch();
        }
    }

    private _updateIdle(): void {
        if (this.aimedPosition && this.aimedInteractionMode != InteractionMode.None) {
            if (this.mode != ArmManagerMode.Aim) {
                this._aimingDistance = 0.1;
                this._currentAimingDistance = 0.1;
            }
            this.mode = ArmManagerMode.Aim;
            return;
        }

        if (this.useWristWatch) {
            if (this.mode != ArmManagerMode.WristWatch) {
                this._aimingDistance = 0.05;
                this._currentAimingDistance = 0.05;
                this._aimingArm = this.rightArm;
                this._tmpPreviousCamPosRotationX = this.human.camPos.rotation.x;
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

    private _updateRequestedTargetIdle(arm: HumanArm): void {
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

    private _aimingArm: HumanArm;
    private _updateAim(): void {

        if (!this.aimedPosition || this.aimedInteractionMode === InteractionMode.None) {
            this.mode = ArmManagerMode.Idle;
            return;
        }

        // 1 - Track which arm should be used.
        if (!this._aimingArm) {
            this._aimingArm = this.rightArm;
        }
        let dx = BABYLON.Vector3.Dot(this.aimedPosition.subtract(this.human.position), this.human.right);
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
        VMath.StepToRef(this.human.camPos.absolutePosition.add(this._aimingArm.absolutePosition).scale(0.5), this.aimedPosition, 0.9, aimedPointClose);
        // 2 - Update the way the hand should interact depending on aimed object.
        if (this.aimedInteractionMode === InteractionMode.Point) {
            if (this._aimingArm.handMode != HandMode.Point && this._aimingArm.handMode != HandMode.PointPress) {
                this._aimingArm.setHandMode(HandMode.Point);
            }
        }
        else if (this.aimedInteractionMode === InteractionMode.Touch) {
            if (this._aimingArm.handMode != HandMode.Touch && this._aimingArm.handMode != HandMode.TouchPress) {
                this._aimingArm.setHandMode(HandMode.Touch);
            }
        }
        else if (this.aimedInteractionMode === InteractionMode.Grab) {
            if (this._aimingArm.handMode != HandMode.Grab) {
                this._aimingArm.setHandMode(HandMode.Grab);
            }
        }

        // 3 - Update arm target position.
        this._aimingArm.setTarget(aimedPointClose.add(this.aimedNormal.scale(this._currentAimingDistance)));

        if (this._aimingArm.handMode === HandMode.Grab) {
            this._aimingArm.targetUp.copyFrom(this.aimedNormal);
        }
        else if (this._aimingArm.handMode === HandMode.Touch || this._aimingArm.handMode === HandMode.TouchPress) {
            this._aimingArm.handUp.copyFrom(this.human.up);
        }
        this._updateRequestedTargetIdle(this.other(this._aimingArm));
    }

    private _updateWristWatch(): void {
        if (!this.useWristWatch) {
            this.mode = ArmManagerMode.Idle;
            this.human.animateCamPosRotX(this._tmpPreviousCamPosRotationX, 0.3);
            this.human.animateCamPosRotY(0, 0.3);
            return;
        }

        // 2 - Update the way the hand should interact depending on aimed object.
        if (this.leftArm.handMode != HandMode.WristWatch) {
            this.leftArm.setHandMode(HandMode.WristWatch);
        }
        if (this.rightArm.handMode != HandMode.Touch && this.rightArm.handMode != HandMode.TouchPress) {
            this.rightArm.setHandMode(HandMode.Touch);
        }

        let wristWatch = WristWatch.Instances.find(ww => { return ww.player === this.human; });

        // 3 - Update arm target position.
        let pos = BABYLON.Vector3.TransformCoordinates(HumanArmManager.POS, this.human.getWorldMatrix());
        let right = this.human.right;
        let up = BABYLON.Vector3.Cross(right, this.human.camPos.absolutePosition.subtract(pos)).normalize();
        this.leftArm.setTarget(pos);
        this.leftArm.handUp = up;
        this.rightArm.handUp = this.human.up;
        
        if (wristWatch) {
            if (this.aimedPosition && this.aimedInteractionMode === InteractionMode.Touch) {
                let offset = this.aimedNormal.add(this.human.right).normalize();
                let pos = this.aimedPosition;
                if (this._pointerDown && this.aimedDragMode === DragMode.Static) {
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
            this.human.targetLook = pos;
            this.human.targetLookStrength = 0.35;
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
        if (this.aimedPosition) {
            this._pointerDownAimedPosition.copyFrom(this.aimedPosition);
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
        if (this.human.scene) {
            if (this._animateAimingDistanceCB) {
                this.human.scene.onBeforeRenderObservable.removeCallback(this._animateAimingDistanceCB);
            }
            return new Promise<void>(resolve => {
                let distanceZero = this._currentAimingDistance;
                let t = 0;
                this._animateAimingDistanceCB = () => {
                    t += this.human.scene.getEngine().getDeltaTime() / 1000;
                    if (t < duration) {
                        let f = t / duration;
                        this._currentAimingDistance = distanceZero * (1 - f) + distanceTarget * f;
                    }
                    else {
                        this._currentAimingDistance = distanceTarget;
                        this.human.scene.onBeforeRenderObservable.removeCallback(this._animateAimingDistanceCB);
                        this._animateAimingDistanceCB = undefined;
                        resolve();
                    }
                }
                this.human.scene.onBeforeRenderObservable.add(this._animateAimingDistanceCB);
            });
        }
    }
}