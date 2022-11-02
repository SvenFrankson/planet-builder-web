/// <reference path="../../lib/babylon.d.ts"/>
/// <reference path="Main.ts"/>

class Demo extends Main {

	public static DEBUG_INSTANCE: Demo;

	public light: BABYLON.HemisphericLight;
	public planetSky: PlanetSky;
	public player: Player;
	public inputManager: InputManager;
	public cameraManager: CameraManager;

	public planets: Planet[] = [];

	public inputMode: InputMode = InputMode.Unknown;

	constructor(canvasElement: string) {
		super(canvasElement);
		Demo.DEBUG_INSTANCE = this;
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
		
		this.cameraManager = new CameraManager(this);
		this.cameraManager.arcRotateCamera.lowerRadiusLimit = 90;
		this.cameraManager.arcRotateCamera.upperRadiusLimit = 350;
	}

	public path: BABYLON.Vector3[] = [];

    public async initialize(): Promise<void> {
		return new Promise<void>(resolve => {

			let kPosMax = 5;
			let planetTest: Planet = new Planet("Paulita", kPosMax, this.scene);
			planetTest.generator = new PlanetGeneratorChaos(planetTest, 0.60, 0.15);
			planetTest.initialize();
			let moon: Planet = new Planet("Moon", 2, this.scene);
			moon.generator = new PlanetGeneratorChaos(moon, 0.60, 0.15);
			moon.position.x = 120;
			moon.initialize();

			this.planets = [planetTest, moon];

			window["PlanetTest"] = planetTest;

			//let p = new BABYLON.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().scaleInPlace((kPosMax + 1) * PlanetTools.CHUNCKSIZE * 0.75);
			//planetTest.generator = new PlanetGeneratorHole(planetTest, 0.60, 0.15, p, 40);
			//planetTest.generator.showDebug();

			this.planetSky = new PlanetSky();
			this.planetSky.setInvertLightDir((new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
			this.planetSky.initialize(this.scene);

			this.player = new Player(new BABYLON.Vector3(0, (kPosMax + 1) * PlanetTools.CHUNCKSIZE * 0.8, 0), planetTest, this);
			this.cameraManager.player = this.player;
			this.player.lockInPlace = true;

			this.inputManager = new InputManager();
			this.inputManager.initialize();
            
            let debugPlanetPerf = new DebugPlanetPerf(this);
            debugPlanetPerf.show();

			this.scene.onPointerObservable.add((eventData: BABYLON.PointerInfo) => {
				if (eventData.type === BABYLON.PointerEventTypes.POINTERDOUBLETAP) {
					if (eventData.pickInfo.hit) {
						let p = eventData.pickInfo.pickedPoint;
						if (isFinite(p.x)) {
							p = p.add(BABYLON.Vector3.Normalize(p).scale(1));
							let target: BABYLON.Vector3;
							if (this.cameraManager.cameraMode === CameraMode.Sky) {
								this.player.position.copyFrom(this.cameraManager.absolutePosition);
							}
							this.player.animatePos(p, 1, target);
							this.cameraManager.setMode(CameraMode.Player);
							(document.querySelector("#sky-view") as HTMLDivElement).style.display = "flex";
							(document.querySelector("#ground-view") as HTMLDivElement).style.display = "none";
						}
						else {
							debugger;
						}
					}
				}
				else if (eventData.type === BABYLON.PointerEventTypes.POINTERDOWN) {
					Game.LockedMouse = true;
				}
				else if (eventData.type === BABYLON.PointerEventTypes.POINTERUP) {
					Game.LockedMouse = false;
				}
			});

			document.querySelector("#sky-view").addEventListener("pointerdown", () => {
				this.cameraManager.setMode(CameraMode.Sky);
				(document.querySelector("#sky-view") as HTMLDivElement).style.display = "none";
				(document.querySelector("#ground-view") as HTMLDivElement).style.display = "flex";
			});
			(document.querySelector("#sky-view") as HTMLDivElement).style.display = "none";

			PlanetChunckVertexData.InitializeData().then(
				() => {
					this.player.initialize();
					this.player.registerControl();
					planetTest.register();
					moon.register();

					resolve();
				}
			);

			this.canvas.addEventListener("pointerup", (event: MouseEvent) => {
				if (this.cameraManager.cameraMode === CameraMode.Sky) {
					return;
				}
				this.inputMode = InputMode.Mouse;
			});
		})
	}

	public update(): void {
		
	}
}
