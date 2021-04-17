/// <reference path="../lib/babylon.d.ts"/>
class Game {

	public static Instance: Game;
	public static Canvas: HTMLCanvasElement;
	public static Engine: BABYLON.Engine;
	public static Scene: BABYLON.Scene;
	public static Camera: BABYLON.Camera;
	public static Light: BABYLON.HemisphericLight;
	public static Sky: BABYLON.Mesh;
	public static PlanetEditor: PlanetEditor;

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

		Game.Camera = new BABYLON.FreeCamera(
			"Camera",
			BABYLON.Vector3.Zero(),
			Game.Scene
		);
		Game.Camera.minZ = 0.1;

		Game.Light = new BABYLON.HemisphericLight(
			"light",
			new BABYLON.Vector3(0, 1, 0),
			Game.Scene
		);

		Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
		Game.Light.specular = new BABYLON.Color3(1, 1, 1);
		Game.Light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);

		Game.CreateSky();
	}

	public static CreateSky(): void {
		Game.Sky = BABYLON.MeshBuilder.CreateBox(
			"Sky",
			{ size: 1000, sideOrientation: 1 },
			Game.Scene
		);
		Game.Sky.material = SharedMaterials.SkyMaterial();
	}

	public static AnimateSky(): void {
		Game.Sky.rotation.x += 0.0001;
		Game.Sky.rotation.y += 0.0001;
		Game.Sky.rotation.z += 0.0001;
	}

	public static AnimateWater(): void {
		(SharedMaterials.WaterMaterial().diffuseTexture as BABYLON.Texture).uOffset += 0.005;
		(SharedMaterials.WaterMaterial().diffuseTexture as BABYLON.Texture).vOffset += 0.005;
	}

	public static AnimateLight(): void {
		Game.Light.direction = Player.Instance.position;
	}

	animate(): void {
		Game.Engine.runRenderLoop(() => {
			Game.Scene.render();
			PlanetChunck.InitializeLoop();
			Game.AnimateSky();
			Game.AnimateWater();
			Game.AnimateLight();
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

	let planetTest: Planet = new Planet("Paulita", 2);

	new Player(new BABYLON.Vector3(0, 64, 0), planetTest);

	planetTest.AsyncInitialize();

	Game.PlanetEditor = new PlanetEditor(planetTest);
	Game.PlanetEditor.initialize();
	
	game.animate();

	Game.Canvas.addEventListener("pointerup", (event: MouseEvent) => {
		if (!Game.LockedMouse) {
			Game.LockMouse(event);
		}
	});

	document.addEventListener("pointermove", (event: MouseEvent) => {
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
