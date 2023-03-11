enum KeyInput {
    NULL = -1,
    ACTION_SLOT_0 = 0,
    ACTION_SLOT_1,
    ACTION_SLOT_2,
    ACTION_SLOT_3,
    ACTION_SLOT_4,
    ACTION_SLOT_5,
    ACTION_SLOT_6,
    ACTION_SLOT_7,
    ACTION_SLOT_8,
    ACTION_SLOT_9,
    INVENTORY,
    MOVE_FORWARD,
    MOVE_LEFT,
    MOVE_BACK,
    MOVE_RIGHT,
    JUMP,
    MAIN_MENU,
    WORKBENCH,
}

class InputManager {

    public isPointerLocked: boolean = false;
    public isPointerDown: boolean = false;

    public keyInputMap: Map<string, KeyInput> = new Map<string, KeyInput>();
    public keyInputDown: UniqueList<KeyInput> = new UniqueList<KeyInput>();
    public keyDownListeners: ((k: KeyInput) => any)[] = [];
    public mappedKeyDownListeners: Map<KeyInput,(() => any)[]> = new Map<KeyInput,(() => any)[]>();
    public keyUpListeners: ((k: KeyInput) => any)[] = [];
    public mappedKeyUpListeners: Map<KeyInput,(() => any)[]> = new Map<KeyInput,(() => any)[]>();

    public player: Player;
    public inventoryOpened: boolean = false;
    public freeHandMode: boolean = false;
    public aimedElement: IPickable;
    public aimedPosition: BABYLON.Vector3;
    public aimedProxyIndex: number = - 1;
    public aimedNormal: BABYLON.Vector3;
    public pickableElements: UniqueList<IPickable>;

    public pointerDownObservable = new BABYLON.Observable<IPickable>();
    public pointerUpObservable = new BABYLON.Observable<IPickable>();

    constructor(public scene: BABYLON.Scene, public canvas: HTMLCanvasElement, public main: Main) {
        this.pickableElements = new UniqueList<IPickable>();
    }

