var Game = (function () {
    function Game(canvasElement) {
        this._cameraTarget = BABYLON.Vector3.Zero();
        Game.Instance = this;
        this._canvas = document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true);
    }
    Game.prototype.getCanvas = function () {
        return this._canvas;
    };
    Game.prototype.getScene = function () {
        return this._scene;
    };
    Game.prototype.CameraTargetAdd = function (vector) {
        this._cameraTarget = this._cameraTarget.add(vector);
        this._camera.setTarget(this._cameraTarget);
    };
    Game.prototype.getCamera = function () {
        return this._camera;
    };
    Game.prototype.createScene = function () {
        this._scene = new BABYLON.Scene(this._engine);
        this._camera = new BABYLON.ArcRotateCamera("camera", 1, 0.8, 45, new BABYLON.Vector3(0, 0, 0), this._scene);
        this._camera.setTarget(Game.Instance._cameraTarget);
        this._camera.attachControl(this._canvas, false);
        this._camera.wheelPrecision = 10;
        this._light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this._scene);
        this._light.diffuse = new BABYLON.Color3(1, 1, 1);
        this._light.specular = new BABYLON.Color3(1, 1, 1);
    };
    Game.prototype.animate = function () {
        var _this = this;
        this._engine.runRenderLoop(function () {
            _this._scene.render();
        });
        window.addEventListener("resize", function () {
            _this._engine.resize();
        });
    };
    return Game;
}());
window.addEventListener("DOMContentLoaded", function () {
    var game = new Game("renderCanvas");
    game.createScene();
    game.animate();
    var planetChunckTest = new PlanetSide(Side.Right, 32);
    planetChunckTest = new PlanetSide(Side.Left, 32);
    planetChunckTest = new PlanetSide(Side.Front, 32);
    planetChunckTest = new PlanetSide(Side.Back, 32);
    planetChunckTest = new PlanetSide(Side.Top, 32);
    planetChunckTest = new PlanetSide(Side.Bottom, 32);
    var center = BABYLON.Mesh.CreateBox("box", 1, Game.Instance.getScene());
    center.position = new BABYLON.Vector3(0, 0, 0);
    var right = BABYLON.Mesh.CreateBox("box1", 1, Game.Instance.getScene());
    right.position = new BABYLON.Vector3(3, 0, 0);
    var front = BABYLON.Mesh.CreateBox("box2", 1, Game.Instance.getScene());
    front.position = new BABYLON.Vector3(0, 0, 3);
    var top = BABYLON.Mesh.CreateBox("box3", 1, Game.Instance.getScene());
    top.position = new BABYLON.Vector3(0, 3, 0);
});
