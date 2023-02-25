/// <reference path="../UI/Pickable.ts"/>

class ModelingWorkbench extends PickablePlanetObject {

    public frame: BABYLON.Mesh;

    public voxelMesh: VoxelMesh;

    public modelMesh: BABYLON.Mesh;

    public interactionAnchor: BABYLON.Mesh;

    public using: boolean = false;

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
        this.voxelMesh.addCube(42, BABYLON.Vector3.Zero(), 2);
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

        this.modelMesh = new BABYLON.Mesh("model-mesh");
        this.modelMesh.position.y = 1;
        this.modelMesh.parent = this;
        this.modelMesh.material = new ToonMaterial("model-mesh-material", this.scene);

        let data = this.voxelMesh.buildMesh(0);
        data.applyToMesh(this.modelMesh);

        this.interactionAnchor = new BABYLON.Mesh("interaction-anchor");
        //BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.interactionAnchor);
        //this.interactionAnchor.material = SharedMaterials.RedMaterial();
        this.interactionAnchor.position.z = -1;
        this.interactionAnchor.parent = this;

        this.proxyPickMeshes = [this.modelMesh];
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
            let localP = BABYLON.Vector3.TransformCoordinates(this.inputManager.aimedPosition, this.modelMesh.getWorldMatrix().clone().invert());
            let i = Math.floor(localP.x / this.voxelMesh.cubeSize);
            let j = Math.floor(localP.y / this.voxelMesh.cubeSize);
            let k = Math.floor(localP.z / this.voxelMesh.cubeSize);

            this.voxelMesh.addCube(42, new BABYLON.Vector3(i, j, k), 3);

            let data = this.voxelMesh.buildMesh(0);
            data.applyToMesh(this.modelMesh);
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
        }
    }
}