interface IPlayerActionManagerData {
    linkedActionsNames: string[];
}

class PlayerAction {
    public iconUrl: string;
    public r: number = 0;
    public item: InventoryItem;

    public onUpdate: (chuncks?: PlanetChunck[]) => void;
    public onClick: (chuncks?: PlanetChunck[]) => void;
    public onWheel: (e: WheelEvent) => void;
    public onKeyDown: (e: KeyboardEvent) => void;
    public onKeyUp: (e: KeyboardEvent) => void;
    public onEquip: () => void;
    public onUnequip: () => void;

    constructor(    
        public name: string,
        public player: Player
    ) {

    }
}

class PlayerActionManager {

    public linkedActions: PlayerAction[] = [];

    public get inventory(): Inventory {
        return this.player.inventory;
    }

    constructor(
        public player: Player,
        public hud: HeadUpDisplay,
        public main: Main
    ) {

    }

    public initialize(): void {
        Main.Scene.onBeforeRenderObservable.add(this.update);
        
        this.main.inputManager.addKeyDownListener((e: KeyInput) => {
            let slotIndex = e;
            if (slotIndex >= 0 && slotIndex < 10) {
                this.startHint(slotIndex);
            }
        });
        this.main.inputManager.addKeyUpListener((e: KeyInput) => {
            let slotIndex = e;
            if (slotIndex >= 0 && slotIndex < 10) {
                this.stopHint(slotIndex);
                this.equipAction(slotIndex);
            }
        });
        for (let i = 0; i < 10; i++) {
            let slotIndex = i;
            /*
            (document.querySelector("#player-action-" + slotIndex) as HTMLDivElement).addEventListener("touchend", () => {
                this.equipAction(slotIndex);
            });
            */
        }
    }

    public update = () => {
        
    }

    public linkAction(action: PlayerAction, slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.linkedActions[slotIndex] = action;
            this.hud.onActionLinked(action, slotIndex);
        }
    }

    public unlinkAction(slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.linkedActions[slotIndex] = undefined;
            this.hud.onActionUnlinked(slotIndex);
        }
    }

    public equipAction(slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex < 10) {
            for (let i = 0; i < 10; i++) {
                //(document.querySelector("#player-action-" + i + " .background") as HTMLImageElement).src ="/datas/images/inventory-item-background.svg";
            }
            // Unequip current action
            if (this.player.currentAction) {
                if (this.player.currentAction.onUnequip) {
                    this.player.currentAction.onUnequip();
                }
                this.hud.onActionUnequiped(this.player.currentAction, slotIndex);
            }
            if (this.linkedActions[slotIndex]) {
                // If request action was already equiped, remove it.
                if (this.player.currentAction === this.linkedActions[slotIndex]) {
                    this.player.currentAction = undefined;
                }
                // Otherwise, equip new action.
                else {
                    this.player.currentAction = this.linkedActions[slotIndex];
                    if (this.player.currentAction) {
                        //(document.querySelector("#player-action-" + slotIndex + " .background") as HTMLImageElement).src ="/datas/images/inventory-item-background-highlit.svg";
                        if (this.player.currentAction.onEquip) {
                            this.player.currentAction.onEquip();
                        }
                        this.hud.onActionEquiped(this.player.currentAction, slotIndex);
                    }
                }
            }
            else {
                this.player.currentAction = undefined;
            }
        }
    }

    public startHint(slotIndex: number): void {
        this.inventory.hintedSlotIndex.push(slotIndex);
        setTimeout(() => {
            if (this.inventory.hintedSlotIndex.contains(slotIndex)) {
                this.hud.onHintStart(slotIndex);
            }
        }, 200);
    }

    public stopHint(slotIndex: number): void {
        this.inventory.hintedSlotIndex.remove(slotIndex) >= 0;
        this.hud.onHintEnd(slotIndex);
    }

    public serialize(): IPlayerActionManagerData {
        let linkedActionsNames: string[] = [];
        for (let i = 0; i < this.linkedActions.length; i++) {
            if (this.linkedActions[i]) {
                linkedActionsNames[i] = this.linkedActions[i].name;
            }
        }
        return {
            linkedActionsNames: linkedActionsNames
        }
    }

    public deserialize(data: IPlayerActionManagerData): void {
        if (data && data.linkedActionsNames) {
            for (let i = 0; i < data.linkedActionsNames.length; i++) {
                let linkedActionName = data.linkedActionsNames[i];
                //let item = this.player.inventory.getItemByPlayerActionName(linkedActionName);
                //if (item) {
                //    this.linkAction(item.playerAction, i);
                //    item.timeUse = (new Date()).getTime();
                //}
            }
        }
    }
}