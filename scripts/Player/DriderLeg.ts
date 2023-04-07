class DriderLeg extends BABYLON.Mesh {

    public grounded: boolean = true;
    
    public targetPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public targetNormal: BABYLON.Vector3 = BABYLON.Vector3.Up();
    public tmpDistance: number = 0;

    private _upperLeg: BABYLON.Mesh;
    private _middleLeg: BABYLON.Mesh;
    private _lowerLeg: BABYLON.Mesh;
    public foot: BABYLON.Mesh;

    private _upperLegLength: number = 0.6;
    private _middleLegLength: number = 0.45;
    private _lowerLegLength: number = 0.45;
    
    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    constructor(
        public index: number = 0,
        public drider: Drider,
        scene: BABYLON.Scene
    ) {
        super("player-arm", scene);
    }

    public initialize(): void {
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        
        let mat = new ToonMaterial("human-leg-material", this.scene);

        this._upperLeg = new BABYLON.Mesh("upper-leg");
        this._upperLeg.material = mat;
        this._upperLeg.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._middleLeg = new BABYLON.Mesh("middle-leg");
        this._middleLeg.material = mat;
        this._middleLeg.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._lowerLeg = new BABYLON.Mesh("lower-leg");
        this._lowerLeg.material = mat;
        this._lowerLeg.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.foot = new BABYLON.Mesh("foot");
        this.foot.parent = this._lowerLeg;
        this.foot.position.z = this._lowerLegLength;
        //BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.foot);

        this.scene.onBeforeRenderObservable.add(this._update);
    }
    
    public async instantiate(): Promise<void> {
        let data = await VertexDataLoader.instance.get("drider");
        data[2].applyToMesh(this._upperLeg);
        data[3].applyToMesh(this._middleLeg);
        data[4].applyToMesh(this._lowerLeg);
        /*
        let upperLegMeshData = BABYLON.CreateBoxVertexData({ width: 0.05, height: 0.05, depth: this._upperLegLength });
        upperLegMeshData.positions = upperLegMeshData.positions.map((v: number, i: number) => { 
            if (i % 3 === 2) {
                return v + this._upperLegLength * 0.5;
            }
            return v;
        });
        upperLegMeshData.applyToMesh(this._upperLeg);
        
        let lowerLegMeshData = BABYLON.CreateBoxVertexData({ width: 0.05, height: 0.05, depth: this._lowerLegLength });
        lowerLegMeshData.positions = lowerLegMeshData.positions.map((v: number, i: number) => { 
            if (i % 3 === 2) {
                return v + this._lowerLegLength * 0.5;
            }
            return v;
        });
        lowerLegMeshData.applyToMesh(this._lowerLeg);
        */
    }

    public setTarget(newTarget: BABYLON.Vector3): void {
        this.targetPosition.copyFrom(newTarget);
    }

    public computeWorldMatrixes(): void {
        this._upperLeg.computeWorldMatrix(true);
        this._middleLeg.computeWorldMatrix(true);
        this._lowerLeg.computeWorldMatrix(true);
        this.foot.computeWorldMatrix(true);
    }

    private _debugCurrentTarget: BABYLON.Mesh;
    private _kneeHighPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _kneeLowPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _v0: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _v1: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _v2: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _q0: BABYLON.Quaternion = BABYLON.Quaternion.Identity();

    public doUpdate(): void {
        this._update(undefined, undefined, true);
    }
    private _update = (eventData: BABYLON.Scene, eventState: BABYLON.EventState, ignorePreviousState?: boolean) => {
        
        if (DebugDefine.SHOW_PLAYER_ARM_CURRENT_TARGET) {
            if (!this._debugCurrentTarget) {
                this._debugCurrentTarget = BABYLON.MeshBuilder.CreateSphere("debug-current-target", { diameter: 0.03 }, this.getScene());
                let material = new BABYLON.StandardMaterial("material", this.getScene());
                material.alpha = 0.5;
                this._debugCurrentTarget.material = material;
            }
            this._debugCurrentTarget.position.copyFrom(this.targetPosition);
        }
        
        let planetUp = this.drider.position.clone().normalize();

        this._upperLeg.position.copyFrom(this.absolutePosition);

        this._kneeLowPosition.copyFrom(this.targetPosition);
        this._kneeLowPosition.addInPlace(planetUp.scale(this._lowerLegLength));

        this._kneeHighPosition.copyFrom(this._kneeLowPosition).addInPlace(this.position).scaleInPlace(0.5);
        //this._kneeHighPosition.addInPlace(planetUp.scale(this._upperLegLength));
        
        let currentTarget = this.targetPosition.clone();
        if (!this.grounded) {
            currentTarget = this.position.subtract(this.up);
        }

        let upperLegZ = this._v0;
        let middleLegZ = this._v1;
        let lowerLegZ = this._v1;
        for (let i = 0; i < 3; i++) {
            lowerLegZ.copyFrom(currentTarget).subtractInPlace(this._kneeLowPosition).normalize().scaleInPlace(this._lowerLegLength);
            this._kneeLowPosition.copyFrom(currentTarget).subtractInPlace(lowerLegZ);

            middleLegZ.copyFrom(this._kneeLowPosition).subtractInPlace(this._kneeHighPosition).normalize().scaleInPlace(this._middleLegLength);
            this._kneeHighPosition.copyFrom(this._kneeLowPosition).subtractInPlace(middleLegZ);

            upperLegZ.copyFrom(this._kneeHighPosition).subtractInPlace(this._upperLeg.absolutePosition).normalize().scaleInPlace(this._upperLegLength);
            this._kneeHighPosition.copyFrom(this._upperLeg.absolutePosition).addInPlace(upperLegZ);

            middleLegZ.copyFrom(this._kneeLowPosition).subtractInPlace(this._kneeHighPosition).normalize().scaleInPlace(this._middleLegLength);
            this._kneeLowPosition.copyFrom(this._kneeHighPosition).subtractInPlace(middleLegZ);
        }

        let magicNumber2 = 1 - Easing.smooth025Sec(this.scene.getEngine().getFps());
        if (ignorePreviousState) {
            magicNumber2 = 1;
        }
        
        let upperLegY = this.drider.up;
        VMath.QuaternionFromZYAxisToRef(upperLegZ, upperLegY, this._q0);
        BABYLON.Quaternion.SlerpToRef(this._upperLeg.rotationQuaternion, this._q0, magicNumber2, this._upperLeg.rotationQuaternion);
        
        this._middleLeg.position.copyFromFloats(0, 0, this._upperLegLength);
        VMath.RotateVectorByQuaternionToRef(this._middleLeg.position, this._upperLeg.rotationQuaternion, this._middleLeg.position);
        this._middleLeg.position.addInPlace(this._upperLeg.position);

        VMath.QuaternionFromZYAxisToRef(middleLegZ, upperLegZ, this._q0);
        BABYLON.Quaternion.SlerpToRef(this._middleLeg.rotationQuaternion, this._q0, magicNumber2, this._middleLeg.rotationQuaternion);
        
        this._lowerLeg.position.copyFromFloats(0, 0, this._middleLegLength);
        VMath.RotateVectorByQuaternionToRef(this._lowerLeg.position, this._middleLeg.rotationQuaternion, this._lowerLeg.position);
        this._lowerLeg.position.addInPlace(this._middleLeg.position);

        VMath.QuaternionFromZYAxisToRef(lowerLegZ, middleLegZ, this._q0);
        BABYLON.Quaternion.SlerpToRef(this._lowerLeg.rotationQuaternion, this._q0, magicNumber2, this._lowerLeg.rotationQuaternion);
    }
}