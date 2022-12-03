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
        this.holoSlika.add(buttonHigh);

        let buttonHighExplain = new SlikaTextBox({
            text: "- Large planets and extended render distance.\n- Select if you're playing on a gaming PC or a high-end mobile phone.",
            x: 530,
            y: 265,
            w: 400,
            h: 90,
            color: BABYLON.Color3.FromHexString("#8dd6c0"),
            fontFamily: "XoloniumRegular",
            fontSize: 20,
            highlightRadius: 4
        })
        this.holoSlika.add(buttonHighExplain);

        let buttonMedium = new SlikaButton(
            "MEDIUM",
            new SPosition(120, 420),
            BABYLON.Color3.FromHexString("#8dd6c0"),
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
            color: BABYLON.Color3.FromHexString("#8dd6c0"),
            fontFamily: "XoloniumRegular",
            fontSize: 20,
            highlightRadius: 4
        })
        this.holoSlika.add(buttonMediumExplain);

        let buttonLow = new SlikaButton(
            "LOW",
            new SPosition(120, 590),
            BABYLON.Color3.FromHexString("#8dd6c0"),
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
            color: BABYLON.Color3.FromHexString("#8dd6c0"),
            fontFamily: "XoloniumRegular",
            fontSize: 20,
            highlightRadius: 4
        })
        this.holoSlika.add(buttonLowExplain);
        
        buttonHigh.onPointerUp = () => {
            buttonHigh.setStatus(SlikaButtonState.Active);
            buttonMedium.setStatus(SlikaButtonState.Enabled);
            buttonLow.setStatus(SlikaButtonState.Enabled);
            Config.setConfHighPreset();
        }
        buttonMedium.onPointerUp = () => {
            buttonHigh.setStatus(SlikaButtonState.Enabled);
            buttonMedium.setStatus(SlikaButtonState.Active);
            buttonLow.setStatus(SlikaButtonState.Enabled);
            Config.setConfMediumPreset();
        }
        buttonLow.onPointerUp = () => {
            buttonHigh.setStatus(SlikaButtonState.Enabled);
            buttonMedium.setStatus(SlikaButtonState.Enabled);
            buttonLow.setStatus(SlikaButtonState.Active);
            Config.setConfLowPreset();
        }

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
        buttonNext.onPointerUp = async () => {
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.planetPage.targetTitleHeight, 1);
            await this.mainMenuPanel.graphicsPage.hide(0.5);
            await this.mainMenuPanel.planetPage.show(0.5);
        }
        this.holoSlika.add(buttonNext);
        buttonNext.setStatus(SlikaButtonState.Disabled);

        this.elements.push(title1, buttonHigh, buttonHighExplain, buttonMedium, buttonMediumExplain, buttonLow, buttonLowExplain, buttonBack, buttonNext);
    }
}