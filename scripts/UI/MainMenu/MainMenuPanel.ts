class MainMenuPanel extends HoloPanel {

    public titleHeight: number = 220;
    public titleLine1: SlikaPath;
    public titleLine2: SlikaPath;

    public pages: MainMenuPanelPage[] = [];
    public introPage: MainMenuPanelIntroPage;
    public graphicsPage: MainMenuPanelGraphicsPage;
    public tutorialPage: MainMenuPanelTutorialPage;
    public planetPage: MainMenuPlanetSelectionPage;

    constructor(public dpi: number, main: Main) {
        super(0.6, 1.5, 1000, 1000, main);
    }

    public instantiate(): void {
        super.instantiate();

        let M = 10;
        let L1 = 40;
        let L2 = 20;
        let L3 = 15;
        let L4 = 400;
        let L5 = 200;
        let L6 = 300;

        this.pointerElement.prop.xMin = M + L2 + 15;
        this.pointerElement.prop.yMin = M+ L2  + 15;
        this.pointerElement.prop.xMax = 1000 - M - L2 - 15;
        this.pointerElement.prop.yMax = 1000 - M - L2 - 15;

        this.holoSlika.add(
            new SlikaPath({
                points: [
                    M + L1, M,
                    500 - L4 * 0.5 - L2, M,
                    500 - L4 * 0.5, M + L2,
                    
                    500 - L5 * 0.5, M + L2,
                    500 - L5 * 0.5 + L3, M + L2 - L3,
                    500 + L5 * 0.5 - L3, M + L2 - L3,
                    500 + L5 * 0.5, M + L2,

                    500 + L4 * 0.5, M + L2,
                    500 + L4 * 0.5 + L2, M,
                    1000 - (L1 + M), M,
                    
                    1000 - M, M + L1,
                    
                    1000 - M, 500 - L6 * 0.5,
                    1000 - (M + L3), 500 - L6 * 0.5 + L3,
                    1000 - (M + L3), 500 + L6 * 0.5 - L3,
                    1000 - M, 500 + L6 * 0.5,
                    
                    1000 - M, 1000 - (M + L1),
                    
                    1000 - (L1 + M), 1000 - M,
                    500 + L4 * 0.5 + L2, 1000 - M,
                    500 + L4 * 0.5, 1000 - (M + L2),
                    
                    500 + L5 * 0.5, 1000 - (M + L2),
                    500 + L5 * 0.5 - L3, 1000 - (M + L2 - L3),
                    500 - L5 * 0.5 + L3, 1000 - (M + L2 - L3),
                    500 - L5 * 0.5, 1000 - (M + L2),

                    500 - L4 * 0.5, 1000 - (M + L2),
                    500 - L4 * 0.5 - L2, 1000 - M,
                    M + L1, 1000 - M,
                    
                    M, 1000 - (M + L1),
                    
                    M, 500 + L6 * 0.5,
                    M + L3, 500 + L6 * 0.5 - L3,
                    M + L3, 500 - L6 * 0.5 + L3,
                    M, 500 - L6 * 0.5,

                    M, M + L1,
                ], 
                close: true,
                fillColor: BABYLON.Color3.FromHexString("#292e2c"), 
                fillAlpha: 0.75
            })
        );

        for (let i = 100; i < 1000; i += 100) {
            this.holoSlika.add(new SlikaLine({ x0: M, y0: i, x1: 1000 - M, y1: i, color: BABYLON.Color3.White(), alpha: 0.3, highlightRadius: 10 }));
        }
        for (let i = 100; i < 1000; i += 100) {
            let dy = M;
            if (Math.abs(500 - i) < L4 * 0.5 + L2) {
                dy = M + L2;
            }
            this.holoSlika.add(new SlikaLine({ x0: i, y0: dy, x1: i, y1: 1000 - dy, color: BABYLON.Color3.White(), alpha: 0.3, highlightRadius: 10 }));
        }

        this.holoSlika.add(
            new SlikaPath({
                points: [
                    M + L1, M,
                    500 - L4 * 0.5 - L2, M,
                    500 - L4 * 0.5, M + L2,
                    
                    500 - L5 * 0.5, M + L2,
                    500 - L5 * 0.5 + L3, M + L2 - L3,
                    500 + L5 * 0.5 - L3, M + L2 - L3,
                    500 + L5 * 0.5, M + L2,

                    500 + L4 * 0.5, M + L2,
                    500 + L4 * 0.5 + L2, M,
                    1000 - (L1 + M), M,
                    
                    1000 - M, M + L1,
                    
                    1000 - M, 500 - L6 * 0.5,
                    1000 - (M + L3), 500 - L6 * 0.5 + L3,
                    1000 - (M + L3), 500 + L6 * 0.5 - L3,
                    1000 - M, 500 + L6 * 0.5,

                    1000 - M, 1000 - (M + L1),
                    
                    1000 - (L1 + M), 1000 - M,
                    500 + L4 * 0.5 + L2, 1000 - M,
                    500 + L4 * 0.5, 1000 - (M + L2),
                    
                    500 + L5 * 0.5, 1000 - (M + L2),
                    500 + L5 * 0.5 - L3, 1000 - (M + L2 - L3),
                    500 - L5 * 0.5 + L3, 1000 - (M + L2 - L3),
                    500 - L5 * 0.5, 1000 - (M + L2),

                    500 - L4 * 0.5, 1000 - (M + L2),
                    500 - L4 * 0.5 - L2, 1000 - M,
                    M + L1, 1000 - M,
                    
                    M, 1000 - (M + L1),
                    
                    M, 500 + L6 * 0.5,
                    M + L3, 500 + L6 * 0.5 - L3,
                    M + L3, 500 - L6 * 0.5 + L3,
                    M, 500 - L6 * 0.5,

                    M, M + L1,
                ],
                close: true,
                strokeColor: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor), 
                strokeAlpha: 1,
                strokeWidth: 6,
                outlineWidth: 3
            })
        );
        
        this.titleLine1 = SlikaPath.CreatePan(M + L2, 1000 - M - L2, 0, 3, 15, 0.30, true, false, {
            close: true,
            fillColor: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor), 
            strokeAlpha: 1,
            outlineWidth: 3
        });
        this.titleLine1.posY = this.titleHeight;
        this.holoSlika.add(this.titleLine1);
        this.titleLine2 = SlikaPath.CreatePan(M + L2, 1000 - M - L2, 30, 3, 15, 0.30, false, true, {
            close: true,
            fillColor: BABYLON.Color3.FromHexString(Config.uiConfiguration.holoScreenBaseColor), 
            strokeAlpha: 1,
            outlineWidth: 3
        });
        this.titleLine2.posY = this.titleHeight;
        this.holoSlika.add(this.titleLine2);

        this.introPage = new MainMenuPanelIntroPage(this);
        this.introPage.hide(0);
        this.graphicsPage = new MainMenuPanelGraphicsPage(this);
        this.graphicsPage.hide(0);
        this.tutorialPage = new MainMenuPanelTutorialPage(this);
        this.tutorialPage.hide(0);
        this.planetPage = new MainMenuPlanetSelectionPage(this);
        this.planetPage.hide(0);
        this.pages = [this.introPage, this.graphicsPage, this.tutorialPage, this.planetPage];
        this.showPage(0);
    }

    public currentPage: number = 0;
    public async showPage(page: number): Promise<void> {
        await this.pages[this.currentPage].hide(0.3);
        this.currentPage = page;
        await this.pages[this.currentPage].show(0.3);
    }

    public register(): void {
        this.inputManager.addMappedKeyUpListener(KeyInput.MAIN_MENU, async () => {
            this.openAtPlayerPosition();
        })
    }

    public async openAtPlayerPosition(): Promise<void> {
        let player = this.inputManager.player;
        if (player && !player.lockInPlace && !player.targetDestination && !player.targetLook) {
            await this.close(0);
            let p = player.position.add(player.forward.scale(1.2));
            this.planet = player.planet;
            this.setPosition(p, true);
            this.setTarget(player.position);
            requestAnimationFrame(() => {
                this.inputManager.player.targetLook = this.holoMesh.absolutePosition;
                this.inputManager.player.targetDestination = this.interactionAnchor.absolutePosition.clone();
            })
            this.showPage(this.currentPage);
            await this.open();
        }
    }

    public animateTitleHeight = AnimationFactory.CreateNumber(
        this,
        this,
        "titleHeight",
        () => {
            this.titleLine1.posY = this.titleHeight;
            this.titleLine2.posY = this.titleHeight;
            this.holoSlika.needRedraw = true;
        }
    );
}