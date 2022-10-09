class DebugPlanetSkyColor {
    
    private _initialized: boolean = false;
    public get initialized(): boolean {
        return this._initialized;
    }

    public container: HTMLDivElement;

    constructor(public game: Game) {

    }

    public initialize(): void {
        this.container = document.querySelector("#debug-planet-sky-color");

        let planetSky = this.game.planetSky;
        
        let inputDawnColor = document.querySelector("#planet-sky-dawn-color") as DebugDisplayColorInput;
        inputDawnColor.setColor(planetSky.dawnColor);
        inputDawnColor.onInput = (color) => {
            planetSky.dawnColor.copyFrom(color);
        }
        
        let inputZenithColor = document.querySelector("#planet-sky-zenith-color") as DebugDisplayColorInput;
        inputZenithColor.setColor(planetSky.zenithColor);
        inputZenithColor.onInput = (color) => {
            planetSky.zenithColor.copyFrom(color);
        }
        
        let inputNightColor = document.querySelector("#planet-sky-night-color") as DebugDisplayColorInput;
        inputNightColor.setColor(planetSky.nightColor);
        inputNightColor.onInput = (color) => {
            planetSky.nightColor.copyFrom(color);
        }

        this._initialized = true;
    }

    public show(): void {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
    }

    public hide(): void {
        this.container.classList.add("hidden");
    }
}