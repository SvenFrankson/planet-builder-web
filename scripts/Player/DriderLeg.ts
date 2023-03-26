class DriderLeg extends BABYLON.Mesh {

    public targetPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public tmpDistance: number = 0;

    private _upperLeg: BABYLON.Mesh;
    private _lowerLeg: BABYLON.Mesh;
    public foot: BABYLON.Mesh;

    private _upperLegLength: number = 0.7;
    private _lowerLegLength: number = 1;
    
    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    constructor(
        public index: number = 0,
        scene: BABYLON.Scene
    ) {
        super("player-arm", scene);
    }

    public setPosition(p: BABYLON.Vector3): void {
        this._upperLeg.position.copyFrom(p);
        this._lowerLeg.position.copyFrom(p);
    }

    public initialize(): void {
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        
        let mat = new ToonMaterial("human-leg-material", this.scene);

        this._upperLeg = new BABYLON.Mesh("upper-leg");
        this._upperLeg.material = mat;
        this._upperLeg.rotationQuaternion = BABYLON.Quaternion.Identity();

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
    }

    public setTarget(newTarget: BABYLON.Vector3): void {
        this.targetPosition.copyFrom(newTarget);
    }

    private _debugCurrentTarget: BABYLON.Mesh;
    private _kneePosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _v0: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _v1: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _v2: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _q0: BABYLON.Quaternion = BABYLON.Quaternion.Identity();

    private _update = () => {
        
        if (DebugDefine.SHOW_PLAYER_ARM_CURRENT_TARGET) {
            if (!this._debugCurrentTarget) {
                this._debugCurrentTarget = BABYLON.MeshBuilder.CreateSphere("debug-current-target", { diameter: 0.03 }, this.getScene());
                let material = new BABYLON.StandardMaterial("material", this.getScene());
                material.alpha = 0.5;
                this._debugCurrentTarget.material = material;
            }
            this._debugCurrentTarget.position.copyFrom(this.targetPosition);
        }
        
        this._upperLeg.position.copyFrom(this.absolutePosition);
        this._kneePosition.copyFromFloats(0, this._upperLegLength * 0.5, 0);
        VMath.RotateVectorByQuaternionToRef(this._kneePosition, this.rotationQuaternion, this._kneePosition);
        this._kneePosition.addInPlace(this._upperLeg.absolutePosition);
        
        let currentTarget = this.targetPosition.clone();

        let upperLegZ = this._v0;
        let lowerLegZ = this._v1;
        for (let i = 0; i < 3; i++) {
            lowerLegZ.copyFrom(currentTarget).subtractInPlace(this._kneePosition).normalize().scaleInPlace(this._lowerLegLength);
            this._kneePosition.copyFrom(currentTarget).subtractInPlace(lowerLegZ);

            upperLegZ.copyFrom(this._kneePosition).subtractInPlace(this._upperLeg.absolutePosition).normalize().scaleInPlace(this._upperLegLength);
            this._kneePosition.copyFrom(this._upperLeg.absolutePosition).addInPlace(upperLegZ);
        }

        let magicNumber2 = 1 - Easing.smooth025Sec(this.scene.getEngine().getFps());
        
        let upperLegY = this.forward;
        VMath.QuaternionFromZYAxisToRef(upperLegZ, upperLegY, this._q0);
        BABYLON.Quaternion.SlerpToRef(this._upperLeg.rotationQuaternion, this._q0, magicNumber2, this._upperLeg.rotationQuaternion);
        
        this._lowerLeg.position.copyFromFloats(0, 0, this._upperLegLength);
        VMath.RotateVectorByQuaternionToRef(this._lowerLeg.position, this._upperLeg.rotationQuaternion, this._lowerLeg.position);
        this._lowerLeg.position.addInPlace(this._upperLeg.position);

        VMath.QuaternionFromZYAxisToRef(lowerLegZ, this.forward, this._q0);
        BABYLON.Quaternion.SlerpToRef(this._lowerLeg.rotationQuaternion, this._q0, magicNumber2, this._lowerLeg.rotationQuaternion);
    }
}