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
    private _degree: number = 0;
    public get degree(): number {
        return this._degree;
    }
    private _chunckCount: number = 0;
    public get chunckCount(): number {
        return this._chunckCount;
    }
    private _size: number = 0;
    public get size(): number {
        return this._size;
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
    public isDegreeLayerBottom: boolean;
    public isCorner: boolean;
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
        if (this.side <= Side.Left && this.isCorner) {
            if (this.jPos === this.chunckCount - 1) {
                if (this.iPos === 0) {
                    if (i === 0) {
                        if (j === PlanetTools.CHUNCKSIZE - 1) {
                            return this.GetData(0, PlanetTools.CHUNCKSIZE, k);
                        }
                    }
                }
                if (this.iPos === this.chunckCount - 1) {
                    if (i === PlanetTools.CHUNCKSIZE - 1) {
                        if (j === PlanetTools.CHUNCKSIZE - 1) {
                            return this.GetData(PlanetTools.CHUNCKSIZE - 1, PlanetTools.CHUNCKSIZE, k);
                        }
                    }
                }
            }
            
            if (this.jPos === 0) {
                if (this.iPos === 0) {
                    if (i === 0) {
                        if (j === 0) {
                            return this.GetData(0, - 1, k);
                        }
                    }
                }
                if (this.iPos === this.chunckCount - 1) {
                    if (i === PlanetTools.CHUNCKSIZE - 1) {
                        if (j === 0) {
                            return this.GetData(PlanetTools.CHUNCKSIZE - 1, - 1, k);
                        }
                    }
                }
            }
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
        return this.planetSide.GetData(iGlobal, jGlobal, kGlobal, this.degree);
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
    public lod: number = 2;

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
        this._degree = PlanetTools.KPosToDegree(this.kPos);
        this._size = PlanetTools.DegreeToSize(this.degree);
        this._chunckCount = PlanetTools.DegreeToChuncksCount(this.degree);
        this.name = "chunck:" + this.side + ":" + this.iPos + "-" + this.jPos	+ "-" + this.kPos;
        this.barycenter = PlanetTools.EvaluateVertex(
            this.size,
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
            this.isDegreeLayerBottom = true;
        }
        else {
            let degreeBellow = PlanetTools.KPosToDegree(this.kPos - 1);
            if (degreeBellow != this.degree) {
                this.isDegreeLayerBottom = true;
            }
        }

        this.isCorner = false;
        if (this.iPos === 0) {
            if (this.jPos === 0) {
                this.isCorner = true;
            }
            else if (this.jPos === this.chunckCount - 1) {
                this.isCorner = true;
            }
        }
        if (this.iPos === this.chunckCount - 1) {
            if (this.jPos === 0) {
                this.isCorner = true;
            }
            else if (this.jPos === this.chunckCount - 1) {
                this.isCorner = true;
            }
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
        vertexData = PlanetChunckMeshBuilder.BuildVertexData(this, this.iPos, this.jPos, this.kPos);
        if (vertexData.positions.length > 0) {
            vertexData.applyToMesh(this.mesh);
            this.mesh.material = SharedMaterials.MainMaterial();
        }
    
        if (this.kPos === 0) {
            vertexData = PlanetChunckMeshBuilder.BuildBedrockVertexData(
                this.size,
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
