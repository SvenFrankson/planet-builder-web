enum HandMode {
    Idle,
    Point,
    Grab,
    Like
}

enum HandTargetAnchor {
    ThumbTip = 0,
    IndexTip = 1,
    MiddleTip = 2,
    RingTip = 3,
    PinkieTip = 4,
    Palm = 5,
    Knucles = 6
}

class PlayerArm extends BABYLON.Mesh {

    public requestedTarget: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public target: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public targetOffset: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public targetUp: BABYLON.Vector3 = BABYLON.Vector3.Up();
    public targetAnchor: HandTargetAnchor = HandTargetAnchor.Palm;

    private _arm: BABYLON.Mesh;
    private _elbow: BABYLON.Mesh;
    private _foreArm: BABYLON.Mesh;
    private _wrist: BABYLON.Mesh;
    private _hand: BABYLON.Mesh;
    private _fingers: BABYLON.Mesh[][];
    public maxHandSpeed: number = 3;

    private _armLength: number = 0.34;
    private _foreArmLength: number = 0.35;
    private _handLength: number = 0.22;
    private _wristLength: number = this._armLength + this._foreArmLength;
    public get wristLength(): number {
        return this._wristLength;
    }
    private _elbowToTargetLength: number = this._foreArmLength + this._handLength;
    private _fullLength: number = this._armLength + this._foreArmLength + this._handLength;
    public get fullLength(): number {
        return this._fullLength;
    }
    private _fingersLength: number[][] = [
        [0.043, 0.042, 0.04],
        [0.040, 0.038, 0.035],
        [0.044, 0.042, 0.035],
        [0.040, 0.038, 0.035],
        [0.030, 0.028, 0.03]
    ];
    private _palmLocalPos: BABYLON.Vector3 = new BABYLON.Vector3(0, - 0.01, 0.088);
    private _knucklesLocalPos: BABYLON.Vector3 = new BABYLON.Vector3(0, 0.02, 0.09);
    public get signLeft(): number {
        return this.isLeftArm ? 1 : - 1;
    }

    public handUp: BABYLON.Vector3 = new BABYLON.Vector3(- 0.5, 1, 0);
    public handUpStrictness: number = 0;

    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    constructor(
        public isLeftArm: boolean = true,
        scene: BABYLON.Scene
    ) {
        super("player-arm", scene);
    }

    public initialize(): void {
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        
        let mat = new ToonMaterial("player-arm-material", this.scene);

        this._arm = new BABYLON.Mesh("arm");
        this._arm.material = mat;
        this._arm.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._elbow = new BABYLON.Mesh("elbow");
        this._elbow.material = mat;
        //this._elbow.parent = this._arm;
        //this._elbow.position.z = this._armLength;
        this._elbow.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._foreArm = new BABYLON.Mesh("foreArm");
        this._foreArm.material = mat;
        //this._foreArm.parent = this._arm;
        //this._foreArm.position.z = this._armLength;
        this._foreArm.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._wrist = new BABYLON.Mesh("wrist");
        this._wrist.material = mat;
        //this._wrist.parent = this._foreArm;
        //this._wrist.position.z = this._foreArmLength;
        this._wrist.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._hand = new BABYLON.Mesh("hand");
        this._hand.material = mat;
        //this._hand.parent = this._wrist;
        //this._hand.position.z = 0;
        this._hand.rotationQuaternion = BABYLON.Quaternion.Identity();

        this._fingers = [];

        this._fingers[0] = [];
        this._fingers[0][0] = new BABYLON.Mesh("finger-0-0");
        this._fingers[0][0].material = mat;
        this._fingers[0][0].parent = this._hand;
        this._fingers[0][0].position.copyFromFloats(this.signLeft * 0.035, - 0.01, 0.01);
        let thumbY = BABYLON.Vector3.Right().scale(this.signLeft);
        let thumbZ = (new BABYLON.Vector3(1 * this.signLeft, - 1, 1)).normalize();
        let thumbX = BABYLON.Vector3.Cross(thumbY, thumbZ);
        thumbY = BABYLON.Vector3.Cross(thumbZ, thumbX);
        this._fingers[0][0].rotationQuaternion = BABYLON.Quaternion.RotationQuaternionFromAxis(thumbX, thumbY, thumbZ);

        for (let i = 1; i <= 4; i++) {
            this._fingers[i] = [];
            this._fingers[i][0] = new BABYLON.Mesh("finger-" + i.toFixed(0) + "-0");
            this._fingers[i][0].material = mat;
            this._fingers[i][0].parent = this._hand;
            //this._fingers[i][0].rotationQuaternion = BABYLON.Quaternion.Identity();
        }
        this._fingers[1][0].position.copyFromFloats(this.signLeft * 0.034, 0.005, 0.087);
        this._fingers[2][0].position.copyFromFloats(this.signLeft * 0.012, 0.01, 0.088);
        this._fingers[3][0].position.copyFromFloats(- this.signLeft * 0.01, 0.01, 0.086);
        this._fingers[4][0].position.copyFromFloats(- this.signLeft * 0.033, 0.005, 0.079);

        for (let i = 0; i <= 4; i++) {
            for (let j = 1; j <= 3; j++) {
                this._fingers[i][j] = new BABYLON.Mesh("finger-" + i.toFixed(0) + "-" + j.toFixed(0));
                if (j < 3) {
                    this._fingers[i][j].material = mat;
                }
                this._fingers[i][j].parent = this._fingers[i][j - 1];
                this._fingers[i][j].position.z = this._fingersLength[i][j - 1];
                //this._fingers[i][j].rotationQuaternion = BABYLON.Quaternion.Identity();
            }
        }

        this.setFingerGrabiness(1, 0.1);
        this.setFingerGrabiness(2, 0.35);
        this.setFingerGrabiness(3, 0.5);
        this.setFingerGrabiness(4, 0.65);
        this._fingers[0][1].rotation.x = this.signLeft * 0.6 * Math.PI * 0.5;
        this._fingers[0][2].rotation.x = this.signLeft * 0.6 * Math.PI * 0.5;

        this.scene.onBeforeRenderObservable.add(this._update);
    }
    
