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
        public galaxy: Galaxy,
        name: string,
        position: BABYLON.Vector3,
        public kPosMax: number,
        public seaLevelRatio: number,
        public scene: BABYLON.Scene,
        createGenerator: (planet: Planet) => PlanetGenerator
    ) {
        super(name, scene);
        this.galaxy.planets.push(this);
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

        if (DebugDefine.SHOW_PLANET_CORNER_FLAGS) {
            let p = BABYLON.Vector3.One();
            p.scaleInPlace(this.kPosMax * PlanetTools.CHUNCKSIZE);
            let d = p.x;
            let lines = [
                [new BABYLON.Vector3(d, d, d), new BABYLON.Vector3(- d, -d, -d)],
                [new BABYLON.Vector3(d, d, - d), new BABYLON.Vector3(- d, - d, d)],
                [new BABYLON.Vector3(- d, d, d), new BABYLON.Vector3(d, - d, - d)],
                [new BABYLON.Vector3(- d, d, - d), new BABYLON.Vector3(d, - d, d)]
            ];
            let color = new BABYLON.Color4(1, 0, 1);
            let colors = [
                [color, color],
                [color, color],
                [color, color],
                [color, color]
            ]
            let debugCornerFlagsMesh = BABYLON.MeshBuilder.CreateLineSystem(
                this.name + "-debug-corner-flags",
                {
                    lines: lines,
                    colors: colors
                },
                this.scene
            );
            debugCornerFlagsMesh.parent = this;
        }
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
