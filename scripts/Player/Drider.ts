class Drider extends BABYLON.Mesh {

    public planet: Planet;

    public camPos: BABYLON.AbstractMesh;

    public torsoLow: BABYLON.Mesh;
    public torsoHigh: BABYLON.Mesh;

    public footTargets: BABYLON.Mesh[] = [];
    
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

        this.scene.onBeforeRenderObservable.add(this._update);
    }
    
    public async instantiate(): Promise<void> {
        let data = await VertexDataLoader.instance.get("drider");
        data[0].applyToMesh(this.torsoLow);
        data[1].applyToMesh(this.torsoHigh);
    }

    private _update = () => {

        this.torsoHigh.position.copyFromFloats(0, 0.26, 0.16);
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