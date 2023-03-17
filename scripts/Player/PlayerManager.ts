class PlayerManager {

    public armManager: HumanArmManager;

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
        this.armManager = new HumanArmManager(player);
    }

    public initialize(): void {
        this.armManager.initialize();
        this.player.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(): void {
        this.armManager.dispose();
        this.player.scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    private _update = () => {
        this.armManager.aimedPosition = this.inputManager.aimedPosition;
        this.armManager.aimedNormal = this.inputManager.aimedNormal;
        if (this.inputManager.aimedElement) {
            this.armManager.aimedDragMode = this.inputManager.aimedElement.dragMode;
            this.armManager.aimedInteractionMode = this.inputManager.aimedElement.interactionMode;
        }
        if (this.inputManager.inventoryOpened) {
            this.player.headMove = true;
        }
        else {
            this.player.headMove = false;
        }
        this.armManager.useWristWatch = this.inputManager.inventoryOpened;
    }
}