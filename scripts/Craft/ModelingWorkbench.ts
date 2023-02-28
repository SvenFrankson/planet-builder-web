/// <reference path="../UI/Pickable.ts"/>

class ModelingWorkbench extends PickablePlanetObject {

    public frame: BABYLON.Mesh;

    public voxelMesh: VoxelMesh;

    public previewMesh: BABYLON.Mesh;
    public brushSize: number = 1;

    public hiddenModelMesh: BABYLON.Mesh;
    public modelMesh: BABYLON.Mesh;
    public cubeModelMesh: BABYLON.Mesh;

    public interactionAnchor: BABYLON.Mesh;

    public using: boolean = false;

    public gridEditionMode: boolean = true;
    public grid: BABYLON.Mesh;
    public gridY: number = 0;
    public gridDesc: IGridDesc;
    public commandContainer: BABYLON.Mesh;
    public gridPlus: BABYLON.Mesh;
    public gridMinus: BABYLON.Mesh;

    constructor(
        main: Main
    ) {
        super("modeling-workbench", main);
    }

    public instantiate(): void {
        super.instantiate();
        
        this.frame = BABYLON.MeshBuilder.CreateBox("frame", { size: 0.05 });
        this.frame.parent = this;
        this.frame.position.y = 0;
        this.frame.isVisible = true;
        VertexDataLoader.instance.get("modeling-workbench").then(vertexDatas => {
            let vData = vertexDatas[0];
            vData.applyToMesh(this.frame);
        });

        this.voxelMesh = new VoxelMesh(6);
        this.voxelMesh.cubeSize = 0.05;
        this.voxelMesh.addCube(42, BABYLON.Vector3.Zero(), 3);
        for (let n = 0; n < 0; n++) {
            let s = Math.floor(2 + 4 * Math.random());
            this.voxelMesh.addCube(
                42,
                new BABYLON.Vector3(
                    Math.round(- 12 + 24 * Math.random()),
                    Math.round(- 12 + 24 * Math.random()),
                    Math.round(- 12 + 24 * Math.random())
                ),
                s
            );
        }

        this.hiddenModelMesh = new BABYLON.Mesh("model-mesh");
        this.hiddenModelMesh.isVisible = false;

        this.modelMesh = new BABYLON.Mesh("model-mesh");
        this.modelMesh.position.y = 1;
        this.modelMesh.parent = this;
        this.modelMesh.material = new ToonMaterial("model-mesh-material", this.scene);

        this.cubeModelMesh = new BABYLON.Mesh("cube-model-mesh");
        this.cubeModelMesh.position.y = 1;
        this.cubeModelMesh.parent = this;
        let cubeModeMaterial = new BABYLON.StandardMaterial("cube-model-material", Game.Scene);
        cubeModeMaterial.diffuseColor = BABYLON.Color3.White();
        cubeModeMaterial.specularColor = BABYLON.Color3.Black();
        cubeModeMaterial.alpha = 0.2;
        this.cubeModelMesh.material = cubeModeMaterial;

        this.previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { size: this.voxelMesh.cubeSize });
        this.previewMesh.scaling.copyFromFloats(1, 1, 1).scaleInPlace(this.brushSize);
        this.previewMesh.material = SharedMaterials.WaterMaterial();
        this.previewMesh.parent = this.modelMesh;

