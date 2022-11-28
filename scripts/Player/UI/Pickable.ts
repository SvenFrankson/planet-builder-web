enum InteractionMode {
    Point,
    Grab,
}

class Pickable extends BABYLON.Mesh {

    public interactionMode: InteractionMode = InteractionMode.Point;
    public proxyPickMesh: BABYLON.Mesh;

    public get scene(): BABYLON.Scene {
        return this.main.scene;
    }

    public get inputManager(): InputManager {
        return this.main.inputManager;
    }

    constructor(name: string, public main: Main) {
        super(name, main.scene);
    }

    public instantiate(): void {
        this.inputManager.pickableElements.push(this);
    }

    public dispose(): void {
        super.dispose();
        this.inputManager.pickableElements.remove(this);
    }

    public onPick(): void {

    }

    public onHoverStart(): void {

    }

    public onHoverEnd(): void {

    }
}