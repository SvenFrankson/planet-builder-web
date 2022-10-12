/// <reference path="../lib/babylon.d.ts"/>
class Game {

	public static ShowDebugPlanetHeightMap: boolean = false;
	public static DebugLodDistanceFactor: number = 100;

	public static Instance: Game;
	public static Canvas: HTMLCanvasElement;
	public static Engine: BABYLON.Engine;
	public static Scene: BABYLON.Scene;
	public static Light: BABYLON.HemisphericLight;
	public static PlanetEditor: PlanetEditor;
	public static CameraManager: CameraManager;
	public static Player: Player;
	public chunckManager: PlanetChunckManager;
	public planetSky: PlanetSky;

	public static LockedMouse: boolean = false;
	public static ClientXOnLock: number = -1;
	public static ClientYOnLock: number = -1;

	constructor(canvasElement: string) {
		Game.Instance = this;
		Game.Canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
		Game.Engine = new BABYLON.Engine(Game.Canvas, true);
		BABYLON.Engine.ShadersRepository = "./shaders/";
		console.log(Game.Engine.webGLVersion);
	}

	public createScene(): void {
		Game.Scene = new BABYLON.Scene(Game.Engine);
		Game.Scene.actionManager = new BABYLON.ActionManager(Game.Scene);
		Game.Scene.clearColor.copyFromFloats(166 / 255, 231 / 255, 255 / 255, 1);

		Game.Light = new BABYLON.HemisphericLight(
			"light",
			new BABYLON.Vector3(0.6, 1, 0.3),
			Game.Scene
		);

		Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
		Game.Light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);

		Game.CameraManager = new CameraManager();

		/*
		let water = BABYLON.MeshBuilder.CreateSphere("water", { diameter: 78 - 0.4 }, Game.Scene);
		let waterMaterial = new BABYLON.StandardMaterial("water-material", Game.Scene);
		waterMaterial.diffuseColor.copyFromFloats(0.1, 0.5, 0.9);
		waterMaterial.alpha = 0.5;
		water.material = waterMaterial;
		*/
	}

	public static AnimateWater(): void {
		(SharedMaterials.WaterMaterial().diffuseTexture as BABYLON.Texture).uOffset += 0.005;
		(SharedMaterials.WaterMaterial().diffuseTexture as BABYLON.Texture).vOffset += 0.005;
	}

	animate(): void {
		let fpsInfoElement = document.getElementById("fps-info");
		let fpsGraphElement = document.getElementById("frame-rate") as DebugDisplayFrameValue;
		let meshesInfoTotalElement = document.getElementById("meshes-info-total");
		let meshesInfoNonStaticUniqueElement = document.getElementById("meshes-info-nonstatic-unique");
		let meshesInfoStaticUniqueElement = document.getElementById("meshes-info-static-unique");
		let meshesInfoNonStaticInstanceElement = document.getElementById("meshes-info-nonstatic-instance");
		let meshesInfoStaticInstanceElement = document.getElementById("meshes-info-static-instance");

		Game.Engine.runRenderLoop(() => {
			Game.Scene.render();
			//PlanetChunck.InitializeLoop();
			Game.AnimateWater();
			
			fpsGraphElement.addValue(Game.Engine.getFps());
			let uniques = Game.Scene.meshes.filter(m => { return !(m instanceof BABYLON.InstancedMesh); });
			let uniquesNonStatic = uniques.filter(m => { return !m.isWorldMatrixFrozen; });
			let uniquesStatic = uniques.filter(m => { return m.isWorldMatrixFrozen; });
			let instances = Game.Scene.meshes.filter(m => { return m instanceof BABYLON.InstancedMesh; });
			let instancesNonStatic = instances.filter(m => { return !m.isWorldMatrixFrozen; });
			let instancesStatic = instances.filter(m => { return m.isWorldMatrixFrozen; });
			meshesInfoTotalElement.innerText = Game.Scene.meshes.length.toFixed(0).padStart(4, "0");
			meshesInfoNonStaticUniqueElement.innerText = uniquesNonStatic.length.toFixed(0).padStart(4, "0");
			meshesInfoStaticUniqueElement.innerText = uniquesStatic.length.toFixed(0).padStart(4, "0");
			meshesInfoNonStaticInstanceElement.innerText = instancesNonStatic.length.toFixed(0).padStart(4, "0");
			meshesInfoStaticInstanceElement.innerText = instancesStatic.length.toFixed(0).padStart(4, "0");
		});

		window.addEventListener("resize", () => {
			Game.Engine.resize();
		});
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

window.addEventListener("DOMContentLoaded", () => {
	let game: Game = new Game("renderCanvas");
	game.createScene();

	game.chunckManager = new PlanetChunckManager(Game.Scene);

	let kPosMax = 10;
	let planetTest: Planet = new Planet("Paulita", kPosMax, game.chunckManager);

	planetTest.generator = new PlanetGeneratorEarth(planetTest, 0.60, 0.1);
	//planetTest.generator = new PlanetGeneratorDebug4(planetTest);
	let r = kPosMax * PlanetTools.CHUNCKSIZE * 0.7;
	document.querySelector("#planet-surface").textContent = (4 * Math.PI * r * r / 1000 / 1000).toFixed(2) + " km²"
	//planetTest.generator.showDebug();

	Game.Player = new Player(new BABYLON.Vector3(0, (kPosMax + 1) * PlanetTools.CHUNCKSIZE * 0.8, 0), planetTest);
	
	Game.Player.registerControl();
	game.chunckManager.onNextInactive(() => {
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

	game.planetSky = new PlanetSky();
	game.planetSky.setInvertLightDir((new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
	game.planetSky.initialize(Game.Scene);

	PlanetChunckVertexData.InitializeData().then(
		() => {
			game.chunckManager.initialize();
			planetTest.register();

			let debugPlanetSkyColor = new DebugPlanetSkyColor(game);
			debugPlanetSkyColor.show();

			let debugTerrainColor = new DebugTerrainColor();
			debugTerrainColor.show();
		}
	)
	
	game.animate();

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
});
