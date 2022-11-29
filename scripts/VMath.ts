class VMath {

    public static IsFinite(v: BABYLON.Vector3): boolean;
    public static IsFinite(o: any): boolean {
        if (o instanceof BABYLON.Vector3) {
            return isFinite(o.x) && isFinite(o.y) && isFinite(o.z);
        }
        return false;
    }

    public static ProjectPerpendicularAt(v: BABYLON.Vector3, at: BABYLON.Vector3): BABYLON.Vector3 {
        let p: BABYLON.Vector3 = BABYLON.Vector3.Zero();
        let k: number = (v.x * at.x + v.y * at.y + v.z * at.z);
        k = k / (at.x * at.x + at.y * at.y + at.z * at.z);
        p.copyFrom(v);
        p.subtractInPlace(at.multiplyByFloats(k, k, k));
        return p;
    }

    public static Angle(from: BABYLON.Vector3, to: BABYLON.Vector3): number {
        let pFrom: BABYLON.Vector3 = BABYLON.Vector3.Normalize(from);
        let pTo: BABYLON.Vector3 = BABYLON.Vector3.Normalize(to);
        let angle: number = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        return angle;
    }

    public static AngleFromToAround(from: BABYLON.Vector3, to: BABYLON.Vector3, around: BABYLON.Vector3): number {
        let pFrom: BABYLON.Vector3 = VMath.ProjectPerpendicularAt(from, around).normalize();
        let pTo: BABYLON.Vector3 = VMath.ProjectPerpendicularAt(to, around).normalize();
        let dot = BABYLON.Vector3.Dot(pFrom, pTo);
        if (isNaN(dot)) {
            debugger;
        }
        let angle: number = Math.acos(dot);
        if (BABYLON.Vector3.Dot(BABYLON.Vector3.Cross(pFrom, pTo), around) < 0) {
            angle = -angle;
        }
        return angle;
    }

    private static _Tmp3: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public static StepToRef(from: BABYLON.Vector3, to: BABYLON.Vector3, step: number, ref: BABYLON.Vector3): BABYLON.Vector3 {
        from = VMath._Tmp3.copyFrom(from);
        let sqrStep = step * step;
        if (BABYLON.Vector3.DistanceSquared(from, to) < sqrStep) {
            ref.copyFrom(to);
        }
        else {
            ref.copyFrom(to).subtractInPlace(from).normalize().scaleInPlace(step).addInPlace(from);
        }

        return ref;
    }

    private static _Tmp4: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public static RotateVectorByQuaternionToRef(v: BABYLON.Vector3, q: BABYLON.Quaternion, ref: BABYLON.Vector3): BABYLON.Vector3 {
        let u = VMath._Tmp4.copyFromFloats(q.x, q.y, q.z);
        let s = q.w;
    
        let v1 = u.scale(2 * BABYLON.Vector3.Dot(u, v));
        let v2 = v.scale(s * s - BABYLON.Vector3.Dot(u, u));
        let v3 = BABYLON.Vector3.Cross(u, v).scale(2 * s);
        
        return ref.copyFrom(v1).addInPlace(v2).addInPlace(v3);
    }

    private static _Tmp0: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private static _Tmp1: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    private static _Tmp2: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public static QuaternionFromXYAxisToRef(x: BABYLON.Vector3, y: BABYLON.Vector3, ref: BABYLON.Quaternion): BABYLON.Quaternion {
        let xAxis = VMath._Tmp0.copyFrom(x);
        let yAxis = VMath._Tmp1.copyFrom(y);
        let zAxis = VMath._Tmp2;
        
        BABYLON.Vector3.CrossToRef(xAxis, yAxis, zAxis);
        BABYLON.Vector3.CrossToRef(zAxis, xAxis, yAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, ref);

        return ref;
    }
    public static QuaternionFromYZAxisToRef(y: BABYLON.Vector3, z: BABYLON.Vector3, ref: BABYLON.Quaternion): BABYLON.Quaternion {
        let xAxis = VMath._Tmp0;
        let yAxis = VMath._Tmp1.copyFrom(y);
        let zAxis = VMath._Tmp2.copyFrom(z);
        
        BABYLON.Vector3.CrossToRef(yAxis, zAxis, xAxis);
        BABYLON.Vector3.CrossToRef(xAxis, yAxis, zAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, ref);

        return ref;
    }
    public static QuaternionFromZXAxisToRef(z: BABYLON.Vector3, x: BABYLON.Vector3, ref: BABYLON.Quaternion): BABYLON.Quaternion {
        let xAxis = VMath._Tmp0.copyFrom(x);
        let yAxis = VMath._Tmp1;
        let zAxis = VMath._Tmp2.copyFrom(z);
        
        BABYLON.Vector3.CrossToRef(zAxis, xAxis, yAxis);
        BABYLON.Vector3.CrossToRef(yAxis, zAxis, xAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, ref);

        return ref;
    }
    public static QuaternionFromZYAxisToRef(z: BABYLON.Vector3, y: BABYLON.Vector3, ref: BABYLON.Quaternion): BABYLON.Quaternion {
        let xAxis = VMath._Tmp0;
        let yAxis = VMath._Tmp1.copyFrom(y);
        let zAxis = VMath._Tmp2.copyFrom(z);
        
        BABYLON.Vector3.CrossToRef(yAxis, zAxis, xAxis);
        BABYLON.Vector3.CrossToRef(zAxis, xAxis, yAxis);
        BABYLON.Quaternion.RotationQuaternionFromAxisToRef(xAxis, yAxis, zAxis, ref);

        return ref;
    }
}