class WristWatch extends Pickable {

    public static Instances: WristWatch[] = [];

    public power: boolean = false;

    public holoMesh: BABYLON.Mesh;
    public powerButton: BABYLON.Mesh;

    public holoSlika: Slika;
    
    public animateExtension = AnimationFactory.EmptyNumberCallback;

    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    public get cameraManager(): CameraManager {
        return this.main.cameraManager;
    }

    public wait = AnimationFactory.EmptyVoidCallback;

    constructor(public player: Player, main: Main) {
        super("head-up-display", main);
        this.holoMesh = new BABYLON.Mesh("wrist-watch-screen");
        this.holoMesh.layerMask = 0x10000000;
        this.holoMesh.alphaIndex = 1;
        this.holoMesh.position.y = 0.146;
        this.holoMesh.position.z = 0.148;
        this.holoMesh.rotation.y = - Math.PI * 0.5;
        this.holoMesh.parent = this.player.armManager.leftArm.foreArmMesh;
        this.proxyPickMesh = this.holoMesh;

        this.powerButton = new BABYLON.Mesh("wrist-watch-power-button");
        this.powerButton.position.x = 0.014;
        this.powerButton.position.y = 0.031;
        this.powerButton.position.z = 0.258;
        this.powerButton.parent = this.player.armManager.leftArm.foreArmMesh;
        
        this.wait = AnimationFactory.CreateWait(this);
        this.animateExtension = AnimationFactory.CreateNumber(this, this, "screenExtension");
        WristWatch.Instances.push(this);
    }

    public async instantiate(): Promise<void> {
        super.instantiate();
        VertexDataUtils.CreatePlane(0.225, 0.225).applyToMesh(this.holoMesh, true);

        let hsf = Config.performanceConfiguration.holoScreenFactor;

        let holoScreenMaterial = new HoloPanelMaterial("hud-material", this.scene);

        let holoScreenTexture = new BABYLON.DynamicTexture("hud-texture", { width: 1000 * hsf, height: 1000 * hsf }, this.scene, true);
        holoScreenTexture.hasAlpha = true;
        holoScreenMaterial.holoTexture = holoScreenTexture;
        
        this.holoSlika = new Slika(1000 * hsf, 1000 * hsf, holoScreenTexture.getContext(), holoScreenTexture);
        this.holoSlika.texture = holoScreenTexture;
        this.holoSlika.context = holoScreenTexture.getContext();
        this.holoSlika.needRedraw = true;

        this.holoMesh.material = holoScreenMaterial;

        let M = 15;
        let L = 40;
        let XEdge = 350;
        let ML = 110;
        let MR = 35;
        this.holoSlika.add(
            new SlikaPath({
                points: [
                    M, M + L,
                    M + L, M,
                    1000 - M - L, M,
                    1000 - M, M + L,
                    1000 - M, 1000 - MR,
                    XEdge, 1000 - ML,
                    M, 1000 - ML
                ],
                close: true,
                fillColor: BABYLON.Color3.Black(), 
                fillAlpha: 0.3,
                strokeColor: BABYLON.Color3.White(), 
                strokeAlpha: 1,
                strokeWidth: 20
            })
        );

        this.holoSlika.add(new SlikaText({
            text: "INVENTORY",
            x: 500,
            y: 110,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));

        for (let i = 0; i < 12; i++) {
            let iconW = 50;
            let lineHeight = 60;

            let itemIcon = this.holoSlika.add(new SlikaImage(
                new SPosition(60 + iconW * 0.5, 150 + iconW * 0.5 + i * lineHeight),
                iconW,
                iconW,
                "datas/images/block-icon-Ice-miniature.png"
            ))

            let itemIconBorder = this.holoSlika.add(new SlikaPath({
                points: [
                    60, 150 + i * lineHeight,
                    60 + iconW, 150 + i * lineHeight,
                    60 + iconW, 150 + iconW + i * lineHeight,
                    60, 150 + iconW + i * lineHeight,
                ],
                close: true,
                strokeColor: BABYLON.Color3.White(), 
                strokeAlpha: 1,
                strokeWidth: 2
            }));

            let itemName = this.holoSlika.add(new SlikaText({
                text: "Loreq Ipsum",
                x: 130,
                y: 135 + iconW + i * lineHeight,
                textAlign: "left",
                color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
                fontSize: 40,
                fontFamily: "XoloniumRegular",
                highlightRadius: 0
            }));
        }

        this.holoSlika.needRedraw = true;

        this.scene.onBeforeRenderObservable.add(this._update);
        this.powerOff();
    }

    public dispose(doNotRecurse?: boolean, disposeMaterialAndTextures?: boolean): void {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
        this.holoMesh.dispose(doNotRecurse, disposeMaterialAndTextures);
        
        let index = WristWatch.Instances.indexOf(this);
        if (index != - 1) {
            WristWatch.Instances.splice(index, 1);
        }

        super.dispose();
    }

    private _screenExtension: number = 0;
    public get screenExtension(): number {
        return this._screenExtension;
    }
    public set screenExtension(v: number) {
        this._screenExtension = v;
        this.updateMesh();
    }

    public updateMesh(): void {
        let positions = VertexDataUtils.GetPlanePositions(this._screenExtension, 0.225, 0.225);
        this.holoMesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
        let uvs = VertexDataUtils.GetPlaneUVs(this._screenExtension);
        this.holoMesh.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
    }

    public async powerOn(): Promise<void> {
        this.power = true;
        await this.wait(1.5);
        this.holoSlika.needRedraw = true;
        this.holoMesh.isVisible = true;
        await this.animateExtension(1, 0.5);
    }

    public async powerOff(): Promise<void> {
        this.power = false;
        await this.animateExtension(0, 0.5);
        this.holoMesh.isVisible = false;
    }

    private _update = () => {
        if (this.power != this.player.inputManager.inventoryOpened) {
            if (this.player.inputManager.inventoryOpened) {
                this.powerOn();
            }
            else {
                this.powerOff();
            }
        }
    }
}