    public async instantiate(): Promise<void> {
        let data = await VertexDataLoader.instance.get("arm");
        if (!this.isLeftArm) {
            data = data.map(d => { return VertexDataUtils.MirrorX(d); });
        }
        data[0].applyToMesh(this._arm);
        data[1].applyToMesh(this._elbow);
        data[2].applyToMesh(this._foreArm);
        data[3].applyToMesh(this._wrist);
        data[4].applyToMesh(this._hand);
        VertexDataUtils.Scale(data[5], this._fingersLength[0][0] / 0.05).applyToMesh(this._fingers[0][0]);
        for (let i = 1; i <= 4; i++) {
            VertexDataUtils.Scale(data[5], this._fingersLength[i][0] / 0.045).applyToMesh(this._fingers[i][0]);
        }
        for (let i = 0; i <= 4; i++) {
            for (let j = 1; j < 3; j++) {
                VertexDataUtils.Scale(data[j === 1 ? 5 : 6], this._fingersLength[i][j] / (j === 1 ? 0.045 : 0.04)).applyToMesh(this._fingers[i][j]);
            }
        }
    }

    public setTarget(newTarget: BABYLON.Vector3): void {
        this.requestedTarget.copyFrom(newTarget);
    }

    public setFingerGrabiness(fingerIndex: number, grabiness: number): void {
        let a = grabiness * Math.PI * 0.5;
        this._fingers[fingerIndex][0].rotation.x = a;
        this._fingers[fingerIndex][1].rotation.x = a;
        this._fingers[fingerIndex][2].rotation.x = a;
    }

    public handMode: HandMode = HandMode.Point;
    public setHandMode(mode: HandMode): void {
        if (this.handMode != mode) {
            this.handMode = mode;
            this.animateToGrabness(mode);
            this.animateToSpreadness(mode);
        }
    }

    private async _animateGrabness(fingerIndex: number, grabinessTarget: number, duration: number): Promise<void> {
        return new Promise<void>(resolve => {
            let grabinessZero = this._fingers[fingerIndex][0].rotation.x / (Math.PI * 0.5);
            let t = 0;
            let cb = () => {
                t += this.scene.getEngine().getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.setFingerGrabiness(fingerIndex, grabinessZero * (1 - f) + grabinessTarget * f);
                }
                else {
                    this.setFingerGrabiness(fingerIndex, grabinessTarget);
                    this.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            }
            this.scene.onBeforeRenderObservable.add(cb);
        });
    }

