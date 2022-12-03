/// <reference path="./MainMenuPanelPage.ts"/>

class MainMenuPanelGraphicsPage extends MainMenuPanelPage {

    public get holoSlika(): Slika {
        return this.mainMenuPanel.holoSlika;
    }

    constructor(mainMenuPanel: MainMenuPanel) {
        super(mainMenuPanel);

        this.targetTitleHeight = 150;

        let title1 = this.holoSlika.add(new SlikaText(
            "GRAPHIC SETTINGS",
            new SPosition(500, 110, "center"),
            new SlikaTextStyle("#8dd6c0", 60, "XoloniumRegular")
        ));

        let buttonHigh = new SlikaButton(
            "HIGH",
            new SPosition(120, 250),
            BABYLON.Color3.FromHexString("#8dd6c0"),
            350,
            120,
            50
        );
        buttonHigh.onPointerUp = () => {
            this.mainMenuPanel.introPage.hide(1);
        }
        this.holoSlika.add(buttonHigh);

        let buttonMedium = new SlikaButton(
            "MEDIUM",
            new SPosition(120, 420),
            BABYLON.Color3.FromHexString("#8dd6c0"),
            350,
            120,
            50
        );
        buttonMedium.onPointerUp = () => {
            this.mainMenuPanel.introPage.hide(1);
        }
        this.holoSlika.add(buttonMedium);

        let buttonLow = new SlikaButton(
            "LOW",
            new SPosition(120, 590),
            BABYLON.Color3.FromHexString("#8dd6c0"),
            350,
            120,
            50
        );
        buttonLow.onPointerUp = () => {
            this.mainMenuPanel.introPage.hide(1);
        }
        this.holoSlika.add(buttonLow);

        let buttonBack = new SlikaButton(
            "BACK",
            new SPosition(120, 820),
            BABYLON.Color3.FromHexString("#8dd6c0"),
            200,
            100,
            40
        );
        buttonBack.onPointerUp = async () => {
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.introPage.targetTitleHeight, 1);
            await this.mainMenuPanel.graphicsPage.hide(0.5);
            await this.mainMenuPanel.introPage.show(0.5);
        }
        this.holoSlika.add(buttonBack);

        let buttonNext = new SlikaButton(
            "NEXT",
            new SPosition(700, 820),
            BABYLON.Color3.FromHexString("#8dd6c0"),
            200,
            100,
            40
        );
        buttonNext.onPointerUp = () => {
            this.mainMenuPanel.introPage.hide(1);
        }
        this.holoSlika.add(buttonNext);
        buttonNext.setStatus(SlikaButtonState.Disabled);

        this.elements.push(title1, buttonHigh, buttonMedium, buttonLow, buttonBack, buttonNext);
    }
}