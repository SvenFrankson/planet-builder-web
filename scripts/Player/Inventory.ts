enum InventorySection {
    Action,
    Cube,
    Block,
    Brick,
    TmpObject,
    DriderBait
}

class InventoryItem {

    public section: InventorySection;
    public subSection: string;
    public count: number = 1;
    public name: string;
    public size: number = 1;
    public playerAction: PlayerAction;
    public iconUrl: string;
    public timeUse: number = 0;

    public static async Block(player: Player, blockType: BlockType): Promise<InventoryItem> {
        return new Promise<InventoryItem>(async resolve => {
            let it = new InventoryItem();
            it.section = InventorySection.Block;
            it.name = BlockTypeNames[blockType];
            it.size = 27;
            it.playerAction = await PlayerActionTemplate.CreateBlockAction(player, blockType);
            it.playerAction.item = it;
            it.iconUrl = "datas/images/block-icon-" + BlockTypeNames[blockType] + "-miniature.png";
            resolve(it);
        });
    }

    public static async TmpObject(player: Player, tmpObjectName: string): Promise<InventoryItem> {
        return new Promise<InventoryItem>(async resolve => {
            let it = new InventoryItem();
            it.section = InventorySection.TmpObject;
            it.name = tmpObjectName;
            it.size = 1;
            it.playerAction = await PlayerActionTemplate.AddTmpObjectAction(player, tmpObjectName);
            it.playerAction.item = it;
            it.iconUrl = "/datas/images/qmark.png";
            resolve(it);
        });
    }

    public static async DriderBait(player: Player): Promise<InventoryItem> {
        return new Promise<InventoryItem>(async resolve => {
            let it = new InventoryItem();
            it.section = InventorySection.DriderBait;
            it.name = "Bait";
            it.size = 1;
            it.playerAction = await PlayerActionTemplate.AddDriderBaitAction(player);
            it.playerAction.item = it;
            it.iconUrl = "/datas/images/qmark.png";
            resolve(it);
        });
    }
}

enum BrickSortingOrder {
    Recent,
    TypeAsc,
    TypeDesc,
    SizeAsc,
    SizeDesc,
    ColorAsc,
    ColorDesc
}

interface IInventoryData {
    items: { r: string, c: number }[];
}

class Inventory {

    public currentSection: InventorySection;
    public items: InventoryItem[] = [];

    private _brickSorting: BrickSortingOrder = BrickSortingOrder.TypeAsc;

    public draggedItem: InventoryItem;
    public hintedSlotIndex: UniqueList<number> = new UniqueList<number>();

    constructor(
        public player: Player
    ) {
        player.inventory = this;
    }

    public async initialize(): Promise<void> {
        
        let savedInventoryString = window.localStorage.getItem("player-inventory");
        if (savedInventoryString) {
            let savedInventory = JSON.parse(savedInventoryString);
            await this.deserializeInPlace(savedInventory);
        }
        else {
            this.addItem(await InventoryItem.Block(this.player, BlockType.None));
        }

        this.update();
    }

    public addItem(item: InventoryItem): void {
        let same = this.items.find(it => { return it.name === item.name; });
        if (same) {
            same.count++;
        }
        else {
            this.items.push(item);
        }
        let data = this.serialize();
        window.localStorage.setItem("player-inventory", JSON.stringify(data));
    }

    public getCurrentSectionItems(): InventoryItem[] {
        let sectionItems: InventoryItem[] = [];
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].section === this.currentSection) {
                sectionItems.push(this.items[i]);
            }
        }

        return sectionItems;
    }

    public getItemByName(name: string): InventoryItem {
        return this.items.find(it => { return it.name === name; });
    }

    public getItemByPlayerActionName(playerActionName: string): InventoryItem {
        return this.items.find(it => { return it.playerAction.name === playerActionName; });
    }

    public update(): void {

    }

    public serialize(): IInventoryData {
        let data: IInventoryData = {
            items: []
        };
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i];
            data.items.push({
                r: item.name,
                c: item.count
            });
        }
        return data;
    }

    public async deserializeInPlace(input: IInventoryData) {
        this.items = [];
        for (let i = 0; i < input.items.length; i++) {
            let data = input.items[i];
            let blockType = BlockTypeNames.indexOf(data.r);
            if (blockType != -1) {
                let item = await InventoryItem.Block(this.player, blockType);
                item.count = data.c;
                this.items.push(item);
            }
            else if (data.r === "Bait") {
                let item = await InventoryItem.DriderBait(this.player);
                item.count = data.c;
                this.items.push(item);
            }
            else {
                let item = await InventoryItem.TmpObject(this.player, data.r);
                item.count = data.c;
                this.items.push(item);
            }
        }
    }
}