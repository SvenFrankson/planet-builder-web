class Drider extends BABYLON.Mesh {

    public planet: Planet;

    public camPos: BABYLON.AbstractMesh;

    public torsoLow: BABYLON.Mesh;
    public torsoHigh: BABYLON.Mesh;

    public footTargets: BABYLON.Mesh[] = [];
    public evaluatedFootTargets: BABYLON.Vector3[] = [];
    public evaluatedFootTargetsDebugs: BABYLON.Mesh[] = [];
    public evaluatedFootTargetGrounded: boolean[] = [];
    
    public targetLookStrength: number = 0.5;
    public targetLook: BABYLON.Vector3;
    
    private _currentChunck: PlanetChunck;
    private _chuncks: PlanetChunck[] = [];
    public get chuncks(): PlanetChunck[] {
        return this._chuncks;
    }
    private _meshes: BABYLON.Mesh[] = [];
    public get meshes(): BABYLON.Mesh[] {
        return this._meshes;
    }

    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    public animateCamPosRotX = AnimationFactory.EmptyNumberCallback;
    public animateCamPosRotY = AnimationFactory.EmptyNumberCallback;

    constructor(
        public isLeftArm: boolean = true,
        scene: BABYLON.Scene
    ) {
        super("drider", scene);

        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        
        this.camPos = new BABYLON.Mesh("Dummy", Game.Scene);
        this.camPos.parent = this;
        this.camPos.position = new BABYLON.Vector3(0, 1.77, 0);
        this.camPos.rotation.x = Math.PI / 8;

        this.animateCamPosRotX = AnimationFactory.CreateNumber(this, this.camPos.rotation, "x");
        this.animateCamPosRotY = AnimationFactory.CreateNumber(this, this.camPos.rotation, "y");
    }

    public initialize(): void {
        
        let mat = new ToonMaterial("player-arm-material", this.scene);

        this.torsoLow = new BABYLON.Mesh("torso-low");
        this.torsoLow.material = mat;
        this.torsoLow.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.torsoHigh = new BABYLON.Mesh("torso-high");
        this.torsoHigh.material = mat;
        this.torsoHigh.rotationQuaternion = BABYLON.Quaternion.Identity();
        
        let a = Math.PI / 4;
        let r = 1;
        let x = r * Math.cos(a);
        let z = r * Math.sin(a);

        this.footTargets[0] = new BABYLON.Mesh("foot-target-0");
        this.footTargets[0].position.x = - x;
        this.footTargets[0].position.z = - z;
        this.footTargets[0].parent = this;
        BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.footTargets[0]);

        this.footTargets[1] = new BABYLON.Mesh("foot-target-0");
        this.footTargets[1].position.x = - r;
        this.footTargets[1].parent = this;
        BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.footTargets[1]);
        
        this.footTargets[2] = new BABYLON.Mesh("foot-target-0");
        this.footTargets[2].position.x = - x;
        this.footTargets[2].position.z = z;
        this.footTargets[2].parent = this;
        BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.footTargets[2]);
        
        this.footTargets[3] = new BABYLON.Mesh("foot-target-0");
        this.footTargets[3].position.x = x;
        this.footTargets[3].position.z = z;
        this.footTargets[3].parent = this;
        BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.footTargets[3]);

        this.footTargets[4] = new BABYLON.Mesh("foot-target-0");
        this.footTargets[4].position.x = r;
        this.footTargets[4].parent = this;
        BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.footTargets[4]);
        
        this.footTargets[5] = new BABYLON.Mesh("foot-target-0");
        this.footTargets[5].position.x = x;
        this.footTargets[5].position.z = - z;
        this.footTargets[5].parent = this;
        BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.footTargets[5]);

        this.evaluatedFootTargets = [
            BABYLON.Vector3.Zero(),
            BABYLON.Vector3.Zero(),
            BABYLON.Vector3.Zero(),
            BABYLON.Vector3.Zero(),
            BABYLON.Vector3.Zero(),
            BABYLON.Vector3.Zero()
        ];

        this.evaluatedFootTargetsDebugs = [
            BABYLON.MeshBuilder.CreateSphere("debug", { diameter: 0.1 }),
            BABYLON.MeshBuilder.CreateSphere("debug", { diameter: 0.1 }),
            BABYLON.MeshBuilder.CreateSphere("debug", { diameter: 0.1 }),
            BABYLON.MeshBuilder.CreateSphere("debug", { diameter: 0.1 }),
            BABYLON.MeshBuilder.CreateSphere("debug", { diameter: 0.1 }),
            BABYLON.MeshBuilder.CreateSphere("debug", { diameter: 0.1 })
        ];

        this.evaluatedFootTargetGrounded = [
            false,
            false,
            false,
            false,
            false,
            false
        ];

        this.scene.onBeforeRenderObservable.add(this._update);
    }
    
    public async instantiate(): Promise<void> {
        let data = await VertexDataLoader.instance.get("drider");
        data[0].applyToMesh(this.torsoLow);
        data[1].applyToMesh(this.torsoHigh);
    }

    public isGrounded(): boolean {
        let c = 0;
        for (let i = 0; i < this.evaluatedFootTargetGrounded.length; i++) {
            if (this.evaluatedFootTargetGrounded[i]) {
                c++;
            }
        }
        return c > 1;
    }

    public async forcePositionRotation(pos: BABYLON.Vector3, rot?: BABYLON.Quaternion): Promise<void> {
        this.position.copyFrom(pos);
        if (rot) {
            this.rotationQuaternion.copyFrom(rot);
        }
        else {
            VMath.QuaternionFromYZAxisToRef(this.position, BABYLON.Vector3.Forward(), this.rotationQuaternion);
        }
        this.computeWorldMatrix(true);
        for (let i = 0; i < 6; i++) {
            this.footTargets[i].computeWorldMatrix(true);
            this.evaluatedFootTargets[i] = this.footTargets[i].absolutePosition;
        }
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0, 1, 0), this.getWorldMatrix(), this.torsoLow.position);
        this.torsoLow.computeWorldMatrix(true);
    } 

    private _update = () => {

        let chunck = PlanetTools.WorldPositionToChunck(this.planet, this.position);
        if (chunck != this._currentChunck) {
            if (this._currentChunck) {
                this._currentChunck.unlit();
            }
            
            this._currentChunck = chunck;

            if (this._currentChunck) {
                this._currentChunck.highlight();
                if (this._currentChunck.adjacentsAsArray) {
                    this._chuncks = [...this._currentChunck.adjacentsAsArray, this._currentChunck];
                }
                else {
                    this._chuncks = [this._currentChunck];
                }
                this._meshes = this._chuncks.map(c => { return c ? c.mesh : undefined; });
            }
            else {
                this._chuncks = [];
                this._meshes = [];
            }
        }

        this.torsoHigh.position.copyFromFloats(0, 0.26, 0.16);
        this.torsoHigh.parent = this.torsoLow;

        this._keepUp();
    }
    
    public evaluateTarget(i: number): void {
        let dir = this.up.scale(-1);
        let ray = new BABYLON.Ray(this.footTargets[i].absolutePosition.subtract(dir.scale(1.5)), dir, 3);
        let bestDist: number = Infinity;
        let bestPick: BABYLON.PickingInfo;
        for (let i = 0; i < this.meshes.length; i++) {
            let mesh = this.meshes[i];
            if (mesh) {
                let pick = ray.intersectsMesh(mesh);
                if (pick && pick.hit && pick.pickedMesh) {
                    if (pick.distance < bestDist) {
                        bestDist = pick.distance;
                        bestPick = pick;
                    }
                }
            }
        }
        if (bestPick) {
            this.evaluatedFootTargets[i] = bestPick.pickedPoint;
            this.evaluatedFootTargetGrounded[i] = true;
        }
        else {
            this.evaluatedFootTargets[i] = this.footTargets[i].absolutePosition;
            this.evaluatedFootTargetGrounded[i] = false;
        }
        this.evaluatedFootTargetsDebugs[i].position = this.evaluatedFootTargets[i];
    }

    private _keepUp(): void {
        if (!this.isGrounded()) {
            console.log("not grounded");
            let upDirection = this.position.subtract(this.planet.position).normalize();
            let currentUp: BABYLON.Vector3 = BABYLON.Vector3.Normalize(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix()));
            let correctionAxis: BABYLON.Vector3 = BABYLON.Vector3.Cross(currentUp, upDirection);
            let correctionAngle: number = Math.abs(Math.asin(correctionAxis.length()));
            
            if (correctionAngle > 0.001) {
                let rotation: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(correctionAxis, correctionAngle / 10);
                this.rotationQuaternion = rotation.multiply(this.rotationQuaternion);
            }
            this.position.subtractInPlace(this.up.scale(0.3 * 1 / 60));
        }
        else {
            console.log("grounded");
            let center = BABYLON.Vector3.Zero();
            
            for (let i = 0; i < 6; i++) {
                center.addInPlace(this.evaluatedFootTargets[i]);
            }
            center.scaleInPlace(1/6);
            let radiuses = [];
            for (let i = 0; i < 6; i++) {
                radiuses.push(this.evaluatedFootTargets[i].subtract(center));
            }
            let norm = BABYLON.Vector3.Zero();
            for (let i = 0; i < 6; i++) {
                let n = BABYLON.Vector3.Cross(radiuses[i], radiuses[(i + 1) % 6]).normalize();
                norm.addInPlace(n);
            }
            norm.normalize();
    
            let dp = BABYLON.Vector3.Dot(this.position.subtract(center), norm);
            this.position.subtractInPlace(norm.scale(dp * 0.1));
            let q = BABYLON.Quaternion.Identity();
            VMath.QuaternionFromYZAxisToRef(norm, this.forward, q);
            BABYLON.Quaternion.SlerpToRef(this.rotationQuaternion, q, 0.01, this.rotationQuaternion);
        }
    }
}