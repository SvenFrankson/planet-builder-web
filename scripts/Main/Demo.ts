/// <reference path="../../lib/babylon.d.ts"/>
/// <reference path="Main.ts"/>

class Demo extends Main {

	public light: BABYLON.HemisphericLight;
	public chunckManager: PlanetChunckManager;
	public planetSky: PlanetSky;
    public camera: BABYLON.ArcRotateCamera;

	constructor(canvasElement: string) {
		super(canvasElement);
	}

	public createScene(): void {
		super.createScene();

		this.light = new BABYLON.HemisphericLight(
			"light",
			new BABYLON.Vector3(0.6, 1, 0.3),
			this.scene
		);

		this.light.diffuse = new BABYLON.Color3(1, 1, 1);
		this.light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);

        this.camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 4, 10, BABYLON.Vector3.Zero());
        this.camera.radius = 400;
        this.camera.speed *= 0.2;
        this.camera.attachControl(this.canvas);
	}

    public async initialize(): Promise<void> {
		return new Promise<void>(resolve => {
			this.chunckManager = new PlanetChunckManager(this.scene);

			let kPosMax = 10;
			console.log("degree = " + PlanetTools.KPosToDegree(kPosMax));
			let planetTest: Planet = new Planet("Paulita", kPosMax, this.chunckManager);
			window["PlanetTest"] = planetTest;

			planetTest.generator = new PlanetGeneratorEarth(planetTest, 0.60, 0.1);

			this.planetSky = new PlanetSky();
			this.planetSky.setInvertLightDir((new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
			this.planetSky.initialize(this.scene);
            
            let debugPlanetPerf = new DebugPlanetPerf(this);
            debugPlanetPerf.show();

			PlanetChunckVertexData.InitializeData().then(
				() => {
					this.chunckManager.initialize();
					setTimeout(() => {
						planetTest.register();
					}, 1000);

					resolve();
				}
			)
		})
	}

	public update(): void {
		//let dt = this.engine.getDeltaTime() / 1000;
        //this.camera.alpha += dt * 2 * Math.PI / 120;
	}
}
