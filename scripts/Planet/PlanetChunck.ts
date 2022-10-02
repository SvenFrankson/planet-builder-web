enum Neighbour {
    IPlus = 0,
    JPlus = 1,
    KPlus = 2,
    IMinus = 3,
    JMinus = 4,
    KMinus = 5,
}

class PlanetChunck {
    
    public planetSide: PlanetSide;

    public name: string;

    public get side(): Side {
        return this.planetSide.side;
    }
    public get chunckManager(): PlanetChunckManager {
        return this.planetSide.chunckManager;
    }
    public get degree(): number {
        return PlanetTools.KPosToDegree(this.kPos);
    }
    public GetSize(): number {
        return PlanetTools.DegreeToSize(this.degree);
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
        if (!this.dataInitialized) {
            this.initializeData();
        }
        if (i >= 0 && i < PlanetTools.CHUNCKSIZE) {
            if (j >= 0 && j < PlanetTools.CHUNCKSIZE) {
                if (k >= 0 && k < PlanetTools.CHUNCKSIZE) {
                    return this.data[i][j][k];
                }
            }
        }
        return this.GetDataGlobal(this.iPos * PlanetTools.CHUNCKSIZE + i, this.jPos * PlanetTools.CHUNCKSIZE + j, this.kPos * PlanetTools.CHUNCKSIZE + k);
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
    public sqrDistanceToViewpoint: number;

    private _isEmpty: boolean = true;
    public get isEmpty(): boolean {
        return this._isEmpty;
    }
    private _isFull: boolean = false;
    public get isFull(): boolean {
        return this._isFull;
    }

    private bedrock: BABYLON.Mesh;

    public mesh: BABYLON.Mesh;
    public isMeshDrawn(): boolean {
        return this.mesh && !this.mesh.isDisposed();
    }
    public isMeshDisposed(): boolean {
        return !this.mesh || this.mesh.isDisposed();
    }

    constructor(
        iPos: number,
        jPos: number,
        kPos: number,
        planetSide: PlanetSide
    ) {
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
            PlanetTools.KGlobalToAltitude((this.kPos + 0.5) * PlanetTools.CHUNCKSIZE)
        );
        this.barycenter = BABYLON.Vector3.TransformCoordinates(
            this.barycenter,
            planetSide.computeWorldMatrix(true)
        );
        this.normal = BABYLON.Vector3.Normalize(this.barycenter);
        
        if (this.kPos === 0) {
            this.bedrock = new BABYLON.Mesh(this.name + "-bedrock", Game.Scene);
            this.bedrock.parent = this.planetSide;
        }
    }

    public register(): void {
        this.chunckManager.registerChunck(this);
    }
    
    public initialize(): void {
        this.initializeData();
        this.initializeMesh();
    }

    public initializeData(): void {
        if (!this.dataInitialized) {
            this.data = this.planetSide.planet.generator.makeData(this);
            this.updateIsEmptyIsFull();
            //this.saveToLocalStorage();
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

    public isEmptyOrHidden(): boolean {
        if (this.isFull || this.isEmpty) {
            let iPrev = this.planetSide.getChunck(this.iPos - 1, this.jPos, this.kPos, this.degree);
            let iNext = this.planetSide.getChunck(this.iPos + 1, this.jPos, this.kPos, this.degree);
            let jPrev = this.planetSide.getChunck(this.iPos, this.jPos - 1, this.kPos, this.degree);
            let jNext = this.planetSide.getChunck(this.iPos, this.jPos + 1, this.kPos, this.degree);
            let kPrev = this.planetSide.getChunck(this.iPos, this.jPos, this.kPos - 1, this.degree);
            let kNext = this.planetSide.getChunck(this.iPos, this.jPos, this.kPos + 1, this.degree);
            if (iPrev instanceof PlanetChunck && iNext instanceof PlanetChunck && jPrev instanceof PlanetChunck && jNext instanceof PlanetChunck && kPrev instanceof PlanetChunck && kNext) {
                iPrev.initializeData();
                iNext.initializeData();
                jPrev.initializeData();
                jNext.initializeData();
                kPrev.initializeData();
                let kNextIsFull = true;
                let kNextIsEmpty = true;
                if (kNext instanceof PlanetChunck) {
                    kNext.initializeData();
                    kNextIsFull = kNext.isFull;
                    kNextIsEmpty = kNext.isEmpty;
                }
                else {
                    kNext.forEach(c => {
                        c.initializeData();
                        kNextIsFull = kNextIsFull && c.isFull;
                        kNextIsEmpty = kNextIsEmpty && c.isEmpty;
                    })
                }
                if (this.isFull && iPrev.isFull && iNext.isFull && jPrev.isFull && jNext.isFull && kPrev.isFull && kNextIsFull) {
                    return true;
                }
                if (this.isEmpty && iPrev.isEmpty && iNext.isEmpty && jPrev.isEmpty && jNext.isEmpty && kPrev.isEmpty && kNextIsEmpty) {
                    return true;
                }
            }
        }
        return false;
    }

    public SetMesh(): void {
        if (this.isEmptyOrHidden()) {
            return;
        }
        if (this.isMeshDisposed()) {
            this.mesh = new BABYLON.Mesh("chunck-" + this.iPos + "-" + this.jPos + "-" + this.kPos, Game.Scene);
        }
        let vertexData: BABYLON.VertexData;
        vertexData = PlanetChunckMeshBuilder.BuildVertexData_V2(this, this.iPos, this.jPos, this.kPos);
        if (vertexData.positions.length > 0) {
            vertexData.applyToMesh(this.mesh);
            this.mesh.material = SharedMaterials.MainMaterial();
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

        this.mesh.parent = this.planetSide;
        this.mesh.freezeWorldMatrix();
        this.mesh.refreshBoundingInfo();
    }

    public disposeMesh(): void {
        if (this.mesh) {
            this.mesh.dispose();
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
