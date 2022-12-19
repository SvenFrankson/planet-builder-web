/// <reference path="../PlanetObject.ts"/>

enum InteractionMode {
    Point,
    Grab,
}

class Pickable extends PlanetObject {

    public interactionMode: InteractionMode = InteractionMode.Point;
    public proxyPickMesh: BABYLON.Mesh;

    public get scene(): BABYLON.Scene {
        return this.main.scene;
    }

    public get inputManager(): InputManager {
        return this.main.inputManager;
    }

    constructor(name: string, main: Main) {
        super(name, main);
    }

    public instantiate(): void {
        this.inputManager.pickableElements.push(this);
    }

    public dispose(): void {
        super.dispose();
        this.inputManager.pickableElements.remove(this);
    }

    public interceptsPointerMove(): boolean {
        return false;
    }

    public onPointerDown(): void {

    }

    public onPointerUp(): void {
        
    }

    public onHoverStart(): void {

    }

    public onHoverEnd(): void {

    }
}