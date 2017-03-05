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
  public side: Side;
  public size: number;
  public chuncksLength: number;
  public chuncks: Array<Array<Array<PlanetChunck>>>;

  constructor(side: Side, size: number) {
    let name: string = "side-" + side;
    super(name, Game.Instance.getScene());

    this.side = side;
    this.size = size;
    this.chuncksLength = this.size / PlanetTools.CHUNCKSIZE;
    console.log(this.chuncksLength);

    this.chuncks = new Array<Array<Array<PlanetChunck>>>();
    for (let i: number = 0; i < this.chuncksLength; i++) {
      this.chuncks[i] = new Array<Array<PlanetChunck>>();
      for (let j: number = 0; j < this.chuncksLength; j++) {
        this.chuncks[i][j] = new Array<PlanetChunck>();
        for (let k: number = 0; k < this.chuncksLength; k++) {
          this.chuncks[i][j][k] = new PlanetChunck(this.size, i, j, k);
          this.chuncks[i][j][k].parent = this;
          this.chuncks[i][j][k].Initialize();
        }
      }
    }
  }
}
