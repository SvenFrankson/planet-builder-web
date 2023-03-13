class TmpObject extends PlanetObject {
    
    constructor(name: string, main: Main) {
        super(name, main);
    }

    public async instantiate(): Promise<void> {
        if (this.name.startsWith("X-")) {
            let mmd = ModelizedMeshData.Get(this.name);
            mmd.vertexData.applyToMesh(this);
        }
        else {
            BABYLON.CreateBoxVertexData({ size: 1 }).applyToMesh(this);
        }
        this.material = new ToonMaterial(this.name + "-material", this.main.scene);
    }
}