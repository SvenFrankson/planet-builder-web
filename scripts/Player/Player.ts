class Player extends BABYLON.Mesh {

    private mass: number = 1;
    private speed: number = 5;
    public velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private underWater: boolean = false;
    public camPos: BABYLON.AbstractMesh;
    public inputForward: number = 0;
    public inputRight: number = 0;
    public inputHeadUp: number = 0;
    public inputHeadRight: number = 0;
    public godMode: boolean;

    constructor(position: BABYLON.Vector3, public planet: Planet, public game: Game) {
        super("Player", Game.Scene);
        this.planet = planet;
        this.position = position;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.camPos = new BABYLON.Mesh("Dummy", Game.Scene);
        this.camPos.parent = this;
        this.camPos.position = new BABYLON.Vector3(0, 1, 0);
        BABYLON.VertexData.CreateSphere({ diameterX: 1, diameterY: 2, diameterZ: 1 }).applyToMesh(this);
        let material = new BABYLON.StandardMaterial("material", this.getScene());
        material.alpha = 0.5;
        this.material = material;
    }

    private _initialized: boolean = false;
    public initialize(): void {
        if (!this._initialized) {
            Game.Scene.onBeforeRenderObservable.add(this._update);
            this._initialized = true;
        }
    }

    public registerControl(): void {
        this.game.canvas.addEventListener("keydown", this._keyDown);
        this.game.canvas.addEventListener("keyup", this._keyUp);
        this.game.canvas.addEventListener("mousemove", this._mouseMove);
    }

    private _keyDown = (e: KeyboardEvent) => {
        if (e.code === "KeyW") {
            this.inputForward = 1;
        }
        if (e.code === "KeyS") {
            this.inputForward = - 1;
        }
        if (e.code === "KeyA") {
            this.inputRight = - 1;
        }
        if (e.code === "KeyD") {
            this.inputRight = 1;
        }
    };

    private _keyUp = (e: KeyboardEvent) => {
        if (e.code === "KeyW") {
            this.inputForward = 0;
        }
        if (e.code === "KeyS") {
            this.inputForward = 0;
        }
        if (e.code === "KeyA") {
            this.inputRight = 0;
        }
        if (e.code === "KeyD") {
            this.inputRight = 0;
        }
        if (e.code === "KeyG") {
            if (!this._initialized) {
                this.initialize();
            }
            this.godMode = !this.godMode;
        }
        if (e.code === "Space") {
            if (this._isGrounded || this.godMode) {
                this.velocity.addInPlace(this.getDirection(BABYLON.Axis.Y).scale(5));
                this._isGrounded = false;
                this._jumpTimer = 0.2;
            }
        }
        if (e.code === "ControlLeft") {
            if (this.godMode) {
                this.velocity.subtractInPlace(this.getDirection(BABYLON.Axis.Y).scale(5));
                this._isGrounded = false;
                this._jumpTimer = 0.2;
            }
        }
    };

    private _mouseMove = (event: MouseEvent) => {
        if (Game.LockedMouse) {
            let movementX: number = event.movementX;
            let movementY: number = event.movementY;
            this.inputHeadRight += movementX / 100;
            this.inputHeadUp += movementY / 100;
            this.inputHeadRight = Math.max(Math.min(this.inputHeadRight, 1), -1);
            this.inputHeadUp = Math.max(Math.min(this.inputHeadUp, 1), -1);
        }
    };

    public unregisterControl(): void {
        this.game.canvas.removeEventListener("keydown", this._keyDown);
        this.game.canvas.removeEventListener("keyup", this._keyUp);
        this.game.canvas.removeEventListener("mousemove", this._mouseMove);
    }

    private _gravityFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _groundFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _surfaceFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _controlFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _rightDirection: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0);
    private _leftDirection: BABYLON.Vector3 = new BABYLON.Vector3(-1, 0, 0);
    private _upDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0);
    private _downDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, -1, 0);
    private _forwardDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1);
    private _backwardDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, -1);

    private _feetPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _headPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _collisionAxis: BABYLON.Vector3[] = [];
    private _collisionPositions: BABYLON.Vector3[] = [];

    private _jumpTimer: number = 0;
    private _isGrounded: boolean = false;

    private _debugCollisionMesh: BABYLON.Mesh;
    private _chuncks: PlanetChunck[] = [];
    private _meshes: BABYLON.Mesh[] = [];

    private _update = () => {
        if (Game.CameraManager.cameraMode != CameraMode.Player) {
            return;
        }
        let deltaTime: number = Game.Engine.getDeltaTime() / 1000;

        this._jumpTimer = Math.max(this._jumpTimer - deltaTime, 0);

        this._keepUp();

        let rotationPower: number = this.inputHeadRight * 0.05;
        let rotationCamPower: number = this.inputHeadUp * 0.05;
        let localY: BABYLON.Vector3 = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix());
        let rotation: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(localY, rotationPower);
        this.rotationQuaternion = rotation.multiply(this.rotationQuaternion);
        this.camPos.rotation.x += rotationCamPower;
        this.camPos.rotation.x = Math.max(this.camPos.rotation.x, -Math.PI / 2);
        this.camPos.rotation.x = Math.min(this.camPos.rotation.x, Math.PI / 2);
        
        if (this.game.inputMode === InputMode.Mouse) {
            this.inputHeadRight *= 0.8;
            this.inputHeadUp *= 0.8;
        }

        this._collisionPositions[0] = this._headPosition;
        this._collisionPositions[1] = this._feetPosition;
        this._collisionAxis[0] = this._rightDirection;
        this._collisionAxis[1] = this._leftDirection;
        this._collisionAxis[2] = this._forwardDirection;
        this._collisionAxis[3] = this._backwardDirection;

        this.getDirectionToRef(BABYLON.Axis.X, this._rightDirection);
        this._leftDirection.copyFrom(this._rightDirection);
        this._leftDirection.scaleInPlace(-1);

        this._upDirection.copyFrom(this.position);
        this._upDirection.normalize();
        this._downDirection.copyFrom(this._upDirection);
        this._downDirection.scaleInPlace(-1);

        this.getDirectionToRef(BABYLON.Axis.Z, this._forwardDirection);
        this._backwardDirection.copyFrom(this._forwardDirection);
        this._backwardDirection.scaleInPlace(-1);

        this._feetPosition.copyFrom(this.position);
        this._feetPosition.addInPlace(this._downDirection.scale(1.5));

        this._headPosition.copyFrom(this.position);
        this._headPosition.addInPlace(this._downDirection.scale(0.5));

        // Add gravity and ground reaction.
        this._gravityFactor.copyFrom(this._downDirection).scaleInPlace(9.8 * deltaTime);
        this._groundFactor.copyFromFloats(0, 0, 0);
        let fVert = 1;

        this._chuncks.forEach((chunck) => {
            chunck.unlit();
        })
        this._chuncks = [];
        this._meshes = [];
        if (this._jumpTimer === 0) {
            let chunck = PlanetTools.WorldPositionToChunck(this.planet, this.position);
            if (chunck) {
                this._chuncks.push(chunck);
                if (chunck.mesh) {
                    this._meshes.push(chunck.mesh);
                }
                if (chunck.adjacentsAsArray) {
                    for (let i = 0; i < chunck.adjacentsAsArray.length; i++) {
                        let adjChunck = chunck.adjacentsAsArray[i];
                        this._chuncks.push(adjChunck);
                        if (adjChunck.mesh) {
                            this._meshes.push(adjChunck.mesh);
                        }
                    }
                }
                this._chuncks.forEach((chunck) => {
                    chunck.highlight();
                })
                let ray: BABYLON.Ray = new BABYLON.Ray(this.position.add(this.up), this._downDirection);
                let hit: BABYLON.PickingInfo[] = ray.intersectsMeshes(this._meshes);
                hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
                if (hit[0] && hit[0].pickedPoint) {
                    if (!this._debugCollisionMesh) {
                        this._debugCollisionMesh = BABYLON.MeshBuilder.CreateSphere("debug-collision-mesh", { diameter: 0.2 }, this.getScene());
                        let material = new BABYLON.StandardMaterial("material", this.getScene());
                        material.alpha = 0.5;
                        this._debugCollisionMesh.material = material;
                    }
                    this._debugCollisionMesh.position.copyFrom(hit[0].pickedPoint);
                    let d: number = BABYLON.Vector3.Dot(this.position.subtract(hit[0].pickedPoint), this.up) + 1;
                    if (d > 0 && d < 2.5) {
                        this._groundFactor
                            .copyFrom(this._gravityFactor)
                            .scaleInPlace(-1)
                            .scaleInPlace(1 / (d * 0.5));
                        fVert = 0.005;
                        this._isGrounded = true;
                    }
                }
            }
        }

        this.velocity.addInPlace(this._gravityFactor);
        this.velocity.addInPlace(this._groundFactor);

        // Add input force.
        this._controlFactor.copyFromFloats(0, 0, 0);
        this._controlFactor.addInPlace(this._rightDirection.scale(this.inputRight));
        this._controlFactor.addInPlace(this._forwardDirection.scale(this.inputForward));
        if (this._controlFactor.lengthSquared() > 0.1) {
            this._controlFactor.normalize();
        }
        this._controlFactor.scaleInPlace((20 / this.mass) * deltaTime);
        if (this.godMode) {
            this._controlFactor.scaleInPlace(5);
        }
        this.velocity.addInPlace(this._controlFactor);

        // Check wall collisions.
        let fLat = 1;
        this._surfaceFactor.copyFromFloats(0, 0, 0);
        for (let i = 0; i < this._collisionPositions.length; i++) {
            let pos = this._collisionPositions[i];
            for (let j = 0; j < this._collisionAxis.length; j++) {
                let axis = this._collisionAxis[j];
                let ray: BABYLON.Ray = new BABYLON.Ray(pos, axis, 0.35);
                let hit: BABYLON.PickingInfo[] = ray.intersectsMeshes(this._meshes);
                hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
                if (hit[0] && hit[0].pickedPoint) {
                    let d: number = hit[0].pickedPoint.subtract(pos).length();
                    if (d > 0.01) {
                        this._surfaceFactor.addInPlace(axis.scale((((-10 / this.mass) * 0.3) / d) * deltaTime));
                        fLat = 0.1;
                    } else {
                        // In case where it stuck to the surface, force push.
                        this.position.addInPlace(hit[0].getNormal(true).scale(0.01));
                    }
                }
            }
        }
        this.velocity.addInPlace(this._surfaceFactor);

        // Add friction
        let downVelocity = this._downDirection.scale(BABYLON.Vector3.Dot(this.velocity, this._downDirection));
        this.velocity.subtractInPlace(downVelocity);
        downVelocity.scaleInPlace(Math.pow(0.5 * fVert, deltaTime));
        this.velocity.scaleInPlace(Math.pow(0.01 * fLat, deltaTime));
        this.velocity.addInPlace(downVelocity);

        // Safety check.
        if (!VMath.IsFinite(this.velocity)) {
            this.velocity.copyFromFloats(-0.1 + 0.2 * Math.random(), -0.1 + 0.2 * Math.random(), -0.1 + 0.2 * Math.random());
        }
        this.position.addInPlace(this.velocity.scale(deltaTime));

        //document.querySelector("#camera-altitude").textContent = this.camPos.absolutePosition.length().toFixed(1);
    };

    private _keepUp(): void {
        if (!this) {
            return;
        }
        let currentUp: BABYLON.Vector3 = BABYLON.Vector3.Normalize(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix()));
        let targetUp: BABYLON.Vector3 = BABYLON.Vector3.Normalize(this.position);
        let correctionAxis: BABYLON.Vector3 = BABYLON.Vector3.Cross(currentUp, targetUp);
        let correctionAngle: number = Math.abs(Math.asin(correctionAxis.length()));

        if (correctionAngle > 0.001) {
            let rotation: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(correctionAxis, correctionAngle / 5);
            this.rotationQuaternion = rotation.multiply(this.rotationQuaternion);
        }
    }
}
