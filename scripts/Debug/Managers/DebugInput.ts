class DebugInput {
    
    private _initialized: boolean = false;
    public get initialized(): boolean {
        return this._initialized;
    }

    public debugContainer: HTMLDivElement;
    public container: HTMLDivElement;

    private _playerHeadUp: DebugDisplayFrameValue;
    private _playerHeadRight: DebugDisplayFrameValue;

    public get scene(): BABYLON.Scene {
        return this.player.scene;
    }

    constructor(public player: Player) {

    }

    public initialize(): void {
        this.debugContainer = document.querySelector("#debug-container");
        if (!this.debugContainer) {
            this.debugContainer = document.createElement("div");
            this.debugContainer.id = "debug-container";
            document.body.appendChild(this.debugContainer);
        }

        this.container = document.querySelector("#debug-player-position");
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "debug-player-position";
            this.container.classList.add("debug", "hidden");
            this.debugContainer.appendChild(this.container);
        }
        
        let playerHeadRightId = "player-head-right";
        this._playerHeadRight = document.querySelector("#" + playerHeadRightId) as DebugDisplayFrameValue;
        if (!this._playerHeadRight) {
            this._playerHeadRight = document.createElement("debug-display-frame-value") as DebugDisplayFrameValue;
            this._playerHeadRight.id = playerHeadRightId;
            this._playerHeadRight.setAttribute("label", "Head X");
            this._playerHeadRight.setAttribute("min", "-1");
            this._playerHeadRight.setAttribute("max", "1");
            this.container.appendChild(this._playerHeadRight);
        }
        
        let playerHeadUpId = "player-head-up";
        this._playerHeadUp = document.querySelector("#" + playerHeadUpId) as DebugDisplayFrameValue;
        if (!this._playerHeadUp) {
            this._playerHeadUp = document.createElement("debug-display-frame-value") as DebugDisplayFrameValue;
            this._playerHeadUp.id = playerHeadUpId;
            this._playerHeadUp.setAttribute("label", "Head Y");
            this._playerHeadUp.setAttribute("min", "-1");
            this._playerHeadUp.setAttribute("max", "1");
            this.container.appendChild(this._playerHeadUp);
        }

        this._initialized = true;
    }

    private _update = () => {
        this._playerHeadRight.addValue(this.player.inputHeadRight);
        this._playerHeadUp.addValue(this.player.inputHeadUp);
    }

    public show(): void {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public hide(): void {
        this.container.classList.add("hidden");
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
}