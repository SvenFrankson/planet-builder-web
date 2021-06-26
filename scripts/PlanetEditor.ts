class PlanetEditor {
    public data: number = 0;

    private _previewMesh: BABYLON.Mesh;

    public static GetHitWorldPos(remove: boolean = false): BABYLON.Vector3 {
        let pickInfo: BABYLON.PickingInfo = Game.Scene.pick(
            Game.Canvas.width / 2,
            Game.Canvas.height / 2,
            (mesh: BABYLON.Mesh) => {
                return !(mesh.name === "preview-mesh");
            }
        );
        if (pickInfo.hit) {
            if (pickInfo.pickedMesh instanceof PlanetChunck) {
                let offset: number = 0.25;
                if (remove) {
                    offset = -0.25;
                }
                return pickInfo.pickedPoint.add(
                    pickInfo.getNormal(true, false).scale(offset)
                );
            }
        }
        return undefined;
    }

    constructor(
        public planet: Planet
    ) {

    }

    public initialize(): void {
        Game.Scene.onBeforeRenderObservable.add(this._update);
        Game.Canvas.addEventListener("pointerup", (event: MouseEvent) => {
            if (Game.LockedMouse) {
                this._pointerUp();
            }
        });

        let keyDataMap = new Map<string, number>();
        keyDataMap.set("Digit1", 129);
        keyDataMap.set("Digit2", 130);
        keyDataMap.set("Digit3", 131);
        keyDataMap.set("Digit4", 132);
        keyDataMap.set("Digit5", 133);
        keyDataMap.set("Digit6", 134);
        keyDataMap.set("Digit7", 135);
        keyDataMap.set("Digit8", 136);
        keyDataMap.set("Digit9", 137);
        keyDataMap.set("Digit0", 0);
        keyDataMap.set("KeyX", 0);

        Game.Canvas.addEventListener("keyup", (event: KeyboardEvent) => {
            if (keyDataMap.has(event.code)) {
                this.data = keyDataMap.get(event.code);
            }
        });
    }

    public dispose(): void {
        Game.Scene.onBeforeRenderObservable.removeCallback(this._update);
    }

    private _update = () => {
        let removeMode: boolean = this.data === 0;
        let worldPos: BABYLON.Vector3 = PlanetEditor.GetHitWorldPos(removeMode);

        if (worldPos) {
            if (this.data === 0 || worldPos.subtract(Game.Player.PositionHead()).lengthSquared() > 1) {
                if (this.data === 0 || worldPos.subtract(Game.Player.PositionLeg()).lengthSquared() > 1) {
                    let planetSide: PlanetSide = PlanetTools.WorldPositionToPlanetSide(this.planet, worldPos);
                    if (planetSide) {
                        let global = PlanetTools.WorldPositionToGlobalIJK(planetSide, worldPos);
                        if (!this._previewMesh) {
                            this._previewMesh = new BABYLON.Mesh("preview-mesh");
                            this._previewMesh.visibility = 0.5;
                        }
                        let vertexData = PlanetChunckMeshBuilder.BuildBlockVertexData(PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(global.k)), global.i, global.j, global.k, 140, this.data === 0 ? 1.1 : 0.9);
                        vertexData.applyToMesh(this._previewMesh);
                        this._previewMesh.rotationQuaternion = PlanetTools.QuaternionForSide(planetSide.side);
                        return;
                    }
                }
            }
        }
        if (this._previewMesh) {
            this._previewMesh.dispose();
            this._previewMesh = undefined;
        }
    }

    private _pointerUp(): void {
        let removeMode: boolean = this.data === 0;
        let worldPos: BABYLON.Vector3 = PlanetEditor.GetHitWorldPos(removeMode);
        if (worldPos) {
            if (this.data === 0 || worldPos.subtract(Game.Player.PositionHead()).lengthSquared() > 1) {
                if (this.data === 0 || worldPos.subtract(Game.Player.PositionLeg()).lengthSquared() > 1) {
                    let planetSide: PlanetSide = PlanetTools.WorldPositionToPlanetSide(
                        this.planet,
                        worldPos
                    );
                    if (planetSide) {
                        let global = PlanetTools.WorldPositionToGlobalIJK(planetSide, worldPos);
                        let local = PlanetTools.GlobalIJKToLocalIJK(planetSide, global);
                        local.planetChunck.SetData(local.i, local.j, local.k, this.data);
                        local.planetChunck.SetMesh();
                        local.planetChunck.saveToLocalStorage();
                    }
                }
            }
        }
    }
}
