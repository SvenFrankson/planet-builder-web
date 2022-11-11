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

		this.camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 1, - 5), this.scene);
		this.camera.attachControl();
		//this.camera.layerMask = 0x10000000;

		this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
	}

	private _textPage: TextPage;

    public async initialize(): Promise<void> {
		return new Promise<void>(resolve => {

			let svg = document.createElement("svg");
			svg.setAttribute("viewBox", "0 0 100 100");
			let rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
			rect.setAttribute("x", "40");
			rect.setAttribute("y", "60");
			rect.setAttribute("width", "100");
			rect.setAttribute("height", "100");
			rect.setAttribute("fill", "red");
			rect.setAttribute("stroke", "lime");
			svg.appendChild(rect);

			let textPage = new TextPage(this);
			textPage.instantiate();
			textPage.setPosition(BABYLON.Vector3.Zero());
			textPage.setTarget(new BABYLON.Vector3(0, 1, - 5));
			textPage.open();
			
			let image = new Image();
			image.onload = () => {
				image.src = URL.createObjectURL(
					new Blob(
						[svg.outerHTML],
						{type:'image/svg+xml;charset=utf-8'}
					)
				);
				textPage.redrawSVG(image);
			}

			this._textPage = textPage;

			resolve();
		})
	}

	public update(): void {
		//this._textPage.baseMesh.rotate(BABYLON.Axis.Y, Math.PI / 60)
	}
}
