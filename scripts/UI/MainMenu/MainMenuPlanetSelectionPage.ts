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
    public locationImage: SlikaImage;

    constructor(mainMenuPanel: MainMenuPanel) {
        super(mainMenuPanel);

        this.targetTitleHeight = 150;

        let title1 = this.holoSlika.add(new SlikaText({
            text: "PLANET SELECTION",
            x: 500,
            y: 110,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
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
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        })) as SlikaText;

        let planetImage = this.holoSlika.add(new SlikaImage(
            new SPosition(370, 520),
            250, 
            250,
            "datas/images/planet.png"
        ));

        this.locationImage = this.holoSlika.add(new SlikaImage(
            new SPosition(260, 390),
            80, 
            80,
            "datas/images/location.png"
        )) as SlikaImage;

        this.planetDescElement = new SlikaTextBox({
            text: this.planetDescriptions[this.currentPlanetIndex],
            x: 540,
            y: 370,
            w: 220,
            h: 300,
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
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
            this.mainMenuPanel.animateTitleHeight(this.mainMenuPanel.pages[2].targetTitleHeight, 1);
            this.mainMenuPanel.showPage(2);
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
            let destinationPlanet = this.mainMenuPanel.main.currentGalaxy.planets[this.currentPlanetIndex];
            if (this.mainMenuPanel.main.cameraManager.player.planet != destinationPlanet) {
                let randomPosition = new BABYLON.Vector3(
                    Math.random(),
                    Math.random(),
                    Math.random(),
                ).normalize();
                let planetSide = PlanetTools.PlanetPositionToPlanetSide(destinationPlanet, randomPosition);
                let global = PlanetTools.PlanetDirectionToGlobalIJ(planetSide, randomPosition);
                let destinationAltitude = PlanetTools.KGlobalToAltitude(Math.floor(destinationPlanet.generator.altitudeMap.getForSide(
                    planetSide.side,
                    global.i,
                    global.j,
                ) * destinationPlanet.kPosMax * PlanetTools.CHUNCKSIZE));
                let destinationPoint = randomPosition.normalize().scale(destinationAltitude + 1).add(destinationPlanet.position);
                let flightPlan = FlyTool.CreateFlightPlan(this.mainMenuPanel.main.cameraManager.player.position, this.mainMenuPanel.main.cameraManager.player.planet, destinationPoint, destinationPlanet);
                //FlyTool.ShowWaypoints(flightPlan.waypoints, this.mainMenuPanel.scene);
                FlyTool.Fly(flightPlan, this.mainMenuPanel.main.cameraManager.player, this.mainMenuPanel.main.scene);
            }
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
            this.mainMenuPanel.main.currentGalaxy.planets.forEach(p => {
                p.chunckManager.dispose();
            });
        }
        this.holoSlika.add(buttonKillChunckManagers);
        */

        this.elements.push(title1, buttonLeft, buttonRight, this.planetNameElement, planetImage, this.locationImage, this.planetDescElement, buttonBack, buttonGo);
    }
    
    public async show(duration: number): Promise<void> {
        let planet = this.mainMenuPanel.main.currentGalaxy.planets[this.currentPlanetIndex];
        if (this.mainMenuPanel.main.cameraManager.player && this.mainMenuPanel.main.cameraManager.player.planet === planet) {
            this.locationImage.display = true;
        }
        else {
            this.locationImage.display = false;
        }
        this.planetNames = this.mainMenuPanel.main.currentGalaxy.planets.map(p => { return p.name; });
        this.planetDescriptions = this.mainMenuPanel.main.currentGalaxy.planets.map(p => { return "\n- radius " + p.seaAltitude.toFixed(0) + "m\n- type " + p.generator.type + "\n" });
        this.planetDescElement.prop.text = this.planetDescriptions[this.currentPlanetIndex];
        this.planetNameElement.prop.text = "id: " + this.planetNames[this.currentPlanetIndex];
        /*"\n- radius : 623m\n\n- type : dry\n\n- moons : 0"*/
        return super.show(duration);
    }

    public async updateCurrentPlanetIndex(left?: boolean): Promise<void> {
        let planet = this.mainMenuPanel.main.currentGalaxy.planets[this.currentPlanetIndex];
        if (this.mainMenuPanel.main.cameraManager.player && this.mainMenuPanel.main.cameraManager.player.planet === planet) {
            this.locationImage.display = true;
            this.locationImage.animateSize(1, 0.3);
        }
        else {
            this.locationImage.display = true;
            this.locationImage.animateSize(0, 0.3);
        }
        this.planetDescElement.animateAlpha(0, 0.3);
        await this.planetNameElement.animatePosX(left ? 1500 : 0, 0.3);
        this.planetDescElement.prop.text = this.planetDescriptions[this.currentPlanetIndex];
        this.planetNameElement.prop.text = "id: " + this.planetNames[this.currentPlanetIndex];
        this.planetNameElement.prop.x = left ? - 500 : 1500;
        this.planetDescElement.animateAlpha(1, 0.3);
        await this.planetNameElement.animatePosX(500, 0.3);
    }
}