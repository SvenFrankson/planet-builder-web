class MainMenuPanel extends HoloPanel {

    public introPage: MainMenuPanelPage = new MainMenuPanelPage();
    public graphic: MainMenuPanelPage = new MainMenuPanelPage();

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
                    500 + L4 * 0.5, M + L2,
                    500 + L4 * 0.5 + L2, M,
                    1000 - (L1 + M), M,
                    
                    1000 - M, M + L1,
                    1000 - M, 1000 - (M + L1),
                    
                    1000 - (L1 + M), 1000 - M,
                    500 + L4 * 0.5 + L2, 1000 - M,
                    500 + L4 * 0.5, 1000 - (M + L2),
                    500 - L4 * 0.5, 1000 - (M + L2),
                    500 - L4 * 0.5 - L2, 1000 - M,
                    M + L1, 1000 - M,
                    
                    M, 1000 - (M + L1),
                    M, M + L1,
                    
                    M + L1, M,
                ]),
                new SlikaShapeStyle("none", 1, "#292e2c", 0.75, 0, "white", 0)
            )
        );

        for (let i = 100; i < 1000; i += 100) {
            this.holoSlika.add(SlikaLine.Create(M, i, 1000 - M, i, new SlikaShapeStyle("#ffffff", 0.5, "none", 1, 3, "ffffff", 20)));
        }
        for (let i = 100; i < 1000; i += 100) {
            let dy = M;
            if (Math.abs(500 - i) < L4 * 0.5 + L2) {
                dy = M + L2;
            }
            this.holoSlika.add(SlikaLine.Create(i, dy, i, 1000 - dy, new SlikaShapeStyle("#ffffff", 0.5, "none", 1, 3, "ffffff", 20)));
        }

        this.holoSlika.add(
            new SlikaPath(
                new SPoints([
                    M + L1, M,
                    500 - L4 * 0.5 - L2, M,
                    500 - L4 * 0.5, M + L2,
                    500 + L4 * 0.5, M + L2,
                    500 + L4 * 0.5 + L2, M,
                    1000 - (L1 + M), M,
                    
                    1000 - M, M + L1,
                    1000 - M, 1000 - (M + L1),
                    
                    1000 - (L1 + M), 1000 - M,
                    500 + L4 * 0.5 + L2, 1000 - M,
                    500 + L4 * 0.5, 1000 - (M + L2),
                    500 - L4 * 0.5, 1000 - (M + L2),
                    500 - L4 * 0.5 - L2, 1000 - M,
                    M + L1, 1000 - M,
                    
                    M, 1000 - (M + L1),
                    M, M + L1,
                    
                    M + L1, M,
                ]),
                new SlikaShapeStyle("#8dd6c0", 1, "none", 1, 3, "#8dd6c0", 10)
            )
        );
        
        this.holoSlika.add(SlikaPath.CreatePan(M + L2, 1000 - M - L2, 220, 3, 15, 0.30, true, false, new SlikaShapeStyle("none", 1, "#8dd6c0", 1, 0, "#8dd6c0", 10)));
        this.holoSlika.add(SlikaPath.CreatePan(M + L2, 1000 - M - L2, 250, 3, 15, 0.30, false, true, new SlikaShapeStyle("none", 1, "#8dd6c0", 1, 0, "#8dd6c0", 10)));

        this.holoSlika.add(
            new SlikaPath(
                new SPoints([
                    500 - L5 * 0.5, M + L2,
                    500 - L5 * 0.5 + L3, M + L2 - L3,
                    500 + L5 * 0.5 - L3, M + L2 - L3,
                    500 + L5 * 0.5, M + L2,
                    500 - L5 * 0.5, M + L2,
                ]),
                new SlikaShapeStyle("none", 1, "#8dd6c0", 1, 0, "#8dd6c0", 10)
            )
        );

        this.holoSlika.add(
            new SlikaPath(
                new SPoints([
                    500 - L5 * 0.5, 1000 - (M + L2),
                    500 - L5 * 0.5 + L3, 1000 - (M + L2 - L3),
                    500 + L5 * 0.5 - L3, 1000 - (M + L2 - L3),
                    500 + L5 * 0.5, 1000 - (M + L2),
                    500 - L5 * 0.5, 1000 - (M + L2),
                ]),
                new SlikaShapeStyle("none", 1, "#8dd6c0", 1, 0, "#8dd6c0", 10)
            )
        );

        this.holoSlika.add(
            new SlikaPath(
                new SPoints([
                    M, 500 - L6 * 0.5,
                    M + L3, 500 - L6 * 0.5 + L3,
                    M + L3, 500 + L6 * 0.5 - L3,
                    M, 500 + L6 * 0.5,
                    M, 500 - L6 * 0.5,
                ]),
                new SlikaShapeStyle("none", 1, "#8dd6c0", 1, 0, "#8dd6c0", 10)
            )
        );

        this.holoSlika.add(
            new SlikaPath(
                new SPoints([
                    1000 - M, 500 - L6 * 0.5,
                    1000 - (M + L3), 500 - L6 * 0.5 + L3,
                    1000 - (M + L3), 500 + L6 * 0.5 - L3,
                    1000 - M, 500 + L6 * 0.5,
                    1000 - M, 500 - L6 * 0.5,
                ]),
                new SlikaShapeStyle("none", 1, "#8dd6c0", 1, 0, "#8dd6c0", 10)
            )
        );

        let title1 = this.holoSlika.add(new SlikaText(
            "Welcome to",
            new SPosition(500, 110, "center"),
            new SlikaTextStyle("#8dd6c0", 60, "XoloniumRegular")
        ));

        let title2 = this.holoSlika.add(new SlikaText(
            "PLANET BUILDER WEB",
            new SPosition(500, 180, "center"),
            new SlikaTextStyle("#8dd6c0", 60, "XoloniumRegular")
        ));

        let text1 = this.holoSlika.add(new SlikaText(
            "a Spherical Voxel",
            new SPosition(550, 370, "end"),
            new SlikaTextStyle("#8dd6c0", 50, "XoloniumRegular")
        ));

        let text2 = this.holoSlika.add(new SlikaText(
            "Engine demo",
            new SPosition(550, 430, "end"),
            new SlikaTextStyle("#8dd6c0", 50, "XoloniumRegular")
        ));

        let textDecoy = this.holoSlika.add(SlikaPath.CreatePan(100, 620, 460, 3, 30, 0.15, false, true, new SlikaShapeStyle("none", 1, "#8dd6c0", 1, 0, "#8dd6c0", 10)));

        let planetImage = this.holoSlika.add(new SlikaImage(
            new SPosition(750, 390),
            200, 
            200,
            "datas/images/planet.png"
        ));

        let buttonPlay = new SlikaButton(
            "Enter",
            new SPosition(320, 550),
            BABYLON.Color3.FromHexString("#8dd6c0")
        );
        buttonPlay.onPointerUp = () => {
            this.introPage.hide(1);
        }
        this.holoSlika.add(buttonPlay);

        let buttonPlayLabel = this.holoSlika.add(new SlikaText(
            "(press to enter)",
            new SPosition(500, 720, "center"),
            new SlikaTextStyle("#8dd6c0", 30, "XoloniumRegular")
        ));

        let bottom1 = this.holoSlika.add(new SlikaText(
            "powered by BabylonJS",
            new SPosition(850, 850, "end"),
            new SlikaTextStyle("#8dd6c0", 40, "XoloniumRegular")
        ));

        let babylonIcon = this.holoSlika.add(new SlikaImage(
            new SPosition(910, 835),
            80, 
            80,
            "datas/images/babylonjs-holo-logo.png"
        ));

        let bottom2 = this.holoSlika.add(new SlikaText(
            "made by Sven Frankson",
            new SPosition(940, 920, "end"),
            new SlikaTextStyle("#8dd6c0", 40, "XoloniumRegular")
        ));

        this.introPage.elements.push(title1, title2, text1, text2, textDecoy, planetImage, buttonPlay, buttonPlayLabel, bottom1, babylonIcon, bottom2);
    }
}