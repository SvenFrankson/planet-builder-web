/// <reference path="./MainMenuPanelPage.ts"/>

class MainMenuPanelGraphicsPage extends MainMenuPanelPage {

    public get holoSlika(): Slika {
        return this.mainMenuPanel.holoSlika;
    }

    constructor(public mainMenuPanel: MainMenuPanel) {
        super();

        let title1 = this.holoSlika.add(new SlikaText(
            "GRAPHIC SETTINGS",
            new SPosition(500, 180, "center"),
            new SlikaTextStyle("#8dd6c0", 60, "XoloniumRegular")
        ));

        let buttonHigh = new SlikaButton(
            "HIGH",
            new SPosition(320, 350),
            BABYLON.Color3.FromHexString("#8dd6c0")
        );
        buttonHigh.onPointerUp = () => {
            this.mainMenuPanel.introPage.hide(1);
        }
        this.holoSlika.add(buttonHigh);

        let buttonMedium = new SlikaButton(
            "MEDIUM",
            new SPosition(320, 550),
            BABYLON.Color3.FromHexString("#8dd6c0")
        );
        buttonMedium.onPointerUp = () => {
            this.mainMenuPanel.introPage.hide(1);
        }
        this.holoSlika.add(buttonMedium);

        let buttonLow = new SlikaButton(
            "LOW",
            new SPosition(320, 750),
            BABYLON.Color3.FromHexString("#8dd6c0")
        );
        buttonLow.onPointerUp = () => {
            this.mainMenuPanel.introPage.hide(1);
        }
        this.holoSlika.add(buttonLow);

        this.elements.push(title1, buttonHigh, buttonMedium, buttonLow);
    }
}