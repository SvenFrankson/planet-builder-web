class PlanetObject extends BABYLON.Mesh {

    public planet: Planet;

    constructor(name: string, public main: Main) {
        super(name);
    }

    public setPosition(position: BABYLON.Vector3): void {
        if (this) {
            this.position = position;
        }
    }

    public setTarget(target: BABYLON.Vector3): void {
        let y = this.position.subtract(this.planet.position).normalize();
        let z = target.subtract(this.position).normalize().scaleInPlace(-1);
        let x = BABYLON.Vector3.Cross(y, z).normalize();
        z = BABYLON.Vector3.Cross(x, y).normalize();
        this.rotationQuaternion = BABYLON.Quaternion.RotationQuaternionFromAxis(x, y, z);
    }
}