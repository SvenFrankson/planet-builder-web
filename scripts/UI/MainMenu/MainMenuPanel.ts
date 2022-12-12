class MainMenuPanel extends HoloPanel {

    public titleHeight: number = 220;
    public titleLine1: SlikaPath;
    public titleLine2: SlikaPath;

    public introPage: MainMenuPanelIntroPage;
    public graphicsPage: MainMenuPanelGraphicsPage;
    public planetPage: MainMenuPlanetSelectionPage;

    constructor(public dpi: number, main: Main) {
        super(0.6, 1.7, 1000, 1000, main);
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

        this.pointerElement.min = new SPosition(M + 5, M + 5);
        this.pointerElement.max = new SPosition(1000 - M - 5, 1000 - M - 5);
        this.pointerElement.XToDY = (x: number) => {
            if (x < 500 - L4 * 0.5 - L2) {
                return 0;
            }
            else if (x < 500 - L4 * 0.5) {
                let f = (x - (500 - L4 * 0.5 - L2)) / L2;
                return f * L2;
            }
            else if (x < 500 + L4 * 0.5) {
                return L2;
            }
            else if (x < 500 + L4 * 0.5 + L2) {
                let f = 1 - (x - (500 + L4 * 0.5)) / L2;
                return f * L2;
            }
            else {
                return 0;
            }
        }

        this.holoSlika.add(
            new SlikaPath(
                new SPoints([
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
                ], true),
                new SlikaShapeStyle("none", 1, "#292e2c", 0.75, 0, "white", 0)
            )
        );

        for (let i = 100; i < 1000; i += 100) {
            this.holoSlika.add(SlikaLine.Create(M, i, 1000 - M, i, new SlikaShapeStyle("#ffffff", 0.1, "none", 1, 3, "ffffff", 20)));
        }
        for (let i = 100; i < 1000; i += 100) {
            let dy = M;
            if (Math.abs(500 - i) < L4 * 0.5 + L2) {
                dy = M + L2;
            }
            this.holoSlika.add(SlikaLine.Create(i, dy, i, 1000 - dy, new SlikaShapeStyle("#ffffff", 0.1, "none", 1, 3, "ffffff", 20)));
        }

        this.holoSlika.add(
            new SlikaPath(
                new SPoints([
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
                ], true),
                new SlikaShapeStyle(Config.uiConfiguration.holoScreenBaseColor, 1, "none", 1, 6, Config.uiConfiguration.holoScreenBaseColor, 6)
            )
        );
        
        this.titleLine1 = SlikaPath.CreatePan(M + L2, 1000 - M - L2, 0, 3, 15, 0.30, true, false, new SlikaShapeStyle("none", 1, Config.uiConfiguration.holoScreenBaseColor, 1, 0, Config.uiConfiguration.holoScreenBaseColor, 6));
        this.titleLine1.posY = this.titleHeight;
        this.holoSlika.add(this.titleLine1);
        this.titleLine2 = SlikaPath.CreatePan(M + L2, 1000 - M - L2, 30, 3, 15, 0.30, false, true, new SlikaShapeStyle("none", 1, Config.uiConfiguration.holoScreenBaseColor, 1, 0, Config.uiConfiguration.holoScreenBaseColor, 6));
        this.titleLine2.posY = this.titleHeight;
        this.holoSlika.add(this.titleLine2);

        this.introPage = new MainMenuPanelIntroPage(this);
        this.introPage.show(0.2);
        this.graphicsPage = new MainMenuPanelGraphicsPage(this);
        this.graphicsPage.hide(0.2);
        this.planetPage = new MainMenuPlanetSelectionPage(this);
        this.planetPage.hide(0.2);
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