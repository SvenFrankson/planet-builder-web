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
		let timers: number[];
        let logOutput: string;
        let useLog = DebugDefine.LOG_GLOBAL_START_TIME_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "main initialize starts at " + timers[0].toFixed(0) + " ms";
        }
		await super.initialize();
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\n  super.initialize executed in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
        }

		Config.chunckPartConfiguration.setFilename("round-smooth-chunck-parts", false);
		Config.chunckPartConfiguration.useXZAxisRotation = false;
		Config.chunckPartConfiguration.setLodMin(0);
		Config.chunckPartConfiguration.setLodMax(1);
		//Config.chunckPartConfiguration.useXZAxisRotation = false;

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
			
			let mainMenuPlanet: Planet = PlanetGeneratorFactory.Create(BABYLON.Vector3.Zero(), PlanetGeneratorType.Earth, 2, this.scene);
			mainMenuPlanet.instantiate();
			this.planets = [mainMenuPlanet];
			
			let dir = new BABYLON.Vector3(
				Math.random() - 0.5,
				Math.random() - 0.5,
				Math.random() - 0.5
			);
			dir.normalize();
			dir.copyFromFloats(0, 1, 0);
			let side = PlanetTools.PlanetPositionToPlanetSide(mainMenuPlanet, dir);
			let globalIJK = PlanetTools.PlanetDirectionToGlobalIJK(mainMenuPlanet, dir);
			let pos = PlanetTools.GlobalIJKToPlanetPosition(side, globalIJK);
			
			//let cubeTest = BABYLON.MeshBuilder.CreateBox("cube-test");
			//cubeTest.position.copyFrom(pos);

			pos = pos.clone();
			let l = pos.length();
			this.player = new Player(pos, this);
			this.cameraManager.player = this.player;
			this.cameraManager.setMode(CameraMode.Player);

			/*
            let debugPlanetPerf = new DebugPlanetPerf(this, true);
            debugPlanetPerf.show();

			let debugPlayerPosition = new DebugPlayerPosition(this.player);
			debugPlayerPosition.show();
			*/

			let debugInput = new DebugInput(this.player);
			debugInput.show();

			this.planetSky = new PlanetSky(this.scene);
			this.planetSky.setInvertLightDir(BABYLON.Vector3.One().normalize());
			this.planetSky.initialize();
			this.planetSky.player = this.player;

			let mainPanel = new MainMenuPanel(100, this);
			mainPanel.instantiate();
			mainPanel.register();
			mainPanel.planet = mainMenuPlanet;

			PlanetChunckVertexData.InitializeData().then(
				async () => {

					this.generatePlanets();

					this.planets.forEach(p => {
						p.register();
					});
					
					this.inputManager.initialize(this.player);
					
					this.onChunckManagerNotWorking(async () => {
						await this.player.initialize();
						this.player.registerControl();

						setTimeout(() => {
							hideLoading();
							//mainPanel.openAtPlayerPosition();
						}, 500);
					});
						
					//let debugAltimeter = new Altimeter3D(this.player);
					//debugAltimeter.instantiate();

					if (useLog) {
						timers.push(performance.now());
						logOutput += "initialize executed in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
						console.log(logOutput);
					}
					resolve();
				}
			);
		})
	}

	public update(): void {
		super.update();
	}

	public async generatePlanets(): Promise<void> {
		let orbitCount = 2;
		let orbitRadius = 500;
		let alpha = Math.PI / 2;
		for (let i = 0; i < orbitCount; i++) {
			let kPosMax = Math.floor(3 + 8 * Math.random());
			let planet: Planet = PlanetGeneratorFactory.Create(new BABYLON.Vector3(Math.cos(alpha) * orbitRadius * (i + 1), 0, Math.sin(alpha) * orbitRadius * (i + 1)), i + 1, kPosMax, this.scene);
			//let planet: Planet = PlanetGeneratorFactory.Create(new BABYLON.Vector3(Math.cos(alpha) * orbitRadius * (i + 1), 0, Math.sin(alpha) * orbitRadius * (i + 1)), PlanetGeneratorType.Earth, kPosMax, this.scene);
			planet.instantiate();
			this.planets.push(planet);
			alpha += Math.PI * 0.5 + Math.PI * Math.random();
		}
	}
}
