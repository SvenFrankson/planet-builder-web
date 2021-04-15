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
                        this.velocity.addInPlace(this.getDirection(BABYLON.Axis.Y).scale(5));
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
    private _groundReaction: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _controlFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _forwardDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, - 1, 0);
    private _downDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, - 1, 0);
    private _update = () => {
        let deltaTime: number = Game.Engine.getDeltaTime() / 1000;

        this._keepUp();
        
        this.getDirectionToRef(BABYLON.Axis.Y, this._downDirection);
        this._downDirection.scaleInPlace(- 1);
        this._downDirection.normalize();

        this._gravityFactor.copyFrom(this._downDirection).scaleInPlace(9.8 * deltaTime);

        this._groundReaction.copyFromFloats(0, 0, 0);

        Player._downRaycastDir.copyFrom(this.position);
        Player._downRaycastDir.scaleInPlace(- 1);
        Player._downRaycastDir.normalize();
        let ray: BABYLON.Ray = new BABYLON.Ray(this.position, Player._downRaycastDir, 1.6);
        let hit: BABYLON.PickingInfo = Game.Scene.pickWithRay(
            ray,
            (mesh: BABYLON.Mesh) => {
                return !(mesh instanceof Water);
            }
        );
        let f = 1;
        if (hit.pickedPoint) {
            let d: number = hit.pickedPoint.subtract(this.position).length();
            this._groundReaction.copyFrom(this._gravityFactor).scaleInPlace(- 1).scaleInPlace(1.5 / d);
            if (d < 1.5) {
                if (BABYLON.Vector3.Dot(this.velocity, this.position) < 0) {
                    f *= d / 1.5;
                }
            }
        }

        this.velocity.addInPlace(this._gravityFactor);
        this.velocity.addInPlace(this._groundReaction);
        
        this._controlFactor.copyFromFloats(0, 0, 0);
        if (this.pForward) {
            this.getDirectionToRef(BABYLON.Axis.Z, this._forwardDirection);
            this._controlFactor.addInPlace(this._forwardDirection);
        }

        if (this._controlFactor.lengthSquared() > 0.1) {
            this._controlFactor.normalize();
        }

        this._controlFactor.scaleInPlace(10 / this.mass * deltaTime);

        this.velocity.addInPlace(this._controlFactor);

        this.velocity.scaleInPlace(0.99 * f);

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

    private static _downRaycastDir: BABYLON.Vector3 = new BABYLON.Vector3(0, - 1, 0);
    public static DownRayCast(): number {
        let pos: BABYLON.Vector3 = Player.Instance.position;
        Player._downRaycastDir.copyFrom(this.Position());
        Player._downRaycastDir.scaleInPlace(- 1);
        Player._downRaycastDir.normalize();
        let ray: BABYLON.Ray = new BABYLON.Ray(pos, Player._downRaycastDir, 1.6);
        let hit: BABYLON.PickingInfo = Game.Scene.pickWithRay(
            ray,
            (mesh: BABYLON.Mesh) => {
                return !(mesh instanceof Water);
            }
        );
        if (!hit.pickedPoint) {
            return -1;
        }
        let d: number = hit.pickedPoint.subtract(pos).length();
        if (d < 1.5) {
            return 1;
        }
        return 0;
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
