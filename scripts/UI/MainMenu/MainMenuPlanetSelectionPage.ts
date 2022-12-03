/// <reference path="./MainMenuPanelPage.ts"/>

class MainMenuPlanetSelectionPage extends MainMenuPanelPage {

    public get holoSlika(): Slika {
        return this.mainMenuPanel.holoSlika;
    }

    constructor(mainMenuPanel: MainMenuPanel) {
        super(mainMenuPanel);

        this.targetTitleHeight = 150;

        let title1 = this.holoSlika.add(new SlikaText(
            "PLANET SELECTION",
            new SPosition(500, 110, "center"),
            new SlikaTextStyle("#8dd6c0", 60, "XoloniumRegular")
        ));

        let buttonLeft = new SlikaButton(
            "<",
            new SPosition(80, 440),
            BABYLON.Color3.FromHexString("#8dd6c0"),
            120,
            120,
            80
        );
        this.holoSlika.add(buttonLeft);

        let buttonRight = new SlikaButton(
            ">",
            new SPosition(800, 440),
            BABYLON.Color3.FromHexString("#8dd6c0"),
            120,
            120,
            80
        );
        this.holoSlika.add(buttonRight);

        let buttonBack = new SlikaButton(
            "BACK",
            new SPosition(120, 820),
            BABYLON.Color3.FromHexString("#8dd6c0"),
            200,
            100,
            40
        );
        buttonBack.onPointerUp = async () => {
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.graphicsPage.targetTitleHeight, 1);
            await this.mainMenuPanel.planetPage.hide(0.5);
            await this.mainMenuPanel.graphicsPage.show(0.5);
        }
        this.holoSlika.add(buttonBack);

        let buttonGo = new SlikaButton(
            "GO !",
            new SPosition(600, 770),
            BABYLON.Color3.FromHexString("#8dd6c0"),
            300,
            150,
            60
        );
        buttonGo.onPointerUp = async () => {
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.planetPage.targetTitleHeight, 1);
            await this.mainMenuPanel.graphicsPage.hide(0.5);
            await this.mainMenuPanel.planetPage.show(0.5);
        }
        this.holoSlika.add(buttonGo);

        this.elements.push(title1, buttonLeft, buttonRight, buttonBack, buttonGo);
    }
}