    public initialize(player: Player): void {
        this.player = player;
        
        window.addEventListener("touchstart", this.onTouchStart.bind(this));
        this.canvas.addEventListener("pointerdown", (ev: PointerEvent) => {
            this.updateAimedElement(ev.x, ev.y);
            this.isPointerDown = true;
            if (Config.controlConfiguration.canLockPointer) {
                if (!this.inventoryOpened && !this.freeHandMode) {
                    this.canvas.requestPointerLock();
                    this.isPointerLocked = true;
                }
            }
            this.pointerDownObservable.notifyObservers(this.aimedElement);
        });
        this.canvas.addEventListener("pointerup", () => {
            this.isPointerDown = false;
            this.pointerUpObservable.notifyObservers(this.aimedElement);
        });
        document.addEventListener("pointerlockchange", () => {
            if (!(document.pointerLockElement === this.canvas)) {
                this.isPointerLocked = false;
            }
        });
        this.scene.onBeforeRenderObservable.add(() => {
            this.updateAimedElement();
        });

        this.keyInputMap.set("Digit0", KeyInput.ACTION_SLOT_0);
        this.keyInputMap.set("Digit1", KeyInput.ACTION_SLOT_1);
        this.keyInputMap.set("Digit2", KeyInput.ACTION_SLOT_2);
        this.keyInputMap.set("Digit3", KeyInput.ACTION_SLOT_3);
        this.keyInputMap.set("Digit4", KeyInput.ACTION_SLOT_4);
        this.keyInputMap.set("Digit5", KeyInput.ACTION_SLOT_5);
        this.keyInputMap.set("Digit6", KeyInput.ACTION_SLOT_6);
        this.keyInputMap.set("Digit7", KeyInput.ACTION_SLOT_7);
        this.keyInputMap.set("Digit8", KeyInput.ACTION_SLOT_8);
        this.keyInputMap.set("Digit9", KeyInput.ACTION_SLOT_9);
        this.keyInputMap.set("KeyI", KeyInput.INVENTORY);
        this.keyInputMap.set("KeyW", KeyInput.MOVE_FORWARD);
        this.keyInputMap.set("KeyA", KeyInput.MOVE_LEFT);
        this.keyInputMap.set("KeyS", KeyInput.MOVE_BACK);
        this.keyInputMap.set("KeyD", KeyInput.MOVE_RIGHT);
        this.keyInputMap.set("Space", KeyInput.JUMP);
        this.keyInputMap.set("Backquote", KeyInput.MAIN_MENU);
        this.keyInputMap.set("KeyI", KeyInput.INVENTORY);
        this.keyInputMap.set("m", KeyInput.MAIN_MENU);
        this.keyInputMap.set("KeyC", KeyInput.WORKBENCH);

        window.addEventListener("keydown", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (!isFinite(keyInput)) {
                keyInput = this.keyInputMap.get(e.key);
            }
            if (isFinite(keyInput)) {
                this.doKeyInputDown(keyInput);
            }
        });
        window.addEventListener("keyup", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (!isFinite(keyInput)) {
                keyInput = this.keyInputMap.get(e.key);
            }
            if (isFinite(keyInput)) {
                this.doKeyInputUp(keyInput);
            }
        });
        document.getElementById("touch-menu").addEventListener("pointerdown", () => {
            let keyInput = KeyInput.MAIN_MENU;
            if (isFinite(keyInput)) {
                this.doKeyInputDown(keyInput);
            }
        })
        document.getElementById("touch-menu").addEventListener("pointerup", () => {
            let keyInput = KeyInput.MAIN_MENU;
            if (isFinite(keyInput)) {
                this.doKeyInputUp(keyInput);
            }
        })
        document.getElementById("touch-jump").addEventListener("pointerdown", () => {
            let keyInput = KeyInput.JUMP;
            if (isFinite(keyInput)) {
                this.doKeyInputDown(keyInput);
            }
        })
        document.getElementById("touch-jump").addEventListener("pointerup", () => {
            let keyInput = KeyInput.JUMP;
            if (isFinite(keyInput)) {
                this.doKeyInputUp(keyInput);
            }
        })
        this.addMappedKeyUpListener(KeyInput.INVENTORY, () => {
            this.inventoryOpened = !this.inventoryOpened;
            if (Config.controlConfiguration.canLockPointer) {
                if (this.inventoryOpened) {
                    document.exitPointerLock();
                    this.isPointerLocked = false;
                }
                else {
                    this.canvas.requestPointerLock();
                    this.isPointerLocked = true;
                }
            }
        });
    }

    private doKeyInputDown(keyInput: KeyInput): void {
        this.keyInputDown.push(keyInput);
        for (let i = 0; i < this.keyDownListeners.length; i++) {
            this.keyDownListeners[i](keyInput);
        }
        let listeners = this.mappedKeyDownListeners.get(keyInput);
        if (listeners) {
            for (let i = 0; i < listeners.length; i++) {
                listeners[i]();
            }
        }
    }

    private doKeyInputUp(keyInput: KeyInput): void {
        this.keyInputDown.remove(keyInput);
        for (let i = 0; i < this.keyUpListeners.length; i++) {
            this.keyUpListeners[i](keyInput);
        }
        let listeners = this.mappedKeyUpListeners.get(keyInput);
        if (listeners) {
            for (let i = 0; i < listeners.length; i++) {
                listeners[i]();
            }
        }
    }

    public onTouchStart(): void {
        if (!this._firstTouchStartTriggered) {
            this.onFirstTouchStart();
        }
    }

    private _firstTouchStartTriggered: boolean = false;
    private onFirstTouchStart(): void {	
        let movePad = new PlayerInputMovePad(this.player);
        movePad.connectInput(true);
        
        let headPad = new PlayerInputHeadPad(this.player);
        headPad.connectInput(false);
        this._firstTouchStartTriggered = true;

        document.getElementById("touch-menu").style.display = "block";
        document.getElementById("touch-jump").style.display = "block";

        this.main.isTouch = true;
    }

    public addKeyDownListener(callback: (k: KeyInput) => any): void {
        this.keyDownListeners.push(callback);
    }

    public addMappedKeyDownListener(k: KeyInput, callback: () => any): void {
        let listeners = this.mappedKeyDownListeners.get(k);
        if (listeners) {
            listeners.push(callback);
        }
        else {
            listeners = [callback];
            this.mappedKeyDownListeners.set(k, listeners);
        }
    }

    public removeKeyDownListener(callback: (k: KeyInput) => any): void {
        let i = this.keyDownListeners.indexOf(callback);
        if (i != -1) {
            this.keyDownListeners.splice(i, 1);
        }
    }

    public removeMappedKeyDownListener(k: KeyInput, callback: () => any): void {
        let listeners = this.mappedKeyDownListeners.get(k);
        if (listeners) {
            let i = listeners.indexOf(callback);
            if (i != -1) {
                listeners.splice(i, 1);
            }
        }
    }

    public addKeyUpListener(callback: (k: KeyInput) => any): void {
        this.keyUpListeners.push(callback);
    }

    public addMappedKeyUpListener(k: KeyInput, callback: () => any): void {
        let listeners = this.mappedKeyUpListeners.get(k);
        if (listeners) {
            listeners.push(callback);
        }
        else {
            listeners = [callback];
            this.mappedKeyUpListeners.set(k, listeners);
        }
    }

    public removeKeyUpListener(callback: (k: KeyInput) => any): void {
        let i = this.keyUpListeners.indexOf(callback);
        if (i != -1) {
            this.keyUpListeners.splice(i, 1);
        }
    }

    public removeMappedKeyUpListener(k: KeyInput, callback: () => any): void {
        let listeners = this.mappedKeyUpListeners.get(k);
        if (listeners) {
            let i = listeners.indexOf(callback);
            if (i != -1) {
                listeners.splice(i, 1);
            }
        }
    }

    public isKeyInputDown(keyInput: KeyInput): boolean {
        return this.keyInputDown.contains(keyInput);
    }

    public getkeyInputActionSlotDown(): KeyInput {
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_0)) {
            return KeyInput.ACTION_SLOT_0;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_1)) {
            return KeyInput.ACTION_SLOT_1;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_2)) {
            return KeyInput.ACTION_SLOT_2;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_3)) {
            return KeyInput.ACTION_SLOT_3;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_4)) {
            return KeyInput.ACTION_SLOT_4;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_5)) {
            return KeyInput.ACTION_SLOT_5;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_6)) {
            return KeyInput.ACTION_SLOT_6;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_7)) {
            return KeyInput.ACTION_SLOT_7;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_8)) {
            return KeyInput.ACTION_SLOT_8;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_9)) {
            return KeyInput.ACTION_SLOT_9;
        }
        return KeyInput.NULL;
    }

    public getPickInfo(meshes: BABYLON.Mesh[], x?: number, y?: number): BABYLON.PickingInfo {
        
        let timers: number[];
        let logOutput: string;
        let useLog = DebugDefine.LOG_INPUTMANAGER_GETPICKINGINFO_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "InputManager getPickInfo on " + meshes.length + " meshes.";
        }
        
        if (isNaN(x) || isNaN(y)) {
            if (this.isPointerLocked) {
                x = this.canvas.clientWidth * 0.5;
                y = this.canvas.clientHeight * 0.5;
            }
            else {
                x = this.scene.pointerX;
                y = this.scene.pointerY;
            }
        }
        let bestDist: number = Infinity;
        let bestPick: BABYLON.PickingInfo;
        let ray = this.scene.createPickingRay(x, y, BABYLON.Matrix.Identity(), this.scene.activeCameras[1]);
        for (let i = 0; i < meshes.length; i++) {
            let mesh = meshes[i];
            if (mesh) {
                let pick = ray.intersectsMesh(mesh);
                if (pick && pick.hit && pick.pickedMesh) {
                    if (pick.distance < bestDist) {
                        bestDist = pick.distance;
                        bestPick = pick;
                    }
                }

                if (useLog) {
                    timers.push(performance.now());
                    logOutput += "\n  mesh " + mesh.name + " checked in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
                }
            }
        }

        if (useLog) {
            timers.push(performance.now());
            logOutput += "\nInputManager getPickInfo completed in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }

        return bestPick;
    }

    public updateAimedElement(x?: number, y?: number): void {
        if (isNaN(x) || isNaN(y)) {
            if (this.isPointerLocked) {
                x = this.canvas.clientWidth * 0.5;
                y = this.canvas.clientHeight * 0.5;
            }
            else {
                x = this.scene.pointerX;
                y = this.scene.pointerY;
            }
        }
        let aimedPickable: IPickable;
        let aimedDist: number = Infinity;
        let hit = false;
        let ray = this.scene.createPickingRay(x, y, BABYLON.Matrix.Identity(), this.scene.activeCameras[1]);
        for (let i = 0; i < this.pickableElements.length; i++) {
            let pickableElement = this.pickableElements.get(i);
            if (pickableElement.proxyPickMeshes) {
                for (let j = 0; j < pickableElement.proxyPickMeshes.length; j++) {
                    let mesh: BABYLON.Mesh = pickableElement.proxyPickMeshes[j];
                    let pick = ray.intersectsMesh(mesh);
                    if (pick && pick.hit && pick.pickedMesh) {
                        if (pick.distance < aimedDist) {
                            aimedPickable = pickableElement;
                            aimedDist = pick.distance;
                            this.aimedPosition = pick.pickedPoint;
                            this.aimedNormal = pick.getNormal(true, true);
                            this.aimedProxyIndex = j;
                            hit = true;
                        }
                    }
                }
            }
            else {
                let mesh: BABYLON.Mesh = pickableElement;
                let pick = ray.intersectsMesh(mesh);
                if (pick && pick.hit && pick.pickedMesh) {
                    if (pick.distance < aimedDist) {
                        aimedPickable = pickableElement;
                        aimedDist = pick.distance;
                        this.aimedPosition = pick.pickedPoint;
                        this.aimedNormal = pick.getNormal(true, true);
                        hit = true;
                    }
                }
            }
        }
        if (!hit) {
            this.aimedPosition = undefined;
            this.aimedNormal = undefined;
        }
        if (aimedPickable != this.aimedElement) {
            if (this.aimedElement) {
                this.aimedElement.onHoverEnd();
            }
            this.aimedElement = aimedPickable;
            if (this.aimedElement) {
                this.aimedElement.onHoverStart();
            }
        }
    }
}