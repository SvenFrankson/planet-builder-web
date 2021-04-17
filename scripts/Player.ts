class Player extends BABYLON.Mesh {
    public static Instance: Player;
    public static Position(): BABYLON.Vector3 {
        return Player.Instance.position;
    }

    private mass: number = 1;
    private speed: number = 5;
    private velocity: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private planet: Planet;
    private underWater: boolean = false;
    public camPos: BABYLON.AbstractMesh;
    public pForward: boolean;
    public back: boolean;
    public pRight: boolean;
    public left: boolean;
    public fly: boolean;

    public PositionLeg(): BABYLON.Vector3 {
        let posLeg: BABYLON.Vector3 = this.position.add(
            BABYLON.Vector3.TransformNormal(
                BABYLON.Axis.Y,
                this.getWorldMatrix()
            ).scale(-1)
        );
        return posLeg;
    }

    public PositionHead(): BABYLON.Vector3 {
        return this.position;
    }

    constructor(position: BABYLON.Vector3, planet: Planet) {
        super("Player", Game.Scene);
        console.log("Create Player");
        this.planet = planet;
        this.position = position;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.camPos = new BABYLON.Mesh("Dummy", Game.Scene);
        this.camPos.parent = this;
        this.camPos.position = new BABYLON.Vector3(0, 0, 0);
        Game.Camera.parent = this.camPos;
        this.RegisterControl();
        Player.Instance = this;
        
        Game.Scene.onBeforeRenderObservable.add(this._update);
    }

    public RegisterControl(): void {
        let scene: BABYLON.Scene = Game.Scene;
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnKeyDownTrigger,
                (event: BABYLON.ActionEvent) => {
                    if (
                        event.sourceEvent.key === "z" ||
                        event.sourceEvent.key === "w"
                    ) {
                        this.pForward = true;
                    }
                    if (event.sourceEvent.key === "s") {
                        this.back = true;
                    }
                    if (
                        event.sourceEvent.key === "q" ||
                        event.sourceEvent.key === "a"
                    ) {
                        this.left = true;
                    }
                    if (event.sourceEvent.key === "d") {
                        this.pRight = true;
                    }
                    if (event.sourceEvent.keyCode === 32) {
                        this.fly = true;
                    }
                }
            )
        );
        scene.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnKeyUpTrigger,
                (event: BABYLON.ActionEvent) => {
                    if (
                        event.sourceEvent.key === "z" ||
                        event.sourceEvent.key === "w"
                    ) {
                        this.pForward = false;
                    }
                    if (event.sourceEvent.key === "s") {
                        this.back = false;
                    }
                    if (
                        event.sourceEvent.key === "q" ||
                        event.sourceEvent.key === "a"
                    ) {
                        this.left = false;
                    }
                    if (event.sourceEvent.key === "d") {
                        this.pRight = false;
                    }
                    if (event.sourceEvent.keyCode === 32) {
                        if (this._isGrounded) {
                            this.velocity.addInPlace(this.getDirection(BABYLON.Axis.Y).scale(5));
                            this._isGrounded = false;
                            this._jumpTimer = 0.2;
                        }
                    }
                }
            )
        );
        Game.Canvas.addEventListener("mousemove", (event: MouseEvent) => {
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
                let rotationPower: number = movementX / 500;
                let localY: BABYLON.Vector3 = BABYLON.Vector3.TransformNormal(
                    BABYLON.Axis.Y,
                    Player.Instance.getWorldMatrix()
                );
                let rotation: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(
                    localY,
                    rotationPower
                );
                Player.Instance.rotationQuaternion = rotation.multiply(
                    Player.Instance.rotationQuaternion
                );
                let rotationCamPower: number = movementY / 500;
                Player.Instance.camPos.rotation.x += rotationCamPower;
                Player.Instance.camPos.rotation.x = Math.max(
                    Player.Instance.camPos.rotation.x,
                    -Math.PI / 2
                );
                Player.Instance.camPos.rotation.x = Math.min(
                    Player.Instance.camPos.rotation.x,
                    Math.PI / 2
                );
            }
        });
    }

    private _gravityFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _groundFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _surfaceFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _controlFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _rightDirection: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0);
    private _leftDirection: BABYLON.Vector3 = new BABYLON.Vector3(- 1, 0, 0);
    private _upDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0);
    private _downDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, - 1, 0);
    private _forwardDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1);
    private _backwardDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, - 1);
    
    private _feetPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _collisionAxis: BABYLON.Vector3[] = [];
    private _collisionPositions: BABYLON.Vector3[] = [];

    private _jumpTimer: number = 0;
    private _isGrounded: boolean = false;

    private _update = () => {
        let deltaTime: number = Game.Engine.getDeltaTime() / 1000;

        this._jumpTimer = Math.max(this._jumpTimer - deltaTime, 0);

        this._keepUp();

        this._collisionPositions[0] = this.position;
        this._collisionPositions[1] = this._feetPosition;
        this._collisionAxis[0] = this._rightDirection;
        this._collisionAxis[1] = this._leftDirection;
        this._collisionAxis[2] = this._forwardDirection;
        this._collisionAxis[3] = this._backwardDirection;
        
        this.getDirectionToRef(BABYLON.Axis.X, this._rightDirection);
        this._leftDirection.copyFrom(this._rightDirection);
        this._leftDirection.scaleInPlace(- 1);

        this._upDirection.copyFrom(this.position);
        this._upDirection.normalize();
        this._downDirection.copyFrom(this._upDirection);
        this._downDirection.scaleInPlace(- 1);

        this.getDirectionToRef(BABYLON.Axis.Z, this._forwardDirection);
        this._backwardDirection.copyFrom(this._forwardDirection);
        this._backwardDirection.scaleInPlace(- 1);

        this._feetPosition.copyFrom(this.position);
        this._feetPosition.addInPlace(this._downDirection);

        // Add gravity and ground reaction.
        this._gravityFactor.copyFrom(this._downDirection).scaleInPlace(9.8 * deltaTime);
        this._groundFactor.copyFromFloats(0, 0, 0);
        let fVert = 1;
        if (this._jumpTimer === 0) {
            let ray: BABYLON.Ray = new BABYLON.Ray(this.position, this._downDirection, 1.7);
            let hit: BABYLON.PickingInfo = Game.Scene.pickWithRay(
                ray,
                (mesh: BABYLON.Mesh) => {
                    return !(mesh instanceof Water);
                }
            );
            if (hit.pickedPoint) {
                let d: number = hit.pickedPoint.subtract(this.position).length();
                if (d > 0.01) {
                    this._groundFactor.copyFrom(this._gravityFactor).scaleInPlace(- 1).scaleInPlace(Math.pow(1.5 / d, 1));
                }
                fVert = 0.005;
                this._isGrounded = true;
            }
        }

        this.velocity.addInPlace(this._gravityFactor);
        this.velocity.addInPlace(this._groundFactor);
        
        // Add input force.
        this._controlFactor.copyFromFloats(0, 0, 0);
        if (this.pRight) {
            this._controlFactor.addInPlace(this._rightDirection);
        }
        if (this.left) {
            this._controlFactor.addInPlace(this._leftDirection);
        }
        if (this.pForward) {
            this._controlFactor.addInPlace(this._forwardDirection);
        }
        if (this.back) {
            this._controlFactor.addInPlace(this._backwardDirection);
        }
        if (this._controlFactor.lengthSquared() > 0.1) {
            this._controlFactor.normalize();
        }
        this._controlFactor.scaleInPlace(20 / this.mass * deltaTime);
        this.velocity.addInPlace(this._controlFactor);

        // Check wall collisions.
        let fLat = 1;
        this._surfaceFactor.copyFromFloats(0, 0, 0);
        for (let i = 0; i < this._collisionPositions.length; i++) {
            let pos = this._collisionPositions[i];
            for (let j = 0; j < this._collisionAxis.length; j++) {
                let axis = this._collisionAxis[j];
                let ray: BABYLON.Ray = new BABYLON.Ray(pos, axis, 0.35);
                let hit: BABYLON.PickingInfo = Game.Scene.pickWithRay(
                    ray,
                    (mesh: BABYLON.Mesh) => {
                        return mesh instanceof PlanetChunck;
                    }
                );
                if (hit.pickedPoint) {
                    let d: number = hit.pickedPoint.subtract(pos).length();
                    if (d > 0.01) {
                        this._surfaceFactor.addInPlace((axis).scale(- 10 / this.mass * 0.30 / d * deltaTime));
                        fLat = 0.1;
                    }
                    else {
                        // In case where it stuck to the surface, force push.
                        this.position.addInPlace(hit.getNormal(true).scale(0.01));
                    }
                }
            }
        }
        this.velocity.addInPlace(this._surfaceFactor);

        // Add friction
        let downVelocity = this._downDirection.scale(BABYLON.Vector3.Dot(this.velocity, this._downDirection));
        this.velocity.subtractInPlace(downVelocity);
        downVelocity.scaleInPlace(Math.pow(0.5 * fVert, deltaTime))
        this.velocity.scaleInPlace(Math.pow(0.01 * fLat, deltaTime));
        this.velocity.addInPlace(downVelocity);

        // Safety check.
        if (!VMath.IsFinite(this.velocity)) {
            this.velocity.copyFromFloats(- 0.1 + 0.2 * Math.random(), - 0.1 + 0.2 * Math.random(), - 0.1 + 0.2 * Math.random());
        }
        this.position.addInPlace(this.velocity.scale(deltaTime));
    }

    private _keepUp(): void {
        if (!Player.Instance) {
            return;
        }
        let currentUp: BABYLON.Vector3 = BABYLON.Vector3.Normalize(
            BABYLON.Vector3.TransformNormal(
                BABYLON.Axis.Y,
                Player.Instance.getWorldMatrix()
            )
        );
        let targetUp: BABYLON.Vector3 = BABYLON.Vector3.Normalize(
            Player.Instance.position
        );
        let correctionAxis: BABYLON.Vector3 = BABYLON.Vector3.Cross(
            currentUp,
            targetUp
        );
        let correctionAngle: number = Math.abs(Math.asin(correctionAxis.length()));
        
        if (correctionAngle > 0.001) {
            let rotation: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(
                correctionAxis,
                correctionAngle / 5
            );
            Player.Instance.rotationQuaternion = rotation.multiply(
                Player.Instance.rotationQuaternion
            );
        }
    }

    public static CanGoSide(axis: BABYLON.Vector3): boolean {
        let localAxis: BABYLON.Vector3 = BABYLON.Vector3.TransformNormal(
            axis,
            Player.Instance.getWorldMatrix()
        );
        let ray: BABYLON.Ray = new BABYLON.Ray(
            Player.Instance.PositionLeg(),
            localAxis,
            0.6
        );
        let hit: BABYLON.PickingInfo = Game.Scene.pickWithRay(
            ray,
            (mesh: BABYLON.Mesh) => {
                return !(mesh instanceof Water);
            }
        );
        if (hit.pickedPoint) {
            return false;
        }
        ray = new BABYLON.Ray(Player.Instance.PositionHead(), localAxis, 0.6);
        hit = Game.Scene.pickWithRay(ray, (mesh: BABYLON.Mesh) => {
            return !(mesh instanceof Water);
        });
        if (hit.pickedPoint) {
            return false;
        }
        return true;
    }

    public static CanGoUp(): boolean {
        let localAxis: BABYLON.Vector3 = BABYLON.Vector3.TransformNormal(
            BABYLON.Axis.Y,
            Player.Instance.getWorldMatrix()
        );
        let ray: BABYLON.Ray = new BABYLON.Ray(
            Player.Instance.PositionHead(),
            localAxis,
            0.6
        );
        let hit: BABYLON.PickingInfo = Game.Scene.pickWithRay(
            ray,
            (mesh: BABYLON.Mesh) => {
                return !(mesh instanceof Water);
            }
        );
        if (hit.pickedPoint) {
            return false;
        }
        return true;
    }
}
