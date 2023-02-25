/// <reference path="../UI/Pickable.ts"/>

class ModelingWorkbench extends PickablePlanetObject {

    public frame: BABYLON.Mesh;

    public interactionAnchor: BABYLON.Mesh;

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

        this.interactionAnchor = new BABYLON.Mesh("interaction-anchor");
        //BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.interactionAnchor);
        //this.interactionAnchor.material = SharedMaterials.RedMaterial();
        this.interactionAnchor.position.z = -1;
        this.interactionAnchor.parent = this;
    }

    public async open(): Promise<void> {
        
    }

    public async close(duration: number = 1.5): Promise<void> {
       
    }

    public interceptsPointerMove(): boolean {
        if (BABYLON.Vector3.DistanceSquared(this.inputManager.player.position, this.interactionAnchor.absolutePosition) < 0.2 * 0.2) {
            return true;
        }
        return false;
    }

    public onPointerDown(): void {
        if (BABYLON.Vector3.DistanceSquared(this.inputManager.player.position, this.interactionAnchor.absolutePosition) < 0.2 * 0.2) {
            
        }
    }

    public onPointerUp(): void {
        if (BABYLON.Vector3.DistanceSquared(this.inputManager.player.position, this.interactionAnchor.absolutePosition) < 0.2 * 0.2) {
            
        }
        else {
            this.inputManager.player.targetLook = this.frame.absolutePosition;
            this.inputManager.player.targetDestination = this.interactionAnchor.absolutePosition.clone();
        }
    }

    public onHoverStart(): void {
        
    }

    public onHoverEnd(): void {
        
    }
}