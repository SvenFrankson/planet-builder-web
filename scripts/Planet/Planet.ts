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
        console.log(this.name + " " + this.degree);

        this.seaLevel = Math.round(this.kPosMax * this.seaLevelRatio * PlanetTools.CHUNCKSIZE);
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
        this.chunckManager.initialize();
        this.planetSides.forEach(planetSide => {
            planetSide.instantiate();
        })
    }

    public register(): void {
        let chunckCount = 0;
        let t0 = performance.now();
        for (let i = 0; i < this.planetSides.length; i++) {
            chunckCount += this.planetSides[i].register();
        }
        let t1 = performance.now();
        console.log("Planet " + this.name + " registered in " + (t1 - t0).toFixed(1) + "ms");
        console.log("Planet " + this.name + " has " + chunckCount.toFixed(0) + " chuncks");
    }
}
