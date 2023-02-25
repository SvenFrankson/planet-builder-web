/// <reference path="../UI/Pickable.ts"/>

class ModelingWorkbench extends PickablePlanetObject {

    public frame: BABYLON.Mesh;

    public voxelMesh: VoxelMesh;

    public previewMesh: BABYLON.Mesh;
    public brushSize: number = 1;

    public hiddenModelMesh: BABYLON.Mesh;
    public modelMesh: BABYLON.Mesh;

    public interactionAnchor: BABYLON.Mesh;

    public using: boolean = false;

    public grid: BABYLON.Mesh;

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

        this.previewMesh = BABYLON.MeshBuilder.CreateBox("preview-mesh", { size: this.voxelMesh.cubeSize });
        this.previewMesh.scaling.copyFromFloats(1, 1, 1).scaleInPlace(this.brushSize);
        this.previewMesh.material = SharedMaterials.WaterMaterial();
        this.previewMesh.parent = this.modelMesh;

        this.grid = BABYLON.MeshBuilder.CreateGround("grid", { width: 1.5, height: 1.5 });
        let uvs = this.grid.getVerticesData(BABYLON.VertexBuffer.UVKind);
        uvs = uvs.map(v => { return v * 1.5 / (this.voxelMesh.cubeSize)});
        this.grid.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
        let gridMaterial = new BABYLON.StandardMaterial("waterMaterial", Game.Scene);
        gridMaterial.diffuseColor = SharedMaterials.MainMaterial().getColor(BlockType.Water);
        gridMaterial.diffuseTexture = new BABYLON.Texture("datas/images/border-square-64.png");
        gridMaterial.useAlphaFromDiffuseTexture = true;
        gridMaterial.specularColor = BABYLON.Color3.White();
        gridMaterial.alpha = 0.2;
        this.grid.material = gridMaterial;
        this.grid.parent = this.modelMesh;

        this.updateMesh();

        this.interactionAnchor = new BABYLON.Mesh("interaction-anchor");
        //BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.interactionAnchor);
        //this.interactionAnchor.material = SharedMaterials.RedMaterial();
        this.interactionAnchor.position.z = -1;
        this.interactionAnchor.parent = this;

        this.proxyPickMeshes = [this.modelMesh, this.grid];
    }

    private updateMesh(): void {
        let data = this.voxelMesh.buildMesh(1);
        data.applyToMesh(this.hiddenModelMesh);

        let decimator = new BABYLON.QuadraticErrorSimplification(this.hiddenModelMesh);
        decimator.simplify({ quality: 0.5, distance: 0 }, (simplifiedMesh: BABYLON.Mesh) => {
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
            let p = this.inputManager.aimedPosition.add(this.inputManager.aimedNormal.scale(this.voxelMesh.cubeSize * 0.5));
            let localP = BABYLON.Vector3.TransformCoordinates(p, this.modelMesh.getWorldMatrix().clone().invert());
            let i = Math.floor(localP.x / this.voxelMesh.cubeSize);
            let j = Math.floor(localP.y / this.voxelMesh.cubeSize);
            let k = Math.floor(localP.z / this.voxelMesh.cubeSize);

            this.voxelMesh.addCube(42, new BABYLON.Vector3(i, j, k), this.brushSize);

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
            if (this.inputManager.aimedPosition) {
                let p = this.inputManager.aimedPosition.add(this.inputManager.aimedNormal.scale(this.voxelMesh.cubeSize * 0.5));
                let localP = BABYLON.Vector3.TransformCoordinates(p, this.modelMesh.getWorldMatrix().clone().invert());
                let i = Math.floor(localP.x / this.voxelMesh.cubeSize);
                let j = Math.floor(localP.y / this.voxelMesh.cubeSize);
                let k = Math.floor(localP.z / this.voxelMesh.cubeSize);
                this.previewMesh.position.copyFromFloats(i, j, k).scaleInPlace(this.voxelMesh.cubeSize).addInPlaceFromFloats(this.voxelMesh.cubeSize * 0.5, this.voxelMesh.cubeSize * 0.5, this.voxelMesh.cubeSize * 0.5);
                this.previewMesh.isVisible = true;
            }
            else {
                this.previewMesh.isVisible = false;
            }
        }
    }
}