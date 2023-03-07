/// <reference path="../UI/Pickable.ts"/>

enum EditionMode {
    Sculpt,
    HGrid,
    VGrid
}

class ModelingWorkbench extends PickablePlanetObject {

    public frame: BABYLON.Mesh;

    public activeVoxelMesh: number = 0;
    public colors: BABYLON.Color3[] = [];
    public voxelMeshes: VoxelMesh[] = [];

    public degree: number = 6;
    public size: number = 2;
    public halfSize: number = 1;
    public cubeSize: number = 0.05;

    public previewMesh: BABYLON.Mesh;
    public brushSize: number = 1;

    public modelContainer: BABYLON.Mesh;
    public hiddenModelMesh: BABYLON.Mesh;
    public modelMeshes: BABYLON.Mesh[] = [];
    public cubeModelMesh: BABYLON.Mesh;

    public interactionAnchor: BABYLON.Mesh;

    public using: boolean = false;

    public editionMode: EditionMode = EditionMode.HGrid;

    public grid: BABYLON.Mesh;
    public gridOffsetX: number = 0;
    public gridOffsetY: number = 0;
    public gridOffsetZ: number = 0;
    public gridDesc: IGridDesc;
    public currentOrientation: number = 0;

    public commandContainer: BABYLON.Mesh;
    public gridPlus: PickableObject;
    public gridDown: PickableObject;
    public modeButton: PickableObject;
    public brushSize3: PickableObject;
    public brushSize1: PickableObject;
    public activeIndexInput: PickableObject[] = [];

    constructor(
        main: Main
    ) {
        super("modeling-workbench", main);

        this.size = Math.pow(2, this.degree);
        this.halfSize = Math.floor(this.size * 0.5);

        this.colors = [
            BABYLON.Color3.Green(),
            BABYLON.Color3.Red(),
            BABYLON.Color3.Yellow()
        ]
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

        /*
        this.voxelMesh = new VoxelMesh(6);
        this.cubeSize = 0.05;
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
        */

        this.hiddenModelMesh = new BABYLON.Mesh("model-mesh");
        this.hiddenModelMesh.isVisible = false;

        /*
        this.modelMesh = new BABYLON.Mesh("model-mesh");
        this.modelMesh.position.y = 1;
        this.modelMesh.parent = this;
        this.modelMesh.material = new ToonMaterial("model-mesh-material", this.scene);
        */

        this.modelContainer = new BABYLON.Mesh("model-container");
        this.modelContainer.position.y = 1;
        this.modelContainer.parent = this;

        this.cubeModelMesh = new BABYLON.Mesh("cube-model-mesh");
        this.cubeModelMesh.position.y = 1;
        this.cubeModelMesh.parent = this;
        let cubeModeMaterial = new BABYLON.StandardMaterial("cube-model-material", Game.Scene);
        cubeModeMaterial.diffuseColor = BABYLON.Color3.White();
        cubeModeMaterial.specularColor = BABYLON.Color3.Black();
        cubeModeMaterial.alpha = 0.3;
        this.cubeModelMesh.material = cubeModeMaterial;

        this.previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { size: this.cubeSize });
        this.previewMesh.scaling.copyFromFloats(1, 1, 1).scaleInPlace(this.brushSize);
        this.previewMesh.material = SharedMaterials.WaterMaterial();
        this.previewMesh.parent = this.modelContainer;

        this.grid = BABYLON.MeshBuilder.CreateGround("grid", { width: this.cubeSize * 2, height: this.cubeSize * 2 });
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
        this.grid.parent = this.modelContainer;

        let hsf = Config.performanceConfiguration.holoScreenFactor;

        let hudMaterial = new HoloPanelMaterial("hud-material", this.scene);

        let hudTexture = new BABYLON.DynamicTexture("hud-texture", { width: 512 * hsf, height: 512 * hsf }, this.scene, true);
        hudTexture.hasAlpha = true;
        hudMaterial.holoTexture = hudTexture;
        
        let slika = new Slika(512 * hsf, 512 * hsf, hudTexture.getContext(), hudTexture);
        slika.texture = hudTexture;
        slika.context = hudTexture.getContext();
        this._fillCommandSlika(slika);
        slika.needRedraw = true;

