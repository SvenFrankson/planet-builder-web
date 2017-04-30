/// <reference path="../lib/babylon.2.4.d.ts"/>
enum Side {
  Right,
  Left,
  Top,
  Bottom,
  Front,
  Back
}

class PlanetSide extends BABYLON.Mesh {
  private side: Side;
  public GetSide(): Side {
    return this.side;
  }
  private planet: Planet;
  public GetSize(): number {
    return this.planet.GetSize();
  }
  public GetPlanetName(): string {
    return this.planet.GetPlanetName();
  }
  public GetRadiusZero(): number {
    return this.planet.GetRadiusZero();
  }
  private chuncksLength: number;
  private chuncks: Array<Array<Array<PlanetChunck>>>;
  public GetChunck(i: number, j: number, k: number): PlanetChunck {
    return this.chuncks[i][j][k];
  }

  constructor(side: Side, planet: Planet) {
    let name: string = "side-" + side;
    super(name, Game.Scene);

    this.planet = planet;
    this.side = side;
    this.chuncksLength = this.GetSize() / PlanetTools.CHUNCKSIZE;
    this.rotationQuaternion = PlanetTools.QuaternionForSide(this.side);

    this.chuncks = new Array<Array<Array<PlanetChunck>>>();
    for (let i: number = 0; i < this.chuncksLength; i++) {
      this.chuncks[i] = new Array<Array<PlanetChunck>>();
      for (let j: number = 0; j < this.chuncksLength; j++) {
        this.chuncks[i][j] = new Array<PlanetChunck>();
        for (let k: number = 0; k < this.chuncksLength / 2; k++) {
          this.chuncks[i][j][k] = new PlanetChunck(i, j, k, this);
          this.chuncks[i][j][k].parent = this;
        }
      }
    }
  }

  public Initialize(): void {
    for (let i: number = 0; i < this.chuncksLength; i++) {
      for (let j: number = 0; j < this.chuncksLength; j++) {
        for (let k: number = 0; k < this.chuncksLength / 2; k++) {
          this.chuncks[i][j][k].Initialize();
        }
      }
    }
  }

  public AsyncInitialize(): void {
    for (let i: number = 0; i < this.chuncksLength; i++) {
      for (let j: number = 0; j < this.chuncksLength; j++) {
        for (let k: number = 0; k < this.chuncksLength / 2; k++) {
          this.chuncks[i][j][k].AsyncInitialize();
        }
      }
    }
  }
}
