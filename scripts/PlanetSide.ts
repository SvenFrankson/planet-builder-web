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
  public GetData(iGlobal: number, jGlobal: number, kGlobal: number): number {
    let iPos: number = Math.floor(iGlobal / PlanetTools.CHUNCKSIZE);
    let jPos: number = Math.floor(jGlobal / PlanetTools.CHUNCKSIZE);
    let kPos: number = Math.floor(kGlobal / PlanetTools.CHUNCKSIZE);

    if (this.chuncks[kPos]) {
      if (this.chuncks[kPos][iPos]) {
        if (this.chuncks[kPos][iPos][jPos]) {
          let i: number = iGlobal - iPos * PlanetTools.CHUNCKSIZE;
          let j: number = jGlobal - jPos * PlanetTools.CHUNCKSIZE;
          let k: number = kGlobal - kPos * PlanetTools.CHUNCKSIZE;
          return this.chuncks[kPos][iPos][jPos].GetData(i, j, k);
        }
      }
    }
    return 0;
  }

  constructor(side: Side, planet: Planet) {
    let name: string = "side-" + side;
    super(name, Game.Scene);

    this.planet = planet;
    this.side = side;
    this.rotationQuaternion = PlanetTools.QuaternionForSide(this.side);
    this.computeWorldMatrix();
    this.freezeWorldMatrix();

    this.chuncks = new Array<Array<Array<PlanetChunck>>>();
    for (let k: number = 0; k <= this.GetKPosMax(); k++) {
      this.chuncks[k] = new Array<Array<PlanetChunck>>();
      let chuncksCount: number = PlanetTools.DegreeToChuncksCount(PlanetTools.KPosToDegree(k));
      for (let i: number = 0; i < chuncksCount; i++) {
        this.chuncks[k][i] = new Array<PlanetChunck>();
        for (let j: number = 0; j < chuncksCount; j++) {
          this.chuncks[k][i][j] = new PlanetChunck(i, j, k, this);
          this.chuncks[k][i][j].parent = this;
          this.chuncks[k][i][j].computeWorldMatrix();
          this.chuncks[k][i][j].freezeWorldMatrix();
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
