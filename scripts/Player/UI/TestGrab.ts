class TestGrab extends Pickable {

    constructor(name: string, main: Main) {
        super(name, main);
        this.interactionMode = InteractionMode.Grab;
    }

    public instantiate(): void {
        super.instantiate();
        BABYLON.CreateIcoSphereVertexData({
            radius: 0.2,
            subdivisions: 2
        }).applyToMesh(this);
    }

    public dispose(): void {
        super.dispose();
    }
}