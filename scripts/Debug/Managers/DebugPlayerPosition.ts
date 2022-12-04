class DebugPlayerPosition {
    
    private _initialized: boolean = false;
    public get initialized(): boolean {
        return this._initialized;
    }

    public container: HTMLDivElement;

    private _playerCoordinates: DebugDisplayTextValue;
    private _playerPosition: DebugDisplayVector3Value;
    private _playerLocalPosition: DebugDisplayVector3Value;
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
        
        this._playerCoordinates = document.querySelector("#player-coordinates") as DebugDisplayTextValue;
        this._playerPosition = document.querySelector("#player-position") as DebugDisplayVector3Value;
        this._playerLocalPosition = document.querySelector("#player-local-position") as DebugDisplayVector3Value;
        this._playerSide = document.querySelector("#player-planet-side") as DebugDisplayTextValue;
        this._playerGlobalIJK = document.querySelector("#player-global-ijk") as DebugDisplayVector3Value;
        this._playerChunck = document.querySelector("#player-chunck") as DebugDisplayVector3Value;
        this._playerLocalIJK = document.querySelector("#player-local-ijk") as DebugDisplayVector3Value;

        this._initialized = true;
    }

    private _update = () => {
        let position = this.game.player.position.clone();
        let longitude = - VMath.AngleFromToAround(BABYLON.Axis.Z, position, BABYLON.Axis.Y) / Math.PI * 180;
        let latitude = 0;
        let heading = 0;
        if (position.y * position.y === position.lengthSquared()) {
            latitude = Math.sign(position.y) * 90;
        }
        else {
            let equatorPosition = position.clone();
            equatorPosition.y = 0;
            let axis = BABYLON.Vector3.Cross(position, BABYLON.Axis.Y);
            if (axis.lengthSquared() > 0) {
                latitude = VMath.AngleFromToAround(equatorPosition, position, axis) / Math.PI * 180;
            }

            let northPole = new BABYLON.Vector3(0, this.game.player.planet.kPosMax * PlanetTools.CHUNCKSIZE, 0);
            let northDir = northPole.subtract(position);
            let dir = this.game.player.forward;
            heading = VMath.AngleFromToAround(northDir, dir, position) / Math.PI * 180;
        }
        this._playerCoordinates.setText("Lat " + latitude.toFixed(0) + "° Lon " + longitude.toFixed(0) + "° Hdg " + heading.toFixed(0) + "°");

        this._playerPosition.setValue(position);

        let planetSide = PlanetTools.PlanetPositionToPlanetSide(this.game.player.planet, position);

        let quat = planetSide.rotationQuaternion.clone();
        let localPos: BABYLON.Vector3 = position.clone()
        position.rotateByQuaternionToRef(quat, localPos);
        this._playerLocalPosition.setValue(localPos);
        
        this._playerSide.setText(SideNames[planetSide.side]);
        let globalIJK = PlanetTools.PlanetPositionToGlobalIJK(planetSide, position);
        this._playerGlobalIJK.setValue(globalIJK);

        let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
        let chunck = localIJK.planetChunck;
        if (chunck) {
            this._playerChunck.setValue(chunck.iPos, chunck.jPos, chunck.kPos);
            this._playerLocalIJK.setValue(localIJK);
        }
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