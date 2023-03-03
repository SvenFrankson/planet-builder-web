/// <reference path="../UI/Pickable.ts"/>

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

    public gridEditionMode: boolean = true;
    public grid: BABYLON.Mesh;
    public gridY: number = 0;
    public gridDesc: IGridDesc;

    public commandContainer: BABYLON.Mesh;
    public gridPlus: PickableObject;
    public gridDown: PickableObject;
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
        cubeModeMaterial.alpha = 0.4;
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
        this.grid.position.y = (this.gridY) * this.cubeSize;

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
        this.gridPlus.position.z = 0.4;
        this.gridPlus.layerMask = 0x10000000;
        this.gridPlus.pointerUpCallback = () => {
            this.gridY++;
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
        this.gridDown.position.z = 0.3;
        this.gridDown.layerMask = 0x10000000;
        this.gridDown.pointerUpCallback = () => {
            this.gridY--;
            this.updateCubeMesh();
        }
        
        let gridDownIcon = new BABYLON.Mesh("grid-down-icon");
        VertexDataUtils.CreatePlane(0.08, 0.08, undefined, undefined, 0, 6/8, 1/8, 7/8).applyToMesh(gridDownIcon);
        gridDownIcon.material = hudMaterial;
        gridDownIcon.parent = this.gridDown;
        gridDownIcon.rotation.x = Math.PI * 0.5;
        gridDownIcon.layerMask = 0x10000000;
        
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

        this.interactionAnchor = new BABYLON.Mesh("interaction-anchor");
        //BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.interactionAnchor);
        //this.interactionAnchor.material = SharedMaterials.RedMaterial();
        this.interactionAnchor.position.z = -1;
        this.interactionAnchor.parent = this;

        this.proxyPickMeshes = [this.grid, this.cubeModelMesh];
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
            let data = voxelMesh.buildCubeMesh(
                {
                    baseColor: new BABYLON.Color4(0.75, 0.75, 0.75, 1),
                    highlightY: this.gridY,
                    highlightColor: new BABYLON.Color4(0, 1, 1, 1)
                },
                this.gridDesc
            );
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
            });
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
        if (BABYLON.Vector3.DistanceSquared(this.inputManager.player.position, this.position) < 1.2 * 1.2) {
            
        }
    }

    public onPointerUp(): void {
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
            if (Math.abs(alpha) < Math.PI / 4) {
                this.commandContainer.rotation.y = 0;
                this.commandContainer.position.x = this._gridPosMax.x + 0.05;
                this.commandContainer.position.z = this._gridPosMin.z - 0.05;
            }
            else if (Math.abs(alpha) > 3 * Math.PI / 4) {
                this.commandContainer.rotation.y = Math.PI;
                this.commandContainer.position.x = this._gridPosMin.x - 0.05;
                this.commandContainer.position.z = this._gridPosMax.z + 0.05;
            }
            else if (alpha > Math.PI / 4) {
                this.commandContainer.rotation.y = - Math.PI / 2;
                this.commandContainer.position.x = this._gridPosMax.x + 0.05;
                this.commandContainer.position.z = this._gridPosMax.z + 0.05;
            }
            else if (alpha < - Math.PI / 4) {
                this.commandContainer.rotation.y = Math.PI / 2;
                this.commandContainer.position.x = this._gridPosMin.x - 0.05;
                this.commandContainer.position.z = this._gridPosMin.z - 0.05;
            }
            //VMath.QuaternionFromYZAxisToRef(Y, Z, this.commandContainer.rotationQuaternion);
        }
    }

    private _gridPosMin: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _gridPosMax: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _gridMargin: number = 3;
    private _redrawGrid(): void {
        this.grid.position.y = (this.gridY) * this.cubeSize;

        console.log(this.gridDesc);

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

        this._gridPosMin.x = ((this.gridDesc.minX - this._gridMargin - this.halfSize)) * this.cubeSize;
        this._gridPosMin.z = ((this.gridDesc.minY - this._gridMargin - this.halfSize)) * this.cubeSize;

        this._gridPosMax.x = ((this.gridDesc.maxX + (this._gridMargin + 1) - this.halfSize)) * this.cubeSize;
        this._gridPosMax.z = ((this.gridDesc.maxY + (this._gridMargin + 1) - this.halfSize)) * this.cubeSize;
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