/// <reference path="Pickable.ts"/>

class HeadUpDisplay extends Pickable {

    public interceptsPointerMove(): boolean {
        return true;
    }

    public slika: Slika;

    public hudLateralTileImageMeshes: BABYLON.Mesh[] = [];
    public hudLateralTileImageMaterials: BABYLON.StandardMaterial[] = [];
    public itemCountTexts: SlikaText[] = [];

    public get cameraManager(): CameraManager {
        return this.main.cameraManager;
    }
    public get scene(): BABYLON.Scene {
        return this.player.scene;
    }
    public get inventory(): Inventory {
        return this.player.inventory;
    }

    constructor(public player: Player, main: Main) {
        super("head-up-display", main);
        this.interactionMode = InteractionMode.None;
        this.proxyPickMeshes = [];
    }

    public async instantiate(): Promise<void> {
        super.instantiate();
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
        
        this.slika = new Slika(1000 * hsf, 1000 * hsf, hudTexture.getContext(), hudTexture);
        this.slika.texture = hudTexture;
        this.slika.context = hudTexture.getContext();
        this.slika.needRedraw = true;

        let M = 20;
        let L1 = 80;
        let L2 = 200;
        this.slika.add(
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
                fillAlpha: 0.3,
                strokeColor: BABYLON.Color3.White(), 
                strokeAlpha: 1,
                strokeWidth: 20
            })
        );
        this.slika.add(
            new SlikaPath({
                points: [
                    M, 500 + M + L1,
                    M + L1, 500 + M,
                    (500 - M), 500 + M,
                    (500 - M), 500 + (500 - M) - L1,
                    (500 - M) - L2, 500 + (500 - M) - L1,
                    (500 - M) - L2 - L1, 500 + (500 - M),
                    M, 500 + (500 - M)
                ],
                close: true,
                fillColor: BABYLON.Color3.Black(), 
                fillAlpha: 0.3,
                strokeColor: BABYLON.Color3.White(), 
                strokeAlpha: 0.5,
                strokeWidth: 10
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
            this.slika.add(
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
            this.itemCountTexts[b] = this.slika.add(new SlikaText({
                text: "",
                textAlign: "center",
                x: 550,
                y: 1000 - 30 - b * 100,
                fontSize: 60,
                strokeColor: BABYLON.Color3.Black(),
                strokeWidth: 12,
                fontFamily: "XoloniumRegular"
            }));

            let beta = - yAngleSide * 0.5 + angularMargin + (yAngleSide - 2 * angularMargin) * b / 9;

            let hudLateralTile = new BABYLON.Mesh("hud-lateral-tile-" + b);
            let highlight = Math.random() > 0.5
            if (highlight) {
                VertexDataUtils.CreatePlane(size, size, undefined, undefined, 0, 0.5, 0.5, 1).applyToMesh(hudLateralTile);
            }
            else {
                VertexDataUtils.CreatePlane(size, size, undefined, undefined, 0, 0, 0.5, 0.5).applyToMesh(hudLateralTile);
            }
            hudLateralTile.layerMask = 0x10000000;
            hudLateralTile.alphaIndex = 1;
            hudLateralTile.parent = this;
            hudLateralTile.material = hudMaterial;

            hudLateralTile.position.y = Math.sin(beta);
            hudLateralTile.position.z = Math.cos(beta);
            hudLateralTile.rotationQuaternion = BABYLON.Quaternion.Identity();
            VMath.QuaternionFromZYAxisToRef(hudLateralTile.position, BABYLON.Axis.Y, hudLateralTile.rotationQuaternion);
            let h = Math.abs(beta / yAngleSide);
            h = h * h;
            hudLateralTile.rotateAround(BABYLON.Vector3.Zero(), BABYLON.Axis.Y, - (xAngle * 0.5 - h * xAngle * 0.08 - angularMargin));
            this.proxyPickMeshes.push(hudLateralTile);


            let v0 = b * 0.1;
            let hudLateralTileCount = new BABYLON.Mesh("hud-lateral-tile-" + b + "-image");
            VertexDataUtils.CreatePlane(size * 0.35, size * 0.35, - size * 0.55, - size * 0.55, 0.5, v0, 0.6, v0 + 0.1).applyToMesh(hudLateralTileCount);
            hudLateralTileCount.layerMask = 0x10000000;
            hudLateralTileCount.alphaIndex = 1;
            hudLateralTileCount.position.z = - 0.1;
            hudLateralTileCount.parent = hudLateralTile;
            hudLateralTileCount.material = hudMaterial;

            this.hudLateralTileImageMeshes[b] = new BABYLON.Mesh("hud-lateral-tile-" + b + "-image");
            VertexDataUtils.CreatePlane(size * 0.7, size * 0.7, - size * 0.3, - size * 0.25, 0, 0, 1, 1).applyToMesh(this.hudLateralTileImageMeshes[b]);
            this.hudLateralTileImageMeshes[b].layerMask = 0x10000000;
            this.hudLateralTileImageMeshes[b].alphaIndex = 1;
            this.hudLateralTileImageMeshes[b].position.z = - 0.1;
            this.hudLateralTileImageMeshes[b].parent = hudLateralTile;
            this.hudLateralTileImageMeshes[b].isVisible = false;
            
            this.hudLateralTileImageMaterials[b] = new BABYLON.StandardMaterial("hud-lateral-tile-" + b + "-image-material");
            this.hudLateralTileImageMeshes[b].material = this.hudLateralTileImageMaterials[b];
            this.hudLateralTileImageMaterials[b].emissiveColor.copyFromFloats(1, 1, 1);
            this.hudLateralTileImageMaterials[b].specularColor.copyFromFloats(0, 0, 0);
            this.hudLateralTileImageMaterials[b].useAlphaFromDiffuseTexture = true;
        }

        this.parent = this.cameraManager.freeCamera;
    }

    public onActionLinked(action: PlayerAction, slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.hudLateralTileImageMeshes[slotIndex].isVisible = true;
            this.hudLateralTileImageMaterials[slotIndex].diffuseTexture = new BABYLON.Texture(action.iconUrl);
            this.hudLateralTileImageMaterials[slotIndex].diffuseTexture.hasAlpha = true;
            this.itemCountTexts[slotIndex].prop.text = action.item.count.toFixed(0);
            this.slika.needRedraw = true;
        }
    }

    public onActionUnlinked(slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.hudLateralTileImageMeshes[slotIndex].isVisible = false;
            this.hudLateralTileImageMaterials[slotIndex].diffuseTexture = undefined;
            this.itemCountTexts[slotIndex].prop.text = "";
            this.slika.needRedraw = true;
        }
    }

    public onPointerUp(): void {
        console.log("HUD picked index " + this.inputManager.aimedProxyIndex);
        let index = this.inputManager.aimedProxyIndex;
        if (this.inventory.draggedItem) {
            this.player.playerActionManager.linkAction(this.inventory.draggedItem.playerAction, index);
        }
    }
}