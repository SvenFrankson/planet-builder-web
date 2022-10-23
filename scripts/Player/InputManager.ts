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
    JUMP
}

class InputManager {

    public keyInputMap: Map<string, KeyInput> = new Map<string, KeyInput>();

    public keyInputDown: UniqueList<KeyInput> = new UniqueList<KeyInput>();

    public keyDownListeners: ((k: KeyInput) => any)[] = [];
    public mappedKeyDownListeners: Map<KeyInput,(() => any)[]> = new Map<KeyInput,(() => any)[]>();
    public keyUpListeners: ((k: KeyInput) => any)[] = [];
    public mappedKeyUpListeners: Map<KeyInput,(() => any)[]> = new Map<KeyInput,(() => any)[]>();

    public initialize(): void {

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

        window.addEventListener("keydown", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (isFinite(keyInput)) {
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
        });
        window.addEventListener("keyup", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (isFinite(keyInput)) {
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
        });
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
}