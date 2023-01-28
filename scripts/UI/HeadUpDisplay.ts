class HeadUpDisplay extends BABYLON.Mesh {

    public get scene(): BABYLON.Scene {
        return this.player.scene;
    }

    constructor(public player: Player, public cameraManager: CameraManager) {
        super("head-up-display");
    }

    public async instantiate(): Promise<void> {
        let camera = this.cameraManager.noOutlineCamera;
        let yAngle = camera.fov;
        let w = camera.getEngine().getRenderWidth();
        let h = camera.getEngine().getRenderHeight();
        let ratio = w / h;
        let dist = (h * 0.5) / Math.tan(yAngle * 0.5);
        let xAngle = 2 * Math.atan((h * ratio * 0.5) / (dist));
        let distSide = dist / Math.cos(xAngle * 0.5);
        let yAngleSide = 2 * Math.atan(h * 0.5 / distSide);
        //console.log("xAngle = " + (xAngle / Math.PI * 180).toFixed(1) + " | yAngle = " + (yAngle / Math.PI * 180).toFixed(1) + " | yAngleSide = " + (yAngleSide / Math.PI * 180).toFixed(1));

        let hsf = Config.performanceConfiguration.holoScreenFactor;

        let hudMaterial = new HoloPanelMaterial("hud-material", this.scene);

        let hudTexture = new BABYLON.DynamicTexture("hud-texture", { width: 1000 * hsf, height: 1000 * hsf }, this.scene, true);
        hudTexture.hasAlpha = true;
        hudMaterial.holoTexture = hudTexture;
        
        let hudSlika = new Slika(1000 * hsf, 1000 * hsf, hudTexture.getContext(), hudTexture);
        hudSlika.texture = hudTexture;
        hudSlika.context = hudTexture.getContext();
        hudSlika.needRedraw = true;

        let M = 20;
        let L1 = 80;
        let L2 = 200;
        hudSlika.add(
            new SlikaPath({
                points: [
                    M, M + L1,
                    M + L1, M,
                    (500 - M), M,
                    (500 - M), (500 - M) - L1,
                    (500 - M) - L2, (500 - M) - L1,
                    (500 - M) - L2 - L1, (500 - M),
                    M, (500 - M)
                ],
                close: true,
                fillColor: BABYLON.Color3.Black(), 
                fillAlpha: 0.2,
                strokeColor: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor), 
                strokeAlpha: 1,
                width: 20
            })
        );

        let angularMargin = 0.04;
        for (let b = 0; b < 10; b ++) {
            let beta = - yAngleSide * 0.5 + angularMargin + (yAngleSide - 2 * angularMargin) * b / 9;
            let hudLateralTile = new BABYLON.Mesh("hud-lateral-tile-" + b);
            VertexDataUtils.CreatePlane(0.055, 0.055, undefined, undefined, 0, 0.5, 0.5, 1).applyToMesh(hudLateralTile);
            hudLateralTile.position.y = Math.sin(beta);
            hudLateralTile.position.z = Math.cos(beta);
            hudLateralTile.rotationQuaternion = BABYLON.Quaternion.Identity();
            VMath.QuaternionFromZYAxisToRef(hudLateralTile.position, BABYLON.Axis.Y, hudLateralTile.rotationQuaternion);
            hudLateralTile.parent = this;
            hudLateralTile.rotateAround(BABYLON.Vector3.Zero(), BABYLON.Axis.Y, - (xAngle * 0.5 - angularMargin));
            hudLateralTile.layerMask = 0x10000000;
            hudLateralTile.alphaIndex = 1;

            hudLateralTile.material = hudMaterial;
        }

        this.parent = this.player.camPos;
    }
}