/// <reference path="../lib/babylon.d.ts"/>
class Game {

	public static ShowDebugPlanetHeightMap: boolean = false;
	public static DebugLodDistanceFactor: number = 100;

	public static Instance: Game;
	public static Canvas: HTMLCanvasElement;
	public static Engine: BABYLON.Engine;
	public static Scene: BABYLON.Scene;
	public static Light: BABYLON.HemisphericLight;
	public static Sky: BABYLON.Mesh;
	public static PlanetEditor: PlanetEditor;
	public static CameraManager: CameraManager;
	public static Player: Player;
	public static Plane: Plane;

	public static LockedMouse: boolean = false;
	public static ClientXOnLock: number = -1;
	public static ClientYOnLock: number = -1;

	constructor(canvasElement: string) {
		Game.Instance = this;
		Game.Canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
		Game.Engine = new BABYLON.Engine(Game.Canvas, true);
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
		Game.Light.groundColor = new BABYLON.Color3(0.1, 0.1, 0.1);

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
		let meshesInfoTotalElement = document.getElementById("meshes-info-total");
		let meshesInfoNonStaticUniqueElement = document.getElementById("meshes-info-nonstatic-unique");
		let meshesInfoStaticUniqueElement = document.getElementById("meshes-info-static-unique");
		let meshesInfoNonStaticInstanceElement = document.getElementById("meshes-info-nonstatic-instance");
		let meshesInfoStaticInstanceElement = document.getElementById("meshes-info-static-instance");

		Game.Engine.runRenderLoop(() => {
			Game.Scene.render();
			PlanetChunck.InitializeLoop();
			Game.AnimateWater();
			
			fpsInfoElement.innerText = Game.Engine.getFps().toFixed(0) + " fps";
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

	let planetTest: Planet = new Planet("Paulita", 4);

	let heightMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(4), 50, 5);
	let heightMap4 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(4), 50, 15, {
		firstNoiseDegree: 1,
		postComputation: (v) => {
			let delta = Math.abs(50 - v);
			if (delta > 2) {
				return 1;
			}
			return 4 - delta;
		}
	});
	heightMap.substractInPlace(heightMap4);
	let heightMap5 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(4), 50, 15, {
		firstNoiseDegree: 4,
		postComputation: (v) => {
			if (v > 60) {
				return (v - 60) * 1.5;
			}
			return 1;
		}
	});
	heightMap.addInPlace(heightMap5);
	
	planetTest.generator = new PlanetGeneratorChaos(planetTest);

	Game.Player = new Player(new BABYLON.Vector3(10, 60, 0), planetTest);
	Game.Player.registerControl();

	Game.PlanetEditor = new PlanetEditor(planetTest);
	//Game.PlanetEditor.initialize();

	Game.Plane = new Plane(new BABYLON.Vector3(0, 80, 0), planetTest);
	Game.Plane.instantiate();

	Game.CameraManager.plane = Game.Plane;
	Game.CameraManager.player = Game.Player;

	Game.CameraManager.setMode(CameraMode.Player);

	planetTest.AsyncInitialize();
	
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
