class Planet extends BABYLON.Mesh {

    private sides: PlanetSide[];
    public GetSide(side: Side): PlanetSide {
        return this.sides[side];
    }

    public kPosMax: number;
	
    public GetPlanetName(): string {
        return this.name;
    }

    public generator: PlanetGenerator;

    constructor(name: string, kPosMax: number) {
        super(name, Game.Scene);
        this.kPosMax = kPosMax;
		
        this.sides = [];
        this.sides[Side.Front] = new PlanetSide(Side.Front, this);
        this.sides[Side.Right] = new PlanetSide(Side.Right, this);
        this.sides[Side.Back] = new PlanetSide(Side.Back, this);
        this.sides[Side.Left] = new PlanetSide(Side.Left, this);
        this.sides[Side.Top] = new PlanetSide(Side.Top, this);
        this.sides[Side.Bottom] = new PlanetSide(Side.Bottom, this);
    }

    public Initialize(): void {
        for (let i: number = 0; i < this.sides.length; i++) {
            this.sides[i].Initialize();
        }
    }

    public AsyncInitialize(): void {
        for (let i: number = 0; i < this.sides.length; i++) {
            this.sides[i].AsyncInitialize();
        }
    }
}
