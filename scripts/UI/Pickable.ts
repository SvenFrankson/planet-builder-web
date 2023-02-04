/// <reference path="../PlanetObject.ts"/>

enum InteractionMode {
    None,
    Point,
    Grab,
}

interface IPickable extends BABYLON.Mesh {
    interactionMode: InteractionMode;
    proxyPickMeshes: BABYLON.Mesh[];
    scene: BABYLON.Scene;
    inputManager: InputManager;
    instantiate(): void;
    dispose(): void;
    interceptsPointerMove();
    onPointerDown(): void;
    onPointerUp(): void;
    onHoverStart(): void;
    onHoverEnd(): void;
}

class PickablePlanetObject extends PlanetObject implements IPickable {
    public interactionMode: InteractionMode = InteractionMode.Point;
    public proxyPickMeshes: BABYLON.Mesh[];

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

class Pickable extends BABYLON.Mesh implements IPickable {

    public interactionMode: InteractionMode = InteractionMode.Point;
    public proxyPickMeshes: BABYLON.Mesh[];

    public get scene(): BABYLON.Scene {
        return this.main.scene;
    }

    public get inputManager(): InputManager {
        return this.main.inputManager;
    }

    constructor(name: string, public main: Main) {
        super(name);
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