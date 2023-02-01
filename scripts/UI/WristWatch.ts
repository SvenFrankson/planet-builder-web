class WristWatch extends BABYLON.Mesh {

    public static Instances: WristWatch[] = [];

    public power: boolean = false;

    public holoMesh: BABYLON.Mesh;
    
    public animateExtension = AnimationFactory.EmptyNumberCallback;

    public get scene(): BABYLON.Scene {
        return this._scene;
    }

    constructor(public player: Player, public cameraManager: CameraManager) {
        super("head-up-display");
        this.holoMesh = new BABYLON.Mesh("wrist-watch-screen");
        this.animateExtension = AnimationFactory.CreateNumber(this, this, "screenExtension");
        WristWatch.Instances.push(this);
    }

    public async instantiate(): Promise<void> {
        VertexDataUtils.CreatePlane(0.225, 0.225).applyToMesh(this.holoMesh, true);
        this.holoMesh.layerMask = 0x10000000;
        this.holoMesh.alphaIndex = 1;
        this.holoMesh.position.y = 0.146;
        this.holoMesh.position.z = 0.148;
        this.holoMesh.rotation.y = - Math.PI * 0.5;
        this.holoMesh.parent = this.player.armManager.leftArm.foreArmMesh;

        let hsf = Config.performanceConfiguration.holoScreenFactor;

        let holoScreenMaterial = new HoloPanelMaterial("hud-material", this.scene);

        let holoScreenTexture = new BABYLON.DynamicTexture("hud-texture", { width: 1000 * hsf, height: 1000 * hsf }, this.scene, true);
        holoScreenTexture.hasAlpha = true;
        holoScreenMaterial.holoTexture = holoScreenTexture;
        
        let holoScreenSlika = new Slika(1000 * hsf, 1000 * hsf, holoScreenTexture.getContext(), holoScreenTexture);
        holoScreenSlika.texture = holoScreenTexture;
        holoScreenSlika.context = holoScreenTexture.getContext();
        holoScreenSlika.needRedraw = true;

        this.holoMesh.material = holoScreenMaterial;

        let M = 15;
        let L = 40;
        let XEdge = 350;
        let ML = 110;
        let MR = 35;
        holoScreenSlika.add(
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

        let title1 = holoScreenSlika.add(new SlikaText({
            text: "INVENTORY",
            x: 500,
            y: 110,
            textAlign: "center",
            color: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor),
            fontSize: 60,
            fontFamily: "XoloniumRegular",
            highlightRadius: 0
        }));

        this.scene.onBeforeRenderObservable.add(this._update);
    }

    public dispose(doNotRecurse?: boolean, disposeMaterialAndTextures?: boolean): void {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
        this.holoMesh.dispose(doNotRecurse, disposeMaterialAndTextures);
        
        let index = WristWatch.Instances.indexOf(this);
        if (index != - 1) {
            WristWatch.Instances.splice(index, 1);
        }

        super.dispose(doNotRecurse, disposeMaterialAndTextures);
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