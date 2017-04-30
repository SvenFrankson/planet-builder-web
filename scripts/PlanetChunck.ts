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
  public Position(): {i: number, j: number, k: number} {
    return {
      i: this.iPos,
      j: this.jPos,
      k: this.kPos
    };
  }
  private data: Array<Array<Array<number>>>;
  public SetData(i: number, j: number, k: number, value: number): void {
    this.data[i][j][k] = value;
  }
  private barycenter: BABYLON.Vector3;
  public GetBaryCenter(): BABYLON.Vector3 {
    return this.barycenter;
  }
  private water: Water;
  public GetRadiusWater(): number {
    return this.planetSide.GetRadiusWater();
  }
  private bedrock: BABYLON.Mesh;

  constructor(
    iPos: number,
    jPos: number,
    kPos: number,
    planetSide: PlanetSide
  ) {
    let name: string = "chunck-" + iPos + "-" + jPos + "-" + kPos;
    super(name, Game.Scene);
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
    this.water = new Water(this.name + "-water");
    this.water.parent = this;
    this.bedrock = new BABYLON.Mesh(this.name + "-bedrock", Game.Scene);
    this.bedrock.parent = this;
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
        this.data = PlanetTools.DataFromHexString(data);
        this.SetMesh();
      }
    );
  }

  public SetMesh(): void {
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
    this.material = SharedMaterials.MainMaterial();

    vertexData = PlanetChunckMeshBuilder
    .BuildWaterVertexData(
      this.GetSize(),
      this.iPos,
      this.jPos,
      this.kPos,
      this.GetRadiusWater()
    );
    vertexData.applyToMesh(this.water);
    this.water.material = SharedMaterials.WaterMaterial();

    vertexData = PlanetChunckMeshBuilder
    .BuildBedrockVertexData(
      this.GetSize(),
      this.iPos,
      this.jPos,
      this.kPos,
      this.GetRadiusZero(),
      this.data
    );
    vertexData.applyToMesh(this.bedrock);
    this.bedrock.material = SharedMaterials.BedrockMaterial();
  }

  public static InitializeLoop(): void {
    let chunck: PlanetChunck = PlanetChunck.initializationBuffer.pop();
    if (chunck) {
      chunck.Initialize();
    }
  }
}
