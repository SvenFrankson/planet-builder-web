/// <reference path="../lib/babylon.2.4.d.ts"/>
class PlanetChunck extends BABYLON.Mesh {
  private planetSide: PlanetSide;
  public GetSize(): number {
    return this.planetSide.GetSize();
  }
  private iPos: number;
  private jPos: number;
  private kPos: number;
  private data: Array<Array<Array<number>>>;

  constructor(
    iPos: number,
    jPos: number,
    kPos: number,
    planetSide: PlanetSide
  ) {
    let name: string = "chunck-" + iPos + "-" + jPos + "-" + kPos;
    super(name, Game.Instance.getScene());
    this.planetSide = planetSide;
    this.iPos = iPos;
    this.jPos = jPos;
    this.kPos = kPos;
    this.data = new Array<Array<Array<number>>>();
    for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
      this.data[i] = new Array<Array<number>>();
      for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
        this.data[i][j] = new Array<number>();
        for (let k: number = 1; k < PlanetTools.CHUNCKSIZE; k++) {
          this.data[i][j][k] = 0;
        }
        this.data[i][j][0] = 1;
        let h: number = Math.floor(Math.random() * 4);
        for (let k: number = 0; k < h; k++) {
          this.data[i][j][k] = 1;
        }
      }
    }
  }

  public Initialize(): void {
    let data: BABYLON.VertexData = PlanetChunckMeshBuilder
    .BuildVertexData(
      this.GetSize(),
      this.iPos,
      this.jPos,
      this.kPos,
      5,
      this.data
    );
    data.applyToMesh(this);
    this.material = SharedMaterials.MainMaterial();
  }
}