        this.grid = BABYLON.MeshBuilder.CreateGround("grid", { width: this.voxelMesh.cubeSize * 2, height: this.voxelMesh.cubeSize * 2 });
        let uvs = this.grid.getVerticesData(BABYLON.VertexBuffer.UVKind);
        uvs = uvs.map((v: number) => { return v * 2});
        this.grid.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
        let gridMaterial = new BABYLON.StandardMaterial("grid-material", Game.Scene);
        gridMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);
        gridMaterial.diffuseTexture = new BABYLON.Texture("datas/images/border-square-64.png");
        gridMaterial.useAlphaFromDiffuseTexture = true;
        gridMaterial.specularColor = BABYLON.Color3.White();
        gridMaterial.alpha = 0.2;
        this.grid.material = gridMaterial;
        this.grid.layerMask = 0x10000000;
        this.grid.parent = this.modelMesh;
        this.grid.position.y = (this.gridY) * this.voxelMesh.cubeSize;

        let hsf = Config.performanceConfiguration.holoScreenFactor;

        let hudMaterial = new HoloPanelMaterial("hud-material", this.scene);

        let hudTexture = new BABYLON.DynamicTexture("hud-texture", { width: 64 * hsf, height: 64 * hsf }, this.scene, true);
        hudTexture.hasAlpha = true;
        hudMaterial.holoTexture = hudTexture;
        
        let slika = new Slika(64 * hsf, 64 * hsf, hudTexture.getContext(), hudTexture);
        slika.texture = hudTexture;
        slika.context = hudTexture.getContext();
        slika.add(new SlikaPath({
            points: [
                16, 40,
                32, 16,
                48, 40
            ],
            close: false,
            strokeColor: BABYLON.Color3.White(),
            strokeAlpha: 1,
            strokeWidth: 4,
        }));
        slika.add(new SlikaCircle({
            x: 32,
            y: 32,
            r: 28,
            color: BABYLON.Color3.White(),
            width: 2
        }));
        slika.needRedraw = true;

        this.commandContainer = new BABYLON.Mesh("command-container");
        this.commandContainer.parent = this.grid;
        //this.commandContainer.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.gridPlus = new BABYLON.Mesh("grid-plus");
        VertexDataUtils.CreatePlane(0.08, 0.08).applyToMesh(this.gridPlus);
        this.gridPlus.material = hudMaterial;
        this.gridPlus.parent = this.commandContainer;
        this.gridPlus.position.x = 0.5;
        this.gridPlus.position.y = 0.02;
        this.gridPlus.position.z = 0.06;
        this.gridPlus.rotation.x = 0.5 * Math.PI;
        this.gridPlus.layerMask = 0x10000000;
        
        this.gridMinus = new BABYLON.Mesh("grid-minus");
        VertexDataUtils.CreatePlane(0.08, 0.08).applyToMesh(this.gridMinus);
        this.gridMinus.material = hudMaterial;
        this.gridMinus.parent = this.commandContainer;
        this.gridMinus.position.x = 0.5;
        this.gridMinus.position.y = 0.02;
        this.gridMinus.position.z = - 0.06;
        this.gridMinus.rotation.x = 0.5 * Math.PI;
        this.gridMinus.rotation.y = Math.PI;
        this.gridMinus.layerMask = 0x10000000;

        this.updateMesh();

        this.interactionAnchor = new BABYLON.Mesh("interaction-anchor");
        //BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.interactionAnchor);
        //this.interactionAnchor.material = SharedMaterials.RedMaterial();
        this.interactionAnchor.position.z = -1;
        this.interactionAnchor.parent = this;

        this.proxyPickMeshes = [this.modelMesh, this.grid, this.gridPlus, this.gridMinus];
    }

    private updateCubeMesh(): void {
        this.gridDesc = {
            minX: this.voxelMesh.halfSize,
            maxX: this.voxelMesh.halfSize,
            minY: this.voxelMesh.halfSize,
            maxY: this.voxelMesh.halfSize,
            blocks: []
        };

        let data = this.voxelMesh.buildCubeMesh(
            {
                baseColor: new BABYLON.Color4(0.75, 0.75, 0.75, 1),
                highlightY: this.gridY,
                highlightColor: new BABYLON.Color4(0, 1, 1, 1)
            },
            this.gridDesc
        );
        data.applyToMesh(this.cubeModelMesh);
        
        this._redrawGrid();
    }

    private updateMesh(): void {
        this.updateCubeMesh();

        let data = this.voxelMesh.buildMesh(1);
        data.applyToMesh(this.hiddenModelMesh);

        let decimator = new BABYLON.QuadraticErrorSimplification(this.hiddenModelMesh);
        decimator.simplify({ quality: 0.8, distance: 0 }, (simplifiedMesh: BABYLON.Mesh) => {
            let data = BABYLON.VertexData.ExtractFromMesh(simplifiedMesh);
            data.applyToMesh(this.modelMesh);
            simplifiedMesh.dispose();
        });
    }

    public async open(): Promise<void> {
        
    }

    public async close(duration: number = 1.5): Promise<void> {
       
    }

    public interceptsPointerMove(): boolean {
        if (BABYLON.Vector3.DistanceSquared(this.inputManager.player.position, this.position) < 1.2 * 1.2) {
            return true;
        }
        return false;
    }

    public onPointerDown(): void {
        if (BABYLON.Vector3.DistanceSquared(this.inputManager.player.position, this.position) < 1.2 * 1.2) {
            
        }
    }

    public onPointerUp(): void {
        if (this.using) {
            if (this.inputManager.aimedProxyIndex === 2) {
                this.gridY++;
                this.updateCubeMesh();
            }
            else if (this.inputManager.aimedProxyIndex === 3) {
                this.gridY--;
                this.updateCubeMesh();
            }
            else {
                let p = this.inputManager.aimedPosition.add(this.inputManager.aimedNormal.scale(this.voxelMesh.cubeSize * 0.5));
                let localP = BABYLON.Vector3.TransformCoordinates(p, this.modelMesh.getWorldMatrix().clone().invert());
                let i = Math.floor(localP.x / this.voxelMesh.cubeSize);
                let j = Math.floor(localP.y / this.voxelMesh.cubeSize);
                let k = Math.floor(localP.z / this.voxelMesh.cubeSize);
    
                this.voxelMesh.addCube(42, new BABYLON.Vector3(i, j, k), this.brushSize);
    
                this.updateMesh();
            }
        }
        else {
            if (BABYLON.Vector3.DistanceSquared(this.inputManager.player.position, this.position) < 1.2 * 1.2) {
                this.using = true;
                document.exitPointerLock();
                this.inputManager.freeHandMode = true;
                this.scene.onBeforeRenderObservable.add(this._update);
            }
        }
    }

    public onHoverStart(): void {
        
    }

    public onHoverEnd(): void {
        
    }

    private _update = () => {
        if (BABYLON.Vector3.DistanceSquared(this.inputManager.player.position, this.position) > 1.2 * 1.2) {
            this.using = false;
            this.inputManager.freeHandMode = false;
            this.scene.onBeforeRenderObservable.removeCallback(this._update);
            this.previewMesh.isVisible = false;
        }
        else {
            if (this.inputManager.aimedPosition) {
                if (this.inputManager.aimedProxyIndex === 2) {

                }
                else if (this.inputManager.aimedProxyIndex === 3) {

                }
                else {
                    let p = this.inputManager.aimedPosition.add(this.inputManager.aimedNormal.scale(this.voxelMesh.cubeSize * 0.5));
                    let localP = BABYLON.Vector3.TransformCoordinates(p, this.modelMesh.getWorldMatrix().clone().invert());
                    let i = Math.floor(localP.x / this.voxelMesh.cubeSize);
                    let j = Math.floor(localP.y / this.voxelMesh.cubeSize);
                    let k = Math.floor(localP.z / this.voxelMesh.cubeSize);
                    this.previewMesh.position.copyFromFloats(i, j, k).scaleInPlace(this.voxelMesh.cubeSize).addInPlaceFromFloats(this.voxelMesh.cubeSize * 0.5, this.voxelMesh.cubeSize * 0.5, this.voxelMesh.cubeSize * 0.5);
                    this.previewMesh.isVisible = true;
                }
            }
            else {
                this.previewMesh.isVisible = false;
            }

            let Y = this.up;
            let Z = this.inputManager.player.forward;
            let alpha = VMath.AngleFromToAround(this.inputManager.player.forward, this.forward, this.up);
            if (Math.abs(alpha) < Math.PI / 4) {
                this.commandContainer.rotation.y = 0;
                this.gridPlus.position.x = this._gridPosMax.x + 0.05;
                this.gridMinus.position.x = this._gridPosMax.x + 0.05;
            }
            else if (Math.abs(alpha) > 3 * Math.PI / 4) {
                this.commandContainer.rotation.y = Math.PI;
                this.gridPlus.position.x = - this._gridPosMin.x + 0.05;
                this.gridMinus.position.x = - this._gridPosMin.x + 0.05;
            }
            else if (alpha > Math.PI / 4) {
                this.commandContainer.rotation.y = - Math.PI / 2;
                this.gridPlus.position.x = this._gridPosMax.z + 0.05;
                this.gridMinus.position.x = this._gridPosMax.z + 0.05;
            }
            else if (alpha < - Math.PI / 4) {
                this.commandContainer.rotation.y = Math.PI / 2;
                this.gridPlus.position.x = - this._gridPosMin.z + 0.05;
                this.gridMinus.position.x = - this._gridPosMin.z + 0.05;
            }
            //VMath.QuaternionFromYZAxisToRef(Y, Z, this.commandContainer.rotationQuaternion);
        }
    }

    private _gridPosMin: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _gridPosMax: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _redrawGrid(): void {
        this.grid.position.y = (this.gridY) * this.voxelMesh.cubeSize;

        console.log(this.gridDesc);

        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];
        let uvs: number[] = [];

        let w = (this.gridDesc.maxX + 3) - (this.gridDesc.minX -2) + 1;
        let h = (this.gridDesc.maxY + 3) - (this.gridDesc.minY -2) + 1;

        for (let j = this.gridDesc.minY - 2; j <= this.gridDesc.maxY + 3; j++) {
            for (let i = this.gridDesc.minX - 2; i <= this.gridDesc.maxX + 3; i++) {
                let x = (i - this.voxelMesh.halfSize) * this.voxelMesh.cubeSize;
                let y = 0;
                let z = (j - this.voxelMesh.halfSize) * this.voxelMesh.cubeSize;

                let n = positions.length / 3;
                positions.push(x, y, z);
                normals.push(0, 1, 0);
                uvs.push(i, j);

                if (!this.gridDesc.blocks[i] || this.gridDesc.blocks[i][j] != 1) {
                    if (i < this.gridDesc.maxX + 3 && j < this.gridDesc.maxY + 3) {
                        indices.push(n, n + 1, n + 1 + w);
                        indices.push(n, n + 1 + w, n + w);
                    }
                }
            }
        }

        data.positions = positions;
        data.indices = indices;
        data.normals = normals;
        data.uvs = uvs;

        data.applyToMesh(this.grid);

        this._gridPosMin.x = ((this.gridDesc.minX - 2 - this.voxelMesh.halfSize)) * this.voxelMesh.cubeSize;
        this._gridPosMin.z = ((this.gridDesc.minY - 2 - this.voxelMesh.halfSize)) * this.voxelMesh.cubeSize;

        this._gridPosMax.x = ((this.gridDesc.maxX + 3 - this.voxelMesh.halfSize)) * this.voxelMesh.cubeSize;
        this._gridPosMax.z = ((this.gridDesc.maxY + 3 - this.voxelMesh.halfSize)) * this.voxelMesh.cubeSize;
    }
}