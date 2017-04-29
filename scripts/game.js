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
        Game.Camera.setTarget(this._cameraTarget);
    };
    Game.prototype.createScene = function () {
        this._scene = new BABYLON.Scene(this._engine);
        Game.Camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI, 150, new BABYLON.Vector3(0, 0, 0), this._scene);
        Game.Camera.attachControl(this._canvas, false);
        Game.Camera.wheelPrecision = 10;
        this._light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this._scene);
        this._light.diffuse = new BABYLON.Color3(1, 1, 1);
        this._light.specular = new BABYLON.Color3(1, 1, 1);
    };
    Game.prototype.animate = function () {
        var _this = this;
        this._engine.runRenderLoop(function () {
            _this._scene.render();
            PlanetChunck.InitializeLoop();
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
    var planetTest = new Planet("paulita", 64);
    planetTest.AsyncInitialize();
});
