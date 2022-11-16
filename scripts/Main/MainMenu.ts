/// <reference path="../../lib/babylon.d.ts"/>

class MainMenu extends Main {

	public camera: BABYLON.FreeCamera;

	public createScene(): void {
		super.createScene();

		let light = new BABYLON.HemisphericLight(
			"light",
			new BABYLON.Vector3(0.6, 1, 0.3),
			this.scene
		);
		light.diffuse = new BABYLON.Color3(1, 1, 1);
		light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);

		this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 1, - 3), this.scene);
		this.camera.attachControl();
		//this.camera.layerMask = 0x10000000;

		this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
	}

	private _textPage: TextPage;

    public async initialize(): Promise<void> {
		return new Promise<void>(resolve => {

			let w = 600;
			let h = 1200;

			let textPage = new TextPage(0.7, w, h, this);
			textPage.instantiate();
			textPage.setPosition(BABYLON.Vector3.Zero());
			textPage.setTarget(new BABYLON.Vector3(0, 1, - 3));
			textPage.open();
			
			let context = textPage.texture.getContext();

			let slika = new Slika(w, h, context);
			slika.add(new SlikaPath(new SlikaPoints([23, 18, w - 23, 18, w - 23, h - 18, 23, h - 18]), new SlikaShapeStyle("none", "#596b6680", 0, "white", 0)));
			for (let i = 100; i < h; i += 100) {
				slika.add(SlikaLine.Create(23, i, w - 23, i, new SlikaShapeStyle("#ffffff30", "none", 3, "ffffff", 20)));
			}
			for (let i = 100; i < w; i += 100) {
				slika.add(SlikaLine.Create(i, 33, i, h - 33, new SlikaShapeStyle("#ffffff30", "none", 3, "ffffff", 20)));
			}

			slika.add(SlikaLine.Create(20, 15, w - 20, 15, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			slika.add(SlikaLine.Create(20, 30, 120, 30, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			slika.add(SlikaLine.Create(130, 30, w - 20, 30, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));

			slika.add(SlikaLine.Create(23, 40, 23, h - 40, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			slika.add(SlikaLine.Create(w - 23, 40, w - 23, h - 40, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			
			slika.add(SlikaLine.Create(20, h - 30, 300, h - 30, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			slika.add(SlikaLine.Create(310, h - 30, w - 20, h - 30, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			slika.add(SlikaLine.Create(20, h - 15, w - 20, h - 15, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));

			//silka.add(new SlikaPath(new SlikaPoints([35, 40, w - 33, 40, w - 33, 80, 400, 80, 360, 46, 35, 46]), new SlikaShapeStyle("none", "#8dd6c0", 0, "#8dd6c0", 10)));
			slika.add(SlikaPath.CreatePan(35, w - 35, 40, 6, 40, 0.3, true, false, new SlikaShapeStyle("none", "#8dd6c0", 0, "#8dd6c0", 10)));
			slika.add(SlikaPath.CreatePan(35, w - 35, 155, 6, 20, 0.3, false, true, new SlikaShapeStyle("none", "#8dd6c0", 0, "#8dd6c0", 10)));

			/*
			*/
			slika.add(new SlikaText(
				"GRAPHICS",
				new SlikaPosition(60, 110),
				new SlikaTextStyle("#8dd6c0", 50, "XoloniumRegular")
			));
			
			slika.add(new SlikaButton(
				"High",
				new SlikaPosition(120, 240),
				BABYLON.Color3.FromHexString("#cc8a2d")
			))

			slika.add(new SlikaButton(
				"Medium",
				new SlikaPosition(120, 440),
				BABYLON.Color3.FromHexString("#2dafcc")
			))
			
			//slika.add(new SlikaText(
			//	"Medium",
			//	new SlikaPosition(300, 500, "center"),
			//	new SlikaTextStyle("#d6d48d", 60, "XoloniumRegular")
			//));
			//slika.add(SlikaPath.CreateParenthesis(110, 130, 412, 146, false, new SlikaShapeStyle("d6d48d80", "none", 6, "#d6d48d", 20)));
			//slika.add(SlikaPath.CreateParenthesis(120, 135, 422, 126, false, new SlikaShapeStyle("d6d48d80", "none", 6, "#d6d48d", 20)));
			//slika.add(SlikaPath.CreatePan(150, w - 35, 420, 6, 50, 0.15, true, false, new SlikaShapeStyle("none", "#d6d48d80", 0, "#d6d48d", 20)));
			//slika.add(SlikaPath.CreatePan(150, w - 35, 550, 6, 50, 0.15, true, true, new SlikaShapeStyle("none", "#d6d48d", 0, "#d6d48d", 20)));
			
			slika.add(new SlikaButton(
				"Low",
				new SlikaPosition(120, 640),
				BABYLON.Color3.FromHexString("#2dcc77")
			))

			slika.add(new SlikaButton(
				"Custom",
				new SlikaPosition(120, 840),
				BABYLON.Color3.FromHexString("#2dafcc")
			))

			slika.clear("#00000000");
			slika.redraw();

			textPage.texture.update();

			this._textPage = textPage;

			resolve();
		})
	}

	public update(): void {
		//this._textPage.baseMesh.rotate(BABYLON.Axis.Y, Math.PI / 60)
	}
}
