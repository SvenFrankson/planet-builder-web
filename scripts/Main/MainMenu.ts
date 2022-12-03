/// <reference path="../../lib/babylon.d.ts"/>

class MainMenu extends Main {

	public player: Player;
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
		Config.chunckPartConfiguration.setLodMin(0, false);
		Config.chunckPartConfiguration.setLodMax(1);
		Config.chunckPartConfiguration.useXZAxisRotation = false;

		return new Promise<void>(resolve => {

			//let testGrab = new TestGrab("test-grab", this);
			//testGrab.position = new BABYLON.Vector3(- 0.3, this._testAltitude + 1.1, - 0.1);
			//testGrab.instantiate();
			
			let mainMenuPlanet: Planet = PlanetGeneratorFactory.Create(PlanetGeneratorType.Flat, 1, this.scene);
			mainMenuPlanet.initialize();
			this.planets = [mainMenuPlanet];

			let mainPanel = new MainMenuPanel(100, this);
			mainPanel.instantiate();
			mainPanel.setPosition(new BABYLON.Vector3(0, this._testAltitude, 0.2));
			mainPanel.setTarget(new BABYLON.Vector3(0, 1.7 + this._testAltitude, - 0.8));
			mainPanel.open();
			setTimeout(() => {
				mainPanel.holoSlika.needRedraw = true;
			}, 1000);
			
			this.player = new Player(new BABYLON.Vector3(0, 1.7 + this._testAltitude, - 0.8), mainMenuPlanet, this);
			this.cameraManager.player = this.player;
			this.cameraManager.setMode(CameraMode.Player);
            
            let debugPlanetPerf = new DebugPlanetPerf(this);
            debugPlanetPerf.show();

			PlanetChunckVertexData.InitializeData().then(
				() => {
					mainMenuPlanet.register();
					this.player.initialize();
					this.player.registerControl();
					//moon.register();

					resolve();
				}
			);

			resolve();
		})
	}

	public update(): void {
		
	}
}
