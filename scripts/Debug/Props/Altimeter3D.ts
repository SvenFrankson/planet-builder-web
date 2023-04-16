class Altimeter3D {

    public get scene(): BABYLON.Scene {
        return this.player.scene;
    }
    
    private _previousPlanet: Planet;
    public lineMesh: BABYLON.LinesMesh;

    constructor(public player: Player) {

    }

    public instantiate(): void {
        this.redrawMesh();
    
        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public redrawMesh(): void {
        if (this.player.planet) {
            let lines = [];
    
            for (let k = 0; k < this.player.planet.kPosMax * PlanetTools.CHUNCKSIZE; k++) {
                let altitude = PlanetTools.KGlobalToAltitude(k, this.player.planet.degree);
                lines.push([new BABYLON.Vector3(0, altitude, 0), new BABYLON.Vector3(1, altitude, 0)]);
            }
    
            let count = lines.length;
    
            lines.push([lines[0][0], lines[count - 1][0]])
    
            if (this.lineMesh) {
                this.lineMesh.dispose();
            }
    
            this.lineMesh = BABYLON.MeshBuilder.CreateLineSystem("altimeter3D", { lines: lines}, this.scene);
            this.lineMesh.rotationQuaternion = BABYLON.Quaternion.Identity();
            this.lineMesh.layerMask = 0x1;
    
            for (let k = 0; k < this.player.planet.kPosMax * PlanetTools.CHUNCKSIZE; k++) {
                let altitude = PlanetTools.KGlobalToAltitude(k, this.player.planet.degree);
                let value = new Number3D("value-" + k, k, 0.5);
                value.redraw();
                value.position.x = 1;
                value.position.y = altitude + 0.1;
                value.parent = this.lineMesh;
            }
        }
    }

    private _x: BABYLON.Vector3 = BABYLON.Vector3.Right();
    private _y: BABYLON.Vector3 = BABYLON.Vector3.Up();
    private _z: BABYLON.Vector3 = BABYLON.Vector3.Forward();
    private _update = () => {
        if (this.player.planet && this.player.planet != this._previousPlanet) {
            this.redrawMesh();
            this._previousPlanet = this.player.planet;
        }
        if (this.lineMesh) {
            let camera: BABYLON.Camera;
            if (this.player.planet) {
                this.lineMesh.position.copyFrom(this.player.planet.position);
            }
            if (this.scene.activeCameras && this.scene.activeCameras.length > 0) {
                camera = this.scene.activeCameras[0];
            }
            else {
                camera = this.scene.activeCamera;
            }
            if (camera) {
                let camDir = camera.getForwardRay().direction
                this._y.copyFrom(camDir).scaleInPlace(4).addInPlace(camera.globalPosition.subtract(this.lineMesh.position)).normalize();
                this._z.copyFrom(camDir);
                BABYLON.Vector3.CrossToRef(this._y, this._z, this._x);
                BABYLON.Vector3.CrossToRef(this._x, this._y, this._z);
                BABYLON.Quaternion.RotationQuaternionFromAxisToRef(this._x, this._y, this._z, this.lineMesh.rotationQuaternion);
            }
        }
    }
}