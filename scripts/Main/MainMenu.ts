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

		this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 1.7, - 1), this.scene);
		this.camera.minZ = 0.1;
		this.camera.attachControl();
		this.camera.speed *= 0.2;
		//this.camera.layerMask = 0x10000000;

		this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
	}

	private _textPage: TextPage;

    public async initialize(): Promise<void> {
        let vertexData = (await this.vertexDataLoader.get("main-room"))[0];
		let roomMesh = new BABYLON.Mesh("main-room");
		vertexData.applyToMesh(roomMesh);
		let material = new PlanetMaterial("room", this.scene);
		material.setUseVertexColor(true);
		roomMesh.material = material;

		return new Promise<void>(resolve => {

			let w = 600;
			let h = 1200;

			let graphicsPanel = new TextPage(0.4, 1.5, w, h, this);
			graphicsPanel.instantiate();
			graphicsPanel.setPosition(new BABYLON.Vector3(-0.6, 0, 0.8));
			graphicsPanel.setTarget(this.camera.position);
			graphicsPanel.open();
			
			let graphicsContext = graphicsPanel.texture.getContext();

			let graphicsSlika = new Slika(w, h, graphicsContext, graphicsPanel.texture);
			graphicsSlika.add(new SlikaPath(new SlikaPoints([23, 18, w - 23, 18, w - 23, h - 18, 23, h - 18]), new SlikaShapeStyle("none", "#596b66e0", 0, "white", 0)));
			for (let i = 100; i < h; i += 100) {
				graphicsSlika.add(SlikaLine.Create(23, i, w - 23, i, new SlikaShapeStyle("#ffffff30", "none", 3, "ffffff", 20)));
			}
			for (let i = 100; i < w; i += 100) {
				graphicsSlika.add(SlikaLine.Create(i, 33, i, h - 33, new SlikaShapeStyle("#ffffff30", "none", 3, "ffffff", 20)));
			}

			graphicsSlika.add(SlikaLine.Create(20, 15, w - 20, 15, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			graphicsSlika.add(SlikaLine.Create(20, 30, 120, 30, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			graphicsSlika.add(SlikaLine.Create(130, 30, w - 20, 30, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));

			graphicsSlika.add(SlikaLine.Create(23, 40, 23, h - 40, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			graphicsSlika.add(SlikaLine.Create(w - 23, 40, w - 23, h - 40, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			
			graphicsSlika.add(SlikaLine.Create(20, h - 30, 300, h - 30, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			graphicsSlika.add(SlikaLine.Create(310, h - 30, w - 20, h - 30, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			graphicsSlika.add(SlikaLine.Create(20, h - 15, w - 20, h - 15, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));

			//silka.add(new SlikaPath(new SlikaPoints([35, 40, w - 33, 40, w - 33, 80, 400, 80, 360, 46, 35, 46]), new SlikaShapeStyle("none", "#8dd6c0", 0, "#8dd6c0", 10)));
			graphicsSlika.add(SlikaPath.CreatePan(35, w - 35, 40, 6, 40, 0.3, true, false, new SlikaShapeStyle("none", "#8dd6c0", 0, "#8dd6c0", 10)));
			graphicsSlika.add(SlikaPath.CreatePan(35, w - 35, 155, 6, 20, 0.3, false, true, new SlikaShapeStyle("none", "#8dd6c0", 0, "#8dd6c0", 10)));

			/*
			*/
			graphicsSlika.add(new SlikaText(
				"GRAPHICS",
				new SlikaPosition(60, 110),
				new SlikaTextStyle("#8dd6c0", 50, "XoloniumRegular")
			));
			
			let buttonHigh = new SlikaButton(
				"High",
				new SlikaPosition(120, 240),
				BABYLON.Color3.FromHexString("#8dd6c0")
			);

			let buttonMedium = new SlikaButton(
				"Medium",
				new SlikaPosition(120, 440),
				BABYLON.Color3.FromHexString("#8dd6c0")
			);
			
			let buttonLow = new SlikaButton(
				"Low",
				new SlikaPosition(120, 640),
				BABYLON.Color3.FromHexString("#8dd6c0")
			);

			let buttonCustom = new SlikaButton(
				"Custom",
				new SlikaPosition(120, 840),
				BABYLON.Color3.FromHexString("#8dd6c0")
			);

			graphicsSlika.add(buttonHigh);
			graphicsSlika.add(buttonMedium);
			graphicsSlika.add(buttonLow);
			graphicsSlika.add(buttonCustom);

			this._textPage = graphicsPanel;

			setTimeout(() => {
				buttonHigh.setStatus(SlikaButtonState.Enabled);
				buttonMedium.setStatus(SlikaButtonState.Enabled);
				buttonLow.setStatus(SlikaButtonState.Enabled);
				buttonCustom.setStatus(SlikaButtonState.Disabled);
			
				setTimeout(() => {
					buttonHigh.setStatus(SlikaButtonState.Active);
				}, 2000);
			}, 2000);

			let wMain = 1200;
			let hMain = 800;

			let mainPanel = new TextPage(1, 1.5, wMain, hMain, this);
			mainPanel.instantiate();
			mainPanel.setPosition(new BABYLON.Vector3(0.2, 0, 1));
			mainPanel.setTarget(this.camera.position);
			mainPanel.open();
			
			let mainContext = mainPanel.texture.getContext();

			let mainSlika = new Slika(wMain, hMain, mainContext, mainPanel.texture);
			mainSlika.add(new SlikaPath(new SlikaPoints([23, 18, wMain - 23, 18, wMain - 23, hMain - 18, 23, hMain - 18]), new SlikaShapeStyle("none", "#596b66e0", 0, "white", 0)));
			for (let i = 100; i < hMain; i += 100) {
				mainSlika.add(SlikaLine.Create(23, i, wMain - 23, i, new SlikaShapeStyle("#ffffff30", "none", 3, "ffffff", 20)));
			}
			for (let i = 100; i < wMain; i += 100) {
				mainSlika.add(SlikaLine.Create(i, 33, i, hMain - 33, new SlikaShapeStyle("#ffffff30", "none", 3, "ffffff", 20)));
			}
			mainSlika.add(SlikaLine.Create(20, 15, wMain - 20, 15, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			mainSlika.add(SlikaLine.Create(20, 30, 120, 30, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			mainSlika.add(SlikaLine.Create(130, 30, wMain - 20, 30, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));

			mainSlika.add(SlikaLine.Create(23, 40, 23, hMain - 40, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			mainSlika.add(SlikaLine.Create(wMain - 23, 40, wMain - 23, hMain - 40, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			
			mainSlika.add(SlikaLine.Create(20, hMain - 30, 300, hMain - 30, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			mainSlika.add(SlikaLine.Create(310, hMain - 30, wMain - 20, hMain - 30, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));
			mainSlika.add(SlikaLine.Create(20, hMain - 15, wMain - 20, hMain - 15, new SlikaShapeStyle("#8dd6c0", "none", 6, "#8dd6c0", 10)));

			//silka.add(new SlikaPath(new SlikaPoints([35, 40, wMain - 33, 40, wMain - 33, 80, 400, 80, 360, 46, 35, 46]), new SlikaShapeStyle("none", "#8dd6c0", 0, "#8dd6c0", 10)));
			mainSlika.add(SlikaPath.CreatePan(35, wMain - 35, 40, 6, 40, 0.3, true, false, new SlikaShapeStyle("none", "#8dd6c0", 0, "#8dd6c0", 10)));
			mainSlika.add(SlikaPath.CreatePan(35, wMain - 35, 155, 6, 20, 0.3, false, true, new SlikaShapeStyle("none", "#8dd6c0", 0, "#8dd6c0", 10)));

			mainSlika.add(new SlikaText(
				"PLANET BUILDER WEB",
				new SlikaPosition(60, 110),
				new SlikaTextStyle("#8dd6c0", 50, "XoloniumRegular")
			));
			
			let buttonPlay = new SlikaButton(
				"Play",
				new SlikaPosition(420, 340),
				BABYLON.Color3.FromHexString("#8dd6c0")
			);
			mainSlika.add(buttonPlay);

			resolve();
		})
	}

	public update(): void {
		//this._textPage.baseMesh.rotate(BABYLON.Axis.Y, Math.PI / 60)
		this.camera.position.y = 1.7;
	}
}
