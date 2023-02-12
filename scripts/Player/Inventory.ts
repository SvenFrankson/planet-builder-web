enum InventorySection {
    Action,
    Cube,
    Block,
    Brick
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

    public static Block(player: Player, blockType: BlockType): InventoryItem {
        let it = new InventoryItem();
        it.section = InventorySection.Block;
        it.name = BlockTypeNames[blockType];
        it.size = 27;
        PlayerActionTemplate.CreateBlockAction(player, blockType).then((action) => {
            it.playerAction = action;
            action.item = it;
        });
        it.iconUrl = "datas/images/block-icon-" + BlockTypeNames[blockType] + "-miniature.png";
        return it;
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
        
        for (let blockType = BlockType.Grass; blockType < BlockType.Unknown; blockType++) {
            for (let n = 0; n < 42; n++) {
                this.addItem(InventoryItem.Block(this.player, blockType));
            }
        }
        this.addItem(InventoryItem.Block(this.player, BlockType.None));
    }

    public initialize(): void {
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

    public getItemByPlayerActionName(playerActionName: string): InventoryItem {
        return this.items.find(it => { return it.playerAction.name === playerActionName; });
    }

    public update(): void {

    }
}