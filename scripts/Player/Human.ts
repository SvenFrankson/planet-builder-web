class Human extends BABYLON.Mesh {

    public planet: Planet;

    public head: BABYLON.AbstractMesh;

    public torsoLow: BABYLON.Mesh;
    public torsoHigh: BABYLON.Mesh;

    public footTargetL: BABYLON.Mesh;
    public footTargetR: BABYLON.Mesh;
    
    public targetLookStrength: number = 0.5;
    public targetLook: BABYLON.Vector3;

    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    public animateCamPosRotX = AnimationFactory.EmptyNumberCallback;
    public animateCamPosRotY = AnimationFactory.EmptyNumberCallback;

    constructor(
        public isLeftArm: boolean = true,
        scene: BABYLON.Scene
    ) {
        super("human", scene);

        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        
        this.head = new BABYLON.Mesh("Dummy", Game.Scene);
        this.head.parent = this;
        this.head.position = new BABYLON.Vector3(0, 1.77, 0);
        this.head.rotation.x = Math.PI / 8;

        this.animateCamPosRotX = AnimationFactory.CreateNumber(this, this.head.rotation, "x");
        this.animateCamPosRotY = AnimationFactory.CreateNumber(this, this.head.rotation, "y");
    }

    public initialize(): void {
        
        let mat = new ToonMaterial("player-arm-material", this.scene);

        this.torsoLow = new BABYLON.Mesh("torso-low");
        this.torsoLow.material = mat;
        this.torsoLow.rotationQuaternion = BABYLON.Quaternion.Identity();

        this.torsoHigh = new BABYLON.Mesh("torso-high");
        this.torsoHigh.material = mat;
        this.torsoHigh.rotationQuaternion = BABYLON.Quaternion.Identity();
        
        this.footTargetL = new BABYLON.Mesh("foot-target-L");
        this.footTargetL.position.x = -0.2;
        this.footTargetL.parent = this;
        BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.footTargetL);

        this.footTargetR = new BABYLON.Mesh("foot-target-R");
        this.footTargetR.position.x = 0.2;
        this.footTargetR.parent = this;
        BABYLON.CreateBoxVertexData({ size: 0.1 }).applyToMesh(this.footTargetR);

        this.scene.onBeforeRenderObservable.add(this._update);
    }
    
    public async instantiate(): Promise<void> {
        let data = await VertexDataLoader.instance.get("human");
        data[0].applyToMesh(this.torsoLow);
        data[5].applyToMesh(this.torsoHigh);
    }

    private _update = () => {

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