class Main {
	public static Canvas: HTMLCanvasElement;
	public static Engine: BABYLON.Engine;
	public static Scene: BABYLON.Scene;
    public scene: BABYLON.Scene;

    constructor(canvasElement: string) {
		Main.Canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
		Main.Engine = new BABYLON.Engine(Main.Canvas, true);
		BABYLON.Engine.ShadersRepository = "./shaders/";
		console.log(Main.Engine.webGLVersion);
	}

    public createScene(): void {
		Main.Scene = new BABYLON.Scene(Main.Engine);
		this.scene = Main.Scene;
		Main.Scene.actionManager = new BABYLON.ActionManager(Main.Scene);
		Main.Scene.clearColor.copyFromFloats(166 / 255, 231 / 255, 255 / 255, 1);
	}

	public animate(): void {

		Game.Engine.runRenderLoop(() => {
			Game.Scene.render();
			this.update();
		});

		window.addEventListener("resize", () => {
			Game.Engine.resize();
		});
	}

    public update(): void {

    }
}

window.addEventListener("DOMContentLoaded", () => {
	let game: Game = new Game("renderCanvas");
	game.createScene();
	game.initialize();
});