    public updateHandUp(): void {
        if (this.handMode === HandMode.Point) {
            let delta = this.target.subtract(this.position);
            let dx = this.signLeft * BABYLON.Vector3.Dot(delta, this.right) / this._fullLength;
            let target = new BABYLON.Vector3(dx, 1, 0);
            VMath.RotateVectorByQuaternionToRef(target, this.rotationQuaternion, target);
            this.handUp.x = this.handUp.x * 0.9 + (target.x) * 0.1;
            this.handUp.y = this.handUp.y * 0.9 + (target.y) * 0.1;
            this.handUp.z = this.handUp.z * 0.9 + (target.z) * 0.1;
            this.handUp.normalize();
        }
        else if (this.handMode === HandMode.Grab) {
            this.handUp.x = this.handUp.x * 0.9 + this.targetUp.x * 0.1;
            this.handUp.y = this.handUp.y * 0.9 + this.targetUp.y * 0.1;
            this.handUp.z = this.handUp.z * 0.9 + this.targetUp.z * 0.1;
            this.handUp.normalize();
        }
        else if (this.handMode === HandMode.Like) {
            this.handUp.x = this.handUp.x * 0.9 + (- this.signLeft * 1) * 0.1;
            this.handUp.y = this.handUp.y * 0.9 + (0) * 0.1;
            this.handUp.normalize();
        }
        else if (this.handMode === HandMode.Idle) {
            let target = new BABYLON.Vector3(- this.signLeft * 1, 0, 0);
            VMath.RotateVectorByQuaternionToRef(target, this.rotationQuaternion, target);
            this.handUp.x = this.handUp.x * 0.9 + (target.x) * 0.1;
            this.handUp.y = this.handUp.y * 0.9 + (target.y) * 0.1;
            this.handUp.z = this.handUp.z * 0.9 + (target.z) * 0.1;
            this.handUp.normalize();
        }
    }

    public updateHandUpStrictness(): void {
        if (this.handMode === HandMode.Grab) {
            this.handUpStrictness = 1;
        }
        else {
            this.handUpStrictness = 0;
        }
    }

    public updateTargetAnchor(): void {
        if (this.handMode === HandMode.Point) {
            this.targetAnchor = HandTargetAnchor.IndexTip;
        }
        else if (this.handMode === HandMode.Grab) {
            this.targetAnchor = HandTargetAnchor.Palm;
        }
        else {
            this.targetAnchor = HandTargetAnchor.Palm;
        }
    }

    public getAnchorPosition(): BABYLON.Vector3 {
        if (this.targetAnchor <= HandTargetAnchor.PinkieTip) {
            return this._fingers[this.targetAnchor][3].absolutePosition;
        } 
        else if (this.targetAnchor === HandTargetAnchor.Palm) {
            let m = BABYLON.Matrix.Compose(BABYLON.Vector3.One(), this._computedHandQ, this._hand.absolutePosition);
            return BABYLON.Vector3.TransformCoordinates(this._palmLocalPos, m);
        }
        else if (this.targetAnchor === HandTargetAnchor.Knucles) {
            let m = BABYLON.Matrix.Compose(BABYLON.Vector3.One(), this._computedHandQ, this._hand.absolutePosition);
            return BABYLON.Vector3.TransformCoordinates(this._knucklesLocalPos, m);
        }
    }

    public animateToGrabness(mode: HandMode, duration: number = 1): void {
        if (mode === HandMode.Point) {
            this._animateGrabness(0, 0.6, duration);
            this._animateGrabness(1, 0.1, duration);
            this._animateGrabness(2, 0.35, duration);
            this._animateGrabness(3, 0.5, duration);
            this._animateGrabness(4, 0.65, duration);
        }
        else if (mode === HandMode.Grab) {
            this._animateGrabness(0, 0.1, duration);
            this._animateGrabness(1, 0.1, duration);
            this._animateGrabness(2, 0.1, duration);
            this._animateGrabness(3, 0.1, duration);
            this._animateGrabness(4, 0.1, duration);
        }
        else if (mode === HandMode.Like) {
            this._animateGrabness(0, 0, duration);
            this._animateGrabness(1, 1, duration);
            this._animateGrabness(2, 1, duration);
            this._animateGrabness(3, 1, duration);
            this._animateGrabness(4, 1, duration);
        }
        else {
            this._animateGrabness(0, 0.2, duration);
            this._animateGrabness(1, 0.2, duration);
            this._animateGrabness(2, 0.2, duration);
            this._animateGrabness(3, 0.2, duration);
            this._animateGrabness(4, 0.2, duration);
        }
    }

    public updateGrabness(): void {

    }

    public animateToSpreadness(mode: HandMode, duration: number = 1): void {
        
    }

    public updateSpreadness(): void {
        
    }

    private _elbowPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _wristPosition: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _v0: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _v1: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _v2: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private _q0: BABYLON.Quaternion = BABYLON.Quaternion.Identity();
    private _computedHandQ: BABYLON.Quaternion = BABYLON.Quaternion.Identity();

