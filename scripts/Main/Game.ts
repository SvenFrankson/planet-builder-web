/// <reference path="../../lib/babylon.d.ts"/>

enum InputMode {
	Unknown,
	Mouse,
	Touch
}

class Game extends Main {

	public static ShowDebugPlanetHeightMap: boolean = false;
	public static DebugLodDistanceFactor: number = 100;

	public static Instance: Game;
	public static Light: BABYLON.HemisphericLight;
	public static PlanetEditor: PlanetEditor;
	public static CameraManager: CameraManager;
	public cameraManager: CameraManager;
	public static Player: Player;
	public player: Player;
	public actionManager: PlayerActionManager;
	public planetSky: PlanetSky;
	public inputManager: InputManager;

	public planets: Planet[] = [];

	public inputMode: InputMode = InputMode.Unknown;
	public headPad: PlayerInputHeadPad;
	public movePad: PlayerInputMovePad;
	public actionButton: PlayerInputVirtualButton;
	public static LockedMouse: boolean = false;
	public static ClientXOnLock: number = -1;
	public static ClientYOnLock: number = -1;

	constructor(canvasElement: string) {
		super(canvasElement);
		Game.Instance = this;
	}

	public createScene(): void {
		super.createScene();

		Game.Light = new BABYLON.HemisphericLight(
			"light",
			new BABYLON.Vector3(0.6, 1, 0.3),
			this.scene
		);

		Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
		Game.Light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);

		Game.CameraManager = new CameraManager(this);
		this.cameraManager = Game.CameraManager;
	}

    public async initialize(): Promise<void> {
		Config.chunckPartConfiguration.filename = "round-smooth-chunck-parts";
		Config.chunckPartConfiguration.lodMin = 0;
		Config.chunckPartConfiguration.lodMax = 1;
		Config.chunckPartConfiguration.useXZAxisRotation = false;

		return new Promise<void>(resolve => {
			let kPosMax = 7;
			let planetTest: Planet = PlanetGeneratorFactory.Create(PlanetGeneratorType.Earth, kPosMax, this.scene);
			planetTest.initialize();
			window["PlanetTest"] = planetTest;

			Game.Player = new Player(new BABYLON.Vector3(0, (kPosMax + 1) * PlanetTools.CHUNCKSIZE * 0.8, 0), planetTest, this);
			this.player = Game.Player;

			this.inputManager = new InputManager();
			this.inputManager.initialize();

			this.actionManager = new PlayerActionManager(this.player, this);
			this.actionManager.initialize();
			let ass = async () => {
				let slotIndex = 1;
				for (let i = BlockType.Grass; i < BlockType.Unknown; i++) {
					this.actionManager.linkAction(await PlayerActionTemplate.CreateBlockAction(this.player, i), slotIndex);
					slotIndex++;
				}
			}
			ass();
			
			this.player.registerControl();

			Game.PlanetEditor = new PlanetEditor(planetTest);
			//Game.PlanetEditor.initialize();

			//Game.Plane = new Plane(new BABYLON.Vector3(0, 80, 0), planetTest);
			//Game.Plane.instantiate();

			//Game.CameraManager.plane = Game.Plane;
			Game.CameraManager.player = this.player;
			Game.CameraManager.setMode(CameraMode.Player);

			//planetTest.AsyncInitialize();

			this.planetSky = new PlanetSky();
			this.planetSky.setInvertLightDir((new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
			this.planetSky.initialize(this.scene);

			PlanetChunckVertexData.InitializeData().then(
				() => {
					planetTest.register();
					
					this.player.initialize();

					let debugPlanetPerf = new DebugPlanetPerf(this);
					debugPlanetPerf.show();

					//let debugPlanetSkyColor = new DebugPlanetSkyColor(this);
					//debugPlanetSkyColor.show();

					let debugTerrainColor = new DebugTerrainColor();
					debugTerrainColor.show();

					let debugPlayerPosition = new DebugPlayerPosition(this);
					debugPlayerPosition.show();

					resolve();
				}
			)

			this.canvas.addEventListener("pointerup", (event: MouseEvent) => {
				if (Game.CameraManager.cameraMode === CameraMode.Sky) {
					return;
				}
				if (event["pointerType"] === "mouse") {
					this.setInputMode(InputMode.Mouse);
					if (!Game.LockedMouse) {
						Game.LockMouse(event);
					}
				}
			});

			this.canvas.addEventListener("touchstart", (event: MouseEvent) => {
				this.setInputMode(InputMode.Touch);
			});

			document.addEventListener("mousemove", (event: MouseEvent) => {
				if (Game.CameraManager.cameraMode === CameraMode.Sky) {
					return;
				}
				if (Game.LockedMouse) {
					if (event.clientX !== Game.ClientXOnLock) {
						Game.UnlockMouse();
					}
					else if (event.clientY !== Game.ClientYOnLock) {
						Game.UnlockMouse();
					}
				}
			});
		})
	}

	public update(): void {
		
	}

	public setInputMode(newInputMode: InputMode): void {
		if (newInputMode != this.inputMode) {
			this.inputMode = newInputMode;
			if (this.inputMode === InputMode.Touch) {
				this.movePad = new PlayerInputMovePad(this.player);
				this.movePad.connectInput(true);

				this.headPad = new PlayerInputHeadPad(this.player);
				this.headPad.connectInput(false);

				this.actionButton = new PlayerInputVirtualButton(this.player);
				this.actionButton.connectInput(() => {
					if (this.player.currentAction) {
						if (this.player.currentAction.onClick) {
							this.player.currentAction.onClick();
						}
					}
				});
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

	public static LockMouse(event: MouseEvent): void {
		if (Game.LockedMouse) {
			console.log("No need to lock.");
			return;
		}

		Game.Instance.canvas.requestPointerLock =
		Game.Instance.canvas.requestPointerLock ||
		Game.Instance.canvas.msRequestPointerLock ||
		Game.Instance.canvas.mozRequestPointerLock ||
		Game.Instance.canvas.webkitRequestPointerLock;

		if (Game.Instance.canvas.requestPointerLock) {
			Game.Instance.canvas.requestPointerLock();
			Game.LockedMouse = true;
			Game.ClientXOnLock = event.clientX;
			Game.ClientYOnLock = event.clientY;
			console.log("Lock");
		}
	}

	public static UnlockMouse(): void {
		if (!Game.LockMouse) {
			return;
		}
		document.exitPointerLock();
		Game.LockedMouse = false;
		console.log("Unlock");
	}
}
