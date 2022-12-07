/// <reference path="./MainMenuPanelPage.ts"/>

class MainMenuPanelIntroPage extends MainMenuPanelPage {

    public get holoSlika(): Slika {
        return this.mainMenuPanel.holoSlika;
    }

    constructor(mainMenuPanel: MainMenuPanel) {
        super(mainMenuPanel);        

        let title1 = this.holoSlika.add(new SlikaText({
            text: "Welcome to",
            x: 500,
            y: 110,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 20
        }));

        let title2 = this.holoSlika.add(new SlikaText({
            text: "PLANET BUILDER WEB",
            x: 500,
            y: 180,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 20
        }));

        let text1 = this.holoSlika.add(new SlikaText({
            text: "a Spherical Voxel",
            x: 550,
            y: 370,
            textAlign: "end",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 50,
            fontFamily: "XoloniumRegular",
            highlightRadius: 20
        }));

        let text2 = this.holoSlika.add(new SlikaText({
            text: "Engine demo",
            x: 550,
            y: 430,
            textAlign: "end",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 50,
            fontFamily: "XoloniumRegular",
            highlightRadius: 20
        }));

        let textDecoy = this.holoSlika.add(SlikaPath.CreatePan(100, 620, 460, 3, 30, 0.15, false, true, new SlikaShapeStyle("none", 1, Config.uiConfiguration.holoScreenBaseColor, 1, 0, Config.uiConfiguration.holoScreenBaseColor, 10)));

        let planetImage = this.holoSlika.add(new SlikaImage(
            new SPosition(750, 390),
            200, 
            200,
            "datas/images/planet.png"
        ));

        let buttonPlay = new SlikaButton(
            "Enter",
            new SPosition(275, 550),
            SlikaButtonState.Enabled
        );
        buttonPlay.onPointerUp = async () => {
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.graphicsPage.targetTitleHeight, 1);
            await this.mainMenuPanel.introPage.hide(0.5);
            await this.mainMenuPanel.graphicsPage.show(0.5);
        }
        this.holoSlika.add(buttonPlay);

        let buttonPlayLabel = this.holoSlika.add(new SlikaText({
            text: "(press to enter)",
            x: 500,
            y: 740,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 30,
            fontFamily: "XoloniumRegular",
            highlightRadius: 20
        }));

        let bottom1 = this.holoSlika.add(new SlikaText({
            text: "powered by BabylonJS",
            x: 850,
            y: 850,
            textAlign: "end",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 40,
            fontFamily: "XoloniumRegular",
            highlightRadius: 20
        }));

        let babylonIcon = this.holoSlika.add(new SlikaImage(
            new SPosition(910, 835),
            80, 
            80,
            "datas/images/babylonjs-holo-logo.png"
        ));

        let bottom2 = this.holoSlika.add(new SlikaText({
            text: "made by Sven Frankson",
            x: 940,
            y: 920,
            textAlign: "end",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 40,
            fontFamily: "XoloniumRegular",
            highlightRadius: 20
        }));

        this.elements.push(title1, title2, text1, text2, textDecoy, planetImage, buttonPlay, buttonPlayLabel, bottom1, babylonIcon, bottom2);
    }
}