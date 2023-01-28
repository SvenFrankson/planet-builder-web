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
        let size = 0.055;
        for (let b = 0; b < 10; b ++) {
            /*
            let w = 10;
            let x0 = 500 + w;
            let x1 = 600 - w;
            let y0 = 1000 - 100 * (b + 1) + w;
            let y1 = 1000 - 100 * b - w;
            hudSlika.add(
                new SlikaPath({
                    points: [
                        x0, y0,
                        x1, y0,
                        x1, y1,
                        x0, y1
                    ],
                    close: true,
                    fillColor: new BABYLON.Color3(0.5, 0.5, 0.5), 
                    fillAlpha: 1,
                    strokeColor: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor), 
                    strokeAlpha: 1,
                    width: w
                })
            );
            */
            hudSlika.add(new SlikaText({
                text: "44",
                textAlign: "center",
                x: 550,
                y: 1000 - 20 - b * 100,
                fontSize: 70,
                highlightRadius: 0,
                fontFamily: "XoloniumRegular"
            }));

            let beta = - yAngleSide * 0.5 + angularMargin + (yAngleSide - 2 * angularMargin) * b / 9;

            let hudLateralTile = new BABYLON.Mesh("hud-lateral-tile-" + b);
            VertexDataUtils.CreatePlane(size, size, undefined, undefined, 0, 0.5, 0.5, 1).applyToMesh(hudLateralTile);
            hudLateralTile.layerMask = 0x10000000;
            hudLateralTile.alphaIndex = 1;
            hudLateralTile.parent = this;
            hudLateralTile.material = hudMaterial;

            hudLateralTile.position.y = Math.sin(beta);
            hudLateralTile.position.z = Math.cos(beta);
            hudLateralTile.rotationQuaternion = BABYLON.Quaternion.Identity();
            VMath.QuaternionFromZYAxisToRef(hudLateralTile.position, BABYLON.Axis.Y, hudLateralTile.rotationQuaternion);
            hudLateralTile.rotateAround(BABYLON.Vector3.Zero(), BABYLON.Axis.Y, - (xAngle * 0.5 - angularMargin));


            let v0 = b * 0.1;
            let hudLateralTileCount = new BABYLON.Mesh("hud-lateral-tile-" + b + "-image");
            VertexDataUtils.CreatePlane(size * 0.35, size * 0.35, - size * 0.55, - size * 0.55, 0.5, v0, 0.6, v0 + 0.1).applyToMesh(hudLateralTileCount);
            hudLateralTileCount.layerMask = 0x10000000;
            hudLateralTileCount.alphaIndex = 1;
            hudLateralTileCount.position.z = - 0.1;
            hudLateralTileCount.parent = hudLateralTile;
            hudLateralTileCount.material = hudMaterial;

            let hudLateralTileImage = new BABYLON.Mesh("hud-lateral-tile-" + b + "-image");
            VertexDataUtils.CreatePlane(size * 0.7, size * 0.7, - size * 0.3, - size * 0.25, 0, 0, 1, 1).applyToMesh(hudLateralTileImage);
            hudLateralTileImage.layerMask = 0x10000000;
            hudLateralTileImage.alphaIndex = 1;
            hudLateralTileImage.position.z = - 0.1;
            hudLateralTileImage.parent = hudLateralTile;
            
            let iconMaterial = new BABYLON.StandardMaterial("hud-lateral-tile-" + b + "-image-material");
            hudLateralTileImage.material = iconMaterial;
            iconMaterial.emissiveColor.copyFromFloats(1, 1, 1);
            iconMaterial.specularColor.copyFromFloats(0, 0, 0);
            iconMaterial.diffuseTexture = new BABYLON.Texture("datas/images/block-icon-" + BlockTypeNames[BlockType.Grass + b] + "-miniature.png");
            iconMaterial.diffuseTexture.hasAlpha = true;
            iconMaterial.useAlphaFromDiffuseTexture = true;
        }

        this.parent = this.player.camPos;
    }
}