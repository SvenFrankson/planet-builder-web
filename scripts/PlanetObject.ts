class PlanetObject extends BABYLON.Mesh {

    public planet: Planet;

    constructor(name: string, public main: Main) {
        super(name);
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
    }

    public onPositionChangedObservable = new BABYLON.Observable<void>();
    public setPosition(position: BABYLON.Vector3, noRotationUpdate?: boolean): void {
        if (this) {
            this.position = position;
            if (!noRotationUpdate && this.planet) {
                VMath.QuaternionFromYZAxisToRef(this.position.subtract(this.planet.position).normalize(), this.forward, this.rotationQuaternion);
                this.computeWorldMatrix(true);
                this.onRotationChangedObservable.notifyObservers();
            }
            this.onPositionChangedObservable.notifyObservers();
        }
    }

    public onRotationChangedObservable = new BABYLON.Observable<void>();
    public setTarget(target: BABYLON.Vector3): void {
        if (this.planet) {
            let z = target.subtract(this.position).normalize().scaleInPlace(-1);
            VMath.QuaternionFromYZAxisToRef(this.position.subtract(this.planet.position).normalize(), z, this.rotationQuaternion);
            this.computeWorldMatrix(true);
            this.onRotationChangedObservable.notifyObservers();
        }
    }
}