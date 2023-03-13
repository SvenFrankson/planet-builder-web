/// <reference path="../UI/Pickable.ts"/>

enum EditionMode {
    Sculpt,
    HGrid,
    VGrid
}

enum BrushMode {
    Add,
    Remove
}

class ModelingWorkbench extends PickablePlanetObject {

    public frame: BABYLON.Mesh;
    public idleMesh: BABYLON.Mesh;
    public get idleMeshSize(): number {
        return this.idleMesh.scaling.x;
    }
    public set idleMeshSize(v: number) {
        this.idleMesh.scaling.copyFromFloats(v, v, v);
    }
    public animateIdleMeshSize = AnimationFactory.CreateNumber(this, this, "idleMeshSize");

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

    public using: boolean = false;

    public editionMode: EditionMode = EditionMode.HGrid;
    public brushMode: BrushMode = BrushMode.Add;

    private _bboxMin: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _bboxMax: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _gridMargin: number = 3;
    public radius: number = Math.SQRT2;
    public grid: BABYLON.Mesh;
    public gridOffset: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public currentOrientation: number = 0;

    public buttonIconMaterial: HoloPanelMaterial
    public buttonIconTexture: BABYLON.DynamicTexture;
    public buttonIconSlika: Slika;

    public commandContainer: BABYLON.Mesh;
    public gridPlus: ModelingWorkbenchButton;
    public gridMinus: ModelingWorkbenchButton;
    public editionModeButton: ModelingWorkbenchButton;
    public brushSize3: ModelingWorkbenchButton;
    public brushSize1: ModelingWorkbenchButton;
    public brushModeButton: ModelingWorkbenchButton;
    public activeIndexInput: ModelingWorkbenchButton[] = [];
    public saveButton: ModelingWorkbenchButton;
    public exitButton: ModelingWorkbenchButton;

    public get player(): Player {
        return this.inputManager.player;
    }

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

