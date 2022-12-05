/// <reference path="./MainMenuPanelPage.ts"/>

class MainMenuPlanetSelectionPage extends MainMenuPanelPage {

    public currentPlanetIndex: number = 0;
    public planetNames: string[] = [
        "M6-Blue",
        "Horus",
        "Pavlita-6B",
        "Echo-V",
    ]
    public planetDescriptions: string[] = [
        "\n- radius : 460m\n\n- type : telluric\n\n- moons : 0",
        "\n- radius : 210m\n\n- type : mars\n\n- moons : 2",
        "\n- radius : 82m\n\n- type : telluric\n\n- moons : 1",
        "\n- radius : 623m\n\n- type : dry\n\n- moons : 0"
    ]
    public get holoSlika(): Slika {
        return this.mainMenuPanel.holoSlika;
    }

    public planetNameElement: SlikaText;
    public planetDescElement: SlikaTextBox;

    constructor(mainMenuPanel: MainMenuPanel) {
        super(mainMenuPanel);

        this.targetTitleHeight = 150;

        let title1 = this.holoSlika.add(new SlikaText({
            text: "PLANET SELECTION",
            x: 500,
            y: 110,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString("#8dd6c0"),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 20
        }));

        let buttonLeft = new SlikaButton(
            "<",
            new SPosition(80, 470),
            SlikaButtonState.Enabled,
            100,
            100,
            80
        );
        buttonLeft.onPointerUp = () => {
            this.currentPlanetIndex = (this.currentPlanetIndex - 1 + this.planetNames.length) % this.planetNames.length;
            this.updateCurrentPlanetIndex(true);
        }
        this.holoSlika.add(buttonLeft);

        let buttonRight = new SlikaButton(
            ">",
            new SPosition(820, 470),
            SlikaButtonState.Enabled,
            100,
            100,
            80
        );
        buttonRight.onPointerUp = () => {
            this.currentPlanetIndex = (this.currentPlanetIndex + 1) % this.planetNames.length;
            this.updateCurrentPlanetIndex();
        }
        this.holoSlika.add(buttonRight);

        this.planetNameElement = this.holoSlika.add(new SlikaText({
            text: "id: " + this.planetNames[this.currentPlanetIndex],
            x: 500,
            y: 300,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString("#8dd6c0"),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 20
        })) as SlikaText;

        let planetImage = this.holoSlika.add(new SlikaImage(
            new SPosition(370, 520),
            250, 
            250,
            "datas/images/planet.png"
        ));

        this.planetDescElement = new SlikaTextBox({
            text: this.planetDescriptions[this.currentPlanetIndex],
            x: 540,
            y: 370,
            w: 220,
            h: 300,
            color: BABYLON.Color3.FromHexString("#8dd6c0"),
            fontFamily: "XoloniumRegular",
            fontSize: 24,
            highlightRadius: 4
        });
        this.holoSlika.add(this.planetDescElement);

        let buttonBack = new SlikaButton(
            "BACK",
            new SPosition(120, 820),
            SlikaButtonState.Enabled,
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
            SlikaButtonState.Enabled,
            300,
            150,
            60
        );
        buttonGo.onPointerUp = async () => {
            let destinationPlanet = this.mainMenuPanel.main.planets[this.currentPlanetIndex];
            let destinationAltitude = PlanetTools.KGlobalToAltitude(Math.floor(destinationPlanet.generator.altitudeMap.getForSide(
                Side.Top,
                destinationPlanet.generator.altitudeMap.size * 0.5,
                destinationPlanet.generator.altitudeMap.size * 0.5,
            ) * destinationPlanet.kPosMax * PlanetTools.CHUNCKSIZE));
            console.log("altitudeMap " + (destinationPlanet.generator.altitudeMap.getForSide(
                Side.Top,
                destinationPlanet.generator.altitudeMap.size * 0.5,
                destinationPlanet.generator.altitudeMap.size * 0.5,
            )))
            console.log("generator size " + (destinationPlanet.generator.altitudeMap.size));
            console.log("destination altitude " + destinationAltitude);
            console.log("destination kposMax " + destinationPlanet.kPosMax);
            let destinationPoint = BABYLON.Vector3.Up().scale(destinationAltitude).add(destinationPlanet.position);
            let flightPlan = FlyTool.CreateFlightPlan(this.mainMenuPanel.main.cameraManager.player.position, this.mainMenuPanel.main.planets[0], destinationPoint, destinationPlanet);
            console.log(flightPlan);
            FlyTool.ShowFlightPlan(flightPlan, this.mainMenuPanel.scene);
            FlyTool.Fly(flightPlan, this.mainMenuPanel.main.cameraManager.player, this.mainMenuPanel.main.scene);
        }
        this.holoSlika.add(buttonGo);

        /*
        let buttonKillChunckManagers = new SlikaButton(
            "K",
            new SPosition(80, 270),
            SlikaButtonState.Red,
            100,
            100,
            80
        );
        buttonKillChunckManagers.onPointerUp = () => {
            this.mainMenuPanel.main.planets.forEach(p => {
                p.chunckManager.dispose();
            });
        }
        this.holoSlika.add(buttonKillChunckManagers);
        */

        this.elements.push(title1, buttonLeft, buttonRight, this.planetNameElement, planetImage, this.planetDescElement, buttonBack, buttonGo);
    }

    public async updateCurrentPlanetIndex(left?: boolean): Promise<void> {
        this.planetDescElement.animateAlpha(0, 0.3);
        await this.planetNameElement.animatePosX(left ? 1500 : 0, 0.3);
        this.planetDescElement.prop.text = this.planetDescriptions[this.currentPlanetIndex];
        this.planetNameElement.prop.text = "id: " + this.planetNames[this.currentPlanetIndex];
        this.planetNameElement.prop.x = left ? - 500 : 1500;
        this.planetDescElement.animateAlpha(1, 0.3);
        await this.planetNameElement.animatePosX(500, 0.3);
    }
}