/// <reference path="../lib/babylon.2.4.d.ts"/>
class PlanetChunck extends BABYLON.Mesh {
  private planetSide: PlanetSide;
  public GetSide(): Side {
    return this.planetSide.GetSide();
  }
  public GetSize(): number {
    return this.planetSide.GetSize();
  }
  public GetPlanetName(): string {
    return this.planetSide.GetPlanetName();
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
    let dataUrl: string = "./chunck" +
                          "/" + this.GetPlanetName() +
                          "/" + Side[this.GetSide()] +
                          "/" + this.iPos +
                          "/" + this.jPos +
                          "/" + this.kPos +
                          "/data.txt";
    $.get(dataUrl,
      (data: string) => {
        this.data = PlanetTools.DataFromHexString(data);
        this.Initialize();
      }
    );
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
