class Main {
	public canvas: HTMLCanvasElement;
	public static Engine: BABYLON.Engine;
	public engine: BABYLON.Engine;
	public static Scene: BABYLON.Scene;
    public scene: BABYLON.Scene;

    constructor(canvasElement: string) {
		this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
		Main.Engine = new BABYLON.Engine(this.canvas, true);
        this.engine = Main.Engine;
		BABYLON.Engine.ShadersRepository = "./shaders/";
		console.log(Main.Engine.webGLVersion);
	}

    public createScene(): void {
		Main.Scene = new BABYLON.Scene(Main.Engine);
		this.scene = Main.Scene;
		this.scene.clearColor.copyFromFloats(166 / 255, 231 / 255, 255 / 255, 1);
        this.scene.autoClearDepthAndStencil = false
	}

	public animate(): void {
		Main.Engine.runRenderLoop(() => {
			this.scene.render();
			this.update();
		});

		window.addEventListener("resize", () => {
			Main.Engine.resize();
		});
	}

    public async initialize(): Promise<void> {

    }

    public update(): void {

    }
}

window.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded " + window.location.href);
    if (window.location.href.indexOf("planet-toy.html") != -1) {
        let planetToy: PlanetToy = new PlanetToy("renderCanvas");
        planetToy.createScene();
        planetToy.initialize().then(() => {
            planetToy.animate();
        });
    }
    else {
        let game: Game = new Game("renderCanvas");
        game.createScene();
        game.initialize().then(() => {
            game.animate();
        });
    }
});