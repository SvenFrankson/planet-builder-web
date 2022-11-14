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

			let textPage = new TextPage(this);
			textPage.instantiate();
			textPage.setPosition(BABYLON.Vector3.Zero());
			textPage.setTarget(new BABYLON.Vector3(0, 1, - 3));
			textPage.open();
			
			let context = textPage.texture.getContext();

			let silka = new Slika(1600, 1000, context);
			silka.add(new SlikaText(
				"SLIKA",
				new SlikaPosition(100, 100),
				new SlikaTextStyle("#74cfaa", 100)
			));
			silka.clear("#4d6b5f80");
			silka.redraw();

			textPage.texture.update();

			this._textPage = textPage;

			resolve();
		})
	}

	public update(): void {
		//this._textPage.baseMesh.rotate(BABYLON.Axis.Y, Math.PI / 60)
	}
}
