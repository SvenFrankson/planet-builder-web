/// <reference path="Pickable.ts"/>

class HeadUpDisplay extends Pickable {

    public interceptsPointerMove(): boolean {
        return true;
    }

    public tileSize: number = 0.055;

    public hudMaterial: HoloPanelMaterial;
    public hudTexture: BABYLON.DynamicTexture;
    public slika: Slika;

    public hudLateralTileMeshes: BABYLON.Mesh[] = [];
    public hudLateralTileImageMeshes: BABYLON.Mesh[] = [];
    public hudLateralTileImageMaterials: BABYLON.StandardMaterial[] = [];
    public itemCountTexts: SlikaText[] = [];
    public itemKeyHintTexts: SlikaText[] = [];
    public itemNameTexts: SlikaText[] = [];

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
        
        let hsf = Config.performanceConfiguration.holoScreenFactor;

        this.hudMaterial = new HoloPanelMaterial("hud-material", this.scene);

        this.hudTexture = new BABYLON.DynamicTexture("hud-texture", { width: 1000 * hsf, height: 1000 * hsf }, this.scene, true);
        this.hudTexture.hasAlpha = true;
        this.hudMaterial.holoTexture = this.hudTexture;
        
        this.slika = new Slika(1000 * hsf, 1000 * hsf, this.hudTexture.getContext(), this.hudTexture);
        this.slika.texture = this.hudTexture;
        this.slika.context = this.hudTexture.getContext();
        this.slika.needRedraw = true;

        this.main.engine.onResizeObservable.add(() => {
            this.resize();
        })

