/// <reference path="../../lib/babylon.d.ts"/>

class MainMenu extends Main {

	public player: Player;
	public planetSky: PlanetSky;
	public skybox: BABYLON.Mesh;
	public tutorialManager: TutorialManager;
	public wristWatch: WristWatch;

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

		//Config.chunckPartConfiguration.setFilename("round-smooth-chunck-parts", false);
		//Config.chunckPartConfiguration.useXZAxisRotation = false;
		//Config.chunckPartConfiguration.setLodMin(0);
		//Config.chunckPartConfiguration.setLodMax(1);
		Config.chunckPartConfiguration.setFilename("chunck-parts", false);
		Config.chunckPartConfiguration.useXZAxisRotation = true;
		Config.chunckPartConfiguration.setLodMin(0);
		Config.chunckPartConfiguration.setLodMax(2);

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
			if (Config.saveConfiguration.useLocalStorage) {
				window.localStorage.setItem("graphic-setting-preset", ConfigurationPreset.None);
			}
		}

		return new Promise<void>(resolve => {

			this.tutorialManager = new TutorialManager(this);
			
			this.skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 6000 / Math.sqrt(3) }, Main.Scene);
			this.skybox.rotation.y = Math.PI / 2;
			let skyboxMaterial: BABYLON.StandardMaterial = new BABYLON.StandardMaterial("skyBox", Main.Scene);
			skyboxMaterial.backFaceCulling = false;
			let skyTexture = new BABYLON.CubeTexture(
				"./datas/skyboxes/dark",
				Main.Scene,
				["-px.png", "-py.png", "-pz.png", "-nx.png", "-ny.png", "-nz.png"]);
			skyboxMaterial.reflectionTexture = skyTexture;
			skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
			skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
			skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
			this.skybox.material = skyboxMaterial;

			//let testGrab = new TestGrab("test-grab", this);
			//testGrab.position = new BABYLON.Vector3(- 0.3, this._testAltitude + 1.1, - 0.1);
			//testGrab.instantiate();
			
			this.universe = new Universe();
			this.currentGalaxy = new Galaxy(this.universe);
			
			let mainMenuPlanet: Planet = PlanetGeneratorFactory.Create(this.currentGalaxy, BABYLON.Vector3.Zero(), PlanetGeneratorType.Earth, 8, this);
			mainMenuPlanet.instantiate();
			//mainMenuPlanet.generator.showDebug();
			
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

            let debugPlanetPerf = new DebugPlanetPerf(this, true);
            debugPlanetPerf.show();

			/*
			let debugPlayerPosition = new DebugPlayerPosition(this.player);
			debugPlayerPosition.show();

			let debugInput = new DebugInput(this.player);
			debugInput.show();
			*/

			this.planetSky = new PlanetSky(this.skybox, this.scene);
			this.planetSky.setInvertLightDir(BABYLON.Vector3.One().normalize());
			this.planetSky.initialize();
			this.planetSky.player = this.player;

			let mainPanel = new MainMenuPanel(100, this);
			mainPanel.instantiate();
			mainPanel.register();
			mainPanel.planet = mainMenuPlanet;

			let workbench = new ModelingWorkbench(this);
			workbench.instantiate();
			workbench.register();
			workbench.planet = mainMenuPlanet;

			PlanetChunckVertexData.InitializeData().then(
				async () => {
					await VoxelVertexData.InitializeData();

					if (!DebugDefine.ONLY_START_PLANET) {
						this.generatePlanets();
					}

					this.currentGalaxy.planets.forEach(p => {
						p.register();
					});
					
					this.inputManager.initialize(this.player);
					
					this.onChunckManagerNotWorkingNear(async () => {
						await this.player.initialize();

						this.player.inventory = new Inventory(this.player);
						await this.player.inventory.initialize();
						
						let hud = new HeadUpDisplay(this.player, this);

						let wristWatch = new WristWatch(this.player, this);
						await wristWatch.instantiate();

						await hud.instantiate();

						this.player.playerActionManager = new PlayerActionManager(this.player, hud, this);
						this.player.playerActionManager.initialize();

						setTimeout(() => {
							let drider = new Drider(false, this.scene);
							let p = this.player.position.add(this.player.forward.scale(3));
							drider.planet = this.player.planet;
							drider.initialize();
							drider.instantiate();
							drider.forcePositionRotation(p);

							let aiManager = new AIDriderManager(drider, this.player);
							aiManager.initialize();

							setInterval(() => {
								aiManager.debugWalking = !aiManager.debugWalking
							}, 5000);
						}, 2000);

						if (DebugDefine.SKIP_MAINMENU_PANEL) {
							this.player.registerControl();
							hideLoading();
						}
						else {
							this.player.registerControlUIOnly();
	
							setTimeout(() => {
								hideLoading();
								setTimeout(() => {
									mainPanel.openAtPlayerPosition();
								}, 1000);
							}, 500);
						}
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
		this.skybox.position = this.scene.activeCameras[0].globalPosition;
	}

	public async generatePlanets(): Promise<void> {
		let orbitCount = 3;
		let orbitRadius = 500;
		let alpha = Math.PI / 2;
		for (let i = 0; i < orbitCount; i++) {
			let planet: Planet = PlanetGeneratorFactory.Create(this.currentGalaxy, new BABYLON.Vector3(Math.cos(alpha) * orbitRadius * (i + 1), 0, Math.sin(alpha) * orbitRadius * (i + 1)), i + 1, 6, this);
			//let planet: Planet = PlanetGeneratorFactory.Create(new BABYLON.Vector3(Math.cos(alpha) * orbitRadius * (i + 1), 0, Math.sin(alpha) * orbitRadius * (i + 1)), PlanetGeneratorType.Earth, kPosMax, this.scene);
			planet.instantiate();
			alpha += Math.PI * 0.5 + Math.PI * 0.8;
		}
	}
}
