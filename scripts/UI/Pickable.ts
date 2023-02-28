/// <reference path="../PlanetObject.ts"/>

enum InteractionMode {
    None,
    Point,
    Touch,
    Grab,
}

enum DragMode {
    Move,
    Static
}

interface IPickable extends BABYLON.Mesh {
    interactionMode: InteractionMode;
    dragMode: DragMode;
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
    public dragMode: DragMode = DragMode.Move;
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
    public dragMode: DragMode = DragMode.Move;
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

class PickableObject extends Pickable {
    
    constructor(name: string, main: Main) {
        super(name, main);
    }

    public onPointerDown(): void {
        this.pointerDownCallback();
    }

    public onPointerUp(): void {
        this.pointerUpCallback();
    }

    public pointerUpCallback = () => {};
    public pointerDownCallback = () => {};
}