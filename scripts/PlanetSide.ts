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
  public GetPlanetName(): string {
    return this.planet.GetPlanetName();
  }
  public GetRadiusWater(): number {
    return this.planet.GetRadiusWater();
  }
  public GetKPosMax(): number {
    return this.planet.GetKPosMax();
  }
  private chuncksLength: number;
  private chuncks: Array<Array<Array<PlanetChunck>>>;
  public GetChunck(i: number, j: number, k: number): PlanetChunck {
    return this.chuncks[k][i][j];
  }

  constructor(side: Side, planet: Planet) {
    let name: string = "side-" + side;
    super(name, Game.Scene);

    this.planet = planet;
    this.side = side;
    this.rotationQuaternion = PlanetTools.QuaternionForSide(this.side);

    this.chuncks = new Array<Array<Array<PlanetChunck>>>();
    for (let k: number = 0; k < this.GetKPosMax(); k++) {
      this.chuncks[k] = new Array<Array<PlanetChunck>>();
      let chuncksCount: number = PlanetTools.DegreeToChuncksCount(PlanetTools.KPosToDegree(k));
      for (let i: number = 0; i < chuncksCount; i++) {
        this.chuncks[k][i] = new Array<PlanetChunck>();
        for (let j: number = 0; j < chuncksCount; j++) {
          this.chuncks[k][i][j] = new PlanetChunck(i, j, k, this);
          this.chuncks[k][i][j].parent = this;
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
    for (let k: number = 0; k < this.chuncks.length; k++) {
      for (let i: number = 0; i < this.chuncks[k].length; i++) {
        for (let j: number = 0; j < this.chuncks[k][i].length; j++) {
          this.chuncks[k][i][j].AsyncInitialize();
        }
      }
    }
  }
}
