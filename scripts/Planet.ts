/// <reference path="../lib/babylon.2.4.d.ts"/>
class Planet extends BABYLON.Mesh {
  private sides: Array<PlanetSide>;
  public GetSide(side: Side): PlanetSide {
    return this.sides[side];
  }
  private size: number;
  public GetSize(): number {
    return this.size;
  }
  private radiusZero: number;
  public GetRadiusZero(): number {
    return this.radiusZero;
  }
  public GetRadiusWater(): number {
    return this.GetRadiusZero() + this.GetSize() / 4 - 3 - 0.2;
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
    size: number
  ) {
    super(name, Game.Scene);
    this.size = size;
    this.radiusZero = Math.floor((2 / Math.PI - 1 / 8) * this.size);
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
