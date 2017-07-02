/// <reference path="../lib/babylon.2.4.d.ts"/>

enum Neighbour {
  IPlus = 0,
  JPlus = 1,
  KPlus = 2,
  IMinus = 3,
  JMinus = 4,
  KMinus = 5
};

class PlanetChunck extends BABYLON.Mesh {
  private static initializationBuffer: Array<PlanetChunck> = new Array<PlanetChunck>();
  private static delayBuffer: Array<PlanetChunck> = new Array<PlanetChunck>();
  private static initializedBuffer: Array<PlanetChunck> = new Array<PlanetChunck>();
  private planetSide: PlanetSide;
  public GetSide(): Side {
    return this.planetSide.GetSide();
  }
  public GetDegree(): number {
    return PlanetTools.KPosToDegree(this.kPos);
  }
  public GetSize(): number {
    return PlanetTools.DegreeToSize(this.GetDegree());
  }
  public GetPlanetName(): string {
    return this.planetSide.GetPlanetName();
  }
  public GetKPosMax(): number {
    return this.planetSide.GetKPosMax();
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
  public GetData(i: number, j: number, k: number): number {
    if (this.data[i]) {
      if (this.data[i][j]) {
        if (this.data[i][j][k]) {
          return this.data[i][j][k];
        }
      }
    }
    return 0;
  }
  public GetDataGlobal(iGlobal: number, jGlobal: number, kGlobal: number): number {
    return this.planetSide.GetData(iGlobal, jGlobal, kGlobal);
  }
  public SetData(i: number, j: number, k: number, value: number): void {
    this.data[i][j][k] = value;
  }
  private barycenter: BABYLON.Vector3;
  public GetBaryCenter(): BABYLON.Vector3 {
    return this.barycenter;
  }
  private normal: BABYLON.Vector3;
  public GetNormal(): BABYLON.Vector3 {
    return this.normal;
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
    super("chunck-" + iPos + "-" + jPos + "-" + kPos, Game.Scene);
    this.planetSide = planetSide;
    this.iPos = iPos;
    this.jPos = jPos;
    this.kPos = kPos;
    this.barycenter = PlanetTools.EvaluateVertex(
      this.GetSize(),
      PlanetTools.CHUNCKSIZE * this.iPos + PlanetTools.CHUNCKSIZE / 2,
      PlanetTools.CHUNCKSIZE * this.jPos + PlanetTools.CHUNCKSIZE / 2
    ).multiply(MeshTools.FloatVector(PlanetTools.CHUNCKSIZE * this.kPos + PlanetTools.CHUNCKSIZE / 2));
    this.barycenter = BABYLON.Vector3.TransformCoordinates(this.barycenter, planetSide.computeWorldMatrix());
    this.normal = BABYLON.Vector3.Normalize(this.barycenter);
    this.water = new Water(this.name + "-water");
    this.water.parent = this;
    this.bedrock = new BABYLON.Mesh(this.name + "-bedrock", Game.Scene);
    this.bedrock.parent = this;
  }

  private PushToBuffer(): void {
    let sqrDist: number = Player.Position().subtract(this.barycenter).lengthSquared();
    if (sqrDist < PlanetTools.DISTANCELIMITSQUARED) {
      this.PushToInitializationBuffer();
    } else {
      PlanetChunck.delayBuffer.push(this);
    }
    /*
    let alpha: number = MeshTools.Angle(this.GetNormal(), Player.Position());
    if (alpha < PlanetTools.ALPHALIMIT) {
      this.PushToInitializationBuffer();
    } else {
      PlanetChunck.delayBuffer.push(this);
    }
    */
  }

  private PushToInitializationBuffer(): void {
    let thisDistance: number = Player.Position().subtract(this.barycenter).lengthSquared();
    let lastIDistance: number = -1;
    for (let i: number = 0; i < PlanetChunck.initializationBuffer.length; i++) {
      let iDistance: number = Player.Position().subtract(PlanetChunck.initializationBuffer[i].GetBaryCenter()).lengthSquared();
      if (thisDistance > iDistance) {
        PlanetChunck.initializationBuffer.splice(i, 0, this);
        $("#initialization-buffer-length").text(PlanetChunck.initializationBuffer.length + "");
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
    $("#initialization-buffer-length").text(PlanetChunck.initializationBuffer.length + "");
  }

  public AsyncInitialize(): void {
    this.PushToBuffer();
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
      this.data
    );
    vertexData.applyToMesh(this);
    this.material = SharedMaterials.MainMaterial();

    if (this.kPos === this.planetSide.GetKPosMax()) {
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
    }

    if (this.kPos === 0) {
      vertexData = PlanetChunckMeshBuilder
      .BuildBedrockVertexData(
        this.GetSize(),
        this.iPos,
        this.jPos,
        this.kPos,
        8,
        this.data
      );
      vertexData.applyToMesh(this.bedrock);
      this.bedrock.material = SharedMaterials.BedrockMaterial();
    }

    this.computeWorldMatrix();
    this.refreshBoundingInfo();

    PlanetChunck.initializedBuffer.push(this);
    $("#chuncks-set-count").text(PlanetChunck.initializedBuffer.length + "");
  }

  public Dispose(): void {
    PlanetTools.EmptyVertexData().applyToMesh(this);
    PlanetTools.EmptyVertexData().applyToMesh(this.water);
    PlanetTools.EmptyVertexData().applyToMesh(this.bedrock);
  }

  public static InitializeLoop(): void {
    let chunck: PlanetChunck = PlanetChunck.initializationBuffer.pop();
    $("#initialization-buffer-length").text(PlanetChunck.initializationBuffer.length + "");
    if (chunck) {
      chunck.Initialize();
      // chunck.RandomInitialize();
    }
    for (let i: number = 0; i < 5; i++) {
      if (PlanetChunck.delayBuffer.length > 0) {
        let delayedChunck: PlanetChunck = PlanetChunck.delayBuffer.splice(0, 1)[0];
        delayedChunck.PushToBuffer();
      }
    }
    for (let i: number = 0; i < 5; i++) {
      if (PlanetChunck.initializedBuffer.length > 0) {
        let initializedChunck: PlanetChunck = PlanetChunck.initializedBuffer.splice(0, 1)[0];
        $("#chuncks-set-count").text(PlanetChunck.initializedBuffer.length + "");
        /*
        let alpha: number = MeshTools.Angle(initializedChunck.GetNormal(), Player.Position());
        if (alpha > PlanetTools.ALPHALIMIT * 1.2) {
          initializedChunck.Dispose();
          PlanetChunck.delayBuffer.push(initializedChunck);
        } else {
          PlanetChunck.initializedBuffer.push(initializedChunck);
        }
        */
        let sqrDist: number = Player.Position().subtract(initializedChunck.barycenter).lengthSquared();
        if (sqrDist > 4 * PlanetTools.DISTANCELIMITSQUARED) {
          initializedChunck.Dispose();
          PlanetChunck.delayBuffer.push(initializedChunck);
        } else {
          PlanetChunck.initializedBuffer.push(initializedChunck);
          $("#chuncks-set-count").text(PlanetChunck.initializedBuffer.length + "");
        }
      }
    }
  }
}