        this.commandContainer = new BABYLON.Mesh("command-container");
        this.commandContainer.parent = this.grid;
        //this.commandContainer.rotationQuaternion = BABYLON.Quaternion.Identity();

        let inputMaterial = new BABYLON.StandardMaterial("input-material", Game.Scene);
        inputMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);
        inputMaterial.alpha = 0.4;

        this.gridPlus = new PickableObject("grid-plus", this.main);
        BABYLON.CreateBoxVertexData({ width: 0.08, height: 0.02, depth: 0.08 }).applyToMesh(this.gridPlus);
        this.gridPlus.instantiate();
        this.gridPlus.material = inputMaterial;
        this.gridPlus.parent = this.commandContainer;
        this.gridPlus.position.z = 0.5;
        this.gridPlus.layerMask = 0x10000000;
        this.gridPlus.pointerUpCallback = () => {
            if (this.editionMode === EditionMode.HGrid) {
                this.gridOffsetY++;
            }
            else if (this.editionMode === EditionMode.VGrid) {
                if (this.currentOrientation === 0) {
                    this.gridOffsetZ++;
                }
                else if (this.currentOrientation === 1) {
                    this.gridOffsetX++;
                }
                else if (this.currentOrientation === 2) {
                    this.gridOffsetZ--;
                }
                else if (this.currentOrientation === 3) {
                    this.gridOffsetX--;
                }
            }
            this.updateCubeMesh();
        }
        
        let gridPlusIcon = new BABYLON.Mesh("grid-plus-icon");
        VertexDataUtils.CreatePlane(0.08, 0.08, undefined, undefined, 0, 7/8, 1/8, 1).applyToMesh(gridPlusIcon);
        gridPlusIcon.material = hudMaterial;
        gridPlusIcon.parent = this.gridPlus;
        gridPlusIcon.rotation.x = Math.PI * 0.5;
        gridPlusIcon.layerMask = 0x10000000;
        
        this.gridDown = new PickableObject("grid-minus", this.main);
        BABYLON.CreateBoxVertexData({ width: 0.08, height: 0.02, depth: 0.08 }).applyToMesh(this.gridDown);
        //VertexDataUtils.CreatePlane(0.08, 0.08).applyToMesh(this.gridMinus);
        this.gridDown.instantiate();
        this.gridDown.material = inputMaterial;
        this.gridDown.parent = this.commandContainer;
        this.gridDown.position.z = 0.4;
        this.gridDown.layerMask = 0x10000000;
        this.gridDown.pointerUpCallback = () => {
            if (this.editionMode === EditionMode.HGrid) {
                this.gridOffsetY--;
            }
            else if (this.editionMode === EditionMode.VGrid) {
                if (this.currentOrientation === 0) {
                    this.gridOffsetZ--;
                }
                else if (this.currentOrientation === 1) {
                    this.gridOffsetX--;
                }
                else if (this.currentOrientation === 2) {
                    this.gridOffsetZ++;
                }
                else if (this.currentOrientation === 3) {
                    this.gridOffsetX++;
                }
            }
            this.updateCubeMesh();
        }
        
        let gridDownIcon = new BABYLON.Mesh("grid-down-icon");
        VertexDataUtils.CreatePlane(0.08, 0.08, undefined, undefined, 0, 6/8, 1/8, 7/8).applyToMesh(gridDownIcon);
        gridDownIcon.material = hudMaterial;
        gridDownIcon.parent = this.gridDown;
        gridDownIcon.rotation.x = Math.PI * 0.5;
        gridDownIcon.layerMask = 0x10000000;
        
        this.modeButton = new PickableObject("grid-minus", this.main);
        BABYLON.CreateBoxVertexData({ width: 0.08, height: 0.02, depth: 0.08 }).applyToMesh(this.modeButton);
        //VertexDataUtils.CreatePlane(0.08, 0.08).applyToMesh(this.gridMinus);
        this.modeButton.instantiate();
        this.modeButton.material = inputMaterial;
        this.modeButton.parent = this.commandContainer;
        this.modeButton.position.z = 0.3;
        this.modeButton.layerMask = 0x10000000;
        
        let modeButtonIcon = new BABYLON.Mesh("grid-down-icon");
        VertexDataUtils.CreatePlane(0.08, 0.08, undefined, undefined, 0, (5 - this.editionMode)/8, 1/8, (6 - this.editionMode)/8).applyToMesh(modeButtonIcon);
        modeButtonIcon.material = hudMaterial;
        modeButtonIcon.parent = this.modeButton;
        modeButtonIcon.rotation.x = Math.PI * 0.5;
        modeButtonIcon.layerMask = 0x10000000;
        
        this.modeButton.pointerUpCallback = () => {
            this.editionMode = (this.editionMode + 1) % 3;
            VertexDataUtils.CreatePlane(0.08, 0.08, undefined, undefined, 0, (5 - this.editionMode)/8, 1/8, (6 - this.editionMode)/8).applyToMesh(modeButtonIcon);
            this.updateCubeMesh();
            this.updateEditionMode();
        }
        
        this.brushSize3 = new PickableObject("brush-size-3", this.main);
        BABYLON.CreateBoxVertexData({ width: 0.08, height: 0.02, depth: 0.08 }).applyToMesh(this.brushSize3);
        //VertexDataUtils.CreatePlane(0.08, 0.08).applyToMesh(this.gridMinus);
        this.brushSize3.instantiate();
        this.brushSize3.material = inputMaterial;
        this.brushSize3.parent = this.commandContainer;
        this.brushSize3.position.z = 0.2;
        this.brushSize3.layerMask = 0x10000000;
        this.brushSize3.pointerUpCallback = () => {
            this.brushSize = 3;
            this.previewMesh.scaling.copyFromFloats(1, 1, 1).scaleInPlace(this.brushSize);
            this.updateCubeMesh();
        }
        
        let brushSize3Icon = new BABYLON.Mesh("grid-down-icon");
        VertexDataUtils.CreatePlane(0.08, 0.08, undefined, undefined, 2/8, 7/8, 3/8, 1).applyToMesh(brushSize3Icon);
        brushSize3Icon.material = hudMaterial;
        brushSize3Icon.parent = this.brushSize3;
        brushSize3Icon.rotation.x = Math.PI * 0.5;
        brushSize3Icon.layerMask = 0x10000000;
        
        this.brushSize1 = new PickableObject("brush-size-1", this.main);
        BABYLON.CreateBoxVertexData({ width: 0.08, height: 0.02, depth: 0.08 }).applyToMesh(this.brushSize1);
        //VertexDataUtils.CreatePlane(0.08, 0.08).applyToMesh(this.gridMinus);
        this.brushSize1.instantiate();
        this.brushSize1.material = inputMaterial;
        this.brushSize1.parent = this.commandContainer;
        this.brushSize1.position.z = 0.1;
        this.brushSize1.layerMask = 0x10000000;
        this.brushSize1.pointerUpCallback = () => {
            this.brushSize = 1;
            this.previewMesh.scaling.copyFromFloats(1, 1, 1).scaleInPlace(this.brushSize);
            this.updateCubeMesh();
        }
        
        let brushSize1Icon = new BABYLON.Mesh("grid-down-icon");
        VertexDataUtils.CreatePlane(0.08, 0.08, undefined, undefined, 2/8, 6/8, 3/8, 7/8).applyToMesh(brushSize1Icon);
        brushSize1Icon.material = hudMaterial;
        brushSize1Icon.parent = this.brushSize1;
        brushSize1Icon.rotation.x = Math.PI * 0.5;
        brushSize1Icon.layerMask = 0x10000000;

        for (let i = 0; i < 3; i++) {
            this.activeIndexInput[i] = new PickableObject("grid-minus", this.main);
            BABYLON.CreateBoxVertexData({ width: 0.08, height: 0.02, depth: 0.08 }).applyToMesh(this.activeIndexInput[i]);
            //VertexDataUtils.CreatePlane(0.08, 0.08).applyToMesh(this.activeIndexInput[i]);
            this.activeIndexInput[i].instantiate();
            this.activeIndexInput[i].material = inputMaterial;
            this.activeIndexInput[i].parent = this.commandContainer;
            this.activeIndexInput[i].position.x = -0.1 - i * 0.1;
            this.activeIndexInput[i].layerMask = 0x10000000;
            let n = i;
            this.activeIndexInput[i].pointerUpCallback = () => {
                this.activeVoxelMesh = n;
                this.updateCubeMesh();
            }
        
            let activeIndexIcon = new BABYLON.Mesh("active-index-icon");
            VertexDataUtils.CreatePlane(0.08, 0.08, undefined, undefined, 1/8, (7-i)/8, 2/8, (8-i)/8).applyToMesh(activeIndexIcon);
            activeIndexIcon.material = hudMaterial;
            activeIndexIcon.parent = this.activeIndexInput[i];
            activeIndexIcon.rotation.x = Math.PI * 0.5;
            activeIndexIcon.layerMask = 0x10000000;
        }

        this.updateMesh();
        this.updateEditionMode();
        this.updateBoundingBox();

        this.interactionAnchor = new BABYLON.Mesh("interaction-anchor");
        //BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.interactionAnchor);
        //this.interactionAnchor.material = SharedMaterials.RedMaterial();
        this.interactionAnchor.position.z = -1;
        this.interactionAnchor.parent = this;

        this.proxyPickMeshes = [this.grid];
    }

    private updateCubeMesh(): void {
        let voxelMesh = this.voxelMeshes[this.activeVoxelMesh];

        this.gridDesc = {
            minX: this.halfSize,
            maxX: this.halfSize,
            minY: this.halfSize,
            maxY: this.halfSize,
            blocks: []
        };

        if (voxelMesh) {
            let cubeProp: ICubeMeshProperties = { baseColor: new BABYLON.Color4(0.75, 0.75, 0.75, 1) };
            if (this.editionMode === EditionMode.HGrid) {
                cubeProp.highlightY = this.gridOffsetY;
                cubeProp.highlightColor = new BABYLON.Color4(0, 1, 1, 1);
            }
            else if (this.editionMode === EditionMode.VGrid) {
                if (this.currentOrientation % 2 === 0) {
                    cubeProp.highlightZ = this.gridOffsetZ;
                    cubeProp.highlightColor = new BABYLON.Color4(0, 1, 1, 1);
                }
                else if (this.currentOrientation % 2 === 1) {
                    cubeProp.highlightX = this.gridOffsetX;
                    cubeProp.highlightColor = new BABYLON.Color4(0, 1, 1, 1);
                }
            }
            let data = voxelMesh.buildCubeMesh(cubeProp, this.gridDesc);
            data.applyToMesh(this.cubeModelMesh);
            this.cubeModelMesh.isVisible = true;
        }
        else {
            this.cubeModelMesh.isVisible = false;
        }
        
        this._redrawGrid();
    }

    private updateMesh(): void {
        this.updateCubeMesh();

        let voxelMesh = this.voxelMeshes[this.activeVoxelMesh];
        let modelMesh = this.modelMeshes[this.activeVoxelMesh];

        if (voxelMesh) {
            let data = voxelMesh.buildMesh(1, this.colors[this.activeVoxelMesh]);
            data.applyToMesh(this.hiddenModelMesh);
            console.log(data);

            if (!modelMesh) {
                modelMesh = new BABYLON.Mesh("model-mesh");
                modelMesh.parent = this.modelContainer;
                modelMesh.material = new ToonMaterial("model-mesh-material", this.scene);
                this.modelMeshes[this.activeVoxelMesh] = modelMesh;
            }
    
            let decimator = new BABYLON.QuadraticErrorSimplification(this.hiddenModelMesh);
            decimator.simplify({ quality: 0.8, distance: 0 }, (simplifiedMesh: BABYLON.Mesh) => {
                let data = BABYLON.VertexData.ExtractFromMesh(simplifiedMesh);
                data.applyToMesh(modelMesh);
                simplifiedMesh.dispose();
                requestAnimationFrame(() => {
                    this.updateBoundingBox();
                })
            });
        }
    }

    private updateBoundingBox(): void {
        this._bboxMin.x = 0;
        this._bboxMin.z = 0;
        this._bboxMax.x = this.cubeSize;
        this._bboxMax.z = this.cubeSize;
        
        for (let i = 0; i < this.modelMeshes.length; i++) {
            if (this.modelMeshes[i]) {
                let bbox = this.modelMeshes[i].getBoundingInfo().boundingBox;
                this._bboxMin.minimizeInPlace(bbox.minimum);
                this._bboxMax.maximizeInPlace(bbox.maximum);
            }
        }

        this._bboxMin.x = Math.floor(this._bboxMin.x / this.cubeSize) * this.cubeSize;
        this._bboxMin.z = Math.floor(this._bboxMin.z / this.cubeSize) * this.cubeSize;
        this._bboxMax.x = Math.ceil(this._bboxMax.x / this.cubeSize) * this.cubeSize;
        this._bboxMax.z = Math.ceil(this._bboxMax.z / this.cubeSize) * this.cubeSize;

        this._bboxMin.x -= this._gridMargin * this.cubeSize;
        this._bboxMin.z -= this._gridMargin * this.cubeSize;
        this._bboxMax.x += this._gridMargin * this.cubeSize;
        this._bboxMax.z += this._gridMargin * this.cubeSize;
    }

    private updateEditionMode(): void {
        if (this.editionMode === EditionMode.Sculpt) {
            this.grid.isVisible = false;
            this.proxyPickMeshes = [this.cubeModelMesh];
        }
        else {
            this.grid.isVisible = true;
            this.proxyPickMeshes = [this.grid];
        }
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
        if (this.using) {
            let p = this.inputManager.aimedPosition.add(this.inputManager.aimedNormal.scale(this.cubeSize * 0.5));
            let localP = BABYLON.Vector3.TransformCoordinates(p, this.modelContainer.getWorldMatrix().clone().invert());
            let i = Math.floor(localP.x / this.cubeSize);
            let j = Math.floor(localP.y / this.cubeSize);
            let k = Math.floor(localP.z / this.cubeSize);

            let voxelMesh = this.voxelMeshes[this.activeVoxelMesh];
            if (!voxelMesh) {
                voxelMesh = new VoxelMesh(6);
                voxelMesh.cubeSize = 0.05;
                this.voxelMeshes[this.activeVoxelMesh] = voxelMesh;
            }
            voxelMesh.addCube(42, new BABYLON.Vector3(i, j, k), this.brushSize);

            this.updateMesh();
        }
    }

    public onPointerUp(): void {
        if (!this.using) {
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
            if (this.inputManager.aimedPosition && this.inputManager.aimedElement === this) {
                let p = this.inputManager.aimedPosition.add(this.inputManager.aimedNormal.scale(this.cubeSize * 0.5));
                let localP = BABYLON.Vector3.TransformCoordinates(p, this.modelContainer.getWorldMatrix().clone().invert());
                let i = Math.floor(localP.x / this.cubeSize);
                let j = Math.floor(localP.y / this.cubeSize);
                let k = Math.floor(localP.z / this.cubeSize);
                this.previewMesh.position.copyFromFloats(i, j, k).scaleInPlace(this.cubeSize).addInPlaceFromFloats(this.cubeSize * 0.5, this.cubeSize * 0.5, this.cubeSize * 0.5);
                this.previewMesh.isVisible = true;
            }
            else {
                this.previewMesh.isVisible = false;
            }

            let Y = this.up;
            let Z = this.inputManager.player.forward;
            let alpha = VMath.AngleFromToAround(this.inputManager.player.forward, this.forward, this.up);
            if (this.editionMode === EditionMode.VGrid) {
                this.commandContainer.rotation.y = 0;
                this.commandContainer.position.x = this._bboxMax.x + 0.05;
                this.commandContainer.position.z = this._bboxMin.z - 0.05;
            }
            else {
                this.grid.rotation.x = 0;
                this.grid.rotation.y = 0;
            }
            
            if (Math.abs(alpha) < Math.PI / 4) {
                if (this.editionMode === EditionMode.VGrid) {
                    this.grid.rotation.x = - Math.PI * 0.5;
                    this.grid.rotation.y = 0;
                    if (this.currentOrientation != 0) {
                        this.currentOrientation = 0;
                        this.updateCubeMesh();
                    }
                }
                else {
                    this.commandContainer.rotation.y = 0;
                    this.commandContainer.position.x = this._bboxMax.x + 0.05;
                    this.commandContainer.position.z = this._bboxMin.z - 0.05;
                }
            }
            else if (Math.abs(alpha) > 3 * Math.PI / 4) {
                if (this.editionMode === EditionMode.VGrid) {
                    this.grid.rotation.x = - Math.PI * 0.5;
                    this.grid.rotation.y = Math.PI;
                    if (this.currentOrientation != 2) {
                        this.currentOrientation = 2;
                        this.updateCubeMesh();
                    }
                }
                else {
                    this.commandContainer.rotation.y = Math.PI;
                    this.commandContainer.position.x = this._bboxMin.x - 0.05;
                    this.commandContainer.position.z = this._bboxMax.z + 0.05;
                }
            }
            else if (alpha > Math.PI / 4) {
                if (this.editionMode === EditionMode.VGrid) {
                    this.grid.rotation.x = - Math.PI * 0.5;
                    this.grid.rotation.y = - Math.PI * 0.5;
                    if (this.currentOrientation != 3) {
                        this.currentOrientation = 3;
                        this.updateCubeMesh();
                    }
                }
                else {
                    this.commandContainer.rotation.y = - Math.PI / 2;
                    this.commandContainer.position.x = this._bboxMax.x + 0.05;
                    this.commandContainer.position.z = this._bboxMax.z + 0.05;
                }
            }
            else if (alpha < - Math.PI / 4) {
                if (this.editionMode === EditionMode.VGrid) {
                    this.grid.rotation.x = - Math.PI * 0.5;
                    this.grid.rotation.y = Math.PI * 0.5;
                    if (this.currentOrientation != 1) {
                        this.currentOrientation = 1;
                        this.updateCubeMesh();
                    }
                }
                else {
                    this.commandContainer.rotation.y = Math.PI / 2;
                    this.commandContainer.position.x = this._bboxMin.x - 0.05;
                    this.commandContainer.position.z = this._bboxMin.z - 0.05;
                }
            }
            //VMath.QuaternionFromYZAxisToRef(Y, Z, this.commandContainer.rotationQuaternion);
        }
    }

    private _bboxMin: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _bboxMax: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _gridMargin: number = 3;
    private _redrawGrid(): void {
        if (this.editionMode === EditionMode.HGrid) {
            this.grid.position.x = 0;
            this.grid.position.y = (this.gridOffsetY) * this.cubeSize;
            this.grid.position.z = 0;
        }
        else if (this.editionMode === EditionMode.VGrid) {
            this.grid.position.x = 0;
            this.grid.position.y = 0;
            this.grid.position.z = 0;
            if (this.currentOrientation % 2 === 0) {
                this.grid.position.z = this.gridOffsetZ * this.cubeSize;
            }
            if (this.currentOrientation % 2 === 1) {
                this.grid.position.x = this.gridOffsetX * this.cubeSize;
            }
            if (this.currentOrientation === 0) {
                this.grid.position.z += this.cubeSize;
            }
            else if (this.currentOrientation === 1) {
                this.grid.position.x += this.cubeSize;
            }
        }

        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];
        let uvs: number[] = [];

        let w = (this.gridDesc.maxX + (this._gridMargin + 1)) - (this.gridDesc.minX -this._gridMargin) + 1;
        let h = (this.gridDesc.maxY + (this._gridMargin + 1)) - (this.gridDesc.minY -this._gridMargin) + 1;

        for (let j = this.gridDesc.minY - this._gridMargin; j <= this.gridDesc.maxY + (this._gridMargin + 1); j++) {
            for (let i = this.gridDesc.minX - this._gridMargin; i <= this.gridDesc.maxX + (this._gridMargin + 1); i++) {
                let x = (i - this.halfSize) * this.cubeSize;
                let y = 0;
                let z = (j - this.halfSize) * this.cubeSize;

                let n = positions.length / 3;
                positions.push(x, y, z);
                normals.push(0, 1, 0);
                uvs.push(i, j);

                if (!this.gridDesc.blocks[i] || this.gridDesc.blocks[i][j] != 1) {
                    if (i < this.gridDesc.maxX + (this._gridMargin + 1) && j < this.gridDesc.maxY + (this._gridMargin + 1)) {
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
    }

    private _fillCommandSlika(slika: Slika): void {
        // Grid UP
        slika.add(new SlikaText({
            text: "GRID",
            color: BABYLON.Color3.White(),
            fontSize: 16,
            x: 32,
            y: 28,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaText({
            text: "UP",
            color: BABYLON.Color3.White(),
            fontSize: 16,
            x: 32,
            y: 46,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 32,
            y: 32,
            r: 30,
            color: BABYLON.Color3.White(),
            width: 2
        }));
        
        // Grid DOWN
        slika.add(new SlikaText({
            text: "GRID",
            color: BABYLON.Color3.White(),
            fontSize: 16,
            x: 32,
            y: 28 + 64,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaText({
            text: "DOWN",
            color: BABYLON.Color3.White(),
            fontSize: 14,
            x: 32,
            y: 44 + 64,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 32,
            y: 32 + 64,
            r: 30,
            color: BABYLON.Color3.White(),
            width: 2
        }));
        
        // Sculpt
        slika.add(new SlikaText({
            text: "SCULPT",
            color: BABYLON.Color3.White(),
            fontSize: 16,
            x: 32,
            y: 39 + 128,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 32,
            y: 32 + 128,
            r: 30,
            color: BABYLON.Color3.White(),
            width: 2
        }));
        
        // HGrid
        slika.add(new SlikaText({
            text: "HGRID",
            color: BABYLON.Color3.White(),
            fontSize: 16,
            x: 32,
            y: 39 + 192,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 32,
            y: 32 + 192,
            r: 30,
            color: BABYLON.Color3.White(),
            width: 2
        }));
        
        // VGrid
        slika.add(new SlikaText({
            text: "VGRID",
            color: BABYLON.Color3.White(),
            fontSize: 16,
            x: 32,
            y: 39 + 256,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 32,
            y: 32 + 256,
            r: 30,
            color: BABYLON.Color3.White(),
            width: 2
        }));

        // Material 0 - Grass
        slika.add(new SlikaText({
            text: "GRASS",
            color: BABYLON.Color3.White(),
            fontSize: 14,
            x: 32 + 64,
            y: 38,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 32 + 64,
            y: 32,
            r: 30,
            color: BABYLON.Color3.White(),
            width: 2
        }));

        // Material 1 - Blood
        slika.add(new SlikaText({
            text: "BLOOD",
            color: BABYLON.Color3.White(),
            fontSize: 14,
            x: 32 + 64,
            y: 38 + 64,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 32 + 64,
            y: 32 + 64,
            r: 30,
            color: BABYLON.Color3.White(),
            width: 2
        }));

        // Material 2 - Gold
        slika.add(new SlikaText({
            text: "GOLD",
            color: BABYLON.Color3.White(),
            fontSize: 16,
            x: 32 + 64,
            y: 39 + 128,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 32 + 64,
            y: 32 + 128,
            r: 30,
            color: BABYLON.Color3.White(),
            width: 2
        }));

        // Brush Size 3
        let brushSize3Icon = slika.add(new SlikaPath({
            strokeColor: BABYLON.Color3.White(),
            strokeWidth: 2,
            points: [
                -15, -15,
                15, -15,
                15, 15,
                -15, 15
            ],
            close: true
        }));
        brushSize3Icon.posX = 128 + 32;
        brushSize3Icon.posY = 32;
        
        let brushSize1Icon = slika.add(new SlikaPath({
            strokeColor: BABYLON.Color3.White(),
            strokeWidth: 2,
            points: [
                -5, -5,
                5, -5,
                5, 5,
                -5, 5
            ],
            close: true
        }));
        brushSize1Icon.posX = 128 + 32;
        brushSize1Icon.posY = 64 + 32;
    }
}