interface IPlayerActionManagerData {
    linkedActionsNames: string[];
}

class PlayerAction {
    public iconUrl: string;
    public r: number = 0;

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

    public hintedSlotIndex: UniqueList<number> = new UniqueList<number>();

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
                if (!document.pointerLockElement) {
                    this.startHint(slotIndex);
                }
            }
        });
        this.main.inputManager.addKeyUpListener((e: KeyInput) => {
            let slotIndex = e;
            this.equipAction(slotIndex);
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
        if (this.hintedSlotIndex.length > 0) {
            let t = (new Date()).getTime();
            let thickness = Math.cos(2 * Math.PI * t / 1000) * 2 + 3;
            let opacity = (Math.cos(2 * Math.PI * t / 1000) + 1) * 0.5 * 0.5 + 0.25;
            for (let i = 0; i < this.hintedSlotIndex.length; i++) {
                let slotIndex = this.hintedSlotIndex.get(i);
                /*
                console.log(thickness);
                (document.querySelector("#player-action-" + slotIndex) as HTMLDivElement).style.backgroundColor = "rgba(255, 255, 255, " + opacity.toFixed(2) + ")";
                */
            }
        }
    }

    public linkAction(action: PlayerAction, slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.linkedActions[slotIndex] = action;
            this.hud.hudLateralTileImageMaterials[slotIndex].diffuseTexture = new BABYLON.Texture(action.iconUrl);
            this.hud.hudLateralTileImageMaterials[slotIndex].diffuseTexture.hasAlpha = true;
        }
    }

    public unlinkAction(slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.linkedActions[slotIndex] = undefined;
            this.hud.hudLateralTileImageMaterials[slotIndex].diffuseTexture = undefined;
        }
    }

    public equipAction(slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex < 10) {
            this.stopHint(slotIndex);
            for (let i = 0; i < 10; i++) {
                //(document.querySelector("#player-action-" + i + " .background") as HTMLImageElement).src ="/datas/images/inventory-item-background.svg";
            }
            // Unequip current action
            if (this.player.currentAction) {
                if (this.player.currentAction.onUnequip) {
                    this.player.currentAction.onUnequip();
                }
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
                    }
                }
            }
            else {
                this.player.currentAction = undefined;
            }
        }
    }

    public startHint(slotIndex: number): void {
        this.hintedSlotIndex.push(slotIndex);
    }

    public stopHint(slotIndex: number): void {
        this.hintedSlotIndex.remove(slotIndex);
        //(document.querySelector("#player-action-" + slotIndex) as HTMLDivElement).style.backgroundColor = "";
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