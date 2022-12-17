class DebugPlayerPosition {
    
    private _initialized: boolean = false;
    public get initialized(): boolean {
        return this._initialized;
    }

    public debugContainer: HTMLDivElement;
    public container: HTMLDivElement;

    private _playerCoordinates: DebugDisplayTextValue;
    private _playerPosition: DebugDisplayVector3Value;
    private _playerLocalPosition: DebugDisplayVector3Value;
    private _playerSide: DebugDisplayTextValue;
    private _playerGlobalIJK: DebugDisplayVector3Value;
    private _playerChunck: DebugDisplayVector3Value;
    private _playerLocalIJK: DebugDisplayVector3Value;

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
        
        let playerCoordinatesId = "#player-coordinates";
        this._playerCoordinates = document.querySelector(playerCoordinatesId) as DebugDisplayTextValue;
        if (!this._playerCoordinates) {
            this._playerCoordinates = document.createElement("debug-display-text-value") as DebugDisplayTextValue;
            this._playerCoordinates.id = playerCoordinatesId;
            this._playerCoordinates.setAttribute("label", "Coordinates");
            this.container.appendChild(this._playerCoordinates);
        }

        this._playerPosition = document.querySelector("#player-position") as DebugDisplayVector3Value;
        this._playerLocalPosition = document.querySelector("#player-local-position") as DebugDisplayVector3Value;
        
        let playerSideId = "#player-planet-side";
        this._playerSide = document.querySelector(playerSideId) as DebugDisplayTextValue;
        if (!this._playerSide) {
            this._playerSide = document.createElement("debug-display-text-value") as DebugDisplayTextValue;
            this._playerSide.id = playerSideId;
            this._playerSide.setAttribute("label", "Side");
            this.container.appendChild(this._playerSide);
        }

        this._playerGlobalIJK = document.querySelector("#player-global-ijk") as DebugDisplayVector3Value;
        this._playerChunck = document.querySelector("#player-chunck") as DebugDisplayVector3Value;
        this._playerLocalIJK = document.querySelector("#player-local-ijk") as DebugDisplayVector3Value;

        this._initialized = true;
    }

    private _update = () => {
        let position = this.player.position.clone();
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

            if (this.player.planet) {
                let northPole = new BABYLON.Vector3(0, this.player.planet.kPosMax * PlanetTools.CHUNCKSIZE, 0);
                let northDir = northPole.subtract(position);
                let dir = this.player.forward;
                heading = VMath.AngleFromToAround(northDir, dir, position) / Math.PI * 180;
            }
        }
        this._playerCoordinates.setText("Lat " + latitude.toFixed(0) + "° Lon " + longitude.toFixed(0) + "° Hdg " + heading.toFixed(0) + "°");

        this._playerPosition.setValue(position);

        if (this.player.planet) {
            let planetSide = PlanetTools.PlanetPositionToPlanetSide(this.player.planet, position);
    
            let quat = planetSide.rotationQuaternion.clone();
            let localPos: BABYLON.Vector3 = position.clone()
            position.rotateByQuaternionToRef(quat, localPos);
            this._playerLocalPosition.setValue(localPos);
            
            this._playerSide.setText(SideNames[planetSide.side]);
            let globalIJK = PlanetTools.PlanetPositionToGlobalIJK(planetSide, position);
            this._playerGlobalIJK.setValue(globalIJK);
    
            let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
            if (localIJK) {
                let chunck = localIJK.planetChunck;
                this._playerChunck.setValue(chunck.iPos, chunck.jPos, chunck.kPos);
                this._playerLocalIJK.setValue(localIJK);
            }
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