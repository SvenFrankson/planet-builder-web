class Main {
	public canvas: HTMLCanvasElement;
	public static Engine: BABYLON.Engine;
	public engine: BABYLON.Engine;
	public static Scene: BABYLON.Scene;
    public scene: BABYLON.Scene;
    public vertexDataLoader: VertexDataLoader;
	public inputManager: InputManager;

    constructor(canvasElement: string) {
		this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.msRequestPointerLock || this.canvas.mozRequestPointerLock || this.canvas.webkitRequestPointerLock;
		Main.Engine = new BABYLON.Engine(this.canvas, true);
        this.engine = Main.Engine;
		BABYLON.Engine.ShadersRepository = "./shaders/";
	}

    public createScene(): void {
		Main.Scene = new BABYLON.Scene(Main.Engine);
		this.scene = Main.Scene;
		this.scene.clearColor.copyFromFloats(166 / 255, 231 / 255, 255 / 255, 1);
        this.vertexDataLoader = new VertexDataLoader(this.scene);
        this.inputManager = new InputManager(this.canvas);
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
        this.inputManager.initialize();
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
    else if (window.location.href.indexOf("game.html") != -1) {
        let game: Game = new Game("renderCanvas");
        game.createScene();
        game.initialize().then(() => {
            game.animate();
        });
    }
    else if (window.location.href.indexOf("miniature.html") != -1) {
        let miniature: Miniature = new Miniature("renderCanvas");
        miniature.createScene();
        miniature.initialize().then(() => {
            miniature.animate();
        });
    }
    else if (window.location.href.indexOf("demo.html") != -1) {
        let demo: Demo = new Demo("renderCanvas");
        demo.createScene();
        demo.initialize().then(() => {
            demo.animate();
        });
    }
    else if (window.location.href.indexOf("chunck-test.html") != -1) {
        let chunckTest: ChunckTest = new ChunckTest("renderCanvas");
        chunckTest.createScene();
        chunckTest.initialize().then(() => {
            chunckTest.animate();
        });
    }
    else {
        let mainMenu: MainMenu = new MainMenu("renderCanvas");
        mainMenu.createScene();
        mainMenu.initialize().then(() => {
            mainMenu.animate();
        });
    }
});