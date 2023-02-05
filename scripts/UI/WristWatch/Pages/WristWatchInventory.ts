class WristWatchInventory extends WristWatchPage {

    private _lineCount: number = 12;
    private _lineHeight: number = 60;

    private _itemIcons: SlikaImage[] = [];
    private _itemNames: SlikaText[] = [];
    private _itemCounts: SlikaText[] = [];

    public get inventory(): Inventory {
        return this.wristWatch.player.inventory;
    }

    constructor(wristWatch: WristWatch) {
        super(wristWatch);

        let M = 15;
        let ML = 108;

        let title = this.slika.add(new SlikaText({
            text: "INVENTORY",
            x: 500,
            y: 110,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.wristWatchScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            strokeColor: BABYLON.Color3.Black(),
            strokeWidth: 6
        }));
        this.elements.push(title);

        for (let i = 0; i < this._lineCount; i++) {
            let iconW = 50;
            this._lineHeight = 60;

            if (i % 2 === 0) {
                let itemIconBorder = this.slika.add(new SlikaPath({
                    points: [
                        250, 147 + i * this._lineHeight,
                        1000 - M - 7.5, 147 + i * this._lineHeight,
                        1000 - M - 7.5, 147 + (i + 1) * this._lineHeight,
                        250, 147 + (i + 1) * this._lineHeight,
                    ],
                    close: true,
                    fillColor: BABYLON.Color3.FromHexString(Config.uiConfiguration.wristWatchScreenBaseColor),
                    fillAlpha: 0.05
                }));
                this.elements.push(itemIconBorder);
            }

            this._itemIcons[i] = this.slika.add(new SlikaImage(
                new SPosition(260 + iconW * 0.5, 150 + iconW * 0.5 + i * this._lineHeight),
                iconW,
                iconW,
                "datas/images/block-icon-" + BlockTypeNames[BlockType.Ice] + "-miniature.png"
            ))
            this.elements.push(this._itemIcons[i]);

            this._itemNames[i] = this.slika.add(new SlikaText({
                text: "",
                x: 330,
                y: 140 + iconW + i * this._lineHeight,
                textAlign: "left",
                color: BABYLON.Color3.FromHexString(Config.uiConfiguration.wristWatchScreenBaseColor),
                fontSize: 40,
                fontFamily: "XoloniumRegular",
                strokeColor: BABYLON.Color3.Black(),
                strokeWidth: 4
            }));
            this.elements.push(this._itemNames[i]);

            this._itemCounts[i] = this.slika.add(new SlikaText({
                text: "",
                x: 800,
                y: 140 + iconW + i * this._lineHeight,
                textAlign: "right",
                color: BABYLON.Color3.FromHexString(Config.uiConfiguration.wristWatchScreenBaseColor),
                fontSize: 40,
                fontFamily: "XoloniumRegular",
                strokeColor: BABYLON.Color3.Black(),
                strokeWidth: 4
            }));
            this.elements.push(this._itemCounts[i]);
        }
        let separator1 = this.slika.add(
            new SlikaPath({
                points: [
                    M + 7.5, 150,
                    1000 - M - 7.5, 150
                ],
                close: false,
                strokeColor: BABYLON.Color3.FromHexString(Config.uiConfiguration.wristWatchScreenBaseColor),
                strokeAlpha: 1,
                strokeWidth: 4,
                outlineColor: BABYLON.Color3.Black(),
                outlineWidth: 2
            })
        );
        this.elements.push(separator1);

        let separator2 = this.slika.add(
            new SlikaPath({
                points: [
                    250, 152,
                    250, 1000 - ML - 7.5
                ],
                close: false,
                strokeColor: BABYLON.Color3.FromHexString(Config.uiConfiguration.wristWatchScreenBaseColor),
                strokeAlpha: 1,
                strokeWidth: 4,
                outlineColor: BABYLON.Color3.Black(),
                outlineWidth: 2
            })
        );
        this.elements.push(separator2);
    }

    public async show(duration: number): Promise<void> {
        this.refresh();
        await super.show(duration);
    }

    public refresh(): void {
        for (let i = 0; i < this._lineCount; i++) {
            let inventoryItem = this.inventory.items[i];
            if (inventoryItem) {
                this._itemCounts[i].prop.text = "x" + inventoryItem.count.toFixed(0);
                this._itemNames[i].prop.text = inventoryItem.name;
                this._itemIcons[i].url = inventoryItem.iconUrl;
            }
            else {
                this._itemCounts[i].prop.text = "";
                this._itemNames[i].prop.text = "";
                this._itemIcons[i].url = "";
            }
        }
    }

    public onPointerDown(x: number, y: number): void {
        if (x > 250) {
            if (y > 150) {
                let n = Math.floor((y - 150) / this._lineHeight);
                if (this.inventory.items[n]) {
                    this.inventory.draggedItem = this.inventory.items[n];
                }
            }
        }
    }
}