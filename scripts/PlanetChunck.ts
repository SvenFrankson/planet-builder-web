/// <reference path="../lib/babylon.2.4.d.ts"/>
class PlanetChunck extends BABYLON.Mesh {
  private static initializationBuffer: Array<PlanetChunck> = new Array<PlanetChunck>();
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
  public GetRadiusZero(): number {
    return this.planetSide.GetRadiusZero();
  }
  private iPos: number;
  private jPos: number;
  private kPos: number;
  private data: Array<Array<Array<number>>>;
  private barycenter: BABYLON.Vector3;
  public GetBaryCenter(): BABYLON.Vector3 {
    return this.barycenter;
  }

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
    this.barycenter = PlanetTools.EvaluateVertex(
      this.GetSize(),
      PlanetTools.CHUNCKSIZE * this.iPos + PlanetTools.CHUNCKSIZE / 2,
      PlanetTools.CHUNCKSIZE * this.jPos + PlanetTools.CHUNCKSIZE / 2
    ).multiply(MeshTools.FloatVector(this.GetRadiusZero() + PlanetTools.CHUNCKSIZE * this.kPos + PlanetTools.CHUNCKSIZE / 2));
    this.barycenter = BABYLON.Vector3.TransformCoordinates(this.barycenter, planetSide.computeWorldMatrix());
  }

  public AsyncInitialize(): void {
    let thisDistance: number = Player.Position().subtract(this.barycenter).lengthSquared();
    let lastIDistance: number = -1;
    for (let i: number = 0; i < PlanetChunck.initializationBuffer.length; i++) {
      let iDistance: number = Player.Position().subtract(PlanetChunck.initializationBuffer[i].GetBaryCenter()).lengthSquared();
      if (thisDistance > iDistance) {
        PlanetChunck.initializationBuffer.splice(i, 0, this);
        return;
      }
      /*
      if (iDistance < lastIDistance) {
        let tmp: PlanetChunck = PlanetChunck.initializationBuffer[i];
        PlanetChunck.initializationBuffer[i] = PlanetChunck.initializationBuffer[i - 1];
        PlanetChunck.initializationBuffer[i - 1] = tmp;
      }*/
      lastIDistance = iDistance;
    }
    console.log("Insert last ! " + thisDistance);
    PlanetChunck.initializationBuffer.push(this);
  }

  public Initialize(): void {
    let dataUrl: string = "./chunck" +
                          "/" + this.GetPlanetName() +
                          "/" + Side[this.GetSide()] +
                          "/" + this.iPos +
                          "/" + this.jPos +
                          "/" + this.kPos +
                          "/data.txt";
    $.get(dataUrl,
      (data: string) => {
        console.log(Player.Position().subtract(this.barycenter).lengthSquared().toPrecision(4));
        this.data = PlanetTools.DataFromHexString(data);
        this.SetMesh();
      }
    );
  }

  private SetMesh(): void {
    let vertexData: BABYLON.VertexData = PlanetChunckMeshBuilder
    .BuildVertexData(
      this.GetSize(),
      this.iPos,
      this.jPos,
      this.kPos,
      this.GetRadiusZero(),
      this.data
    );
    vertexData.applyToMesh(this);
    SharedMaterials.AsyncSetMainMaterial(this);
  }

  public static InitializeLoop(): void {
    let chunck: PlanetChunck = PlanetChunck.initializationBuffer.pop();
    if (chunck) {
      chunck.Initialize();
    }
  }
}
