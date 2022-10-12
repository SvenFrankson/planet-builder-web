class DebugPlayerPosition {
    
    private _initialized: boolean = false;
    public get initialized(): boolean {
        return this._initialized;
    }

    public container: HTMLDivElement;

    private _playerPosition: DebugDisplayVector3Value;
    private _playerSide: DebugDisplayTextValue;
    private _playerGlobalIJK: DebugDisplayVector3Value;
    private _playerChunck: DebugDisplayVector3Value;
    private _playerLocalIJK: DebugDisplayVector3Value;

    public get scene(): BABYLON.Scene {
        return this.game.scene;
    }

    constructor(public game: Game) {

    }

    public initialize(): void {
        this.container = document.querySelector("#debug-player-position");
        
        this._playerPosition = document.querySelector("#player-position") as DebugDisplayVector3Value;
        this._playerSide = document.querySelector("#player-planet-side") as DebugDisplayTextValue;
        this._playerGlobalIJK = document.querySelector("#player-global-ijk") as DebugDisplayVector3Value;
        this._playerChunck = document.querySelector("#player-chunck") as DebugDisplayVector3Value;
        this._playerLocalIJK = document.querySelector("#player-local-ijk") as DebugDisplayVector3Value;

        this._initialized = true;
    }

    private _update = () => {
        let position = this.game.player.position;
        this._playerPosition.setValue(position);

        let planetSide = PlanetTools.WorldPositionToPlanetSide(this.game.player.planet, position);
        this._playerSide.setText(SideNames[planetSide.side]);
        let globalIJK = PlanetTools.WorldPositionToGlobalIJK(planetSide, position);
        this._playerGlobalIJK.setValue(globalIJK);

        let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
        let chunck = localIJK.planetChunck;
        this._playerChunck.setValue(chunck.iPos, chunck.jPos, chunck.kPos);
        this._playerLocalIJK.setValue(localIJK);
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