class PlayerArm extends BABYLON.Mesh {

    public target: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _arm: BABYLON.Mesh;
    private _elbow: BABYLON.Mesh;
    private _foreArm: BABYLON.Mesh;
    private _wrist: BABYLON.Mesh;
    private _hand: BABYLON.Mesh;
    private _fingers: BABYLON.Mesh[][];

    private _armLength: number = 0.34;
    private _foreArmLength: number = 0.35;
    private _handLength: number = 0.22;
    private _elbowToTargetLength: number = this._foreArmLength + this._handLength;
    private _fingersLength: number[][] = [
        [0.045, 0.04, 0.04],
        [0.048, 0.03, 0.03],
        [0.05, 0.036, 0.03],
        [0.045, 0.033, 0.03],
        [0.035, 0.023, 0.03]
    ];

    public handUp: BABYLON.Vector3 = new BABYLON.Vector3(0, 1, 0);

    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    constructor(scene: BABYLON.Scene) {
        super("player-arm", scene);
    }

    public async instantiate(): Promise<void> {
        let data = await VertexDataLoader.instance.get("arm");

        this._arm = new BABYLON.Mesh("arm");
        data[0].applyToMesh(this._arm);
        this._arm.parent = this;
        this._arm.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._elbow = new BABYLON.Mesh("elbow");
        data[1].applyToMesh(this._elbow);
        //this._elbow.parent = this._arm;
        //this._elbow.position.z = this._armLength;
        this._elbow.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._foreArm = new BABYLON.Mesh("foreArm");
        data[2].applyToMesh(this._foreArm);
        //this._foreArm.parent = this._arm;
        //this._foreArm.position.z = this._armLength;
        this._foreArm.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._wrist = new BABYLON.Mesh("wrist");
        data[3].applyToMesh(this._wrist);
        //this._wrist.parent = this._foreArm;
        //this._wrist.position.z = this._foreArmLength;
        this._wrist.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._hand = new BABYLON.Mesh("hand");
        data[4].applyToMesh(this._hand);
        //this._hand.parent = this._wrist;
        //this._hand.position.z = 0;
        this._hand.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._fingers = [];

        this._fingers[0] = [];
        this._fingers[0][0] = new BABYLON.Mesh("finger-0-0");
        data[5].applyToMesh(this._fingers[0][0]);
        this._fingers[0][0].parent = this._hand;
        this._fingers[0][0].position.copyFromFloats(0.035, 0, 0.01);
        this._fingers[0][0].rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI * 0.5);

        for (let i = 1; i <= 4; i++) {
            this._fingers[i] = [];
            this._fingers[i][0] = new BABYLON.Mesh("finger-" + i.toFixed(0) + "-0");
            data[5 + i * 3].applyToMesh(this._fingers[i][0]);
            this._fingers[i][0].parent = this._hand;
            this._fingers[i][0].rotationQuaternion = BABYLON.Quaternion.Identity();
        }
        this._fingers[1][0].position.copyFromFloats(0.034, 0, 0.087);
        this._fingers[2][0].position.copyFromFloats(0.012, 0, 0.088);
        this._fingers[3][0].position.copyFromFloats(- 0.01, 0, 0.086);
        this._fingers[4][0].position.copyFromFloats(- 0.033, 0, 0.079);

        for (let i = 0; i <= 4; i++) {
            for (let j = 1; j <= 2; j++) {
                this._fingers[i][j] = new BABYLON.Mesh("finger-" + i.toFixed(0) + "-" + j.toFixed(0));
                data[5 + i * 3 + j].applyToMesh(this._fingers[i][j]);
                this._fingers[i][j].parent = this._fingers[i][j - 1];
                this._fingers[i][j].position.z = this._fingersLength[i][j - 1];
                this._fingers[i][j].rotationQuaternion = BABYLON.Quaternion.Identity();
            }
        }

        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public setTarget(newTarget: BABYLON.Vector3): void {
        this.target.copyFrom(newTarget);
        if (BABYLON.Vector3.Distance(this.position, this.target) > this._armLength + this._elbowToTargetLength) {
            let n = this.target.subtract(this.position).normalize().scaleInPlace(this._armLength + this._elbowToTargetLength);
            this.target.copyFrom(n).addInPlace(this.position);
        }
    }

    private _elbowPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _wristPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _v0: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _v1: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _v2: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    
    private _update = () => {
        this._elbowPosition.y -= 0.05;
        this._elbowPosition.x -= 0.05;

        let n = this.target.subtract(this.position).normalize();
        this._wristPosition.subtractInPlace(n.scale(0.05));

        let armZ = this._v0;
        let foreArmZ = this._v1;
        let handZ = this._v2;
        for (let i = 0; i < 3; i++) {
            handZ.copyFrom(this.target).subtractInPlace(this._wristPosition).normalize().scaleInPlace(this._handLength);
            this._wristPosition.copyFrom(this.target).subtractInPlace(handZ);

            foreArmZ.copyFrom(this._wristPosition).subtractInPlace(this._elbowPosition).normalize().scaleInPlace(this._foreArmLength);
            this._elbowPosition.copyFrom(this._wristPosition).subtractInPlace(foreArmZ);

            armZ.copyFrom(this._elbowPosition).subtractInPlace(this._arm.absolutePosition).normalize().scaleInPlace(this._armLength);
            this._elbowPosition.copyFrom(this._arm.absolutePosition).addInPlace(armZ);
        }
        
        let armY = BABYLON.Vector3.Right().scaleInPlace(- 1);
        let armX = BABYLON.Vector3.Cross(armY, armZ);
        armY = BABYLON.Vector3.Cross(armZ, armX);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(armX, armY, armZ, this._arm.rotationQuaternion);
        
        this._foreArm.position.copyFrom(this._elbowPosition);
        let foreArmX = armZ.scale(- 1);
        let foreArmY = BABYLON.Vector3.Cross(foreArmZ, foreArmX);
        foreArmX = BABYLON.Vector3.Cross(foreArmY, foreArmZ);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(foreArmX, foreArmY, foreArmZ, this._foreArm.rotationQuaternion);

        this._elbow.position.copyFrom(this._elbowPosition);
        let elbowX = foreArmX;
        let elbowZ = armZ;
        let elbowY = BABYLON.Vector3.Cross(elbowZ, elbowX);
        elbowX = BABYLON.Vector3.Cross(elbowY, elbowZ);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(elbowX, elbowY, elbowZ, this._elbow.rotationQuaternion);

        this._hand.position.copyFrom(this._wristPosition);
        let handX = BABYLON.Vector3.Cross(foreArmZ, handZ);
        let handY = BABYLON.Vector3.Cross(handZ, handX);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(handX, handY, handZ, this._hand.rotationQuaternion);

        this._wrist.position.copyFrom(this._wristPosition);
        let wristZ = foreArmZ;
        let wristY = handY;
        let wristX = BABYLON.Vector3.Cross(wristY, wristZ);
        wristY = BABYLON.Vector3.Cross(wristZ, wristX);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(wristX, wristY, wristZ, this._wrist.rotationQuaternion);
    }
}