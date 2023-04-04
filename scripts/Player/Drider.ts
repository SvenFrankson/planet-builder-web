class Drider extends BABYLON.Mesh {

    public planet: Planet;

    public torsoLow: BABYLON.Mesh;
    public torsoHigh: BABYLON.Mesh;
    public camPos: BABYLON.Mesh;
    public armManager: HumanArmManager;
    public legManager: DriderLegManager;

    public footTargets: BABYLON.Mesh[] = [];
    public evaluatedFootTargets: BABYLON.Vector3[] = [];
    public evaluatedFootNormals: BABYLON.Vector3[] = [];
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

        let mat = new ToonMaterial("player-arm-material", this.scene);

        this.torsoLow = new BABYLON.Mesh("torso-low");
        this.torsoLow.material = mat;
        this.torsoLow.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.torsoHigh = new BABYLON.Mesh("torso-high");
        this.torsoHigh.material = mat;
        this.torsoHigh.rotationQuaternion = BABYLON.Quaternion.Identity();
        
        this.camPos = new BABYLON.Mesh("head");
        this.camPos.material = mat;
        this.camPos.parent = this.torsoHigh;
        this.camPos.position = new BABYLON.Vector3(0, 0.539, -0.112);

        this.armManager = new HumanArmManager(this);
        this.armManager.leftParent = this.torsoHigh;
        this.armManager.leftPos = new BABYLON.Vector3(- 0.18, 0.419, -0.117);
        this.armManager.rightParent = this.torsoHigh;
        this.armManager.rightPos = new BABYLON.Vector3(0.18, 0.419, -0.117);
        this.legManager = new DriderLegManager(this);

        this.animateCamPosRotX = AnimationFactory.CreateNumber(this, this.camPos.rotation, "x");
        this.animateCamPosRotY = AnimationFactory.CreateNumber(this, this.camPos.rotation, "y");
    }

    public initialize(): void {        
        
        let a = Math.PI / 3.5;
        let r = 1;
        let x = r * Math.cos(a);
        let y = 0.4;
        let z = r * Math.sin(a);

        this.footTargets[0] = new BABYLON.Mesh("foot-target-0");
        this.footTargets[0].position.x = - x;
        this.footTargets[0].position.y = y;
        this.footTargets[0].position.z = - z;
        this.footTargets[0].parent = this;
        BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.footTargets[0]);

        this.footTargets[1] = new BABYLON.Mesh("foot-target-0");
        this.footTargets[1].position.x = - r;
        this.footTargets[1].position.y = y;
        this.footTargets[1].parent = this;
        BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.footTargets[1]);
        
        this.footTargets[2] = new BABYLON.Mesh("foot-target-0");
        this.footTargets[2].position.x = - x;
        this.footTargets[2].position.y = y;
        this.footTargets[2].position.z = z;
        this.footTargets[2].parent = this;
        BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.footTargets[2]);
        
        this.footTargets[3] = new BABYLON.Mesh("foot-target-0");
        this.footTargets[3].position.x = x;
        this.footTargets[3].position.y = y;
        this.footTargets[3].position.z = z;
        this.footTargets[3].parent = this;
        BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.footTargets[3]);

        this.footTargets[4] = new BABYLON.Mesh("foot-target-0");
        this.footTargets[4].position.x = r;
        this.footTargets[4].position.y = y;
        this.footTargets[4].parent = this;
        BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.footTargets[4]);
        
        this.footTargets[5] = new BABYLON.Mesh("foot-target-0");
        this.footTargets[5].position.x = x;
        this.footTargets[5].position.y = y;
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
        
        this.evaluatedFootNormals = [
            BABYLON.Vector3.Up(),
            BABYLON.Vector3.Up(),
            BABYLON.Vector3.Up(),
            BABYLON.Vector3.Up(),
            BABYLON.Vector3.Up(),
            BABYLON.Vector3.Up()
        ];

        this.evaluatedFootTargetsDebugs = [
            BABYLON.MeshBuilder.CreateBox("debug", { width: 0.03, height: 0.5, depth: 0.03 }),
            BABYLON.MeshBuilder.CreateBox("debug", { width: 0.03, height: 0.5, depth: 0.03 }),
            BABYLON.MeshBuilder.CreateBox("debug", { width: 0.03, height: 0.5, depth: 0.03 }),
            BABYLON.MeshBuilder.CreateBox("debug", { width: 0.03, height: 0.5, depth: 0.03 }),
            BABYLON.MeshBuilder.CreateBox("debug", { width: 0.03, height: 0.5, depth: 0.03 }),
            BABYLON.MeshBuilder.CreateBox("debug", { width: 0.03, height: 0.5, depth: 0.03 })
        ];
        
        this.footTargets.forEach(mesh => {
            mesh.isVisible = false;
        })
        this.evaluatedFootTargetsDebugs.forEach(mesh => {
            mesh.isVisible = false;
        })

        for (let i = 0; i < 6; i++) {
            this.evaluatedFootTargetsDebugs[i].rotationQuaternion = BABYLON.Quaternion.Identity();
        }

        this.evaluatedFootTargetGrounded = [
            false,
            false,
            false,
            false,
            false,
            false
        ];

        this.scene.onBeforeRenderObservable.add(this._update);
        
        this.armManager.initialize();
        this.legManager.initialize();
    }
    
    public async instantiate(): Promise<void> {
        let data = await VertexDataLoader.instance.get("drider");
        data[0].applyToMesh(this.torsoLow);
        data[1].applyToMesh(this.torsoHigh);
        data[4].applyToMesh(this.camPos);
    }

    public dispose(doNotRecurse?: boolean, disposeMaterialAndTextures?: boolean): void {
        super.dispose(doNotRecurse, disposeMaterialAndTextures);
        this.armManager.dispose();
        this.legManager.dispose();
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

        //let driderRoot = BABYLON.MeshBuilder.CreateBox("drider root", { size: 0.2 });
        //driderRoot.material = SharedMaterials.RedMaterial();
        //driderRoot.position.copyFrom(this.absolutePosition);

        for (let i = 0; i < 6; i++) {
            this.footTargets[i].computeWorldMatrix(true);
            this.evaluatedFootTargets[i].copyFrom(this.footTargets[i].absolutePosition);
            this.evaluatedFootTargets[i].subtractInPlace(this.up.scale(0.4));
            
            //let evaluatedRoot = BABYLON.MeshBuilder.CreateBox("evaluated root", { size: 0.1 });
            //evaluatedRoot.material = SharedMaterials.CyanMaterial();
            //evaluatedRoot.position.copyFrom(this.evaluatedFootTargets[i]);
        }
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0, 0.7, 0), this.getWorldMatrix(), this.torsoLow.position);
        this.torsoLow.computeWorldMatrix(true);

        //let torsoRoot = BABYLON.MeshBuilder.CreateBox("torso root", { size: 0.2 });
        //torsoRoot.material = SharedMaterials.GreenMaterial();
        //torsoRoot.position.copyFrom(this.torsoLow.absolutePosition);

        this.legManager.doUpdate();
        for (let i = 0; i < 6; i++) {
            this.legManager.legs[i].targetPosition = this.evaluatedFootTargets[i];
            this.legManager.legs[i].doUpdate();
            this.legManager.legs[i].computeWorldMatrixes();
            
            //let footRoot = BABYLON.MeshBuilder.CreateBox("foot root", { size: 0.1 });
            //footRoot.material = SharedMaterials.BlueMaterial();
            //footRoot.position.copyFrom(this.legManager.legs[i].foot.absolutePosition);
        }
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

        let upQ = BABYLON.Quaternion.Identity();
        VMath.QuaternionFromYZAxisToRef(this.position, this.forward, upQ);
        BABYLON.Vector3.TransformCoordinatesToRef(new BABYLON.Vector3(0, 0.053, 0.277), this.torsoLow.getWorldMatrix(), this.torsoHigh.position);
        
        this.torsoHigh.rotationQuaternion = BABYLON.Quaternion.Slerp(this.rotationQuaternion, upQ, 0.8);

        let footCenter = BABYLON.Vector3.Zero();
        for (let i = 0; i < 6; i++) {
            footCenter.addInPlace(this.legManager.legs[i].foot.absolutePosition);
        }
        footCenter.scaleInPlace(1 / 6);
        footCenter.addInPlace(this.up.scale(0.8));
        this.torsoLow.position.scaleInPlace(0.9).addInPlace(footCenter.scale(0.1));
        this.torsoLow.rotationQuaternion.copyFrom(this.rotationQuaternion);

        let correction = BABYLON.Quaternion.RotationAxis(this.right, - Math.PI / 8);
        correction.multiplyToRef(this.torsoLow.rotationQuaternion, this.torsoLow.rotationQuaternion);

        this._keepUp();
    }
    
    public evaluateTarget(footIndex: number): void {
        let dir = this.up.scale(-1);
        let bestDist: number = 1.5;
        let bestPick: VPickInfo;
        for (let i = 0; i < this.meshes.length; i++) {
            let mesh = this.meshes[i];
            if (mesh) {
                let pick = VCollision.closestPointOnMesh(this.footTargets[footIndex].absolutePosition, mesh);
                if (pick && pick.hit) {
                    if (pick.distance < bestDist) {
                        bestDist = pick.distance;
                        bestPick = pick;
                    }
                }
            }
        }
        if (bestPick) {
            this.evaluatedFootTargets[footIndex] = bestPick.worldPoint;
            this.evaluatedFootNormals[footIndex] = bestPick.worldNormal;
            this.evaluatedFootTargetGrounded[footIndex] = true;
        }
        else {
            let idlePos = this.footTargets[footIndex].position.scale(0.5);
            BABYLON.Vector3.TransformCoordinatesToRef(idlePos, this.getWorldMatrix(), idlePos);
            this.evaluatedFootNormals[footIndex] = this.up;
            this.evaluatedFootTargetGrounded[footIndex] = false;
        }
        this.evaluatedFootTargetsDebugs[footIndex].position = this.evaluatedFootTargets[footIndex].clone();
        this.evaluatedFootTargetsDebugs[footIndex].position.addInPlace(this.evaluatedFootNormals[footIndex].scale(0.25));
        VMath.QuaternionFromYZAxisToRef(this.evaluatedFootNormals[footIndex], BABYLON.Vector3.Forward(), this.evaluatedFootTargetsDebugs[footIndex].rotationQuaternion);
        
    }

    private _keepUp(): void {
        let center = BABYLON.Vector3.Zero();
        
        for (let i = 0; i < 6; i++) {
            center.addInPlace(this.evaluatedFootTargets[i]);
        }
        center.scaleInPlace(1/6);

        if (!this.isGrounded()) {
            let upDirection = this.position.subtract(this.planet.position).normalize();
            let currentUp: BABYLON.Vector3 = BABYLON.Vector3.Normalize(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix()));
            let correctionAxis: BABYLON.Vector3 = BABYLON.Vector3.Cross(currentUp, upDirection);
            let correctionAngle: number = Math.abs(Math.asin(correctionAxis.length()));
            
            if (correctionAngle > 0.001) {
                let rotation: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(correctionAxis, correctionAngle / 10);
                this.rotationQuaternion = rotation.multiply(this.rotationQuaternion);
            }
            this.position.subtractInPlace(this.up.scale(2 * 1 / 60));
        }
        else {
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