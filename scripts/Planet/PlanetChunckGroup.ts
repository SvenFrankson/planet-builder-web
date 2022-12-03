class PlanetChunckGroup extends AbstractPlanetChunck {

    public children: AbstractPlanetChunck[] = [];
    public kOffset: number;
    public kOffsetNext: number;

    public mesh: BABYLON.Mesh;
    public lines: BABYLON.Mesh[] = [];

    constructor(
        iPos: number,
        jPos: number,
        kPos: number,
        planetSide: PlanetSide,
        parentGroup: PlanetChunckGroup,
        degree: number,
        public level: number
    ) {
        super(iPos, jPos, kPos, planetSide, parentGroup);

        this.name = "group:" + this.side + ":" + this.iPos + "-" + this.jPos	+ "-" + this.kPos + ":" + this.level;

        this._degree = degree;
        this._size = PlanetTools.DegreeToSize(this.degree);
        this._chunckCount = PlanetTools.DegreeToChuncksCount(this.degree);

        this.kOffset = PlanetTools.DegreeToKOffset(this.degree);
        this.kOffsetNext = PlanetTools.DegreeToKOffset(this.degree + 1);

        let levelCoef = Math.pow(2, level);
        console.log(this.size + " " + (PlanetTools.CHUNCKSIZE * (this.iPos + 0.5) * levelCoef) + " " + (PlanetTools.CHUNCKSIZE * (this.jPos + 0.5) * levelCoef))
        this._barycenter = PlanetTools.EvaluateVertex(
            this.size,
            PlanetTools.CHUNCKSIZE * (this.iPos + 0.5) * levelCoef,
            PlanetTools.CHUNCKSIZE * (this.jPos + 0.5) * levelCoef 
        ).scale(
            PlanetTools.KGlobalToAltitude(Math.floor((this.kOffset + (this.kPos + 0.5) * levelCoef) * PlanetTools.CHUNCKSIZE))
        );
        this._barycenter = BABYLON.Vector3.TransformCoordinates(
            this._barycenter,
            planetSide.computeWorldMatrix(true)
        );

        if ((this.kPos * levelCoef + this.kOffset) * PlanetTools.CHUNCKSIZE <= this.planetSide.planet.seaLevel) {
            if (((this.kPos + 1) * levelCoef + this.kOffset) * PlanetTools.CHUNCKSIZE > this.planetSide.planet.seaLevel) {
                this.isSeaLevel = true;
            }
        }

        if (this.isSeaLevel) {
            this.drawMesh();
        }

        /*
        if (this.degree === 4) {
            this.mesh = BABYLON.MeshBuilder.CreateBox(this.name);
        }
        else  if (this.degree === 5) {
            this.mesh = BABYLON.MeshBuilder.CreateSphere(this.name);
        }
        else if (this.degree === 6) {
            this.mesh = BABYLON.MeshBuilder.CreateBox(this.name, { width: 0.5, height: 2, depth: 0.5 });
        }
        else  if (this.degree === 7) {
            this.mesh = BABYLON.MeshBuilder.CreateSphere(this.name, { diameterY: 0.5, diameterX: 2, diameterZ: 0.2 });
        }
        else {
            this.mesh = BABYLON.MeshBuilder.CreateBox(this.name);
        }

        if (level === 1) {
            let material = new BABYLON.StandardMaterial("red");
            material.diffuseColor.copyFromFloats(1, 0, 0);
            this.mesh.material = material;
        }
        if (level === 2) {
            let material = new BABYLON.StandardMaterial("green");
            material.diffuseColor.copyFromFloats(0, 1, 0);
            this.mesh.material = material;
        }
        if (level === 3) {
            let material = new BABYLON.StandardMaterial("blue");
            material.diffuseColor.copyFromFloats(0, 0, 1);
            this.mesh.material = material;
        }
        this.mesh.position = this._barycenter;
        this.mesh.freezeWorldMatrix();
        */
    }

    public drawMesh(): void {
        if (this.mesh) {
            this.mesh.dispose();
        }
        this.mesh = BABYLON.MeshBuilder.CreateBox(this.name, { size: 4 });

        PlanetChunckMeshBuilder.BuildSeaLevelVertexData(this).applyToMesh(this.mesh);
        this.mesh.material = this.planetSide.seaLevelMaterial;
        this.mesh.parent = this.planetSide;
        
        this.mesh.freezeWorldMatrix();
    }

    public getPlanetChunck(iPos: number, jPos: number, kPos: number): PlanetChunck {
        if (!this.children || this.children.length === 0) {
            this.subdivide();
        }
        if (this.level === 1) {
            let i = Math.floor((iPos - 2 * this.iPos));
            let j = Math.floor((jPos - 2 * this.jPos));
            let k = Math.floor((kPos - (2 * this.kPos + this.kOffset)));
            let child = this.children[j + 2 * i + 4 * k];
            if (child instanceof PlanetChunck) {
                return child;
            }
            else {
                console.error("PlanetChunckGroup " + this.name + " of level == 1 has a child that is not a PlanetChunck.");
                debugger;
            }
        }
        else {
            let levelCoef = Math.pow(2, this.level);
            let i = Math.floor((iPos - levelCoef * this.iPos) / (levelCoef / 2));
            let j = Math.floor((jPos - levelCoef * this.jPos) / (levelCoef / 2));
            let k = Math.floor((kPos - this.kOffset - levelCoef * this.kPos) / (levelCoef / 2));
            let child = this.children[j + 2 * i + 4 * k];
            if (child instanceof PlanetChunckGroup) {
                return child.getPlanetChunck(iPos, jPos, kPos);
            }
            else {
                console.error("PlanetChunckGroup " + this.name + " of level > 1 has a child that is not a PlanetChunckGroup.");
                debugger;
            }
        }
        console.error("PlanetChunckGroup " + this.name + " does not contain PlanetChunck " + iPos + " " + jPos + " " + kPos);
        debugger;
    }

    private _subdivisionsCount: number = 0;
    private _subdivisionsSkipedCount: number = 0;
    private _subdivided: boolean = false;
    public get subdivided(): boolean {
        return this._subdivided;
    }
    public subdivide(): void {
        this._subdivisionsSkipedCount++;
        this.unregister();
        if (this._subdivided) {
            return;
        }
        this._subdivided = true;
        for (let k = 0; k < 2; k++) {
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    if (this.level === 1) {
                        let childKPos: number = this.kOffset + this.kPos * 2 + k;
                        if (childKPos < this.kOffsetNext) {
                            let chunck = this.children[j + 2 * i + 4 * k] as PlanetChunck;
                            if (!chunck) {
                                chunck = PlanetChunck.CreateChunck(this.iPos * 2 + i, this.jPos * 2 + j, childKPos, this.planetSide, this);
                                //console.log(PlanetChunck._DEBUG_NICE_CHUNCK_COUNT + " " + PlanetChunck._DEBUG_CHUNCK_COUNT);
                                this.children[j + 2 * i + 4 * k] = chunck;
                            }
                            chunck.register();
                        }
                    }
                    else {
                        let levelCoef = Math.pow(2, this.level - 1);
                        let childKPos: number = this.kPos * 2 + k;
                        if (childKPos * levelCoef < this.kOffsetNext - this.kOffset) {
                            let chunck = this.children[j + 2 * i + 4 * k] as PlanetChunckGroup;
                            if (!chunck) {
                                chunck = new PlanetChunckGroup(this.iPos * 2 + i, this.jPos * 2 + j, childKPos, this.planetSide, this, this.degree, this.level - 1);
                                this.children[j + 2 * i + 4 * k] = chunck;
                                if (chunck.isSeaLevel) {
                                    chunck.drawMesh();
                                }
                            }
                            chunck.register();
                        }
                    }
                }
            }
        }
        // debug
        if (this.children.length === 8) {
            let barycenterDisplacement = BABYLON.Vector3.Zero();
            this.children.forEach(c => {
                barycenterDisplacement.addInPlace(c.barycenter);
                //let line = BABYLON.MeshBuilder.CreateLines("l", { points: [this.barycenter, c.barycenter ]});
            })
            barycenterDisplacement.scaleInPlace(1 / this.children.length);
            console.log("barycenterDisplacement " + barycenterDisplacement.length().toFixed(2));
        }
        // debug done

        if (this.mesh) {
            this.mesh.dispose();
        }
        this._subdivisionsCount++;
        //console.log(this.name + " " + this._subdivisionsCount + " (" + this._subdivisionsSkipedCount + ")");
    }

    public collapse(): void {
        if (this.canCollapse()) {
            if (this.parentGroup) {
                this.parentGroup.collapseChildren();
            }
        }
    }

    public collapseChildren(): void {
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            if (child instanceof PlanetChunck) {
                child.disposeMesh();
                child.unregister();
            }
            else if (child instanceof PlanetChunckGroup) {
                if (child.subdivided) {
                    child.collapseChildren();
                }
                if (child.mesh) {
                    child.mesh.dispose();
                }
                child.lines.forEach(l => { l.dispose() });
                child.unregister();
            }
        }
        this.children = [];
        if (this.isSeaLevel) {
            this.drawMesh();
        }
        this._subdivided = false;
        this.register();
    }
}