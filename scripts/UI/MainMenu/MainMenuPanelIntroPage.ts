/// <reference path="./MainMenuPanelPage.ts"/>

class MainMenuPanelIntroPage extends MainMenuPanelPage {

    public get holoSlika(): Slika {
        return this.mainMenuPanel.holoSlika;
    }

    constructor(public mainMenuPanel: MainMenuPanel) {
        super();        

        let title1 = this.holoSlika.add(new SlikaText(
            "Welcome to",
            new SPosition(500, 110, "center"),
            new SlikaTextStyle("#8dd6c0", 60, "XoloniumRegular")
        ));

        let title2 = this.holoSlika.add(new SlikaText(
            "PLANET BUILDER WEB",
            new SPosition(500, 180, "center"),
            new SlikaTextStyle("#8dd6c0", 60, "XoloniumRegular")
        ));

        let text1 = this.holoSlika.add(new SlikaText(
            "a Spherical Voxel",
            new SPosition(550, 370, "end"),
            new SlikaTextStyle("#8dd6c0", 50, "XoloniumRegular")
        ));

        let text2 = this.holoSlika.add(new SlikaText(
            "Engine demo",
            new SPosition(550, 430, "end"),
            new SlikaTextStyle("#8dd6c0", 50, "XoloniumRegular")
        ));

        let textDecoy = this.holoSlika.add(SlikaPath.CreatePan(100, 620, 460, 3, 30, 0.15, false, true, new SlikaShapeStyle("none", 1, "#8dd6c0", 1, 0, "#8dd6c0", 10)));

        let planetImage = this.holoSlika.add(new SlikaImage(
            new SPosition(750, 390),
            200, 
            200,
            "datas/images/planet.png"
        ));

        let buttonPlay = new SlikaButton(
            "Enter",
            new SPosition(320, 550),
            BABYLON.Color3.FromHexString("#8dd6c0")
        );
        buttonPlay.onPointerUp = async () => {
            await this.mainMenuPanel.introPage.hide(1);
            await this.mainMenuPanel.graphicsPage.show(1);
        }
        this.holoSlika.add(buttonPlay);

        let buttonPlayLabel = this.holoSlika.add(new SlikaText(
            "(press to enter)",
            new SPosition(500, 740, "center"),
            new SlikaTextStyle("#8dd6c0", 30, "XoloniumRegular")
        ));

        let bottom1 = this.holoSlika.add(new SlikaText(
            "powered by BabylonJS",
            new SPosition(850, 850, "end"),
            new SlikaTextStyle("#8dd6c0", 40, "XoloniumRegular")
        ));

        let babylonIcon = this.holoSlika.add(new SlikaImage(
            new SPosition(910, 835),
            80, 
            80,
            "datas/images/babylonjs-holo-logo.png"
        ));

        let bottom2 = this.holoSlika.add(new SlikaText(
            "made by Sven Frankson",
            new SPosition(940, 920, "end"),
            new SlikaTextStyle("#8dd6c0", 40, "XoloniumRegular")
        ));

        this.elements.push(title1, title2, text1, text2, textDecoy, planetImage, buttonPlay, buttonPlayLabel, bottom1, babylonIcon, bottom2);
    }
}