/// <reference path="./MainMenuPanelPage.ts"/>

class MainMenuPanelGraphicsPage extends MainMenuPanelPage {

    public get holoSlika(): Slika {
        return this.mainMenuPanel.holoSlika;
    }

    constructor(mainMenuPanel: MainMenuPanel) {
        super(mainMenuPanel);

        this.targetTitleHeight = 150;
		let confPreset = window.localStorage.getItem("graphic-setting-preset");

        let title1 = this.holoSlika.add(new SlikaText({
            text: "GRAPHIC SETTINGS",
            x: 500,
            y: 110,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 20
        }));

        let buttonHigh = new SlikaButton(
            "HIGH",
            new SPosition(120, 250),
            confPreset === ConfigurationPreset.High ? SlikaButtonState.Active : SlikaButtonState.Enabled,
            350,
            120,
            50
        );
        this.holoSlika.add(buttonHigh);

        let buttonHighExplain = new SlikaTextBox({
            text: "- Large planets and extended render distance.\n- Select if you're playing on a gaming PC or a high-end mobile phone.",
            x: 530,
            y: 265,
            w: 400,
            h: 90,
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontFamily: "XoloniumRegular",
            fontSize: 20,
            highlightRadius: 4
        })
        this.holoSlika.add(buttonHighExplain);

        let buttonMedium = new SlikaButton(
            "MEDIUM",
            new SPosition(120, 420),
            confPreset === ConfigurationPreset.Medium ? SlikaButtonState.Active : SlikaButtonState.Enabled,
            350,
            120,
            50
        );
        this.holoSlika.add(buttonMedium);

        let buttonMediumExplain = new SlikaTextBox({
            text: "- Medium planets and normal render distance. ",
            x: 530,
            y: 450,
            w: 400,
            h: 50,
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontFamily: "XoloniumRegular",
            fontSize: 20,
            highlightRadius: 4
        })
        this.holoSlika.add(buttonMediumExplain);

        let buttonLow = new SlikaButton(
            "LOW",
            new SPosition(120, 590),
            confPreset === ConfigurationPreset.Low ? SlikaButtonState.Active : SlikaButtonState.Enabled,
            350,
            120,
            50
        );
        this.holoSlika.add(buttonLow);

        let buttonLowExplain = new SlikaTextBox({
            text: "- Small planets and reduced render distance.\n- Select if you're playing on a mobile phone.",
            x: 530,
            y: 605,
            w: 400,
            h: 90,
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontFamily: "XoloniumRegular",
            fontSize: 20,
            highlightRadius: 4
        })
        this.holoSlika.add(buttonLowExplain);

        let buttonBack = new SlikaButton(
            "BACK",
            new SPosition(120, 820),
            SlikaButtonState.Enabled,
            200,
            100,
            40
        );
        this.holoSlika.add(buttonBack);

        console.log(confPreset);
        let buttonNext = new SlikaButton(
            "NEXT",
            new SPosition(700, 820),
            confPreset === ConfigurationPreset.None ? SlikaButtonState.Disabled : SlikaButtonState.Enabled,
            200,
            100,
            40
        );
        this.holoSlika.add(buttonNext);
        
        buttonHigh.onPointerUp = () => {
            buttonHigh.setStatus(SlikaButtonState.Active);
            buttonMedium.setStatus(SlikaButtonState.Enabled);
            buttonLow.setStatus(SlikaButtonState.Enabled);
            buttonNext.setStatus(SlikaButtonState.Enabled);
            Config.setConfHighPreset();
        }
        buttonMedium.onPointerUp = () => {
            buttonHigh.setStatus(SlikaButtonState.Enabled);
            buttonMedium.setStatus(SlikaButtonState.Active);
            buttonLow.setStatus(SlikaButtonState.Enabled);
            buttonNext.setStatus(SlikaButtonState.Enabled);
            Config.setConfMediumPreset();
        }
        buttonLow.onPointerUp = () => {
            buttonHigh.setStatus(SlikaButtonState.Enabled);
            buttonMedium.setStatus(SlikaButtonState.Enabled);
            buttonLow.setStatus(SlikaButtonState.Active);
            buttonNext.setStatus(SlikaButtonState.Enabled);
            Config.setConfLowPreset();
        }
        buttonBack.onPointerUp = async () => {
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.introPage.targetTitleHeight, 1);
            await this.mainMenuPanel.graphicsPage.hide(0.5);
            await this.mainMenuPanel.introPage.show(0.5);
        }
        buttonNext.onPointerUp = async () => {
            if (buttonNext.state === SlikaButtonState.Enabled) {
                this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.planetPage.targetTitleHeight, 1);
                await this.mainMenuPanel.graphicsPage.hide(0.5);
                await this.mainMenuPanel.planetPage.show(0.5);
            }
        }

        this.elements.push(title1, buttonHigh, buttonHighExplain, buttonMedium, buttonMediumExplain, buttonLow, buttonLowExplain, buttonBack, buttonNext);
    }
}