        this.resize();
    }

    public resize(): void {
        this.getChildMeshes().forEach(mesh => {
            mesh.dispose(false, false);
        });

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
                strokeWidth: 6,
                fontFamily: "XoloniumRegular"
            }));

            this.itemKeyHintTexts[b] = this.slika.add(new SlikaText({
                text: b.toFixed(0),
                textAlign: "center",
                x: 950,
                y: 1000 - 30 - b * 100,
                fontSize: 50,
                color: new BABYLON.Color3(0.8, 0.8, 0.8),
                strokeColor: BABYLON.Color3.Black(),
                strokeWidth: 2,
                fontFamily: "XoloniumRegular"
            }));

            this.itemNameTexts[b] = this.slika.add(new SlikaText({
                text: "",
                textAlign: "left",
                x: 670,
                y: 1000 - 25 - b * 100,
                fontSize: 50,
                strokeColor: BABYLON.Color3.Black(),
                strokeWidth: 6,
                fontFamily: "XoloniumRegular"
            }));

            let beta = yAngleSide * 0.5 - angularMargin - (yAngleSide - 2 * angularMargin) * ((b + 9) % 10) / 9;

            this.hudLateralTileMeshes[b] = new BABYLON.Mesh("hud-lateral-tile-" + b);
            VertexDataUtils.CreatePlane(this.tileSize, this.tileSize, undefined, undefined, 0, 0, 0.5, 0.5).applyToMesh(this.hudLateralTileMeshes[b]);
            this.hudLateralTileMeshes[b].layerMask = 0x10000000;
            this.hudLateralTileMeshes[b].alphaIndex = 1;
            this.hudLateralTileMeshes[b].parent = this;
            this.hudLateralTileMeshes[b].material = this.hudMaterial;

            this.hudLateralTileMeshes[b].position.y = Math.sin(beta);
            this.hudLateralTileMeshes[b].position.z = Math.cos(beta);
            this.hudLateralTileMeshes[b].rotationQuaternion = BABYLON.Quaternion.Identity();
            VMath.QuaternionFromZYAxisToRef(this.hudLateralTileMeshes[b].position, BABYLON.Axis.Y, this.hudLateralTileMeshes[b].rotationQuaternion);
            let h = Math.abs(beta / yAngleSide);
            h = h * h;
            this.hudLateralTileMeshes[b].rotateAround(BABYLON.Vector3.Zero(), BABYLON.Axis.Y, - (xAngle * 0.5 - h * xAngle * 0.08 - angularMargin));
            this.proxyPickMeshes.push(this.hudLateralTileMeshes[b]);


            let v0 = b * 0.1;
            let hudLateralTileDesc = new BABYLON.Mesh("hud-lateral-tile-" + b + "-desc");
            VertexDataUtils.CreatePlane(this.tileSize * 0.35 * 4, this.tileSize * 0.35, - this.tileSize * 0.55, - this.tileSize * 0.55, 0.5, v0, 0.9, v0 + 0.1).applyToMesh(hudLateralTileDesc);
            hudLateralTileDesc.layerMask = 0x10000000;
            hudLateralTileDesc.alphaIndex = 1;
            hudLateralTileDesc.position.z = - 0.1;
            hudLateralTileDesc.parent = this.hudLateralTileMeshes[b];
            hudLateralTileDesc.material = this.hudMaterial;
            
            let hudLateralTileKey = new BABYLON.Mesh("hud-lateral-tile-" + b + "-key");
            VertexDataUtils.CreatePlane(this.tileSize * 0.35, this.tileSize * 0.35, - this.tileSize * 0.70, this.tileSize * 0.0, 0.9, v0, 1, v0 + 0.1).applyToMesh(hudLateralTileKey);
            hudLateralTileKey.layerMask = 0x10000000;
            hudLateralTileKey.alphaIndex = 1;
            hudLateralTileKey.position.z = - 0.1;
            hudLateralTileKey.parent = this.hudLateralTileMeshes[b];
            hudLateralTileKey.material = this.hudMaterial;

            this.hudLateralTileImageMeshes[b] = new BABYLON.Mesh("hud-lateral-tile-" + b + "-image");
            VertexDataUtils.CreatePlane(this.tileSize * 0.7, this.tileSize * 0.7, - this.tileSize * 0.3, - this.tileSize * 0.25, 0, 0, 1, 1).applyToMesh(this.hudLateralTileImageMeshes[b]);
            this.hudLateralTileImageMeshes[b].layerMask = 0x10000000;
            this.hudLateralTileImageMeshes[b].alphaIndex = 1;
            this.hudLateralTileImageMeshes[b].position.z = - 0.1;
            this.hudLateralTileImageMeshes[b].parent = this.hudLateralTileMeshes[b];
            this.hudLateralTileImageMeshes[b].isVisible = false;
            
            if (!this.hudLateralTileImageMaterials[b]) {
                this.hudLateralTileImageMaterials[b] = new BABYLON.StandardMaterial("hud-lateral-tile-" + b + "-image-material");
                this.hudLateralTileImageMaterials[b].emissiveColor.copyFromFloats(1, 1, 1);
                this.hudLateralTileImageMaterials[b].specularColor.copyFromFloats(0, 0, 0);
                this.hudLateralTileImageMaterials[b].useAlphaFromDiffuseTexture = true;
            }
            this.hudLateralTileImageMeshes[b].material = this.hudLateralTileImageMaterials[b];
        }

        this.parent = this.cameraManager.freeCamera;
    }

    public highlight(slotIndex: number): void {
        VertexDataUtils.CreatePlane(this.tileSize, this.tileSize, undefined, undefined, 0, 0.5, 0.5, 1).applyToMesh(this.hudLateralTileMeshes[slotIndex]);
    }

    public unlit(slotIndex: number): void {
        VertexDataUtils.CreatePlane(this.tileSize, this.tileSize, undefined, undefined, 0, 0, 0.5, 0.5).applyToMesh(this.hudLateralTileMeshes[slotIndex]);
    }

    private _equipedSlotIndex: number = - 1;
    public onActionEquiped(action: PlayerAction, slotIndex: number): void {
        if (this._equipedSlotIndex >= 0 && this._equipedSlotIndex <= 9) {
            this.unlit(this._equipedSlotIndex);
        }
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.highlight(slotIndex);
            this._equipedSlotIndex = slotIndex;
        }
    }

    public onActionUnequiped(action: PlayerAction, slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.unlit(slotIndex);
        }
    }

    public onHintStart(slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.itemKeyHintTexts[slotIndex].prop.fontSize = 60;
            this.itemKeyHintTexts[slotIndex].prop.color = BABYLON.Color3.White();
            this.itemKeyHintTexts[slotIndex].prop.strokeWidth = 4;
            this.slika.needRedraw = true;
        }
    }

    public onHintEnd(slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.itemKeyHintTexts[slotIndex].prop.fontSize = 50;
            this.itemKeyHintTexts[slotIndex].prop.color = new BABYLON.Color3(0.8, 0.8, 0.8);
            this.itemKeyHintTexts[slotIndex].prop.strokeWidth = 2;
            this.slika.needRedraw = true;
        }
    }

    public onActionLinked(action: PlayerAction, slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.hudLateralTileImageMeshes[slotIndex].isVisible = true;
            this.hudLateralTileImageMaterials[slotIndex].diffuseTexture = new BABYLON.Texture(action.iconUrl);
            this.hudLateralTileImageMaterials[slotIndex].diffuseTexture.hasAlpha = true;
            this.itemCountTexts[slotIndex].prop.text = action.item.count.toFixed(0);
            this.itemNameTexts[slotIndex].prop.text = action.item.name;
            this.slika.needRedraw = true;
        }
    }

    public onActionUnlinked(slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.hudLateralTileImageMeshes[slotIndex].isVisible = false;
            this.hudLateralTileImageMaterials[slotIndex].diffuseTexture = undefined;
            this.itemCountTexts[slotIndex].prop.text = "";
            this.itemNameTexts[slotIndex].prop.text = "";
            this.slika.needRedraw = true;
        }
    }

    public onPointerUp(): void {
        let index = this.inputManager.aimedProxyIndex;
        if (this.inventory.draggedItem) {
            this.player.playerActionManager.linkAction(this.inventory.draggedItem.playerAction, index);
            this.inventory.draggedItem = undefined;
        }
    }
}