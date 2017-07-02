var Game = (function () {
    function Game(canvasElement) {
        Game.Instance = this;
        Game.Canvas = document.getElementById(canvasElement);
        Game.Engine = new BABYLON.Engine(Game.Canvas, true);
    }
    Game.prototype.createScene = function () {
        Game.Scene = new BABYLON.Scene(Game.Engine);
        Game.Scene.actionManager = new BABYLON.ActionManager(Game.Scene);
        Game.Camera = new BABYLON.FreeCamera("Camera", BABYLON.Vector3.Zero(), Game.Scene);
        Game.Camera.minZ = 0.1;
        Game.Light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), Game.Scene);
        Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
        Game.Light.specular = new BABYLON.Color3(1, 1, 1);
        Game.Light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        Game.CreateSky();
    };
    Game.CreateSky = function () {
        Game.Sky = BABYLON.MeshBuilder.CreateBox("Sky", { size: 1000, sideOrientation: 1 }, Game.Scene);
        Game.Sky.material = SharedMaterials.SkyMaterial();
    };
    Game.AnimateSky = function () {
        Game.Sky.rotation.x += 0.0001;
        Game.Sky.rotation.y += 0.0001;
        Game.Sky.rotation.z += 0.0001;
    };
    Game.AnimateWater = function () {
        if (SharedMaterials.WaterMaterial().diffuseTexture instanceof BABYLON.Texture) {
            SharedMaterials.WaterMaterial().diffuseTexture.uOffset += 0.005;
            SharedMaterials.WaterMaterial().diffuseTexture.vOffset += 0.005;
        }
    };
    Game.AnimateLight = function () {
        Game.Light.direction = Player.Instance.position;
    };
    Game.UpdateFPS = function () {
        $("#fps-count").text(Game.Engine.getFps().toPrecision(2));
    };
    Game.prototype.animate = function () {
        Game.Engine.runRenderLoop(function () {
            Game.Scene.render();
            PlanetChunck.InitializeLoop();
            Player.StillStanding();
            Player.GetMovin();
            Game.AnimateSky();
            Game.AnimateWater();
            Game.AnimateLight();
            Player.WaterFilter();
            Game.UpdateFPS();
        });
        window.addEventListener("resize", function () {
            Game.Engine.resize();
            Game.SetCursorPosition();
        });
    };
    Game.LockMouse = function (event) {
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
    };
    Game.UnlockMouse = function () {
        if (!Game.LockMouse) {
            return;
        }
        document.exitPointerLock();
        Game.LockedMouse = false;
        console.log("Unlock");
    };
    Game.SetCursorPosition = function () {
        $("#cursor").css("top", $("#cursor").parent().height() / 2 - $("#cursor").height() / 2);
        $("#cursor").css("left", $("#cursor").parent().width() / 2 - $("#cursor").width() / 2);
    };
    return Game;
}());
Game.LockedMouse = false;
Game.ClientXOnLock = -1;
Game.ClientYOnLock = -1;
window.addEventListener("DOMContentLoaded", function () {
    var game = new Game("renderCanvas");
    game.createScene();
    game.animate();
    Game.SetCursorPosition();
    PlanetEditor.RegisterControl();
    var planetTest = new Planet("Paulita", 3);
    new Player(new BABYLON.Vector3(0, 128, 0), planetTest);
    planetTest.AsyncInitialize();
    Game.Canvas.addEventListener("mouseup", function (event) {
        if (!Game.LockedMouse) {
            Game.LockMouse(event);
        }
        else {
            PlanetEditor.OnClick(planetTest);
        }
    });
    document.addEventListener("mousemove", function (event) {
        if (Game.LockedMouse) {
            if (event.clientX !== Game.ClientXOnLock) {
                Game.UnlockMouse();
            }
            else if (event.clientY !== Game.ClientYOnLock) {
                Game.UnlockMouse();
            }
        }
    });
    $("#camera-fov").val(Game.Camera.fov.toPrecision(3));
    $("#camera-fov").on("change", function (e) {
        if (e.target instanceof HTMLInputElement) {
            Game.Camera.fov = parseFloat(e.target.value);
        }
    });
    $("#camera-fov-reset").on("click", function () {
        Game.Camera.fov = 0.8;
        $("#camera-fov").val("0.8");
    });
});
