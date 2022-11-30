class MainMenuPanel extends HoloPanel {

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
                new SlikaShapeStyle("none", "#292e2cc0", 0, "white", 0)
            )
        );

        for (let i = 100; i < 1000; i += 100) {
            this.holoSlika.add(SlikaLine.Create(M, i, 1000 - M, i, new SlikaShapeStyle("#ffffff30", "none", 3, "ffffff", 20)));
        }
        for (let i = 100; i < 1000; i += 100) {
            let dy = M;
            if (Math.abs(500 - i) < L4 * 0.5 + L2) {
                dy = M + L2;
            }
            this.holoSlika.add(SlikaLine.Create(i, dy, i, 1000 - dy, new SlikaShapeStyle("#ffffff30", "none", 3, "ffffff", 20)));
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
                new SlikaShapeStyle("#8dd6c0", "none", 3, "#8dd6c0", 10)
            )
        );

        this.holoSlika.add(
            new SlikaPath(
                new SPoints([
                    500 - L5 * 0.5, M + L2,
                    500 - L5 * 0.5 + L3, M + L2 - L3,
                    500 + L5 * 0.5 - L3, M + L2 - L3,
                    500 + L5 * 0.5, M + L2,
                    500 - L5 * 0.5, M + L2,
                ]),
                new SlikaShapeStyle("none", "#8dd6c0", 0, "#8dd6c0", 10)
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
                new SlikaShapeStyle("none", "#8dd6c0", 0, "#8dd6c0", 10)
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
                new SlikaShapeStyle("none", "#8dd6c0", 0, "#8dd6c0", 10)
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
                new SlikaShapeStyle("none", "#8dd6c0", 0, "#8dd6c0", 10)
            )
        );

        this.holoSlika.add(new SlikaText(
            "WELCOME TO",
            new SPosition(500, 110, "center"),
            new SlikaTextStyle("#8dd6c0", 60, "XoloniumRegular")
        ));

        this.holoSlika.add(new SlikaText(
            "PLANET BUILDER WEB",
            new SPosition(500, 190, "center"),
            new SlikaTextStyle("#8dd6c0", 60, "XoloniumRegular")
        ));

        this.holoSlika.add(new SlikaText(
            "A SPHERICAL VOXEL ENGINE",
            new SPosition(500, 320, "center"),
            new SlikaTextStyle("#8dd6c0", 60, "XoloniumRegular")
        ));

        this.holoSlika.add(new SlikaText(
            "DEMO",
            new SPosition(500, 400, "center"),
            new SlikaTextStyle("#8dd6c0", 60, "XoloniumRegular")
        ));

        this.holoSlika.add(new SlikaText(
            "made by Sven Frankson",
            new SPosition(500, 530, "center"),
            new SlikaTextStyle("#8dd6c0", 60, "XoloniumRegular")
        ));

        this.holoSlika.add(new SlikaText(
            "powered by BabylonJS",
            new SPosition(500, 610, "center"),
            new SlikaTextStyle("#8dd6c0", 60, "XoloniumRegular")
        ));
    }
}