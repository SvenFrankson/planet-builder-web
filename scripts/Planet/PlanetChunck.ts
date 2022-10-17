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
    public get scene(): BABYLON.Scene {
        return this.planetSide.getScene();
    }

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
    private _adjacents: PlanetChunck[][][][];
    public adjacentsAsArray: PlanetChunck[];
    public findAdjacents(): void {
        this._adjacents = [];
        this.adjacentsAsArray = [];
        for (let di = - 1; di <= 1; di++) {
            for (let dj = - 1; dj <= 1; dj++) {
                for (let dk = - 1; dk <= 1; dk++) {
                    if (di != 0 || dj != 0 || dk != 0) {
                        if (!this._adjacents[1 + di]) {
                            this._adjacents[1 + di] = [];
                        }
                        if (!this._adjacents[1 + di][1 + dj]) {
                            this._adjacents[1 + di][1 + dj] = [];
                        }
                        if (!this._adjacents[1 + di][1 + dj][1 + dk]) {
                            let n = this.planetSide.getChunck(this.iPos + di, this.jPos + dj, this.kPos + dk, this.degree);
                            if (n instanceof PlanetChunck) {
                                this._adjacents[1 + di][1 + dj][1 + dk] = [n];
                                this.adjacentsAsArray.push(n);
                            }
                            else if (n instanceof Array) {
                                this._adjacents[1 + di][1 + dj][1 + dk] = n;
                                this.adjacentsAsArray.push(...n);
                            }
                        }
                    }
                }
            }
        }
    }

    private _dataInitialized: boolean = false;
    public get dataInitialized(): boolean {
        return this._dataInitialized;
    }
    private _adjacentsDataSynced: boolean = false;
    public get dataNeighbourSynced(): boolean {
        return this._adjacentsDataSynced;
    }
    private _firstI: number;
    public get firstI(): number {
        return this._firstI;
    }
    private _firstJ: number;
    public get firstJ(): number {
        return this._firstJ;
    }
    private _lastJ: number;
    public get lastJ(): number {
        return this._lastJ;
    }
    private _firstK: number;
    public get firstK(): number {
        return this._firstK;
    }
    private data: number[][][];
    private proceduralItems: ProceduralTree[];
    private _proceduralItemsGenerated: boolean = false;
    public get proceduralItemsGenerated(): boolean {
        return this._proceduralItemsGenerated;
    }
    public GetData(i: number, j: number, k: number): number {
        if (!this.dataInitialized) {
            this.initializeData();
        }
        if (!this.dataNeighbourSynced) {
            this.syncWithAdjacents();
        }

        if (i >= this.firstI && i <= PlanetTools.CHUNCKSIZE) {
            if (j >= this.firstJ && j <= this.lastJ) {
                if (k >= this.firstK && k <= PlanetTools.CHUNCKSIZE) {
                    return this.data[i - this.firstI][j - this.firstJ][k - this.firstK];
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
    public SetData(i: number, j: number, k: number, value: number, noDataSafety: boolean = false): void {
        if (!this.dataInitialized) {
            this.initializeData();
        }
        if (!this.dataNeighbourSynced) {
            this.syncWithAdjacents();
        }
        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = value;
        if (noDataSafety) {
            return;
        }
        this.doDataSafety();
    }
    public doDataSafety(): void {
        this.updateIsEmptyIsFull();
        this.adjacentsAsArray.forEach(adj => {
            adj.syncWithAdjacents();
        })
        this.register();
    }

    private barycenter: BABYLON.Vector3;
    public GetBaryCenter(): BABYLON.Vector3 {
        return this.barycenter;
    }
    private normal: BABYLON.Vector3;
    public GetNormal(): BABYLON.Vector3 {
        return this.normal;
    }

    private _registered: boolean = false;
    public get registered(): boolean {
        return this._registered;
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
            PlanetTools.CHUNCKSIZE * (this.iPos + 0.5),
            PlanetTools.CHUNCKSIZE * (this.jPos + 0.5)
        ).scale(
            PlanetTools.KGlobalToAltitude((this.kPos + 0.5) * PlanetTools.CHUNCKSIZE)
        );
        this.barycenter = BABYLON.Vector3.TransformCoordinates(
            this.barycenter,
            planetSide.computeWorldMatrix(true)
        );
        this.normal = BABYLON.Vector3.Normalize(this.barycenter);
        
        if (this.kPos === 0) {
            this.bedrock = new BABYLON.Mesh(this.name + "-bedrock", this.scene);
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

        this._firstI = 0;
        this._firstJ = 0;
        this._lastJ = PlanetTools.CHUNCKSIZE;
        this._firstK = 0;
        if (this.side === Side.Top || this.side === Side.Bottom) {
            if (this.iPos === 0) {
                this._firstI = - 1;
            }
            if (this.jPos === 0) {
                this._firstJ = - 1;
            }
        }
        if (this.side <= Side.Left) {
            if (this.jPos === this.chunckCount - 1) {
                this._lastJ = PlanetTools.CHUNCKSIZE - 1;
            }
        }
        if (this.isDegreeLayerBottom) {
            this._firstK = - 1;
        }
    }

    public register(): void {
        if (!this.registered) {
            this._registered = this.chunckManager.registerChunck(this);
        }        
    }
    
    public initialize(): void {
        this.initializeData();
        this.initializeMesh();
    }

    public initializeData(): void {
        if (!this.dataInitialized) {
            this.data = [];
            this.proceduralItems = [];
            this.planetSide.planet.generator.makeData(this, this.data, this.proceduralItems);
            for (let i: number = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
                if (!this.data[i - this.firstI]) {
                    this.data[i - this.firstI] = [];
                }
                for (let j: number = this.firstJ; j <= this.lastJ; j++) {
                    if (!this.data[i - this.firstI][j - this.firstJ]) {
                        this.data[i - this.firstI][j - this.firstJ] = [];
                    }
                    for (let k: number = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                        if (!this.data[i - this.firstI][j - this.firstJ][k - this.firstK]) {
                            this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = BlockType.None;
                        }
                    }
                }
            }
            this._dataInitialized = true;
            this.updateIsEmptyIsFull();
        }
    }
    
    public syncWithAdjacents(): void {
        if (!this.dataInitialized) {
            return;
        }
        this._adjacentsDataSynced = true;
        this.findAdjacents();
        if (!this._adjacents[0][1][1]) {
            
        }
        
        for (let i: number = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
            for (let j: number = this.firstJ; j <= this.lastJ; j++) {
                for (let k: number = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                    if (this.side <= Side.Left && this.isCorner) {
                        if (this.jPos === 0) {
                            if (this.iPos === 0) {
                                if (j === 0) {
                                    if (i === 0) {
                                        let d = this.GetDataGlobal(0, - 1, this.kPos * PlanetTools.CHUNCKSIZE + k);
                                        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
                                    }
                                }
                            }
                            if (this.iPos === this.chunckCount - 1) {
                                if (j === 0) {
                                    if (i === PlanetTools.CHUNCKSIZE - 1) {
                                        let d = this.GetDataGlobal(this.iPos * PlanetTools.CHUNCKSIZE + i, - 1, this.kPos * PlanetTools.CHUNCKSIZE + k);
                                        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
                                    }
                                }
                            }
                        }

                        if (this.jPos === this.chunckCount - 1) {
                            if (this.iPos === 0) {
                                if (i === 0) {
                                    if (j === PlanetTools.CHUNCKSIZE - 1) {
                                        let d = this.GetDataGlobal(0, (this.jPos + 1) * PlanetTools.CHUNCKSIZE, this.kPos * PlanetTools.CHUNCKSIZE + k);
                                        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
                                    }
                                }
                            }
                            if (this.iPos === this.chunckCount - 1) {
                                if (j === PlanetTools.CHUNCKSIZE - 1) {
                                    if (i === PlanetTools.CHUNCKSIZE - 1) {
                                        let d = this.GetDataGlobal(this.iPos * PlanetTools.CHUNCKSIZE + i, (this.jPos + 1) * PlanetTools.CHUNCKSIZE, this.kPos * PlanetTools.CHUNCKSIZE + k);
                                        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
                                    }
                                }
                            }
                        }
                    }
                    if (i < 0 || i >= PlanetTools.CHUNCKSIZE || j < 0 || j >= PlanetTools.CHUNCKSIZE || k < 0 || k >= PlanetTools.CHUNCKSIZE) {
                        let d = this.GetDataGlobal(this.iPos * PlanetTools.CHUNCKSIZE + i, this.jPos * PlanetTools.CHUNCKSIZE + j, this.kPos * PlanetTools.CHUNCKSIZE + k);
                        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
                    }
                }
            }
        }
        this.updateIsEmptyIsFull();
        this.register();
    }

    public initializeMesh(): void {
        if (this.dataInitialized) {
            this.SetMesh();
        }
    }

    public updateIsEmptyIsFull(): void {
        this._isEmpty = true;
        this._isFull = true;
        for (let i = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
            for (let j = this.firstJ; j <= this.lastJ; j++) {
                for (let k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                    let block = this.data[i - this.firstI][j - this.firstJ][k - this.firstK] > 0;
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
        if (!this.dataInitialized) {
            this.initializeData();
        }
        if (!this.dataNeighbourSynced) {
            this.syncWithAdjacents();
        }
        return this.isEmpty || this.isFull;
    }

    public SetMesh(): void {
        if (this.isEmptyOrHidden()) {
            return;
        }
        if (!this.syncWithAdjacents) {
            this.syncWithAdjacents();
        }
        if (!this.proceduralItemsGenerated) {
            this._proceduralItemsGenerated = true;
            for (let i = 0; i < this.proceduralItems.length; i++) {
                this.proceduralItems[i].generateData();
            }
        }
        if (this.isMeshDisposed()) {
            this.mesh = new BABYLON.Mesh("chunck-" + this.iPos + "-" + this.jPos + "-" + this.kPos, this.scene);
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

    public highlight(): void {
        if (this.mesh) {
            this.mesh.material = SharedMaterials.HighlightChunckMaterial();
        }
    }

    public unlit(): void {
        if (this.mesh) {
            this.mesh.material = SharedMaterials.MainMaterial();
        }
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
