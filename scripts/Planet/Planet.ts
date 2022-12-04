class Planet extends BABYLON.Mesh {

    public static DEBUG_INSTANCE: Planet;

    private sides: PlanetSide[];
    public GetSide(side: Side): PlanetSide {
        return this.sides[side];
    }

    public degree: number;
    public seaLevel: number;
	
    public GetPlanetName(): string {
        return this.name;
    }

    public chunckManager: PlanetChunckManager;
    public generator: PlanetGenerator;

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
        //this.freezeWorldMatrix();
        Planet.DEBUG_INSTANCE = this;
        
        this.kPosMax = kPosMax;
        this.degree = PlanetTools.KPosToDegree(this.kPosMax);

        this.seaLevel = Math.round(this.kPosMax * this.seaLevelRatio * PlanetTools.CHUNCKSIZE);
		
        this.generator = createGenerator(this);
        if (!this.generator) {
            debugger;
        }
        if (name === "Paulita") {
            this.generator.showDebug();
        }

        this.sides = [];
        this.sides[Side.Front] = new PlanetSide(Side.Front, this);
        this.sides[Side.Right] = new PlanetSide(Side.Right, this);
        this.sides[Side.Back] = new PlanetSide(Side.Back, this);
        this.sides[Side.Left] = new PlanetSide(Side.Left, this);
        this.sides[Side.Top] = new PlanetSide(Side.Top, this);
        this.sides[Side.Bottom] = new PlanetSide(Side.Bottom, this);

        this.chunckManager = new PlanetChunckManager(this._scene);
    }

    public initialize(): void {
        this.chunckManager.initialize();
    }

    public register(): void {
        let chunckCount = 0;
        let t0 = performance.now();
        for (let i = 0; i < this.sides.length; i++) {
            chunckCount += this.sides[i].register();
        }
        let t1 = performance.now();
        console.log("Planet " + this.name + " registered in " + (t1 - t0).toFixed(1) + "ms");
        console.log("Planet " + this.name + " has " + chunckCount.toFixed(0) + " chuncks");
    }
}
