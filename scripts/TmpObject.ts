class TmpObject extends PlanetObject {
    
    constructor(name: string, main: Main) {
        super(name, main);
    }

    public async instantiate(): Promise<void> {
        BABYLON.CreateBoxVertexData({ size: 1 }).applyToMesh(this);
    }
}