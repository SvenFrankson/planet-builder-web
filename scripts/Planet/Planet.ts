class Planet extends BABYLON.Mesh {

    public static DEBUG_INSTANCE: Planet;

    private planetSides: PlanetSide[];
    public GetSide(side: Side): PlanetSide {
        return this.planetSides[side];
    }

    public degree: number;
    public seaLevel: number;
    public seaAltitude: number;
	
    public GetPlanetName(): string {
        return this.name;
    }

    public chunckManager: PlanetChunckManager;
    public generator: PlanetGenerator;

    public chunckMaterial: PlanetMaterial;

    constructor(
        name: string,
        position: BABYLON.Vector3,
        public kPosMax: number,
        public seaLevelRatio: number,
        public scene: BABYLON.Scene,
        createGenerator: (planet: Planet) => PlanetGenerator
    ) {
        super(name, scene);
        this.position.copyFrom(position);
        this.freezeWorldMatrix();
        Planet.DEBUG_INSTANCE = this;
        
        this.kPosMax = kPosMax;
        this.degree = PlanetTools.KPosToDegree(this.kPosMax);

        this.seaLevel = Math.floor(this.kPosMax * this.seaLevelRatio * PlanetTools.CHUNCKSIZE);
        this.seaAltitude = PlanetTools.KGlobalToAltitude(this.seaLevel);
		
        this.generator = createGenerator(this);
        if (!this.generator) {
            debugger;
        }

        this.chunckMaterial = new PlanetMaterial(this.name + "-chunck-material", this.scene);
        this.chunckMaterial.setPlanetPos(this.position);

        this.planetSides = [];
        this.planetSides[Side.Front] = new PlanetSide(Side.Front, this);
        this.planetSides[Side.Right] = new PlanetSide(Side.Right, this);
        this.planetSides[Side.Back] = new PlanetSide(Side.Back, this);
        this.planetSides[Side.Left] = new PlanetSide(Side.Left, this);
        this.planetSides[Side.Top] = new PlanetSide(Side.Top, this);
        this.planetSides[Side.Bottom] = new PlanetSide(Side.Bottom, this);

        this.chunckManager = new PlanetChunckManager(this._scene);
    }

    public instantiate(): void {
        let timers: number[];
        let logOutput: string;
        let useLog = DebugDefine.LOG_PLANET_INSTANTIATE_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "instantiate planet " + this.name;
        }
        this.chunckManager.initialize();
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  chunckManager initialized in " + (timers[1] - timers[0]).toFixed(0) + " ms";
        }
        this.planetSides.forEach(planetSide => {
            planetSide.instantiate();
        });
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  planetsides instantiated in " + (timers[2] - timers[1]).toFixed(0) + " ms";
            logOutput += "\nplanet " + this.name + " instantiated in " + (timers[2] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }
    }

    public register(): void {
        let chunckCount = 0;
        for (let i = 0; i < this.planetSides.length; i++) {
            chunckCount += this.planetSides[i].register();
        }
    }
}
