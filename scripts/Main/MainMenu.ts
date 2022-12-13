/// <reference path="../../lib/babylon.d.ts"/>

class MainMenu extends Main {

	public player: Player;
	public planetSky: PlanetSky;
	private _testAltitude = 20.7;

	public createScene(): void {
		super.createScene();

		let light = new BABYLON.HemisphericLight(
			"light",
			new BABYLON.Vector3(0.6, 1, 0.3),
			this.scene
		);
		light.diffuse = new BABYLON.Color3(1, 1, 1);
		light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);

		this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
	}

	private _textPage: HoloPanel;

    public async initialize(): Promise<void> {
		await super.initialize();

		Config.chunckPartConfiguration.setFilename("round-smooth-chunck-parts", false);
		Config.chunckPartConfiguration.setLodMin(0);
		Config.chunckPartConfiguration.setLodMax(2);
		Config.chunckPartConfiguration.useXZAxisRotation = false;

		let confPreset = window.localStorage.getItem("graphic-setting-preset");
		if (confPreset === ConfigurationPreset.Low) {
			Config.setConfLowPreset();
		}
		else if (confPreset === ConfigurationPreset.Medium) {
			Config.setConfMediumPreset();
		}
		else if (confPreset === ConfigurationPreset.High) {
			Config.setConfHighPreset();
		}
		else {
			window.localStorage.setItem("graphic-setting-preset", ConfigurationPreset.None);
		}

		return new Promise<void>(resolve => {

			//let testGrab = new TestGrab("test-grab", this);
			//testGrab.position = new BABYLON.Vector3(- 0.3, this._testAltitude + 1.1, - 0.1);
			//testGrab.instantiate();
			
			let mainMenuPlanet: Planet = PlanetGeneratorFactory.Create(BABYLON.Vector3.Zero(), PlanetGeneratorType.Moon, 2, this.scene);
			mainMenuPlanet.instantiate();
			this.planets = [mainMenuPlanet];
			
			let dir = new BABYLON.Vector3(
				Math.random() - 0.5,
				Math.random() - 0.5,
				Math.random() - 0.5
			);
			dir.copyFromFloats(0, 1, 0);
			let side = PlanetTools.PlanetPositionToPlanetSide(mainMenuPlanet, dir);
			console.log(side);
			let globalIJK = PlanetTools.PlanetDirectionToGlobalIJK(mainMenuPlanet, dir);
			console.log(globalIJK);
			let pos = PlanetTools.GlobalIJKToPlanetPosition(side, globalIJK);
			console.log(pos.toString());

			let mainPanel = new MainMenuPanel(100, this);
			mainPanel.instantiate();
			mainPanel.register();
			mainPanel.planet = mainMenuPlanet;
			mainPanel.setPosition(pos);
			mainPanel.setTarget(new BABYLON.Vector3(0, 1.7 + this._testAltitude, - 0.8));
			mainPanel.open();
			
			//let cubeTest = BABYLON.MeshBuilder.CreateBox("cube-test");
			//cubeTest.position.copyFrom(pos);

			pos = pos.clone();
			let l = pos.length();
			pos.scaleInPlace((l + 1) / l);
			this.player = new Player(pos, this);
			this.cameraManager.player = this.player;
			this.cameraManager.setMode(CameraMode.Player);

            let debugPlanetPerf = new DebugPlanetPerf(this, true);
            debugPlanetPerf.show();

			let debugPlayerPosition = new DebugPlayerPosition(this.player);
			debugPlayerPosition.show();

			this.planetSky = new PlanetSky(this.scene);
			this.planetSky.setInvertLightDir((new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
			this.planetSky.initialize();
			this.planetSky.player = this.player;

			PlanetChunckVertexData.InitializeData().then(
				() => {

					this.generatePlanets();

					this.planets.forEach(p => {
						p.register();
					});
					
					this.inputManager.initialize(this.player);
					
					this.player.initialize();
					this.player.registerControl();
					//moon.register();

					resolve();
				}
			);
		})
	}

	public update(): void {
		
	}

	public async generatePlanets(): Promise<void> {
		let orbitCount = 3;
		let orbitRadius = 200;
		let alpha = 0;
		for (let i = 0; i < orbitCount; i++) {
			alpha += Math.PI * 0.5 + Math.PI * Math.random();
			let kPosMax = Math.floor(3 + 12 * Math.random());
			let planet: Planet = PlanetGeneratorFactory.Create(new BABYLON.Vector3(Math.cos(alpha) * orbitRadius * (i + 1), 0, Math.sin(alpha) * orbitRadius * (i + 1)), Math.floor(Math.random() * 2 + 1), kPosMax, this.scene);
			planet.instantiate();
			this.planets.push(planet);
		}
	}
}
