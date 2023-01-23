/// <reference path="./MainMenuPanelPage.ts"/>

class MainMenuPanelTutorialPage extends MainMenuPanelPage {

    public get holoSlika(): Slika {
        return this.mainMenuPanel.holoSlika;
    }

    constructor(mainMenuPanel: MainMenuPanel) {
        super(mainMenuPanel);

        this.targetTitleHeight = 150;

        let title1 = this.holoSlika.add(new SlikaText({
            text: "TUTORIAL",
            x: 500,
            y: 110,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));

        let text1 = this.holoSlika.add(new SlikaText({
            text: "Take a quick control tutorial,",
            x: 100,
            y: 330,
            textAlign: "start",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 50,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));

        let text2 = this.holoSlika.add(new SlikaText({
            text: "or press NEXT to skip.",
            x: 100,
            y: 400,
            textAlign: "start",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 50,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));

        let buttonEnter = new SlikaButton(
            "Start Tutorial",
            new SPosition(150, 500),
            SlikaButtonState.Enabled,
            700
        );
        buttonEnter.onPointerUp = async () => {
            if (this.mainMenuPanel.main instanceof MainMenu) {
                this.mainMenuPanel.close();
                this.mainMenuPanel.main.tutorialManager.runTutorial();
            }
        }
        this.holoSlika.add(buttonEnter);

        let buttonBack = new SlikaButton(
            "BACK",
            new SPosition(120, 820),
            SlikaButtonState.Enabled,
            200,
            100,
            40
        );
        this.holoSlika.add(buttonBack);

        let buttonNext = new SlikaButton(
            "NEXT",
            new SPosition(700, 820),
            SlikaButtonState.Enabled,
            200,
            100,
            40
        );
        this.holoSlika.add(buttonNext);
        
        buttonBack.onPointerUp = async () => {
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.pages[1].targetTitleHeight, 1);
            this.mainMenuPanel.showPage(1);
        }
        buttonNext.onPointerUp = async () => {
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.pages[3].targetTitleHeight, 1);
            this.mainMenuPanel.showPage(3);
        }

        this.elements.push(title1, text1, text2, buttonEnter, buttonBack, buttonNext);
    }
}