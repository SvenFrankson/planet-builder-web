class Planet extends BABYLON.Mesh {

    public static DEBUG_INSTANCE: Planet;

    private sides: PlanetSide[];
    public GetSide(side: Side): PlanetSide {
        return this.sides[side];
    }

    public kPosMax: number;
	
    public GetPlanetName(): string {
        return this.name;
    }

    public generator: PlanetGenerator;
    public chunckManager: PlanetChunckManager;

    constructor(
        name: string,
        kPosMax: number,
        scene?: BABYLON.Scene
    ) {
        if (!scene) {
            scene = BABYLON.Engine.Instances[0].scenes[0];
        }
        super(name, scene);
        Planet.DEBUG_INSTANCE = this;
        
        this.kPosMax = kPosMax;
		
        this.sides = [];
        this.sides[Side.Front] = new PlanetSide(Side.Front, this);
        this.sides[Side.Right] = new PlanetSide(Side.Right, this);
        this.sides[Side.Back] = new PlanetSide(Side.Back, this);
        this.sides[Side.Left] = new PlanetSide(Side.Left, this);
        this.sides[Side.Top] = new PlanetSide(Side.Top, this);
        this.sides[Side.Bottom] = new PlanetSide(Side.Bottom, this);

        this.chunckManager = new PlanetChunckManager(scene)
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
