var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Player = (function (_super) {
    __extends(Player, _super);
    function Player(position, planet) {
        var _this = _super.call(this, "Player", Game.Scene) || this;
        _this.speed = 5;
        _this.underWater = false;
        console.log("Create Player");
        _this.planet = planet;
        _this.position = position;
        _this.rotationQuaternion = BABYLON.Quaternion.Identity();
        _this.camPos = new BABYLON.Mesh("Dummy", Game.Scene);
        _this.camPos.parent = _this;
        _this.camPos.position = new BABYLON.Vector3(0, 0, 0);
        Game.Camera.parent = _this.camPos;
        _this.RegisterControl();
        Player.Instance = _this;
        return _this;
    }
    Player.Position = function () {
        return Player.Instance.position;
    };
    Player.prototype.PositionLeg = function () {
        var posLeg = this.position.add(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix()).multiply(MeshTools.FloatVector(-1)));
        return posLeg;
    };
    Player.prototype.PositionHead = function () {
        return this.position;
    };
    Player.prototype.RegisterControl = function () {
        var _this = this;
        var scene = Game.Scene;
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (event) {
            if ((event.sourceEvent.key === "z") || (event.sourceEvent.key === "w")) {
                _this.forward = true;
            }
            if (event.sourceEvent.key === "s") {
                _this.back = true;
            }
            if ((event.sourceEvent.key === "q") || (event.sourceEvent.key === "a")) {
                _this.left = true;
            }
            if (event.sourceEvent.key === "d") {
                _this.right = true;
            }
            if (event.sourceEvent.keyCode === 32) {
                _this.fly = true;
            }
        }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (event) {
            if ((event.sourceEvent.key === "z") || (event.sourceEvent.key === "w")) {
                _this.forward = false;
            }
            if (event.sourceEvent.key === "s") {
                _this.back = false;
            }
            if ((event.sourceEvent.key === "q") || (event.sourceEvent.key === "a")) {
                _this.left = false;
            }
            if (event.sourceEvent.key === "d") {
                _this.right = false;
            }
            if (event.sourceEvent.keyCode === 32) {
                _this.fly = false;
            }
        }));
        Game.Canvas.addEventListener("mousemove", function (event) {
            if (Game.LockedMouse) {
                var movementX = event.movementX;
                var movementY = event.movementY;
                if (movementX > 20) {
                    movementX = 20;
                }
                if (movementX < -20) {
                    movementX = -20;
                }
                if (movementY > 20) {
                    movementY = 20;
                }
                if (movementY < -20) {
                    movementY = -20;
                }
                var rotationPower = movementX / 500;
                var localY = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, Player.Instance.getWorldMatrix());
                var rotation = BABYLON.Quaternion.RotationAxis(localY, rotationPower);
                Player.Instance.rotationQuaternion = rotation.multiply(Player.Instance.rotationQuaternion);
                var rotationCamPower = movementY / 500;
                Player.Instance.camPos.rotation.x += rotationCamPower;
                Player.Instance.camPos.rotation.x = Math.max(Player.Instance.camPos.rotation.x, -Math.PI / 2);
                Player.Instance.camPos.rotation.x = Math.min(Player.Instance.camPos.rotation.x, Math.PI / 2);
            }
        });
    };
    Player.WaterFilter = function () {
        if (Player.Instance) {
            if (Player.Instance.position.lengthSquared() < Player.Instance.planet.GetTotalRadiusWaterSquared()) {
                Game.Light.diffuse = new BABYLON.Color3(0.5, 0.5, 1);
                Player.Instance.underWater = true;
            }
            else {
                Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
                Player.Instance.underWater = false;
            }
        }
    };
    Player.GetMovin = function () {
        var deltaTime = Game.Engine.getDeltaTime();
        $("#delta-time").text(deltaTime.toPrecision(2) + "");
        if (!Player.Instance) {
            return;
        }
        if (Player.Instance.forward) {
            if (Player.CanGoSide(BABYLON.Axis.Z)) {
                var localZ = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Z, Player.Instance.getWorldMatrix());
                Player.Instance.position.addInPlace(localZ.multiply(MeshTools.FloatVector(deltaTime / 1000 * Player.Instance.speed)));
            }
        }
        if (Player.Instance.back) {
            if (Player.CanGoSide(BABYLON.Axis.Z.multiply(MeshTools.FloatVector(-1)))) {
                var localZ = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Z, Player.Instance.getWorldMatrix());
                Player.Instance.position.addInPlace(localZ.multiply(MeshTools.FloatVector(-deltaTime / 1000 * Player.Instance.speed)));
            }
        }
        if (Player.Instance.right) {
            if (Player.CanGoSide(BABYLON.Axis.X)) {
                var localX = BABYLON.Vector3.TransformNormal(BABYLON.Axis.X, Player.Instance.getWorldMatrix());
                Player.Instance.position.addInPlace(localX.multiply(MeshTools.FloatVector(deltaTime / 1000 * Player.Instance.speed)));
            }
        }
        if (Player.Instance.left) {
            if (Player.CanGoSide(BABYLON.Axis.X.multiply(MeshTools.FloatVector(-1)))) {
                var localX = BABYLON.Vector3.TransformNormal(BABYLON.Axis.X, Player.Instance.getWorldMatrix());
                Player.Instance.position.addInPlace(localX.multiply(MeshTools.FloatVector(-deltaTime / 1000 * Player.Instance.speed)));
            }
        }
    };
    Player.StillStanding = function () {
        if (!Player.Instance) {
            return;
        }
        var currentUp = BABYLON.Vector3.Normalize(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, Player.Instance.getWorldMatrix()));
        var targetUp = BABYLON.Vector3.Normalize(Player.Instance.position);
        var correctionAxis = BABYLON.Vector3.Cross(currentUp, targetUp);
        var correctionAngle = Math.abs(Math.asin(correctionAxis.length()));
        if (Player.Instance.fly) {
            if (Player.CanGoUp()) {
                Player.Instance.position.addInPlace(targetUp.multiply(MeshTools.FloatVector(0.05)));
            }
        }
        else {
            var gravity = Player.DownRayCast();
            if (gravity !== 0) {
                var gravityFactor = 0.1;
                if (Player.Instance.underWater) {
                    gravityFactor = 0.02;
                }
                Player.Instance.position.addInPlace(targetUp.multiply(MeshTools.FloatVector(gravity * gravityFactor)));
            }
        }
        if (correctionAngle > 0.001) {
            var rotation = BABYLON.Quaternion.RotationAxis(correctionAxis, correctionAngle / 5);
            Player.Instance.rotationQuaternion = rotation.multiply(Player.Instance.rotationQuaternion);
        }
    };
    Player.DownRayCast = function () {
        var pos = Player.Instance.position;
        var dir = BABYLON.Vector3.Normalize(BABYLON.Vector3.Zero().subtract(Player.Instance.position));
        var ray = new BABYLON.Ray(pos, dir, 1.6);
        var hit = Game.Scene.pickWithRay(ray, function (mesh) {
            return !(mesh instanceof Water);
        });
        if (!hit.pickedPoint) {
            return -1;
        }
        var d = hit.pickedPoint.subtract(pos).length();
        if (d < 1.5) {
            return 1;
        }
        return 0;
    };
    Player.CanGoSide = function (axis) {
        var localAxis = BABYLON.Vector3.TransformNormal(axis, Player.Instance.getWorldMatrix());
        var ray = new BABYLON.Ray(Player.Instance.PositionLeg(), localAxis, 0.6);
        var hit = Game.Scene.pickWithRay(ray, function (mesh) {
            return !(mesh instanceof Water);
        });
        if (hit.pickedPoint) {
            return false;
        }
        ray = new BABYLON.Ray(Player.Instance.PositionHead(), localAxis, 0.6);
        hit = Game.Scene.pickWithRay(ray, function (mesh) {
            return !(mesh instanceof Water);
        });
        if (hit.pickedPoint) {
            return false;
        }
        return true;
    };
    Player.CanGoUp = function () {
        var localAxis = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, Player.Instance.getWorldMatrix());
        var ray = new BABYLON.Ray(Player.Instance.PositionHead(), localAxis, 0.6);
        var hit = Game.Scene.pickWithRay(ray, function (mesh) {
            return !(mesh instanceof Water);
        });
        if (hit.pickedPoint) {
            return false;
        }
        return true;
    };
    return Player;
}(BABYLON.Mesh));
