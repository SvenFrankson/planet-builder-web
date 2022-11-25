class PlayerArm extends BABYLON.Mesh {

    public target: BABYLON.Vector3 = BABYLON.Vector3.Zero();

    private _arm: BABYLON.Mesh;
    private _foreArm: BABYLON.Mesh;
    private _hand: BABYLON.Mesh;
    private _fingers: BABYLON.Mesh[][];

    private _armLength: number = 0.33;
    private _elbowToTargetLength: number = 0.5;
    private _fingersLength: number[][] = [
        [0.07, 0.05, 0.04],
        [0.06, 0.04, 0.03],
        [0.07, 0.04, 0.03],
        [0.06, 0.04, 0.03],
        [0.05, 0.03, 0.03]
    ]

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

        this._foreArm = new BABYLON.Mesh("foreArm");
        data[1].applyToMesh(this._foreArm);
        //this._foreArm.parent = this._arm;
        //this._foreArm.position.z = 0.33;
        this._foreArm.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._hand = new BABYLON.Mesh("hand");
        data[2].applyToMesh(this._hand);
        this._hand.parent = this._foreArm;
        this._hand.position.z = 0.32;
        this._hand.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._fingers = [];

        this._fingers[0] = [];
        this._fingers[0][0] = new BABYLON.Mesh("finger-0-0");
        data[3].applyToMesh(this._fingers[0][0]);
        this._fingers[0][0].parent = this._hand;
        this._fingers[0][0].position.x = 0.05;
        this._fingers[0][0].position.z = - 0.005;
        this._fingers[0][0].rotationQuaternion = BABYLON.Quaternion.RotationAxis(BABYLON.Axis.Y, Math.PI * 0.5);

        for (let i = 1; i <= 4; i++) {
            this._fingers[i] = [];
            this._fingers[i][0] = new BABYLON.Mesh("finger-" + i.toFixed(0) + "-0");
            data[3 + i * 3].applyToMesh(this._fingers[i][0]);
            this._fingers[i][0].parent = this._hand;
            this._fingers[i][0].position.x = 0.045 - (i - 1) * 0.03;
            this._fingers[i][0].position.z = 0.095;
            this._fingers[i][0].rotationQuaternion = BABYLON.Quaternion.Identity();
        }

        for (let i = 0; i <= 4; i++) {
            for (let j = 1; j <= 2; j++) {
                this._fingers[i][j] = new BABYLON.Mesh("finger-" + i.toFixed(0) + "-" + j.toFixed(0));
                data[3 + i * 3 + j].applyToMesh(this._fingers[i][j]);
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
    private _v0: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _v1: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _update = () => {
        this._elbowPosition.copyFrom(this.position);
        this._elbowPosition.y -= 0.5;
        this._elbowPosition.x -= 0.5;

        let armDir = this._v0;
        let foreArmDir = this._v1;
        for (let i = 0; i < 5; i++) {
            armDir.copyFrom(this._elbowPosition).subtractInPlace(this._arm.absolutePosition).normalize().scaleInPlace(this._armLength);
            this._elbowPosition.copyFrom(this._arm.absolutePosition).addInPlace(armDir);

            foreArmDir.copyFrom(this.target).subtractInPlace(this._elbowPosition).normalize().scaleInPlace(this._elbowToTargetLength);
            this._elbowPosition.copyFrom(this.target).subtractInPlace(foreArmDir);
        }
        
        let x = BABYLON.Vector3.Forward();
        let y = BABYLON.Vector3.Cross(armDir, x);
        x = BABYLON.Vector3.Cross(y, armDir);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(x, y, armDir, this._arm.rotationQuaternion);
        
        this._foreArm.position.copyFrom(this._elbowPosition);
        x = BABYLON.Vector3.Right();
        y = BABYLON.Vector3.Cross(foreArmDir, x);
        x = BABYLON.Vector3.Cross(y, foreArmDir);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(x, y, foreArmDir, this._foreArm.rotationQuaternion);
    }
}