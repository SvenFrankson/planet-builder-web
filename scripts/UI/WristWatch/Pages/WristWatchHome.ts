class WristWatchHome extends WristWatchPage {

    private _clockNeedles: SlikaPath;

    constructor(wristWatch: WristWatch) {
        super(wristWatch);

        let M = 15;
        let ML = 108;

        let title = this.slika.add(new SlikaText({
            text: "HOME",
            x: 500,
            y: 110,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.wristWatchScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            strokeColor: BABYLON.Color3.Black(),
            strokeWidth: 3
        }));
        this.elements.push(title);

        let clockFrame = this.slika.add(new SlikaCircle({
            x: 250,
            y: 350,
            r: 150,
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.wristWatchScreenBaseColor),
            alpha: 1,
            width: 4,
            outlineColor: BABYLON.Color3.Black(),
            outlineWidth: 2
        }));
        this.elements.push(clockFrame);

        this._clockNeedles = this.slika.add(new SlikaPath({
            points: [
                200, 350,
                250, 350,
                350, 350
            ],
            close: false,
            strokeColor: BABYLON.Color3.FromHexString(Config.uiConfiguration.wristWatchScreenBaseColor),
            strokeAlpha: 1,
            strokeWidth: 4,
            outlineColor: BABYLON.Color3.Black(),
            outlineWidth: 2
        }));
        this.elements.push(this._clockNeedles);

        let inventoryButton = this.slika.add(new SlikaButton(
            "Inventory",
            new SPosition(600, 200),
            SlikaButtonState.Enabled,
            300,
            300,
            50
        ));
        inventoryButton.onPointerUp = () => {
            this.wristWatch.showPage(1)
        }
        this.elements.push(inventoryButton);
    }

    private _lastM: number = NaN;
    public update(): void {
        let date = new Date();
        let h = date.getHours();
        let m = date.getMinutes();
        if (m != this._lastM) {
            this._lastM = m;

            let angleHour = ((h % 12) / 12 + (m / 60 / 12)) * 2 * Math.PI;
            let dxHour = Math.sin(angleHour);
            let dyHour = - Math.cos(angleHour);
            let angleMinutes = (m / 60) * 2 * Math.PI;
            let dxMinutes = Math.sin(angleMinutes);
            let dyMinutes = - Math.cos(angleMinutes);
    
            this._clockNeedles.prop.points[0] = 250 + dxHour * 90;
            this._clockNeedles.prop.points[1] = 350 + dyHour * 90;
            
            this._clockNeedles.prop.points[4] = 250 + dxMinutes * 120;
            this._clockNeedles.prop.points[5] = 350 + dyMinutes * 120;

            this.slika.needRedraw = true;
        }

    }
}