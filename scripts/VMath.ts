class VMath {

    public static IsFinite(v: BABYLON.Vector3): boolean;
    public static IsFinite(o: any): boolean {
        if (o instanceof BABYLON.Vector3) {
            return isFinite(o.x) && isFinite(o.y) && isFinite(o.z);
        }
        return false;
    }
}