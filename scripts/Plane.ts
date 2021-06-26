class Plane extends BABYLON.Mesh {
    public static Instance: Plane;
    public static Position(): BABYLON.Vector3 {
        return Plane.Instance.position;
    }

    private mass: number = 1;
    public velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public alphaSpeed: number = 0;
    public pitchSpeed: number = 0;
    public rollSpeed: number = 0;

    public camTarget: BABYLON.Mesh;
    public camPosition: BABYLON.Mesh;

    private planet: Planet;
    public camPos: BABYLON.AbstractMesh;
    public pForward: boolean;
    public back: boolean;
    public pRight: boolean;
    public left: boolean;
    public fly: boolean;

    public planeMesh: BABYLON.Mesh;
    public leftEngine: BABYLON.Mesh;
    public leftEngineThrust: BABYLON.Mesh;
    public rightEngine: BABYLON.Mesh;
    public rightEngineThrust: BABYLON.Mesh;
    public landingGearMesh: BABYLON.Mesh;

    public lift: number = 0.05;

    public thrust: number = 0;
    public alpha: number = Math.PI / 4;
    //public targetAltitude: number = 60;
    public targetPitch: number = 0;
    public targetRoll: number = Math.PI / 8;
    public targetAirspeed: number = 0;

    public planeHud: PlaneHud;
    public xInput: number = 0;
    public yInput: number = 0;
    public throttleUpInput: boolean = false;
    public throttleDownInput: boolean = false;

    constructor(position: BABYLON.Vector3, planet: Planet) {
        super("Plane", Game.Scene);
        console.log("Create Plane");
        this.planet = planet;
        this.position = position;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        Plane.Instance = this;

        this.camPosition = new BABYLON.Mesh("cam-position", Game.Scene);

        this.camTarget = new BABYLON.Mesh("cam-target", Game.Scene);

        this.planeHud = new PlaneHud();
        this.planeHud.instantiate();
        this.planeHud.hide();

        Game.Scene.onBeforeRenderObservable.add(this._update);
    }

    public instantiate(): void {
        BABYLON.SceneLoader.ImportMesh("", "./resources/models/plane.babylon", "", Game.Scene, (meshes) => {
            this.planeMesh = meshes.find((m) => {
                return m.name === "plane";
            }) as BABYLON.Mesh;
            this.leftEngine = meshes.find((m) => {
                return m.name === "engine-left";
            }) as BABYLON.Mesh;
            this.rightEngine = meshes.find((m) => {
                return m.name === "engine-right";
            }) as BABYLON.Mesh;
            this.landingGearMesh = meshes.find((m) => {
                return m.name === "landing-gear";
            }) as BABYLON.Mesh;
            this.planeMesh.parent = this;
            this.leftEngine.parent = this;
            this.leftEngineThrust = BABYLON.MeshBuilder.CreateBox("left-engine-thrust", { size: 0.5 }, Game.Scene);
            this.leftEngineThrust.parent = this.leftEngine;
            this.rightEngine.parent = this;
            this.rightEngineThrust = BABYLON.MeshBuilder.CreateBox("right-engine-thrust", { size: 0.5 }, Game.Scene);
            this.rightEngineThrust.parent = this.rightEngine;
        });
    }

    public registerControl(): void {
        Game.Canvas.addEventListener("keydown", this._keyDown);
        Game.Canvas.addEventListener("keyup", this._keyUp);
        Game.Canvas.addEventListener("mousemove", this._mouseMove);
    }

    private _keyDown = (e: KeyboardEvent) => {
        if (e.code === "Space") {
            this.throttleUpInput = true;
        }
        if (e.code === "ControlLeft") {
            this.throttleDownInput = true;
        }
    }

    private _keyUp = (e: KeyboardEvent) => {
        if (e.code === "Space") {
            this.throttleUpInput = false;
        }
        if (e.code === "ControlLeft") {
            this.throttleDownInput = false;
        }
        if (e.code === "KeyX") {
            this.exit();
        }
    }

    private _mouseMove = (event: MouseEvent) => {
        if (Game.LockedMouse) {
            let movementX: number = event.movementX;
            let movementY: number = event.movementY;
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

            if (!isNaN(movementX)) {
                this.xInput += movementX / 200;
            }
            if (!isNaN(movementY)) {
                this.yInput += -movementY / 200;
            }

            this.xInput = Math.min(Math.max(this.xInput, -1), 1);
            this.yInput = Math.min(Math.max(this.yInput, -1), 1);

            let ll = this.xInput * this.xInput + this.yInput * this.yInput;
            if (ll > 1) {
                let l = Math.sqrt(ll);
                this.xInput /= l;
                this.yInput /= l;
            }
            this.planeHud.target.setAttribute("cx", (500 + this.xInput * 450).toFixed(0));
            this.planeHud.target.setAttribute("cy", (500 - this.yInput * 450).toFixed(0));
        }
    }

    public unregisterControl(): void {
        Game.Canvas.removeEventListener("keydown", this._keyDown);
        Game.Canvas.removeEventListener("keyup", this._keyUp);
        Game.Canvas.removeEventListener("mousemove", this._mouseMove);
    }

    public exit(): void {
        this.unregisterControl();
        Game.Player.registerControl();
        Game.CameraManager.setMode(CameraMode.Player);
    }

    private _gravityFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _groundFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _thrustYFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _thrustZFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _liftFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _rightDirection: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0);
    private _leftDirection: BABYLON.Vector3 = new BABYLON.Vector3(-1, 0, 0);
    private _upDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0);
    private _downDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, -1, 0);
    private _forwardDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1);
    private _backwardDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, -1);

    public planetRight: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0);
    public planetUp: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0);
    public planetForward: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1);

    private _feetPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _collisionAxis: BABYLON.Vector3[] = [];
    private _collisionPositions: BABYLON.Vector3[] = [];

    private _jumpTimer: number = 0;
    private _isGrounded: boolean = false;

    private _update = () => {
        if (Game.CameraManager.cameraMode != CameraMode.Plane) {
            return;
        }
        let deltaTime: number = Game.Engine.getDeltaTime() / 1000;

        this.planetUp.copyFrom(this.position).normalize();

        this.getDirectionToRef(BABYLON.Axis.X, this._rightDirection);
        this._leftDirection.copyFrom(this._rightDirection);
        this._leftDirection.scaleInPlace(-1);

        this.getDirectionToRef(BABYLON.Axis.Y, this._upDirection);
        this._downDirection.copyFrom(this._upDirection);
        this._downDirection.scaleInPlace(-1);

        this.getDirectionToRef(BABYLON.Axis.Z, this._forwardDirection);
        this._backwardDirection.copyFrom(this._forwardDirection);
        this._backwardDirection.scaleInPlace(-1);

        BABYLON.Vector3.CrossToRef(this.planetUp, this._forwardDirection, this.planetRight);
        BABYLON.Vector3.CrossToRef(this.planetRight, this.planetUp, this.planetForward);

        this.camPosition.position.copyFrom(this.position);
        //this.camPosition.position.addInPlace(this.planetRight.scale(25));
        this.camPosition.position.addInPlace(this.planetUp.scale(7));
        this.camPosition.position.addInPlace(this.planetForward.scale(-10));

        this.camTarget.position.copyFrom(this.position);
        this.camTarget.position.addInPlace(this.planetUp.scale(2));
        this.camTarget.position.addInPlace(this.planetForward.scale(2));

        // Add gravity and ground reaction.
        this._gravityFactor.copyFrom(this.planetUp).scaleInPlace(-this.mass * 9.8 * deltaTime);
        this._groundFactor.copyFromFloats(0, 0, 0);

        let ray: BABYLON.Ray = new BABYLON.Ray(this.position, this._downDirection, 1);
        let hit: BABYLON.PickingInfo = Game.Scene.pickWithRay(
            ray,
            (mesh: BABYLON.Mesh) => {
                return (mesh instanceof PlanetChunck);
            }
        );
        if (hit.pickedPoint) {
            let d: number = hit.pickedPoint.subtract(this.position).length();
            if (d > 0.01) {
                this._groundFactor.copyFrom(this._gravityFactor).scaleInPlace(- 1).scaleInPlace(Math.pow(1.5 / d, 1));
            }
        }

        this._thrustYFactor.copyFrom(this._upDirection).scaleInPlace(this.mass * Math.cos(this.alpha) * this.thrust * deltaTime);
        this._thrustZFactor.copyFrom(this._forwardDirection).scaleInPlace(this.mass * Math.sin(this.alpha) * this.thrust * deltaTime);

        if (!VMath.IsFinite(this._gravityFactor)) {
            debugger;
        }
        this.velocity.addInPlace(this._gravityFactor);
        this.velocity.addInPlace(this._groundFactor);
        if (!VMath.IsFinite(this._thrustYFactor)) {
            debugger;
        }
        this.velocity.addInPlace(this._thrustYFactor);
        if (!VMath.IsFinite(this._thrustZFactor)) {
            debugger;
        }
        this.velocity.addInPlace(this._thrustZFactor);

        // Add friction
        let downVelocity = this._downDirection.scale(BABYLON.Vector3.Dot(this.velocity, this._downDirection));
        if (!VMath.IsFinite(downVelocity)) {
            debugger;
        }
        this.velocity.subtractInPlace(downVelocity);
        downVelocity.scaleInPlace(Math.pow(0.5, deltaTime));
        this.velocity.scaleInPlace(Math.pow(0.01, deltaTime));
        if (!VMath.IsFinite(downVelocity)) {
            debugger;
        }
        this.velocity.addInPlace(downVelocity);

        //Plane.Instance.targetAltitude = Plane.Instance.targetAltitude + this.yInput * deltaTime;

        let vSpeed = BABYLON.Vector3.Dot(this.velocity, this.planetUp);
        //let deltaAltitude = this.position.length() + vSpeed * 2 - this.targetAltitude;
        let airspeed = BABYLON.Vector3.Dot(this.velocity, this._forwardDirection);
        let pitch = VMath.AngleFromToAround(this._upDirection, this.planetUp, this._rightDirection);
        if (isNaN(pitch)) {
            pitch = 0;
        }
        let roll = VMath.AngleFromToAround(this.planetUp, this._upDirection, this._forwardDirection);
        if (isNaN(roll)) {
            roll = 0;
        }

        this._liftFactor.copyFrom(this._upDirection).scaleInPlace(airspeed * this.lift * deltaTime);
        if (!VMath.IsFinite(this._liftFactor)) {
            debugger;
        }
        this.velocity.addInPlace(this._liftFactor);

        //let targetVSpeed: number = (this.targetAltitude - this.position.length()) * 0.5;
        let targetVSpeed = this.yInput * 5;
        if (this.throttleUpInput) {
            this.targetAirspeed += 2 * deltaTime;
        }
        else if (this.throttleDownInput) {
            this.targetAirspeed -= 2 * deltaTime;
        }
        this.targetAirspeed = Math.max(Math.min(this.targetAirspeed, 20), 0);

        this.targetPitch = 0;

        let tVS = 3;
        if (airspeed < 3) {
            tVS += 3 - airspeed;
        }

        if (vSpeed < targetVSpeed) {
            this.thrust += tVS * deltaTime;
        } else if (vSpeed > targetVSpeed) {
            this.thrust -= tVS * deltaTime;
        }

        let tAS = 3;
        if (airspeed > 3) {
            tAS += airspeed - 3;
        }
        if (airspeed < this.targetAirspeed) {
            this.thrust += tAS * deltaTime;
        } else if (airspeed > this.targetAirspeed) {
            this.thrust -= tAS * deltaTime;
        }

        this.thrust = Math.max(0.1, this.thrust);
        let cos = (Math.cos(pitch) * this.mass * 9.8 - this.targetAirspeed * this.lift) / this.thrust;
        cos = Math.max(Math.min(cos, 1), - 1);
        this.alpha = Math.acos(cos);
        this.alpha = Math.min(Math.max(this.alpha, (-3 * Math.PI) / 4), (3 * Math.PI) / 4);
        if (isNaN(this.alpha)) {
            debugger;
        }

        this.targetPitch = (Math.PI / 4) * this.yInput + 3 / 180 * Math.PI;
        if (this.targetAirspeed < 3) {
            this.targetPitch *= (this.targetAirspeed + 1) / 4;
        }

        let dPitch = pitch - this.targetPitch;
        this.pitchSpeed += dPitch * 10 * deltaTime;
        this.pitchSpeed *= Math.pow(0.1, deltaTime);
        this.rotationQuaternion = BABYLON.Quaternion.RotationAxis(this._rightDirection, this.pitchSpeed * deltaTime).multiply(this.rotationQuaternion);

        this.targetRoll = (-Math.PI / 4) * this.xInput;

        if (isFinite(roll)) {
            let dRoll = this.targetRoll - roll;
            this.rollSpeed += dRoll * 10 * deltaTime;
            this.rollSpeed *= Math.pow(0.1, deltaTime);
            this.rotationQuaternion = BABYLON.Quaternion.RotationAxis(this._forwardDirection, this.rollSpeed * deltaTime).multiply(this.rotationQuaternion);
            this.rotationQuaternion = BABYLON.Quaternion.RotationAxis(this._upDirection, -roll * 0.2 * Math.PI * deltaTime).multiply(this.rotationQuaternion);
        }

        let a2 = Math.asin((Math.sin(pitch) * this.mass * 9.8 + 0.01 * airspeed) / this.thrust);

        // Safety check.
        if (!VMath.IsFinite(this.velocity)) {
            debugger;
            this.velocity.copyFromFloats(-0.1 + 0.2 * Math.random(), -0.1 + 0.2 * Math.random(), -0.1 + 0.2 * Math.random());
        }
        this.position.addInPlace(this.velocity.scale(deltaTime));
        if (this.leftEngine) {
            this.leftEngine.rotation.x = this.alpha;
        }
        if (this.rightEngine) {
            this.rightEngine.rotation.x = this.alpha;
        }

        document.getElementById("plane-altitude").innerText = this.position.length().toFixed(1) + " m";
        document.getElementById("plane-airspeed").innerText = airspeed.toFixed(1) + " m/s";
        document.getElementById("plane-vspeed").innerText = vSpeed.toFixed(1) + " (" + targetVSpeed.toFixed(1) + ") m/s";
        document.getElementById("plane-pitch").innerText = (pitch / Math.PI * 180).toFixed(1) + " (" + (this.targetPitch / Math.PI * 180).toFixed(1) + ") °";
        document.getElementById("plane-roll").innerText = roll.toFixed(1) + " (" + this.targetRoll.toFixed(1) + ") °";
        document.getElementById("x-input").innerText = this.xInput.toFixed(4);
        document.getElementById("y-input").innerText = this.yInput.toFixed(4);

        if (this.leftEngineThrust) {
            this.leftEngineThrust.position.y = -this.thrust * 0.125;
            this.leftEngineThrust.scaling.y = this.thrust * 0.5;
        }
        if (this.rightEngineThrust) {
            this.rightEngineThrust.position.y = -this.thrust * 0.125;
            this.rightEngineThrust.scaling.y = this.thrust * 0.5;
        }
        this.planeHud.updateAirspeed(airspeed);
        this.planeHud.updateTargetAirspeed(this.targetAirspeed);
    };
}
