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
        let iCenter = PlanetTools.CHUNCKSIZE * (this.iPos + 0.5) * levelCoef;
        let jCenter = PlanetTools.CHUNCKSIZE * (this.jPos + 0.5) * levelCoef;

        let pts: BABYLON.Vector3[] = [];

        let kMin = Math.floor((this.kOffset + (this.kPos) * levelCoef) * PlanetTools.CHUNCKSIZE);
        let kMax = Math.floor((this.kOffset + (this.kPos + 1) * levelCoef) * PlanetTools.CHUNCKSIZE);
        kMax = Math.min(kMax, Math.floor(this.kOffsetNext * PlanetTools.CHUNCKSIZE));

        let altMin = PlanetTools.KGlobalToAltitude(Math.floor((this.kOffset + (this.kPos) * levelCoef) * PlanetTools.CHUNCKSIZE));
        let altMax = PlanetTools.KGlobalToAltitude(Math.floor((this.kOffset + (this.kPos + 1) * levelCoef) * PlanetTools.CHUNCKSIZE));

        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMax));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMax));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMax));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMax));

        this._barycenter = BABYLON.Vector3.Zero();
        pts.forEach(p => {
            this._barycenter.addInPlace(p);
        })
        this._barycenter.scaleInPlace(1 / pts.length);

        this._barycenter = BABYLON.Vector3.TransformCoordinates(
            this._barycenter,
            planetSide.computeWorldMatrix(true)
        );

        if (kMin < this.planet.seaLevel && this.planet.seaLevel < kMax) {
            this.isShellLevel = true;
        }

        /*
        let p00 = PlanetTools.EvaluateVertex(chunck.size, i0, j0);
        
        let altOffset = 0;
        if (i < 0) {
            i0 = PlanetTools.CHUNCKSIZE * chunck.iPos * levelCoef;
            altOffset = - 0.2;
        }
        if (j < 0) {
            j0 = PlanetTools.CHUNCKSIZE * chunck.jPos * levelCoef;
            altOffset = - 0.2;
        }
        if (i > vertexCount) {
            i0 = PlanetTools.CHUNCKSIZE * (chunck.iPos + 1) * levelCoef;
            altOffset = - 0.2;
        }
        if (j > vertexCount) {
            j0 = PlanetTools.CHUNCKSIZE * (chunck.jPos + 1) * levelCoef;
            altOffset = - 0.2;
        }
        p00.scaleInPlace(PlanetTools.KGlobalToAltitude(h00 + 1) + altOffset);
        */

        if (this.isShellLevel) {
            this.drawMesh();
        }
    }

    public drawMesh(): void {
        if (this.mesh) {
            this.mesh.dispose();
        }
        this.mesh = new BABYLON.Mesh(this.name);

        PlanetChunckMeshBuilder.BuildShellLevelVertexData(this).applyToMesh(this.mesh);
        /*
        this.planetSide.onShellMaterialReady(() => {
            if (this.mesh && !this.mesh.isDisposed()) {
                this.mesh.material = this.planetSide.shellMaterial;
            }
        })
        */
        if (this.level === 1) {
            this.mesh.material = SharedMaterials.GreenMaterial();
        }
        if (this.level === 2) {
            this.mesh.material = SharedMaterials.BlueMaterial();
        }
        if (this.level === 3) {
            this.mesh.material = SharedMaterials.MagentaMaterial();
        }
        if (this.level === 4) {
            this.mesh.material = SharedMaterials.YellowMaterial();
        }
        this.mesh.parent = this.planetSide;
        this.mesh.freezeWorldMatrix();
        
        /*
        let pts: BABYLON.Vector3[] = [];
        let levelCoef = Math.pow(2, this.level);

        let altMin = PlanetTools.KGlobalToAltitude(Math.floor((this.kOffset + (this.kPos) * levelCoef) * PlanetTools.CHUNCKSIZE));
        let altMax = PlanetTools.KGlobalToAltitude(Math.floor((this.kOffset + (this.kPos + 1) * levelCoef) * PlanetTools.CHUNCKSIZE));

        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMin));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMax));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0) * levelCoef).scale(altMax));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 1) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMax));
        pts.push(PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 1) * levelCoef).scale(altMax));

        let f = 0.99;

        let color = new BABYLON.Color4(1, 1, 1, 1);
        if (this.level === 1) {
            color = new BABYLON.Color4(1, 0, 0, 1);
            //this.mesh.material = SharedMaterials.RedMaterial();
            f = 0.99;
        }
        if (this.level === 2) {
            color = new BABYLON.Color4(0, 1, 0, 1);
            //this.mesh.material = SharedMaterials.GreenMaterial();
            f = 0.98;
        }
        if (this.level === 3) {
            color = new BABYLON.Color4(0, 0, 1, 1);
            //this.mesh.material = SharedMaterials.BlueMaterial();
            f = 0.97;
        }
        if (this.level === 4) {
            color = new BABYLON.Color4(0, 1, 1, 1);
            f = 0.96;
        }

        f = 1;
        for (let i = 0; i < pts.length; i++) {
            pts[i] = pts[i].scale(f).add(this.barycenter.scale(1 - f));
        }

        let hitBox = BABYLON.MeshBuilder.CreateLineSystem(
            "hitbox",
            {
                lines: [
                    [pts[0], pts[1], pts[2], pts[3], pts[0]],
                    [pts[4], pts[5], pts[6], pts[7], pts[4]],
                    [pts[0], pts[4]],
                    [pts[1], pts[5]],
                    [pts[2], pts[6]],
                    [pts[3], pts[7]]
                ],
                colors: [
                    [color, color, color, color, color],
                    [color, color, color, color, color],
                    [color, color],
                    [color, color],
                    [color, color],
                    [color, color]
                ]
            },
            this.scene
        );
        
        hitBox.layerMask = 0x10000000;
        hitBox.parent = this.mesh;
        */
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
                                if (chunck.isShellLevel) {
                                    chunck.drawMesh();
                                }
                            }
                            chunck.register();
                        }
                    }
                }
            }
        }

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
        if (this.isShellLevel) {
            this.drawMesh();
        }
        this._subdivided = false;
        this.register();
    }
}