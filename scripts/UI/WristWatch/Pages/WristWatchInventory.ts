class WristWatchInventory extends WristWatchPage {

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

        for (let i = 0; i < 12; i++) {
            let iconW = 50;
            let lineHeight = 60;

            if (i % 2 === 0) {
                let itemIconBorder = this.slika.add(new SlikaPath({
                    points: [
                        250, 147 + i * lineHeight,
                        1000 - M - 7.5, 147 + i * lineHeight,
                        1000 - M - 7.5, 147 + (i + 1) * lineHeight,
                        250, 147 + (i + 1) * lineHeight,
                    ],
                    close: true,
                    fillColor: BABYLON.Color3.FromHexString(Config.uiConfiguration.wristWatchScreenBaseColor),
                    fillAlpha: 0.05
                }));
                this.elements.push(itemIconBorder);
            }

            let itemIcon = this.slika.add(new SlikaImage(
                new SPosition(260 + iconW * 0.5, 150 + iconW * 0.5 + i * lineHeight),
                iconW,
                iconW,
                "datas/images/block-icon-" + BlockTypeNames[BlockType.Grass + i] + "-miniature.png"
            ))
            this.elements.push(itemIcon);

            let itemName = this.slika.add(new SlikaText({
                text: BlockTypeNames[BlockType.Grass + i],
                x: 330,
                y: 140 + iconW + i * lineHeight,
                textAlign: "left",
                color: BABYLON.Color3.FromHexString(Config.uiConfiguration.wristWatchScreenBaseColor),
                fontSize: 40,
                fontFamily: "XoloniumRegular",
                strokeColor: BABYLON.Color3.Black(),
                strokeWidth: 4
            }));
            this.elements.push(itemName);

            let itemCount = this.slika.add(new SlikaText({
                text: "x" + Math.floor(Math.random() * 100).toFixed(0),
                x: 800,
                y: 140 + iconW + i * lineHeight,
                textAlign: "right",
                color: BABYLON.Color3.FromHexString(Config.uiConfiguration.wristWatchScreenBaseColor),
                fontSize: 40,
                fontFamily: "XoloniumRegular",
                strokeColor: BABYLON.Color3.Black(),
                strokeWidth: 4
            }));
            this.elements.push(itemCount);
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
}