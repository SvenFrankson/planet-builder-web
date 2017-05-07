/// <reference path="../lib/babylon.2.4.d.ts"/>

class Planet extends BABYLON.Mesh {
  private sides: Array<PlanetSide>;
  public GetSide(side: Side): PlanetSide {
    return this.sides[side];
  }
  private kPosMax: number;
  public GetKPosMax(): number {
    return this.kPosMax;
  }
  public GetRadiusWater(): number {
    return this.kPosMax * PlanetTools.CHUNCKSIZE / 4;
  }
  private totalRadiusWaterSquared: number;
  public GetTotalRadiusWaterSquared(): number {
    return this.totalRadiusWaterSquared;
  }
  public GetPlanetName(): string {
    return this.name;
  }

  constructor(
    name: string,
    kPosMax: number
  ) {
    super(name, Game.Scene);
    this.kPosMax = kPosMax;
    this.totalRadiusWaterSquared = this.GetRadiusWater() * this.GetRadiusWater();
    console.log(this.totalRadiusWaterSquared);
    this.sides = new Array<PlanetSide>();
    this.sides[Side.Right] = new PlanetSide(Side.Right, this);
    this.sides[Side.Left] = new PlanetSide(Side.Left, this);
    this.sides[Side.Front] = new PlanetSide(Side.Front, this);
    this.sides[Side.Back] = new PlanetSide(Side.Back, this);
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
