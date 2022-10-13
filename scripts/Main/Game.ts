/// <reference path="../../lib/babylon.d.ts"/>
/// <reference path="Main.ts"/>

class Game extends Main {

	public static ShowDebugPlanetHeightMap: boolean = false;
	public static DebugLodDistanceFactor: number = 100;

	public static Instance: Game;
	public static Light: BABYLON.HemisphericLight;
	public static PlanetEditor: PlanetEditor;
	public static CameraManager: CameraManager;
	public static Player: Player;
	public player: Player;
	public chunckManager: PlanetChunckManager;
	public planetSky: PlanetSky;

	public static LockedMouse: boolean = false;
	public static ClientXOnLock: number = -1;
	public static ClientYOnLock: number = -1;

	public fpsGraphElement: DebugDisplayFrameValue;
	public meshesInfoTotalElement: HTMLDivElement; 
	public meshesInfoNonStaticUniqueElement: HTMLDivElement;
	public meshesInfoStaticUniqueElement: HTMLDivElement;
	public meshesInfoNonStaticInstanceElement: HTMLDivElement;
	public meshesInfoStaticInstanceElement: HTMLDivElement;

	constructor(canvasElement: string) {
		super(canvasElement);
		Game.Instance = this;
	}

	public createScene(): void {
		super.createScene();

		Game.Light = new BABYLON.HemisphericLight(
			"light",
			new BABYLON.Vector3(0.6, 1, 0.3),
			Game.Scene
		);

		Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
		Game.Light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);

		Game.CameraManager = new CameraManager();
		
		this.fpsGraphElement = document.getElementById("frame-rate") as DebugDisplayFrameValue;
		this.meshesInfoTotalElement = document.getElementById("meshes-info-total") as HTMLDivElement;
		this.meshesInfoNonStaticUniqueElement = document.getElementById("meshes-info-nonstatic-unique") as HTMLDivElement;
		this.meshesInfoStaticUniqueElement = document.getElementById("meshes-info-static-unique") as HTMLDivElement;
		this.meshesInfoNonStaticInstanceElement = document.getElementById("meshes-info-nonstatic-instance") as HTMLDivElement;
		this.meshesInfoStaticInstanceElement = document.getElementById("meshes-info-static-instance") as HTMLDivElement;
	}

	public initialize(): void {
		this.chunckManager = new PlanetChunckManager(Game.Scene);

		let kPosMax = 10;
		let planetTest: Planet = new Planet("Paulita", kPosMax, this.chunckManager);

		planetTest.generator = new PlanetGeneratorEarth(planetTest, 0.60, 0.1);
		//planetTest.generator = new PlanetGeneratorDebug4(planetTest);
		let r = kPosMax * PlanetTools.CHUNCKSIZE * 0.7;
		document.querySelector("#planet-surface").textContent = (4 * Math.PI * r * r / 1000 / 1000).toFixed(2) + " km²"
		//planetTest.generator.showDebug();

		Game.Player = new Player(new BABYLON.Vector3(0, (kPosMax + 1) * PlanetTools.CHUNCKSIZE * 0.8, 0), planetTest);
		this.player = Game.Player;
		
		Game.Player.registerControl();
		this.chunckManager.onNextInactive(() => {
			Game.Player.initialize();
		})

		Game.PlanetEditor = new PlanetEditor(planetTest);
		//Game.PlanetEditor.initialize();

		//Game.Plane = new Plane(new BABYLON.Vector3(0, 80, 0), planetTest);
		//Game.Plane.instantiate();

		//Game.CameraManager.plane = Game.Plane;
		Game.CameraManager.player = Game.Player;
		Game.CameraManager.setMode(CameraMode.Player);

		//planetTest.AsyncInitialize();

		this.planetSky = new PlanetSky();
		this.planetSky.setInvertLightDir((new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
		this.planetSky.initialize(Game.Scene);

		PlanetChunckVertexData.InitializeData().then(
			() => {
				this.chunckManager.initialize();
				planetTest.register();

				//let debugPlanetSkyColor = new DebugPlanetSkyColor(this);
				//debugPlanetSkyColor.show();

				//let debugTerrainColor = new DebugTerrainColor();
				//debugTerrainColor.show();

				let debugPlayerPosition = new DebugPlayerPosition(this);
				debugPlayerPosition.show();
			}
		)
		
		this.animate();

		Game.Canvas.addEventListener("pointerup", (event: MouseEvent) => {
			if (Game.CameraManager.cameraMode === CameraMode.Sky) {
				return;
			}
			if (!Game.LockedMouse) {
				Game.LockMouse(event);
			}
		});

		document.addEventListener("pointermove", (event: MouseEvent) => {
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
	}

	public update(): void {
		this.fpsGraphElement.addValue(Game.Engine.getFps());
		let uniques = Game.Scene.meshes.filter(m => { return !(m instanceof BABYLON.InstancedMesh); });
		let uniquesNonStatic = uniques.filter(m => { return !m.isWorldMatrixFrozen; });
		let uniquesStatic = uniques.filter(m => { return m.isWorldMatrixFrozen; });
		let instances = Game.Scene.meshes.filter(m => { return m instanceof BABYLON.InstancedMesh; });
		let instancesNonStatic = instances.filter(m => { return !m.isWorldMatrixFrozen; });
		let instancesStatic = instances.filter(m => { return m.isWorldMatrixFrozen; });
		this.meshesInfoTotalElement.innerText = Game.Scene.meshes.length.toFixed(0).padStart(4, "0");
		this.meshesInfoNonStaticUniqueElement.innerText = uniquesNonStatic.length.toFixed(0).padStart(4, "0");
		this.meshesInfoStaticUniqueElement.innerText = uniquesStatic.length.toFixed(0).padStart(4, "0");
		this.meshesInfoNonStaticInstanceElement.innerText = instancesNonStatic.length.toFixed(0).padStart(4, "0");
		this.meshesInfoStaticInstanceElement.innerText = instancesStatic.length.toFixed(0).padStart(4, "0");
	}

	public static LockMouse(event: MouseEvent): void {
		if (Game.LockedMouse) {
			console.log("No need to lock.");
			return;
		}

		Game.Canvas.requestPointerLock =
		Game.Canvas.requestPointerLock ||
		Game.Canvas.msRequestPointerLock ||
		Game.Canvas.mozRequestPointerLock ||
		Game.Canvas.webkitRequestPointerLock;

		if (Game.Canvas.requestPointerLock) {
			Game.Canvas.requestPointerLock();
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
