class Human extends BABYLON.Mesh {

    public planet: Planet;

    public torsoLow: BABYLON.Mesh;
    public upperLegL: BABYLON.Mesh;
    public lowerLegL: BABYLON.Mesh;
    public upperLegR: BABYLON.Mesh;
    public lowerLegR: BABYLON.Mesh;
    public torsoHigh: BABYLON.Mesh;

    public armManager: HumanArmManager;

    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    constructor(
        public isLeftArm: boolean = true,
        scene: BABYLON.Scene
    ) {
        super("human", scene);
    }

    public initialize(): void {
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        
        let mat = new ToonMaterial("player-arm-material", this.scene);

        this.torsoLow = new BABYLON.Mesh("torso-low");
        this.torsoLow.material = mat;
        this.torsoLow.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.upperLegL = new BABYLON.Mesh("upper-leg-L");
        this.upperLegL.material = mat;
        this.upperLegL.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.lowerLegL = new BABYLON.Mesh("lower-leg-L");
        this.lowerLegL.material = mat;
        this.lowerLegL.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.upperLegR = new BABYLON.Mesh("upper-leg-R");
        this.upperLegR.material = mat;
        this.upperLegR.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.lowerLegR = new BABYLON.Mesh("lower-leg-R");
        this.lowerLegR.material = mat;
        this.lowerLegR.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.torsoHigh = new BABYLON.Mesh("torso-high");
        this.torsoHigh.material = mat;
        this.torsoHigh.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.armManager = new HumanArmManager(this);

        this.scene.onBeforeRenderObservable.add(this._update);
    }
    
    public async instantiate(): Promise<void> {
        let data = await VertexDataLoader.instance.get("human");
        data[0].applyToMesh(this.torsoLow);
        data[1].applyToMesh(this.upperLegL);
        data[2].applyToMesh(this.lowerLegL);
        VertexDataUtils.MirrorX(data[1]).applyToMesh(this.upperLegR);
        VertexDataUtils.MirrorX(data[2]).applyToMesh(this.lowerLegR);
        data[3].applyToMesh(this.torsoHigh);

        this.armManager.initialize();
    }

    private _update = () => {
        this.torsoLow.position.copyFromFloats(0, 1, 0);
        this.torsoLow.parent = this;

        this.upperLegL.position.copyFromFloats(-0.11, 0, 0);
        this.upperLegL.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2);
        this.upperLegL.parent = this.torsoLow;
        
        this.lowerLegL.position.copyFromFloats(0, 0, 0.46);
        this.lowerLegL.parent = this.upperLegL;

        this.upperLegR.position.copyFromFloats(0.11, 0, 0);
        this.upperLegR.rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI / 2);
        this.upperLegR.parent = this.torsoLow;
        
        this.lowerLegR.position.copyFromFloats(0, 0, 0.46);
        this.lowerLegR.parent = this.upperLegR;

        this.torsoHigh.position.copyFromFloats(0, 0.26, 0);
        this.torsoHigh.parent = this.torsoLow;

        this._keepUp();
    }

    private _keepUp(): void {
        if (!this) {
            return;
        }
        let upDirection = this.position.subtract(this.planet.position).normalize();
        let currentUp: BABYLON.Vector3 = BABYLON.Vector3.Normalize(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix()));
        let correctionAxis: BABYLON.Vector3 = BABYLON.Vector3.Cross(currentUp, upDirection);
        let correctionAngle: number = Math.abs(Math.asin(correctionAxis.length()));
        
        if (correctionAngle > 0.001) {
            let rotation: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(correctionAxis, correctionAngle / 10);
            this.rotationQuaternion = rotation.multiply(this.rotationQuaternion);
        }
    }
}