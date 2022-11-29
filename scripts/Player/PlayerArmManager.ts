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

    private _update = () => {
        this.leftArm.position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(- 0.2, 0.7, 0), this.player.getWorldMatrix());
        this.leftArm.rotationQuaternion = this.player.rotationQuaternion;
        this.rightArm.position = BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(0.2, 0.7, 0), this.player.getWorldMatrix());
        this.rightArm.rotationQuaternion = this.player.rotationQuaternion;

        if (this.inputManager.aimedPosition) {
            let arm: PlayerArm;
            if (this.inputManager.aimedPosition.x > 0) {
                arm = this.rightArm;
                if (this.leftArm.handMode != HandMode.Idle) {
                    this.leftArm.setHandMode(HandMode.Idle);
                }
            }
            else {
                arm = this.leftArm;
                if (this.rightArm.handMode != HandMode.Idle) {
                    this.rightArm.setHandMode(HandMode.Idle);
                }
            }
            if (this.inputManager.aimedElement.interactionMode === InteractionMode.Point) {
                if (arm.handMode != HandMode.Point) {
                    arm.setHandMode(HandMode.Point);
                }
            }
            else if (this.inputManager.aimedElement.interactionMode === InteractionMode.Grab) {
                if (arm.handMode != HandMode.Grab) {
                    arm.setHandMode(HandMode.Grab);
                }
            }
            arm.setTarget(this.inputManager.aimedPosition);
            if (arm.handMode === HandMode.Grab) {
                arm.targetUp.copyFrom(this.inputManager.aimedNormal);
            }
        }
        else {
            if (this.leftArm.handMode != HandMode.Idle) {
                this.leftArm.setHandMode(HandMode.Idle);
            }
            if (this.rightArm.handMode != HandMode.Idle) {
                this.rightArm.setHandMode(HandMode.Idle);
            }
        }
    }
}