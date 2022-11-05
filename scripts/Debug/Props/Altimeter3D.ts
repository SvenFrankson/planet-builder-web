class Altimeter3D {

    public get scene(): BABYLON.Scene {
        return this.planet._scene;
    }
    
    public lineMesh: BABYLON.LinesMesh;

    constructor(public planet: Planet) {

    }

    public instantiate(): void {
        let lines = [];

        for (let k = 0; k < this.planet.kPosMax * PlanetTools.CHUNCKSIZE; k++) {
            let altitude = PlanetTools.KGlobalToAltitude(k);
            lines.push([new BABYLON.Vector3(0, altitude, 0), new BABYLON.Vector3(1, altitude, 0)]);
        }

        let count = lines.length;

        lines.push([lines[0][0], lines[count - 1][0]])

        this.lineMesh = BABYLON.MeshBuilder.CreateLineSystem("altimeter3D", { lines: lines}, this.scene);
        this.lineMesh.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.lineMesh.layerMask = 0x1;

        for (let k = 0; k < this.planet.kPosMax * PlanetTools.CHUNCKSIZE; k++) {
            let altitude = PlanetTools.KGlobalToAltitude(k);
            let value = new Number3D("value-" + k, k, 0.5);
            value.redraw();
            value.position.x = 1;
            value.position.y = altitude + 0.1;
            value.parent = this.lineMesh;
        }

        this.scene.onBeforeRenderObservable.add(this._update);
    }

    private _x: BABYLON.Vector3 = BABYLON.Vector3.Right();
    private _y: BABYLON.Vector3 = BABYLON.Vector3.Up();
    private _z: BABYLON.Vector3 = BABYLON.Vector3.Forward();
    private _update = () => {
        let camera: BABYLON.Camera;
        if (this.scene.activeCameras && this.scene.activeCameras.length > 0) {
            camera = this.scene.activeCameras[0];
        }
        else {
            camera = this.scene.activeCamera;
        }
        if (camera) {
            let camDir = camera.getForwardRay().direction
            this._y.copyFrom(camDir).scaleInPlace(4).addInPlace(camera.globalPosition).normalize();
            this._z.copyFrom(camDir);
            BABYLON.Vector3.CrossToRef(this._y, this._z, this._x);
            BABYLON.Vector3.CrossToRef(this._x, this._y, this._z);
            BABYLON.Quaternion.RotationQuaternionFromAxisToRef(this._x, this._y, this._z, this.lineMesh.rotationQuaternion);
        }
    }
}