    private _update = () => {
        let dt = this.scene.getEngine().getDeltaTime() / 1000;
        
        if (BABYLON.Vector3.Distance(this.position, this.requestedTarget) > this._fullLength) {
            let n = this.requestedTarget.subtract(this.position).normalize().scaleInPlace(this._fullLength);
            this.requestedTarget.copyFrom(n).addInPlace(this.position);
        }

        this.updateHandUp();
        this.updateHandUpStrictness();
        this.updateTargetAnchor();
        this.updateGrabness();
        this.updateSpreadness();

        let dTargetMove = dt * this.maxHandSpeed;
        if (BABYLON.Vector3.Distance(this.position, this.target) > this._fullLength) {
            let n = this.target.subtract(this.position).normalize().scaleInPlace(this._fullLength);
            this.target.copyFrom(n).addInPlace(this.position);
        }
        
        VMath.StepToRef(this.target, this.requestedTarget, dTargetMove, this.target);

        let elbowOffset = new BABYLON.Vector3(this.signLeft * 2 * dt, 2 * dt, 0);
        VMath.RotateVectorByQuaternionToRef(elbowOffset, this.rotationQuaternion, elbowOffset);
        this._elbowPosition.subtractInPlace(elbowOffset);

        let currentTarget = this.target.add(this.targetOffset);

        let n = currentTarget.subtract(this._elbowPosition).normalize();
        this._wristPosition.subtractInPlace(n.scale(0.07));

        this._arm.position.copyFrom(this.absolutePosition);

        let anchor = this.getAnchorPosition()
        let handLength = BABYLON.Vector3.Distance(anchor, this._wristPosition);
        let armZ = this._v0;
        let foreArmZ = this._v1;
        let handZ = this._v2;
        for (let i = 0; i < 3; i++) {
            handZ.copyFrom(currentTarget).subtractInPlace(this._wristPosition).normalize().scaleInPlace(handLength);
            this._wristPosition.copyFrom(currentTarget).subtractInPlace(handZ);

            foreArmZ.copyFrom(this._wristPosition).subtractInPlace(this._elbowPosition).normalize().scaleInPlace(this._foreArmLength);
            this._elbowPosition.copyFrom(this._wristPosition).subtractInPlace(foreArmZ);

            armZ.copyFrom(this._elbowPosition).subtractInPlace(this._arm.absolutePosition).normalize().scaleInPlace(this._armLength);
            this._elbowPosition.copyFrom(this._arm.absolutePosition).addInPlace(armZ);
        }

        this._wristPosition.copyFrom(this._elbowPosition).addInPlace(foreArmZ);
        
        let armY = this.right.scaleInPlace(- this.signLeft * 1);
        VMath.QuaternionFromZYAxisToRef(armZ, armY, this._q0);
        BABYLON.Quaternion.SlerpToRef(this._arm.rotationQuaternion, this._q0, 1, this._arm.rotationQuaternion);
        
        this._foreArm.position.copyFrom(this._elbowPosition);
        let foreArmX = armZ.scale(- 1 * this.signLeft);
        VMath.QuaternionFromZXAxisToRef(foreArmZ, foreArmX, this._q0);
        BABYLON.Quaternion.SlerpToRef(this._foreArm.rotationQuaternion, this._q0, 1, this._foreArm.rotationQuaternion);

        this._elbow.position.copyFrom(this._elbowPosition);
        let elbowX = foreArmZ.scale(this.signLeft);
        let elbowZ = armZ;
        VMath.QuaternionFromZXAxisToRef(elbowZ, elbowX, this._q0);
        BABYLON.Quaternion.SlerpToRef(this._elbow.rotationQuaternion, this._q0, 1, this._elbow.rotationQuaternion);

        this._hand.position.copyFrom(this._wristPosition);
        let handY = this.handUp;
        if (this.handUpStrictness < 0.5) {
            VMath.QuaternionFromZYAxisToRef(handZ, handY, this._computedHandQ);
            BABYLON.Quaternion.SlerpToRef(this._hand.rotationQuaternion, this._computedHandQ, 0.1, this._hand.rotationQuaternion);
        }
        else {
            VMath.QuaternionFromYZAxisToRef(handY, handZ, this._computedHandQ);
            BABYLON.Quaternion.SlerpToRef(this._hand.rotationQuaternion, this._computedHandQ, 0.1, this._hand.rotationQuaternion);
        }

        this._wrist.position.copyFrom(this._wristPosition);
        let wristZ = foreArmZ;
        let wristY = this._hand.up;
        VMath.QuaternionFromZYAxisToRef(wristZ, wristY, this._q0);
        BABYLON.Quaternion.SlerpToRef(this._wrist.rotationQuaternion, this._q0, 1, this._wrist.rotationQuaternion);

        let error = this.target.subtract(anchor);
        if (error.lengthSquared() > 0.1 * 0.1) {
            this.targetOffset.scaleInPlace(0.95);
            error.normalize().scaleInPlace(0.1);
        }
        this.targetOffset.addInPlace(error.scale(1 / 20));
    }
}