        this.interactionMode = InteractionMode.Touch;
    }

    public instantiate(): void {
        super.instantiate();
        
        let gridMaterial = new BABYLON.StandardMaterial("grid-material", Game.Scene);
        gridMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);
        gridMaterial.diffuseTexture = new BABYLON.Texture("datas/images/border-square-64.png");
        gridMaterial.useAlphaFromDiffuseTexture = true;
        gridMaterial.specularColor = BABYLON.Color3.Black();
        gridMaterial.alpha = 0.4;

        this.frame = BABYLON.MeshBuilder.CreateBox("frame", { size: 0.05 });
        this.frame.material = new ToonMaterial("frame-material", this.scene);
        this.frame.parent = this;
        this.frame.position.y = 0;
        this.frame.isVisible = true;
        VertexDataLoader.instance.get("modeling-workbench").then(vertexDatas => {
            let vData = vertexDatas[0];
            vData.applyToMesh(this.frame);
        });
        
        let idleMeshSize: number = 0.4;
        this.idleMesh = BABYLON.MeshBuilder.CreateBox("idleMesh", { size: idleMeshSize });
        let idleMeshUVs = this.idleMesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
        idleMeshUVs = idleMeshUVs.map((uv: number) => { return uv * (idleMeshSize / this.cubeSize) });
        this.idleMesh.setVerticesData(BABYLON.VertexBuffer.UVKind, idleMeshUVs);
        this.idleMesh.material = gridMaterial;
        this.idleMesh.parent = this;
        this.idleMesh.layerMask = 0x10000000;
        this.idleMesh.position.y = 1;
        this.idleMesh.rotation.x = Math.PI / 4;
        this.idleMesh.rotation.z = Math.PI / 4;
        this.idleMesh.isVisible = true;

        /*
        this.voxelMesh = new VoxelMesh(6);
        this.cubeSize = 0.05;
        this.voxelMesh.addCube(1, BABYLON.Vector3.Zero(), 3);
        for (let n = 0; n < 0; n++) {
            let s = Math.floor(2 + 4 * Math.random());
            this.voxelMesh.addCube(
                1,
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
        this.grid.material = gridMaterial;
        this.grid.layerMask = 0x10000000;
        this.grid.parent = this.modelContainer;

        let hsf = Config.performanceConfiguration.holoScreenFactor;

        this.buttonIconMaterial = new HoloPanelMaterial("hud-material", this.scene);

        this.buttonIconTexture = new BABYLON.DynamicTexture("hud-texture", { width: 1024 * hsf, height: 1024 * hsf }, this.scene, true);
        this.buttonIconTexture.hasAlpha = true;
        this.buttonIconMaterial.holoTexture = this.buttonIconTexture;
        
        this.buttonIconSlika = new Slika(1024, 1024, this.buttonIconTexture.getContext(), this.buttonIconTexture);
        this.buttonIconSlika.texture = this.buttonIconTexture;
        this.buttonIconSlika.context = this.buttonIconTexture.getContext();
        this._fillCommandSlika(this.buttonIconSlika);
        this.buttonIconSlika.needRedraw = true;

        this.commandContainer = new BABYLON.Mesh("command-container");
        this.commandContainer.parent = this.grid;
        //this.commandContainer.rotationQuaternion = BABYLON.Quaternion.Identity();

        let buttonMaterial = new BABYLON.StandardMaterial("input-material", Game.Scene);
        buttonMaterial.diffuseColor = new BABYLON.Color3(0, 1, 1);
        buttonMaterial.alpha = 0.4;

        
        
        this.gridPlus = new ModelingWorkbenchButton("grid-plus-button", buttonMaterial, this.buttonIconMaterial, [new BABYLON.Vector2(0, 0)], this.main);
        this.gridPlus.instantiate();
        this.gridPlus.parent = this.commandContainer;
        this.gridPlus.position.z = 0.5;
        this.gridPlus.onClick = () => {
            if (this.editionMode === EditionMode.HGrid) {
                this.gridOffset.y++;
            }
            else if (this.editionMode === EditionMode.VGrid) {
                if (this.currentOrientation === 0) {
                    this.gridOffset.z++;
                }
                else if (this.currentOrientation === 1) {
                    this.gridOffset.x++;
                }
                else if (this.currentOrientation === 2) {
                    this.gridOffset.z--;
                }
                else if (this.currentOrientation === 3) {
                    this.gridOffset.x--;
                }
            }
            this.updateCubeMesh();
        }

        this.gridMinus = new ModelingWorkbenchButton("grid-minus-button", buttonMaterial, this.buttonIconMaterial, [new BABYLON.Vector2(0, 1)], this.main);
        this.gridMinus.instantiate();
        this.gridMinus.parent = this.commandContainer;
        this.gridMinus.position.z = 0.4;
        this.gridMinus.onClick = () => {
            if (this.editionMode === EditionMode.HGrid) {
                this.gridOffset.y--;
            }
            else if (this.editionMode === EditionMode.VGrid) {
                if (this.currentOrientation === 0) {
                    this.gridOffset.z--;
                }
                else if (this.currentOrientation === 1) {
                    this.gridOffset.x--;
                }
                else if (this.currentOrientation === 2) {
                    this.gridOffset.z++;
                }
                else if (this.currentOrientation === 3) {
                    this.gridOffset.x++;
                }
            }
            this.updateCubeMesh();
        }
        
        this.editionModeButton = new ModelingWorkbenchButton(
            "edition-mode-button", buttonMaterial, this.buttonIconMaterial,
            [new BABYLON.Vector2(0, 2), new BABYLON.Vector2(0, 3), new BABYLON.Vector2(0, 4)],
            this.main,
            this.editionMode
        );
        this.editionModeButton.instantiate();
        this.editionModeButton.parent = this.commandContainer;
        this.editionModeButton.position.z = 0.3;
        
        this.editionModeButton.onClick = (index: number) => {
            this.editionMode = index;
            this.updateCubeMesh();
            this.updateEditionMode();
        }
        
        this.brushSize1 = new ModelingWorkbenchButton("brush-size-1-button", buttonMaterial, this.buttonIconMaterial, [new BABYLON.Vector2(2, 0)], this.main);
        this.brushSize1.instantiate();
        this.brushSize1.parent = this.commandContainer;
        this.brushSize1.position.z = 0.2;
        this.brushSize1.onClick = () => {
            this.brushSize = 1;
            this.previewMesh.scaling.copyFromFloats(1, 1, 1).scaleInPlace(this.brushSize);
            this.updateCubeMesh();
        }
        
        this.brushSize3 = new ModelingWorkbenchButton("brush-size-3-button", buttonMaterial, this.buttonIconMaterial, [new BABYLON.Vector2(2, 1)], this.main);
        this.brushSize3.instantiate();
        this.brushSize3.parent = this.commandContainer;
        this.brushSize3.position.x = 0.1;
        this.brushSize3.position.z = 0.2;
        this.brushSize3.onClick = () => {
            this.brushSize = 3;
            this.previewMesh.scaling.copyFromFloats(1, 1, 1).scaleInPlace(this.brushSize);
            this.updateCubeMesh();
        }
        
        this.brushModeButton = new ModelingWorkbenchButton(
            "brush-mode-button", buttonMaterial, this.buttonIconMaterial,
            [new BABYLON.Vector2(2, 3), new BABYLON.Vector2(2, 4)],
            this.main
        );
        this.brushModeButton.instantiate();
        this.brushModeButton.parent = this.commandContainer;
        this.brushModeButton.position.z = 0.1;
        
        this.brushModeButton.onClick = (index: number) => {
            this.brushMode = index;
            this.updateCubeMesh();
            this.updateEditionMode();
        }

        for (let i = 0; i < 3; i++) {
            this.activeIndexInput[i] = new ModelingWorkbenchButton("material-" + i.toFixed(0) + "-button", buttonMaterial, this.buttonIconMaterial, [new BABYLON.Vector2(1, i)], this.main);
            this.activeIndexInput[i].instantiate();
            this.activeIndexInput[i].parent = this.commandContainer;
            this.activeIndexInput[i].position.x = -0.1 - i * 0.1;
            let n = i;
            this.activeIndexInput[i].onClick = () => {
                this.activeVoxelMesh = n;
                this.updateCubeMesh();
            }
        }
        
        this.saveButton = new ModelingWorkbenchButton("save-button", buttonMaterial, this.buttonIconMaterial, [new BABYLON.Vector2(3, 0)], this.main);
        this.saveButton.instantiate();
        this.saveButton.parent = this.commandContainer;
        this.saveButton.position.x = -0.5;
        this.saveButton.onClick = () => {
            let name = "X-" + Math.floor(Math.random() * 1000);
            let degree = this.degree;
            let cubeSize = this.cubeSize;
            let octrees = new Map<string, OctreeNode<number>>();
            for (let i = 0; i < this.voxelMeshes.length; i++) {
                let voxelMesh = this.voxelMeshes[i];
                if (voxelMesh) {
                    let octree = voxelMesh.root;
                    let color = this.colors[i].toHexString();
                    octrees.set(color, octree);
                }
            }
            let mmd = new ModelizedMeshData(name, cubeSize, degree, octrees);
            window.localStorage.setItem(name, mmd.serialize());

            requestAnimationFrame(async () => {
                let item = await InventoryItem.TmpObject(this.player, name);
                console.log(item);
                this.player.inventory.addItem(item);
            })
        }
        
        this.exitButton = new ModelingWorkbenchButton("exit-button", buttonMaterial, this.buttonIconMaterial, [new BABYLON.Vector2(3, 1)], this.main);
        this.exitButton.instantiate();
        this.exitButton.parent = this.commandContainer;
        this.exitButton.position.x = -0.6;
        this.exitButton.onClick = () => { this._exit(); };

        this.updateBoundingBox();
        this.updateMesh();
        this.updateEditionMode();
        this.updateBoundingBox();
        this._redrawGrid();

        this.powerOff();

        Config.performanceConfiguration.onHoloScreenFactorChangedCallbacks.push(() => {
            this.refreshHSF();
        });
    }

    public refreshHSF(): void {
        let hsf = Config.performanceConfiguration.holoScreenFactor;

        this.buttonIconTexture = new BABYLON.DynamicTexture("hud-texture", { width: 1024 * hsf, height: 1024 * hsf }, this.scene, true);
        this.buttonIconTexture.hasAlpha = true;
        this.buttonIconMaterial.holoTexture = this.buttonIconTexture;
        if (this.buttonIconSlika) {
            this.buttonIconSlika.texture = this.buttonIconTexture;
            this.buttonIconSlika.context = this.buttonIconTexture.getContext();
            this.buttonIconSlika.needRedraw = true;
        }
    }

    public register(): void {
        this.inputManager.addMappedKeyUpListener(KeyInput.WORKBENCH, async () => {
            let p = this.player.position.add(this.player.forward.scale(0.8));
            this.planet = this.player.planet

            this.setPosition(p, true);
            this.setTarget(this.player.position);
        })
    }

    private updateCubeMesh(): void {
        let voxelMesh = this.voxelMeshes[this.activeVoxelMesh];

        if (voxelMesh) {
            let cubeProp: ICubeMeshProperties = { baseColor: new BABYLON.Color4(0.75, 0.75, 0.75, 1) };
            if (this.editionMode === EditionMode.HGrid) {
                cubeProp.highlightY = this.gridOffset.y;
                cubeProp.highlightColor = new BABYLON.Color4(0, 1, 1, 1);
            }
            else if (this.editionMode === EditionMode.VGrid) {
                if (this.currentOrientation % 2 === 0) {
                    cubeProp.highlightZ = this.gridOffset.z;
                    cubeProp.highlightColor = new BABYLON.Color4(0, 1, 1, 1);
                }
                else if (this.currentOrientation % 2 === 1) {
                    cubeProp.highlightX = this.gridOffset.x;
                    cubeProp.highlightColor = new BABYLON.Color4(0, 1, 1, 1);
                }
            }
            let data = voxelMesh.buildCubeMesh(cubeProp);
            data.applyToMesh(this.cubeModelMesh);
            this.cubeModelMesh.isVisible = true;
        }
        else {
            this.cubeModelMesh.isVisible = false;
        }
        
        this._redrawGrid();
    }

    private updateMesh(): void {
        let voxelMesh = this.voxelMeshes[this.activeVoxelMesh];
        let modelMesh = this.modelMeshes[this.activeVoxelMesh];

        if (voxelMesh) {
            /*
            let data = voxelMesh.buildMesh(1, this.colors[this.activeVoxelMesh]);
            data.applyToMesh(this.hiddenModelMesh);

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
                    this._redrawGrid();
                })
            });
            */

            if (!modelMesh) {
                modelMesh = new BABYLON.Mesh("model-mesh");
                modelMesh.parent = this.modelContainer;
                modelMesh.material = new ToonMaterial("model-mesh-material", this.scene);
                this.modelMeshes[this.activeVoxelMesh] = modelMesh;
            }

            let data = voxelMesh.buildMesh(1, this.colors[this.activeVoxelMesh]);
            data.applyToMesh(modelMesh);

            requestAnimationFrame(() => {
                this.updateBoundingBox();
                this._redrawGrid();
            })
        }
    }

    private updateBoundingBox(): void {
        this._bboxMin.x = 0;
        this._bboxMin.y = 0;
        this._bboxMin.z = 0;
        this._bboxMax.x = this.cubeSize;
        this._bboxMax.y = this.cubeSize;
        this._bboxMax.z = this.cubeSize;
        
        for (let i = 0; i < this.modelMeshes.length; i++) {
            if (this.modelMeshes[i]) {
                let bbox = this.modelMeshes[i].getBoundingInfo().boundingBox;
                this._bboxMin.minimizeInPlace(bbox.minimum);
                this._bboxMax.maximizeInPlace(bbox.maximum);
            }
        }

        this._bboxMin.x = Math.floor(this._bboxMin.x / this.cubeSize) * this.cubeSize;
        this._bboxMin.y = Math.floor(this._bboxMin.y / this.cubeSize) * this.cubeSize;
        this._bboxMin.z = Math.floor(this._bboxMin.z / this.cubeSize) * this.cubeSize;
        this._bboxMax.x = Math.ceil(this._bboxMax.x / this.cubeSize) * this.cubeSize;
        this._bboxMax.y = Math.ceil(this._bboxMax.y / this.cubeSize) * this.cubeSize;
        this._bboxMax.z = Math.ceil(this._bboxMax.z / this.cubeSize) * this.cubeSize;

        this._bboxMin.x -= this._gridMargin * this.cubeSize;
        this._bboxMin.y -= this._gridMargin * this.cubeSize;
        this._bboxMin.z -= this._gridMargin * this.cubeSize;
        this._bboxMax.x += this._gridMargin * this.cubeSize;
        this._bboxMax.y += this._gridMargin * this.cubeSize;
        this._bboxMax.z += this._gridMargin * this.cubeSize;
        
        this.radius = Math.max(  
            Math.abs(this._bboxMax.x) + 0.8,
            Math.abs(this._bboxMin.x) + 0.8,
            Math.abs(this._bboxMax.z) + 0.8,
            Math.abs(this._bboxMin.z) + 0.8,
            1
        );
        this.radius *= Math.SQRT2;
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
        if (BABYLON.Vector3.DistanceSquared(this.player.position, this.position) < this.radius * this.radius) {
            return true;
        }
        return false;
    }

    public onPointerDown(): void {
        if (this.using) {
            this._activelyPainting = true;
        }
    }

    private _activelyPainting: boolean = false;
    private _doPaint(): void {
        if (!this.inputManager.aimedPosition) {
            this._activelyPainting = false;
            return;
        }
        let s = 0.5;
        if (this.brushMode === BrushMode.Remove && this.editionMode === EditionMode.Sculpt) {
            s = -1;
        }
        let p = this.inputManager.aimedPosition.add(this.inputManager.aimedNormal.scale(s * this.cubeSize * 0.5));
        let localP = BABYLON.Vector3.TransformCoordinates(p, this.modelContainer.getWorldMatrix().clone().invert());
        let i = Math.floor(localP.x / this.cubeSize);
        let j = Math.floor(localP.y / this.cubeSize);
        let k = Math.floor(localP.z / this.cubeSize);

        this.gridOffset.copyFromFloats(i, j, k);

        let voxelMesh = this.voxelMeshes[this.activeVoxelMesh];
        if (!voxelMesh) {
            voxelMesh = new VoxelMesh(6);
            voxelMesh.cubeSize = 0.05;
            this.voxelMeshes[this.activeVoxelMesh] = voxelMesh;
        }
        let coordinates = new BABYLON.Vector3(i, j, k);
        if (this.brushMode === BrushMode.Add) {
            if (voxelMesh.getCube(coordinates) != 1) {
                voxelMesh.addCube(1, coordinates, this.brushSize);
            }
        }
        else if (this.brushMode === BrushMode.Remove) {
            if (voxelMesh.getCube(coordinates) === 1) {
                voxelMesh.addCube(0, new BABYLON.Vector3(i, j, k), this.brushSize);
            }
        }

        this.updateMesh();
    }

    public onPointerUp(): void {
        if (!this.using) {
            if (BABYLON.Vector3.DistanceSquared(this.player.position, this.position) < this.radius * this.radius) {
                this.using = true;
                document.exitPointerLock();
                this.inputManager.freeHandMode = true;
                this.scene.onBeforeRenderObservable.add(this._update);
                this.player.moveType = MoveType.Rotate;
                this.player.rotateMoveCenter = this.position;
                this.player.rotateMoveNorm = this.up;
                this.player.isWalking = true;
                this.powerOn();
            }
        }
        else {
            this._activelyPainting = false;
            this.updateCubeMesh();
        }
    }

    public onHoverStart(): void {
        
    }

    public onHoverEnd(): void {
        
    }

    private _update = () => {
        if (BABYLON.Vector3.DistanceSquared(this.player.position, this.position) > this.radius * this.radius) {
            this._exit();
        }
        else {
            if (this._activelyPainting) {
                this._doPaint();
            }
            if (this.inputManager.aimedPosition && this.inputManager.aimedElement === this) {
                let s = 0.5;
                if (this.brushMode === BrushMode.Remove && this.editionMode === EditionMode.Sculpt) {
                    s = -1;
                }
                let p = this.inputManager.aimedPosition.add(this.inputManager.aimedNormal.scale(s * this.cubeSize * 0.5));
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
            let Z = this.player.forward;
            let alpha = VMath.AngleFromToAround(this.player.forward, this.forward, this.up);
            if (this.editionMode === EditionMode.VGrid) {
                this.commandContainer.rotation.y = 0;
                if (this.currentOrientation === 0) {
                    this.commandContainer.position.x = this._bboxMax.x + 0.05;
                }
                else if (this.currentOrientation === 1) {
                    this.commandContainer.position.x = - this._bboxMin.z + 0.05;
                }
                else if (this.currentOrientation === 2) {
                    this.commandContainer.position.x = - this._bboxMin.x + 0.05;
                }
                else if (this.currentOrientation === 3) {
                    this.commandContainer.position.x = this._bboxMax.z + 0.05;
                }
                this.commandContainer.position.z = this._bboxMin.y - 0.05;
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

    public async powerOn(): Promise<void> {
        await this.animateIdleMeshSize(0, 0.5);
        let buttons = this.commandContainer.getChildren();
        for (let i = 0; i < buttons.length; i++) {
            let button = buttons[i];
            if (button instanceof ModelingWorkbenchButton) {
                button.animateSize(1, 0.2);
            }
        }
        for (let i = 0; i < this.modelMeshes.length; i++) {
            let modelMesh = this.modelMeshes[i];
            if (modelMesh) {
                modelMesh.isVisible = true;
            }
        }
        this.cubeModelMesh.isVisible = true;
        this.updateBoundingBox();
        this.updateEditionMode();
    }

    public async powerOff(): Promise<void> {
        this.animateIdleMeshSize(1, 0.5);
        let buttons = this.commandContainer.getChildren();
        for (let i = 0; i < buttons.length; i++) {
            let button = buttons[i];
            if (button instanceof ModelingWorkbenchButton) {
                button.animateSize(0, 0.2);
            }
        }
        this.grid.isVisible = false;
        this.previewMesh.isVisible = false;
        this.idleMesh.isVisible = true;
        for (let i = 0; i < this.modelMeshes.length; i++) {
            let modelMesh = this.modelMeshes[i];
            if (modelMesh) {
                modelMesh.isVisible = false;
            }
        }
        this.cubeModelMesh.isVisible = false;
        this.proxyPickMeshes = [this.idleMesh];
    }

    private _exit(): void {
        this.using = false;
        this.player.moveType = MoveType.Free;
        this.inputManager.freeHandMode = false;
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
        this.previewMesh.isVisible = false;
        this.player.isWalking = false;
        this.radius = Math.SQRT2;
        this.powerOff();
    }

    private _redrawGrid(): void {
        let i0 = 0;
        let j0 = 0;
        let iN = 0;
        let jN = 0;

        if (this.editionMode === EditionMode.HGrid || this.editionMode === EditionMode.Sculpt) {

            this.grid.position.x = 0;
            if (this.editionMode === EditionMode.HGrid) {
                this.grid.position.y = (this.gridOffset.y) * this.cubeSize;
            }
            else {
                this.grid.position.y = 0;
            }
            this.grid.position.z = 0;

            i0 = Math.round(this._bboxMin.x / this.cubeSize);
            j0 = Math.round(this._bboxMin.z / this.cubeSize);
            iN = Math.round(this._bboxMax.x / this.cubeSize);
            jN = Math.round(this._bboxMax.z / this.cubeSize);
        }
        else if (this.editionMode === EditionMode.VGrid) {
            this.grid.position.x = 0;
            this.grid.position.y = 0;
            this.grid.position.z = 0;

            j0 = Math.round(this._bboxMin.y / this.cubeSize);
            jN = Math.round(this._bboxMax.y / this.cubeSize);

            if (this.currentOrientation % 2 === 0) {
                this.grid.position.z = this.gridOffset.z * this.cubeSize;
            }
            if (this.currentOrientation % 2 === 1) {
                this.grid.position.x = this.gridOffset.x * this.cubeSize;
            }

            if (this.currentOrientation === 0) {
                this.grid.position.z += this.cubeSize;
                i0 = Math.round(this._bboxMin.x / this.cubeSize);
                iN = Math.round(this._bboxMax.x / this.cubeSize);
            }
            else if (this.currentOrientation === 1) {
                this.grid.position.x += this.cubeSize;
                i0 = Math.round(- this._bboxMax.z / this.cubeSize);
                iN = Math.round(- this._bboxMin.z / this.cubeSize);
            }
            else if (this.currentOrientation === 2) {
                i0 = Math.round(- this._bboxMax.x / this.cubeSize);
                iN = Math.round(- this._bboxMin.x / this.cubeSize);
            }
            else if (this.currentOrientation === 3) {
                i0 = Math.round(this._bboxMin.z / this.cubeSize);
                iN = Math.round(this._bboxMax.z / this.cubeSize);
            }
        }

        let data = new BABYLON.VertexData();
        let positions: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];
        let uvs: number[] = [];

        let w = iN - i0 + 1;

        for (let j = j0; j <= jN; j++) {
            for (let i = i0; i <= iN; i++) {
                let x = i * this.cubeSize;
                let y = 0;
                let z = j * this.cubeSize;

                let n = positions.length / 3;
                positions.push(x, y, z);
                normals.push(0, 1, 0);
                uvs.push(i, j);

                if (i < iN && j < jN) {
                    indices.push(n, n + 1, n + 1 + w);
                    indices.push(n, n + 1 + w, n + w);
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
            fontSize: 32,
            x: 64,
            y: 56,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaText({
            text: "+",
            color: BABYLON.Color3.White(),
            fontSize: 44,
            x: 64,
            y: 98,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 64,
            y: 64,
            r: 60,
            color: BABYLON.Color3.White(),
            width: 4
        }));
        
        // Grid DOWN
        slika.add(new SlikaText({
            text: "GRID",
            color: BABYLON.Color3.White(),
            fontSize: 32,
            x: 64,
            y: 56 + 128,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaText({
            text: "-",
            color: BABYLON.Color3.White(),
            fontSize: 44,
            x: 64,
            y: 98 + 128,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 64,
            y: 64 + 128,
            r: 60,
            color: BABYLON.Color3.White(),
            width: 4
        }));
        
        // Sculpt
        slika.add(new SlikaText({
            text: "SCULPT",
            color: BABYLON.Color3.White(),
            fontSize: 26,
            x: 64,
            y: 74 + 256,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 64,
            y: 64 + 256,
            r: 60,
            color: BABYLON.Color3.White(),
            width: 4
        }));
        
        // HGrid
        slika.add(new SlikaText({
            text: "HGRID",
            color: BABYLON.Color3.White(),
            fontSize: 32,
            x: 64,
            y: 78 + 384,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 64,
            y: 64 + 384,
            r: 60,
            color: BABYLON.Color3.White(),
            width: 4
        }));
        
        // VGrid
        slika.add(new SlikaText({
            text: "VGRID",
            color: BABYLON.Color3.White(),
            fontSize: 32,
            x: 64,
            y: 78 + 512,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 64,
            y: 64 + 512,
            r: 60,
            color: BABYLON.Color3.White(),
            width: 4
        }));

        // Material 0 - Grass
        slika.add(new SlikaText({
            text: "GRASS",
            color: BABYLON.Color3.White(),
            fontSize: 28,
            x: 64 + 128,
            y: 76,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 64 + 128,
            y: 64,
            r: 60,
            color: BABYLON.Color3.White(),
            width: 4
        }));

        // Material 1 - Blood
        slika.add(new SlikaText({
            text: "BLOOD",
            color: BABYLON.Color3.White(),
            fontSize: 28,
            x: 64 + 128,
            y: 76 + 128,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 64 + 128,
            y: 64 + 128,
            r: 60,
            color: BABYLON.Color3.White(),
            width: 4
        }));

        // Material 2 - Gold
        slika.add(new SlikaText({
            text: "GOLD",
            color: BABYLON.Color3.White(),
            fontSize: 28,
            x: 64 + 128,
            y: 76 + 256,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 64 + 128,
            y: 64 + 256,
            r: 60,
            color: BABYLON.Color3.White(),
            width: 4
        }));

        // Brush Sizes        
        let brushSize1Icon = slika.add(new SlikaPath({
            strokeColor: BABYLON.Color3.White(),
            strokeWidth: 4,
            points: [
                -10, -10,
                10, -10,
                10, 10,
                -10, 10
            ],
            close: true
        }));
        brushSize1Icon.posX = 256 + 64;
        brushSize1Icon.posY = 64;

        let brushSize3Icon = slika.add(new SlikaPath({
            strokeColor: BABYLON.Color3.White(),
            strokeWidth: 4,
            points: [
                -30, -30,
                30, -30,
                30, 30,
                -30, 30
            ],
            close: true
        }));
        brushSize3Icon.posX = 256 + 64;
        brushSize3Icon.posY = 128 + 64;

        let brushSize5Icon = slika.add(new SlikaPath({
            strokeColor: BABYLON.Color3.White(),
            strokeWidth: 4,
            points: [
                -50, -50,
                50, -50,
                50, 50,
                -50, 50
            ],
            close: true
        }));
        brushSize5Icon.posX = 256 + 64;
        brushSize5Icon.posY = 256 + 64;
        
        slika.add(new SlikaText({
            text: "ADD",
            color: BABYLON.Color3.White(),
            fontSize: 32,
            x: 64 + 256,
            y: 78 + 384,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 64 + 256,
            y: 64 + 384,
            r: 60,
            color: BABYLON.Color3.White(),
            width: 4
        }));
        
        slika.add(new SlikaText({
            text: "SUB",
            color: BABYLON.Color3.White(),
            fontSize: 32,
            x: 64 + 256,
            y: 78 + 512,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 64 + 256,
            y: 64 + 512,
            r: 60,
            color: BABYLON.Color3.White(),
            width: 4
        }));
                
        slika.add(new SlikaText({
            text: "SAVE",
            color: BABYLON.Color3.White(),
            fontSize: 32,
            x: 64 + 384,
            y: 78,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 64 + 384,
            y: 64,
            r: 60,
            color: BABYLON.Color3.White(),
            width: 4
        }));
                
        slika.add(new SlikaText({
            text: "EXIT",
            color: BABYLON.Color3.White(),
            fontSize: 32,
            x: 64 + 384,
            y: 78 + 128,
            fontFamily: "XoloniumRegular",
            textAlign: "center"
        }));
        slika.add(new SlikaCircle({
            x: 64 + 384,
            y: 64 + 128,
            r: 60,
            color: BABYLON.Color3.White(),
            width: 4
        }));
    }
}