enum Neighbour {
    IPlus = 0,
    JPlus = 1,
    KPlus = 2,
    IMinus = 3,
    JMinus = 4,
    KMinus = 5,
}

class PlanetChunck extends BABYLON.Mesh {
    
    public planetSide: PlanetSide;

    public get side(): Side {
        return this.planetSide.side;
    }
    public get chunckManager(): PlanetChunckManager {
        return this.planetSide.chunckManager;
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
    public get kPosMax(): number {
        return this.planetSide.kPosMax;
    }

    public iPos: number;
    public jPos: number;
    public kPos: number;
    public Position(): { i: number; j: number; k: number } {
        return {
            i: this.iPos,
            j: this.jPos,
            k: this.kPos,
        };
    }

    private _dataInitialized: boolean = false;
    public get dataInitialized(): boolean {
        return this._dataInitialized;
    }
    private data: number[][][];
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
    public GetDataGlobal(
        iGlobal: number,
        jGlobal: number,
        kGlobal: number
    ): number {
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
    private _isEmpty: boolean = true;
    public get isEmpty(): boolean {
        return this._isEmpty;
    }
    private _isFull: boolean = false;
    public get isFull(): boolean {
        return this._isFull;
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
        this.name = "chunck:" + this.side + ":" + this.iPos + "-" + this.jPos	+ "-" + this.kPos;
        this.barycenter = PlanetTools.EvaluateVertex(
            this.GetSize(),
            PlanetTools.CHUNCKSIZE * this.iPos + PlanetTools.CHUNCKSIZE / 2,
            PlanetTools.CHUNCKSIZE * this.jPos + PlanetTools.CHUNCKSIZE / 2
        ).scale(
            PlanetTools.CHUNCKSIZE * this.kPos + PlanetTools.CHUNCKSIZE / 2
        );
        this.barycenter = BABYLON.Vector3.TransformCoordinates(
            this.barycenter,
            planetSide.computeWorldMatrix()
        );
        this.normal = BABYLON.Vector3.Normalize(this.barycenter);
        
        if (this.kPos === 0) {
            this.bedrock = new BABYLON.Mesh(this.name + "-bedrock", Game.Scene);
            this.bedrock.parent = this;
        }

        this.chunckManager.requestDraw(this);
    }
    
    public initialize(): void {
        this.initializeData();
        this.initializeMesh();
    }

    public initializeData(): void {
        if (!this.dataInitialized) {
            this.data = this.planetSide.planet.generator.makeData(this);
            this.updateIsEmptyIsFull();
            this.saveToLocalStorage();
            this._dataInitialized = true;
        }
    }

    public initializeMesh(): void {
        if (this.dataInitialized) {
            this.SetMesh();
        }
    }

    public updateIsEmptyIsFull(): void {
        this._isEmpty = true;
        this._isFull = true;
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let block = this.data[i][j][k] > 0;
                    this._isFull = this._isFull && block;
                    this._isEmpty = this._isEmpty && !block;
                    if (!this._isFull && !this._isEmpty) {
                        return;
                    }
                }
            }
        }
    }

    public SetMesh(): void {
        if (this.isFull || this.isEmpty) {
            let iPrev = this.planetSide.GetChunck(this.iPos - 1, this.jPos, this.kPos);
            let iNext = this.planetSide.GetChunck(this.iPos + 1, this.jPos, this.kPos);
            let jPrev = this.planetSide.GetChunck(this.iPos, this.jPos - 1, this.kPos);
            let jNext = this.planetSide.GetChunck(this.iPos, this.jPos + 1, this.kPos);
            let kPrev = this.planetSide.GetChunck(this.iPos, this.jPos, this.kPos - 1);
            let kNext = this.planetSide.GetChunck(this.iPos, this.jPos, this.kPos + 1);
            if (iPrev && iNext && jPrev && jNext && kPrev && kNext) {
                iPrev.initializeData();
                iNext.initializeData();
                jPrev.initializeData();
                jNext.initializeData();
                kPrev.initializeData();
                kNext.initializeData();
                if (this.isFull && iPrev.isFull && iNext.isFull && jPrev.isFull && jNext.isFull && kPrev.isFull && kNext.isFull) {
                    console.log("opti");
                    return;
                }
                if (this.isEmpty && iPrev.isEmpty && iNext.isEmpty && jPrev.isEmpty && jNext.isEmpty && kPrev.isEmpty && kNext.isEmpty) {
                    console.log("opti");
                    return;
                }
            }
        }
        let vertexData: BABYLON.VertexData = PlanetChunckMeshBuilder.BuildVertexData(
            this.GetSize(),
            this.iPos,
            this.jPos,
            this.kPos,
            this.data
        );
        if (vertexData.positions.length > 0) {
            vertexData.applyToMesh(this);
            this.material = SharedMaterials.MainMaterial();
        }
    
        if (this.kPos === 0) {
            vertexData = PlanetChunckMeshBuilder.BuildBedrockVertexData(
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
    }

    public Dispose(): void {
        PlanetTools.EmptyVertexData().applyToMesh(this);
        if (this.bedrock) {
            PlanetTools.EmptyVertexData().applyToMesh(this.bedrock);
        }
    }

    public serialize(): string {
        let output = "";
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    output += this.data[i][j][k].toFixed(0);
                }
            }
        }
        let compressed = Utils.compress(output);
		//console.log("Compressed " + this.name + " data to " + (compressed.length / output.length * 100).toFixed(0) + "% of uncompressed size.");
        return compressed;
    }

    public deserialize(input: string): void {
        let data = Utils.decompress(input);
        this.data = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            this.data[i] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                this.data[i][j] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let n = k + j * PlanetTools.CHUNCKSIZE + i * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE;
                    this.data[i][j][k] = parseInt(data[n]);
                }
            }
        }
    }

    public saveToLocalStorage(): void {
        localStorage.setItem(this.name, this.serialize());
    }
}
