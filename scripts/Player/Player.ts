class Player extends BABYLON.Mesh {

    public static DEBUG_INSTANCE: Player;

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
    public armManager: PlayerArmManager;
    
    public currentAction: PlayerAction;

    public lockInPlace: boolean = false;
    public planet: Planet;
    public sqrDistToPlanet = Infinity;
    public altitudeOnPlanet: number = 0;

    public headMove: boolean = false;
    public targetLookStrength: number = 0.5;
    public targetLook: BABYLON.Vector3;
    public targetDestination: BABYLON.Vector3;
    private _lastDistToTarget: number;

    private groundCollisionVData: BABYLON.VertexData;
    private groundCollisionMesh: BABYLON.Mesh;
    private wallCollisionVData: BABYLON.VertexData;
    private wallCollisionMeshes: BABYLON.Mesh[] = [];

    private moveDelay: number = 1;
    private moveIndicatorDisc: PlanetObject;
    private moveIndicatorLandmark: PlanetObject;

    private _initialized: boolean = false;
    private _isRegisteredUIOnly: boolean = false;
    private _isRegistered: boolean = false;

    public playerActionManager: PlayerActionManager;
    public inventory: Inventory;

    public get inputManager(): InputManager {
        return this.main.inputManager;
    }

    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    public animateCamPosRotX = AnimationFactory.EmptyNumberCallback;
    public animateCamPosRotY = AnimationFactory.EmptyNumberCallback;

    constructor(position: BABYLON.Vector3, public main: Main) {
        super("Player", main.scene);
        Player.DEBUG_INSTANCE = this;
        this.position = position;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.camPos = new BABYLON.Mesh("Dummy", Game.Scene);
        this.camPos.parent = this;
        this.camPos.position = new BABYLON.Vector3(0, 1.77, 0);
        this.camPos.rotation.x = Math.PI / 8;
        this.armManager = new PlayerArmManager(this);
        /*
        BABYLON.CreateSphereVertexData({ diameter: 0.2 }).applyToMesh(this);
        let material = new BABYLON.StandardMaterial("material", this.getScene());
        material.alpha = 0.5;
        this.material = material;
        this.layerMask = 0x10000000;
        */

        let mat = new ToonMaterial("move-indicator-material", this.scene);
        this.moveIndicatorDisc = new PlanetObject("player-move-indicator-disc", this.main);
        this.moveIndicatorDisc.material = mat;
        this.moveIndicatorDisc.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.moveIndicatorDisc.isVisible = false; 
        
        this.moveIndicatorLandmark = new PlanetObject("player-move-indicator-landmark", this.main);
        this.moveIndicatorLandmark.material = mat;
        this.moveIndicatorLandmark.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.moveIndicatorLandmark.isVisible = false;
        
        this.animateCamPosRotX = AnimationFactory.CreateNumber(this, this.camPos.rotation, "x");
        this.animateCamPosRotY = AnimationFactory.CreateNumber(this, this.camPos.rotation, "y");
    }

    public async initialize(): Promise<void> {
        if (!this._initialized) {
            Game.Scene.onBeforeRenderObservable.add(this._update);
            this.armManager.initialize();
            this._initialized = true;
            this.groundCollisionVData = (await this.main.vertexDataLoader.get("chunck-part"))[1];
            this.wallCollisionVData = (await this.main.vertexDataLoader.get("chunck-part"))[2];
            (await this.main.vertexDataLoader.get("landmark"))[0].applyToMesh(this.moveIndicatorDisc);
            (await this.main.vertexDataLoader.get("landmark"))[1].applyToMesh(this.moveIndicatorLandmark);
        }
    }

    public registerControlUIOnly(): void {
        if (this._isRegisteredUIOnly) {
            return;
        }
        this.inputManager.pointerUpObservable.add(this._onPointerUpUIOnly);
        this.inputManager.pointerDownObservable.add(this._onPointerDownUIOnly);
        this._isRegisteredUIOnly = true;
    }

    public unregisterControlUIOnly(): void {
        this.inputManager.pointerUpObservable.removeCallback(this._onPointerUpUIOnly);
        this.inputManager.pointerDownObservable.removeCallback(this._onPointerDownUIOnly);
        this._isRegisteredUIOnly = false;
    }

    private _onPointerUpUIOnly = (pickableElement: Pickable) => {
        if (this.armManager) {
            this.armManager.pointerUpAnimation(pickableElement, () => {
                if (pickableElement) {
                    pickableElement.onPointerUp();
                }
            });
        }
    }

    private _onPointerDownUIOnly = (pickableElement: Pickable) => {
        if (this.inputManager.aimedElement) {
            this.inputManager.aimedElement.onPointerDown();
        }
    }

    public registerControl(): void {
        if (this._isRegisteredUIOnly) {
            this.unregisterControlUIOnly();
        }
        if (this._isRegistered) {
            return;
        }

        this.inputManager.addMappedKeyDownListener(KeyInput.MOVE_FORWARD, () => {
            this.inputForward = 1;
        });
        this.inputManager.addMappedKeyDownListener(KeyInput.MOVE_BACK, () => {
            this.inputForward = - 1;
        });
        this.inputManager.addMappedKeyDownListener(KeyInput.MOVE_RIGHT, () => {
            this.inputRight = 1;
        });
        this.inputManager.addMappedKeyDownListener(KeyInput.MOVE_LEFT, () => {
            this.inputRight = - 1;
        });

        this.inputManager.addMappedKeyUpListener(KeyInput.MOVE_FORWARD, () => {
            this.inputForward = 0;
        });
        this.inputManager.addMappedKeyUpListener(KeyInput.MOVE_BACK, () => {
            this.inputForward = 0;
        });
        this.inputManager.addMappedKeyUpListener(KeyInput.MOVE_RIGHT, () => {
            this.inputRight = 0;
        });
        this.inputManager.addMappedKeyUpListener(KeyInput.MOVE_LEFT, () => {
            this.inputRight = 0;
        });
        this.inputManager.addMappedKeyUpListener(KeyInput.JUMP, () => {
            if (this._isGrounded || this.godMode) {
                this.velocity.addInPlace(this.getDirection(BABYLON.Axis.Y).scale(5));
                this._isGrounded = false;
                this._jumpTimer = 0.2;
            }
        });
        this.inputManager.addMappedKeyUpListener(KeyInput.INVENTORY, () => {
            this.inputManager.inventoryOpened = !this.inputManager.inventoryOpened;
        });
        this.main.canvas.addEventListener("keyup", this._keyUp);

        this.main.canvas.addEventListener("pointermove", this._mouseMove);

        this.inputManager.pointerUpObservable.add((pickable: IPickable) => {
            this.abortTeleportation();

            this._headMoveWithMouse = false;

            if (!pickable) {
                if (this.currentAction) {
                    if (this.currentAction.onClick) {
                        this.currentAction.onClick();
                        return;
                    }
                }
            }
            
            if (this.armManager) {
                this.armManager.pointerUpAnimation(pickable, () => {
                    if (pickable) {
                        pickable.onPointerUp();
                    }
                });
            }
        });

        this.inputManager.pointerDownObservable.add((pickable: IPickable) => {
            
            if (this.armManager) {
                this.armManager.pointerDownAnimation(pickable, () => {
                    if (pickable) {
                        pickable.onPointerDown();
                    }
                });
            }

            if (!this.inputManager.inventoryOpened) {
                this.startTeleportation();
                if (!this.inputManager.aimedElement || !this.inputManager.aimedElement.interceptsPointerMove()) {
                    this._headMoveWithMouse = true;
                }
            }
        });

        this._isRegistered = true;
    }

    private _keyUp = (e: KeyboardEvent) => {
        if (e.code === "KeyG") {
            if (!this._initialized) {
                this.initialize();
            }
            this.godMode = !this.godMode;
        }
        if (e.code === "ControlLeft") {
            if (this.godMode) {
                this.velocity.subtractInPlace(this.getDirection(BABYLON.Axis.Y).scale(5));
                this._isGrounded = false;
                this._jumpTimer = 0.2;
            }
        }
    };

    private _headMoveWithMouse: boolean = false;
    private _mouseMove = (event: MouseEvent) => {
        if (this._headMoveWithMouse || this.inputManager.isPointerLocked) {
            let movementX: number = event.movementX;
            let movementY: number = event.movementY;
            let size = Math.min(this.main.canvas.width, this.main.canvas.height)
            this.inputHeadRight += movementX / size * 10;
            this.inputHeadRight = Math.max(Math.min(this.inputHeadRight, 1), - 1);
            this.inputHeadUp += movementY / size * 10;
            this.inputHeadUp = Math.max(Math.min(this.inputHeadUp, 1), - 1);
        }
    };

    private _moveTarget: BABYLON.Vector3;
    private _moveTimer: number = Infinity;
    private startTeleportation(): void {
        this._moveTimer = 1;
        this._moveTarget = undefined;
    }

    private abortTeleportation(): void {
        this._moveTimer = Infinity;
    }

    public unregisterControl(): void {
        this.main.canvas.removeEventListener("keyup", this._keyUp);
        this.main.canvas.removeEventListener("mousemove", this._mouseMove);
    }

    private _gravityFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _groundFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _surfaceFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _controlFactor: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _rightDirection: BABYLON.Vector3 = new BABYLON.Vector3(1, 0, 0);
    private _leftDirection: BABYLON.Vector3 = new BABYLON.Vector3(-1, 0, 0);
    public upDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0);
    private _downDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, -1, 0);
    private _forwardDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 1);
    private _backwardDirection: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, -1);

    private _feetPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _headPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _collisionAxis: BABYLON.Vector3[] = [];
    private _collisionPositions: BABYLON.Vector3[] = [];

    private _jumpTimer: number = 0;
    private _isGrounded: boolean = false;

    private _debugCollisionGroundMesh: BABYLON.Mesh;
    private _debugCollisionWallMesh: BABYLON.Mesh;
    private _debugAimGroundMesh: BABYLON.Mesh;
    private _chuncks: PlanetChunck[] = [];
    private _meshes: BABYLON.Mesh[] = [];
    public get meshes(): BABYLON.Mesh[] {
        return this._meshes;
    }
    
    private _isPosAnimating: boolean = false;
    public get isPosAnimating(): boolean {
        return this._isPosAnimating;
    }
    public async animatePos(posTarget: BABYLON.Vector3, duration: number, lookingAt?: boolean): Promise<void> {
        return new Promise<void>(resolve => {
            let posZero = this.position.clone();
            let quaternionZero: BABYLON.Quaternion;
            let quaternionTarget: BABYLON.Quaternion;
            if (lookingAt) {
                quaternionZero = this.rotationQuaternion.clone();
                let targetZ = posTarget.subtract(posZero).normalize();
                let targetY: BABYLON.Vector3;
                if (this.planet) {
                    targetY = posTarget.subtract(this.planet.position).normalize();
                }
                else {
                    targetY = posTarget.clone().normalize();
                }
                let targetX = BABYLON.Vector3.Cross(targetY, targetZ);
                targetZ = BABYLON.Vector3.Cross(targetX, targetY);
                quaternionTarget = BABYLON.Quaternion.RotationQuaternionFromAxis(targetX, targetY, targetZ);
            }
            let t = 0;
            let cb = () => {
                t += this.main.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    this._isPosAnimating = true;
                    let f = Easing.easeInOutSine(t / duration);
                    this.position.copyFrom(posZero).scaleInPlace(1 - f).addInPlace(posTarget.scale(f));
                    if (lookingAt) {
                        BABYLON.Quaternion.SlerpToRef(quaternionZero, quaternionTarget, f, this.rotationQuaternion);
                    }
                }
                else {
                    this._isPosAnimating = false;
                    this.position.copyFrom(posTarget);
                    this.main.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            }
            this.main.scene.onBeforeRenderObservable.add(cb);
        });
    }

    public updatePlanet(): void {
        this.sqrDistToPlanet = Infinity;
        for (let i = 0; i < this.main.currentGalaxy.planets.length; i++) {
            let p = this.main.currentGalaxy.planets[i];
            let sqrDist = BABYLON.Vector3.DistanceSquared(this.position, p.position);
            if (sqrDist < this.sqrDistToPlanet) {
                this.planet = p;
                this.sqrDistToPlanet = sqrDist;
            }
        }
        this.altitudeOnPlanet = Math.sqrt(this.sqrDistToPlanet) - this.planet.seaAltitude;
    }

    private _currentChunck: PlanetChunck;
    private _update = () => {
        if (this.main.cameraManager.cameraMode != CameraMode.Player) {
            return;
        }
        this.updatePlanet();

        let deltaTime: number = this.main.engine.getDeltaTime() / 1000;

        if (isFinite(this._moveTimer)) {
            let p = this.inputManager.getPickInfo(this._meshes);
            if (p && p.hit && p.pickedPoint) {
                if (!this._moveTarget) {
                    this._moveTarget = p.pickedPoint.clone();
                }
                
                if (BABYLON.Vector3.DistanceSquared(this._moveTarget, p.pickedPoint) > 1) {
                    this.abortTeleportation();
                }

                if (this._moveTarget) {
                    this._moveTimer -= deltaTime;
                }
            }
            if (this._moveTimer < 0) {
                this.animatePos(this._moveTarget, 1, true);
                this.abortTeleportation();
            }
        }

        let moveTimerNormalized = this._moveTimer / this.moveDelay;
        if (moveTimerNormalized < 0.75 && this._moveTarget) {
            let sDisc = 0;
            if (moveTimerNormalized > 0.6) {
                sDisc = Easing.easeInOutSine(1 - (moveTimerNormalized - 0.6) / 0.15);
            }
            else {
                sDisc = Easing.easeInOutSine(moveTimerNormalized / 0.6);
            }
            let sLandmark = 0;
            if (moveTimerNormalized <= 0.6) {
                sLandmark = Easing.easeInOutSine(1 - moveTimerNormalized / 0.6);
            }

            this.moveIndicatorDisc.isVisible = true;
            this.moveIndicatorDisc.planet = this.planet;
            this.moveIndicatorDisc.scaling.copyFromFloats(sDisc, sDisc, sDisc);
            this.moveIndicatorDisc.setPosition(this._moveTarget);
            this.moveIndicatorLandmark.isVisible = true;
            this.moveIndicatorLandmark.planet = this.planet;
            this.moveIndicatorLandmark.scaling.copyFromFloats(sLandmark, sLandmark, sLandmark);
            this.moveIndicatorLandmark.setPosition(this._moveTarget);
        }
        else {
            this.moveIndicatorDisc.isVisible = false;
            this.moveIndicatorLandmark.isVisible = false;
        }

        this._jumpTimer = Math.max(this._jumpTimer - deltaTime, 0);

        if (this.targetLook) {
            let forward = this.camPos.forward;
            let targetForward = this.targetLook.subtract(this.camPos.absolutePosition).normalize();
            let a = VMath.AngleFromToAround(forward, targetForward, this.upDirection) / Math.PI;
            if (isFinite(a)) {
                this.inputHeadRight += a * this.targetLookStrength;
            }
            a = VMath.AngleFromToAround(forward, targetForward, this._rightDirection) / (2 * Math.PI);
            if (isFinite(a)) {
                this.inputHeadUp += a * this.targetLookStrength;
            }
            if (!this.targetDestination && this.velocity.lengthSquared() < 0.001) {
                if (BABYLON.Vector3.Dot(forward, targetForward) > 0.99) {
                    this.targetLook = undefined;
                    this.targetLookStrength = 0.5;
                }
            }
        }

        let inputHeadRight = Math.max(Math.min(this.inputHeadRight, 1), -1);
        let inputHeadUp = Math.max(Math.min(this.inputHeadUp, 1), -1);

        let rotationPower: number = inputHeadRight * Math.PI * deltaTime;
        let rotationCamPower: number = inputHeadUp * Math.PI * deltaTime;
        if (!this.headMove) {
            let localY: BABYLON.Vector3 = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix());
            let rotation: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(localY, rotationPower);
            this.rotationQuaternion = rotation.multiply(this.rotationQuaternion);
        }
        else {
            this.camPos.rotation.y += rotationPower;
            this.camPos.rotation.y = Math.max(this.camPos.rotation.y, -Math.PI / 2);
            this.camPos.rotation.y = Math.min(this.camPos.rotation.y, Math.PI / 2);
        }
        this.camPos.rotation.x += rotationCamPower;
        this.camPos.rotation.x = Math.max(this.camPos.rotation.x, -Math.PI / 2);
        this.camPos.rotation.x = Math.min(this.camPos.rotation.x, Math.PI / 2);
        
        let chunck = PlanetTools.WorldPositionToChunck(this.planet, this.position);
        if (chunck != this._currentChunck) {
            if (this._currentChunck) {
                //this._currentChunck.unlit();
            }
            
            this._currentChunck = chunck;

            if (this._currentChunck) {
                //this._currentChunck.highlight();
                this._chuncks = [...this._currentChunck.adjacentsAsArray, this._currentChunck];
                this._meshes = this._chuncks.map(c => { return c ? c.mesh : undefined; });
            }
            else {
                this._chuncks = [];
                this._meshes = [];
            }
        }

        let inputFactor = Easing.smooth025Sec(this.getEngine().getFps());
        this.inputHeadRight *= inputFactor;
        this.inputHeadUp *= inputFactor;

        this._collisionPositions[0] = this._headPosition;
        this._collisionPositions[1] = this._feetPosition;
        this._collisionAxis[0] = this._rightDirection;
        this._collisionAxis[1] = this._leftDirection;
        this._collisionAxis[2] = this._forwardDirection;
        this._collisionAxis[3] = this._backwardDirection;

        this.getDirectionToRef(BABYLON.Axis.X, this._rightDirection);
        this._leftDirection.copyFrom(this._rightDirection);
        this._leftDirection.scaleInPlace(-1);

        if (this.planet && !this.lockInPlace) {
            this.upDirection.copyFrom(this.position).subtractInPlace(this.planet.position);
            this.upDirection.normalize();
        }
        this._downDirection.copyFrom(this.upDirection);
        this._downDirection.scaleInPlace(-1);

        this.getDirectionToRef(BABYLON.Axis.Z, this._forwardDirection);
        this._backwardDirection.copyFrom(this._forwardDirection);
        this._backwardDirection.scaleInPlace(-1);

        this._feetPosition.copyFrom(this.position);
        this._feetPosition.addInPlace(this.upDirection.scale(0.5));

        this._headPosition.copyFrom(this.position);
        this._headPosition.addInPlace(this.upDirection.scale(1.5));

        this._keepUp();

        if (this.lockInPlace) {
            return;
        }

        let fVert = 1;
        // Add gravity and ground reaction.
        let gFactor = 1 - (this.altitudeOnPlanet / 300);
        gFactor = Math.max(Math.min(gFactor, 1), 0) * 9.8;
        this._gravityFactor.copyFrom(this._downDirection).scaleInPlace(gFactor * deltaTime);
        this._groundFactor.copyFromFloats(0, 0, 0);

        if (this._jumpTimer === 0 && this.planet) {

            let checkGroundCollision: boolean = false;
            if (this.groundCollisionVData) {
                let localIJK = PlanetTools.WorldPositionToLocalIJK(this.planet, this.position.subtract(this.upDirection.scale(0.1)));
                if (localIJK) {
                    let data = localIJK.planetChunck.GetData(localIJK.i, localIJK.j, localIJK.k);
                    if (data > BlockType.Water) {
                        let globalIJK = PlanetTools.LocalIJKToGlobalIJK(localIJK);
                        if (globalIJK) {
                            if (!this.groundCollisionMesh) {
                                this.groundCollisionMesh = BABYLON.MeshBuilder.CreateSphere("debug-current-block", { diameter: 1 });
                                if (DebugDefine.SHOW_PLAYER_COLLISION_MESHES) {
                                    let material = new BABYLON.StandardMaterial("material");
                                    material.alpha = 0.25;
                                    this.groundCollisionMesh.material = material;
                                }
                                else {
                                    this.groundCollisionMesh.isVisible = false;
                                }
                            }
            
                            PlanetTools.SkewVertexData(this.groundCollisionVData, localIJK.planetChunck.size, globalIJK.i, globalIJK.j, globalIJK.k).applyToMesh(this.groundCollisionMesh);
                            this.groundCollisionMesh.parent = localIJK.planetChunck.planetSide;
                            checkGroundCollision = true;
                        }
                    }
                }
            }

            if (checkGroundCollision) {
                let ray: BABYLON.Ray = new BABYLON.Ray(this.camPos.absolutePosition, this._downDirection);
                let hit: BABYLON.PickingInfo = ray.intersectsMesh(this.groundCollisionMesh);
                if (hit && hit.pickedPoint) {
                    if (DebugDefine.SHOW_PLAYER_COLLISION_MESHES) {
                        if (!this._debugCollisionGroundMesh) {
                            this._debugCollisionGroundMesh = BABYLON.MeshBuilder.CreateSphere("debug-collision-mesh", { diameter: 0.2 }, this.getScene());
                            let material = new BABYLON.StandardMaterial("material", this.getScene());
                            material.alpha = 0.5;
                            this._debugCollisionGroundMesh.material = material;
                        }
                        this._debugCollisionGroundMesh.position.copyFrom(hit.pickedPoint);
                    }
                    let d: number = BABYLON.Vector3.Dot(this.position.subtract(hit.pickedPoint), this.upDirection);
                    if (d <= 0.2) {
                        let v = 0;
                        if (d < 0) {
                            v = Math.abs(20 * d);
                        }
                        this._groundFactor
                            .copyFrom(this._gravityFactor)
                            .scaleInPlace(- 1 - v);
                        fVert = 0.001;
                        this._isGrounded = true;
                    }
                }
            }
        }

        this.velocity.addInPlace(this._gravityFactor);
        this.velocity.addInPlace(this._groundFactor);

        // Add input force.
        let fLat = 1;
        this._controlFactor.copyFromFloats(0, 0, 0);
        if (this.targetDestination) {
            this._controlFactor.copyFrom(this.targetDestination);
            this._controlFactor.subtractInPlace(this.position);
            let dist = this._controlFactor.length();
            if (dist > this._lastDistToTarget && this.velocity.length() < 0.1) {
                this.targetDestination = undefined;
                this._lastDistToTarget = undefined;
            }
            else {
                this._lastDistToTarget = dist;
                this._controlFactor.normalize();
                this._controlFactor.scaleInPlace((dist * 20 / this.mass) * deltaTime);
                fLat = 0.2;
            }
        }
        else {
            this._controlFactor.addInPlace(this._rightDirection.scale(this.inputRight));
            this._controlFactor.addInPlace(this._forwardDirection.scale(this.inputForward));
            if (this._controlFactor.lengthSquared() > 0.1) {
                this._controlFactor.normalize();
            }
            this._controlFactor.scaleInPlace((20 / this.mass) * deltaTime);
            if (this.godMode) {
                this._controlFactor.scaleInPlace(5);
            }
        }
        this.velocity.addInPlace(this._controlFactor);

        // Check wall collisions.
        this._surfaceFactor.copyFromFloats(0, 0, 0);

        let wallCount = 0;
        if (this.wallCollisionVData) {
            for (let i = 0; i < this._collisionPositions.length; i++) {
                let pos = this._collisionPositions[i];
                for (let j = 0; j < this._collisionAxis.length; j++) {
                    let axis = this._collisionAxis[j];
                    let localIJK = PlanetTools.WorldPositionToLocalIJK(this.planet, pos.add(axis.scale(0.35)));
                    if (localIJK) {
                        let data = localIJK.planetChunck.GetData(localIJK.i, localIJK.j, localIJK.k);
                        if (data > BlockType.Water) {
                            let globalIJK = PlanetTools.LocalIJKToGlobalIJK(localIJK);
                            if (globalIJK) {
                                if (!this.wallCollisionMeshes[wallCount]) {
                                    this.wallCollisionMeshes[wallCount] = BABYLON.MeshBuilder.CreateSphere("wall-collision-mesh", { diameter: 1 });
                                    if (DebugDefine.SHOW_PLAYER_COLLISION_MESHES) {
                                        let material = new BABYLON.StandardMaterial("material");
                                        material.alpha = 0.25;
                                        this.wallCollisionMeshes[wallCount].material = material;
                                    }
                                    else {
                                        this.wallCollisionMeshes[wallCount].isVisible = false;
                                    }
                                }
                
                                PlanetTools.SkewVertexData(this.wallCollisionVData, localIJK.planetChunck.size, globalIJK.i, globalIJK.j, globalIJK.k).applyToMesh(this.wallCollisionMeshes[wallCount]);
                                this.wallCollisionMeshes[wallCount].parent = localIJK.planetChunck.planetSide;
                                wallCount++;
                            }
                        }
                    }
                }
            }
        }

        if (!this.godMode) {
            for (let i = 0; i < this._collisionPositions.length; i++) {
                let pos = this._collisionPositions[i];
                for (let j = 0; j < this._collisionAxis.length; j++) {
                    let axis = this._collisionAxis[j];
                    let ray: BABYLON.Ray = new BABYLON.Ray(pos, axis, 0.35);
                    let hit: BABYLON.PickingInfo[] = ray.intersectsMeshes(this.wallCollisionMeshes.filter((m, index) => { return index < wallCount; }));
                    hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
                    if (hit[0] && hit[0].pickedPoint) {
                        if (DebugDefine.SHOW_PLAYER_COLLISION_MESHES) {
                            if (!this._debugCollisionWallMesh) {
                                this._debugCollisionWallMesh = BABYLON.MeshBuilder.CreateSphere("debug-collision-mesh", { diameter: 0.2 }, this.getScene());
                                let material = new BABYLON.StandardMaterial("material", this.getScene());
                                material.alpha = 0.5;
                                this._debugCollisionWallMesh.material = material;
                            }
                            this._debugCollisionWallMesh.position.copyFrom(hit[0].pickedPoint);
                        }
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

        // Update action
        if (!this.inputManager.aimedElement && this.currentAction) {
            if (this.currentAction.onUpdate) {
                this.currentAction.onUpdate();
            }
        }

        //document.querySelector("#camera-altitude").textContent = this.camPos.absolutePosition.length().toFixed(1);
    };

    private _keepUp(): void {
        if (!this) {
            return;
        }
        let currentUp: BABYLON.Vector3 = BABYLON.Vector3.Normalize(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix()));
        let correctionAxis: BABYLON.Vector3 = BABYLON.Vector3.Cross(currentUp, this.upDirection);
        let correctionAngle: number = Math.abs(Math.asin(correctionAxis.length()));
        
        let gFactor = 1 - (this.altitudeOnPlanet / 300);
        gFactor = Math.max(Math.min(gFactor, 1), 0);
        gFactor = gFactor * gFactor;

        if (correctionAngle > 0.001) {
            let rotation: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(correctionAxis, gFactor * correctionAngle / 10);
            this.rotationQuaternion = rotation.multiply(this.rotationQuaternion);
        }
    }
}
