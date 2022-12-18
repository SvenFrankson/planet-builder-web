class Main {
	public canvas: HTMLCanvasElement;
	public static Engine: BABYLON.Engine;
	public engine: BABYLON.Engine;
	public static Scene: BABYLON.Scene;
    public scene: BABYLON.Scene;
    public vertexDataLoader: VertexDataLoader;
	public inputManager: InputManager;
	public cameraManager: CameraManager;

	public planets: Planet[] = [];
    private _chunckManagersWorkingTimer: number = 3
    public get chunckManagerWorking(): boolean {
        return this._chunckManagersWorkingTimer > 0;
    }
    private _onNextChunckManagerNotWorking: (() => void)[] = [];

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
        this.inputManager = new InputManager(this.scene, this.canvas);
		this.cameraManager = new CameraManager(this);
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
        if (this.planets.length > 0) {
            let checkIfReachesZero = false;
            if (this._chunckManagersWorkingTimer > 0) {
                checkIfReachesZero = true;
            }
    
            this._chunckManagersWorkingTimer = Math.max(this._chunckManagersWorkingTimer - 1, 0);
            let needRedrawCount = 0;
            for (let i = 0; i < this.planets.length; i++) {
                needRedrawCount += this.planets[i].chunckManager.needRedrawCount;
            }
            if (needRedrawCount > 0) {
                this._chunckManagersWorkingTimer = 3;
            }
            if (needRedrawCount > 10) {
                if (showLoading(false)) {
                    this._onNextChunckManagerNotWorking.push(() => { hideLoading(); });
                }
            }
    
            if (checkIfReachesZero && this._chunckManagersWorkingTimer <= 0) {
                while (this._onNextChunckManagerNotWorking.length > 0) {
                    this._onNextChunckManagerNotWorking.pop()();
                }
            }
        }
    }
    
    public onChunckManagerNotWorking(callback: () => void): void {
        if (!this.chunckManagerWorking) {
            callback();
        }
        else {
            this._onNextChunckManagerNotWorking.push(callback);
        }
    }
}

var loadingInterval: number;

function showLoading(darkBackground?: boolean): boolean {
    let loadingElement = document.getElementById("loading");
    if (loadingElement.style.display != "block") {
        console.log("showLoading " + darkBackground)
        if (darkBackground) {
            delete loadingElement.style.backgroundColor;
        }
        else {
            loadingElement.style.backgroundColor = "rgba(0, 0, 0, 0%)";
        }
        loadingElement.style.display = "block";
        let n = 0;
        clearInterval(loadingInterval);
        loadingInterval = setInterval(() => {
            for (let i = 0; i < 4; i++) {
                if (i === n) {
                    document.getElementById("load-" + i).style.display = "";
                }
                else {
                    document.getElementById("load-" + i).style.display = "none";
                }
            }
            n = (n + 1) % 4;
        }, 500);
        return true;
    }
    return false;
}

function hideLoading(): void {
    console.log("hideLoading");
    document.getElementById("loading").style.display = "none";
    clearInterval(loadingInterval);
}

window.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded " + window.location.href);
    showLoading(true);

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