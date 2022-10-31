/// <reference path="../../lib/babylon.d.ts"/>
/// <reference path="Main.ts"/>

class Demo extends Main {

	public static DEBUG_INSTANCE: Demo;

	public light: BABYLON.HemisphericLight;
	public chunckManager: PlanetChunckManager;
	public planetSky: PlanetSky;
	public player: Player;
	public inputManager: InputManager;
	public cameraManager: CameraManager;

	public inputMode: InputMode = InputMode.Unknown;
	public headPad: PlayerInputHeadPad;
	public movePad: PlayerInputMovePad;

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
		this.cameraManager.arcRotateCamera.lowerRadiusLimit = 100;
		this.cameraManager.arcRotateCamera.upperRadiusLimit = 140;
	}

	public path: BABYLON.Vector3[] = [];

    public async initialize(): Promise<void> {
		return new Promise<void>(resolve => {

			this.chunckManager = new PlanetChunckManager(this.scene);

			let kPosMax = 5;
			let planetTest: Planet = new Planet("Paulita", kPosMax, this.chunckManager);
			window["PlanetTest"] = planetTest;

			planetTest.generator = new PlanetGeneratorChaos(planetTest, 0.60, 0.1);

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
							let target: BABYLON.Vector3;
							if (this.cameraManager.cameraMode === CameraMode.Sky) {
								this.player.position.copyFrom(this.cameraManager.absolutePosition);
							}
							this.player.animatePos(p, 1, target);
							this.cameraManager.setMode(CameraMode.Player);
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
			})

			PlanetChunckVertexData.InitializeData().then(
				() => {
					this.chunckManager.initialize();
					this.player.initialize();
					this.player.registerControl();
					planetTest.register();

					resolve();
				}
			);

			this.canvas.addEventListener("pointerup", (event: MouseEvent) => {
				if (this.cameraManager.cameraMode === CameraMode.Sky) {
					return;
				}
				this.setInputMode(InputMode.Mouse);
			});
		})
	}

	public setInputMode(newInputMode: InputMode): void {
		if (newInputMode != this.inputMode) {
			this.inputMode = newInputMode;
			if (this.inputMode === InputMode.Touch) {
				this.movePad = new PlayerInputMovePad(this.player);
				this.movePad.connectInput(true);

				this.headPad = new PlayerInputHeadPad(this.player);
				this.headPad.connectInput(false);
			}
			else {
				if (this.movePad) {
					this.movePad.disconnect();
				}
				if (this.headPad) {
					this.headPad.disconnect();
				}
			}
			return;
		}
	}

	public update(): void {
		
	}
}
