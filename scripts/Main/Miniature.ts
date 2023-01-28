class Miniature extends Main {

    public camera: BABYLON.ArcRotateCamera;
	public targets: BABYLON.Mesh[] = [];
	public sizeMarkers: BABYLON.Mesh;
	public sizeMarkerMaterial: BABYLON.StandardMaterial;

	public updateCameraPosition(useSizeMarker: boolean = false): void {
        if (this.camera instanceof BABYLON.ArcRotateCamera) {
            this.camera.lowerRadiusLimit = 0.01;
            this.camera.upperRadiusLimit = 1000;
            let size = 0;
            this.targets.forEach(
                t => {
                    let bbox = t.getBoundingInfo();
                    size = Math.max(size, bbox.maximum.x - bbox.minimum.x);
                    size = Math.max(size, bbox.maximum.y - bbox.minimum.y);
                    size = Math.max(size, bbox.maximum.z - bbox.minimum.z);
                }
			)
			if (useSizeMarker) {
				size += 1.5;
			}
            let bbox = this.targets[0].getBoundingInfo();
            this.camera.target.copyFrom(bbox.maximum).addInPlace(bbox.minimum).scaleInPlace(0.5);
            let cameraPosition = (new BABYLON.Vector3(- 1, 0.6, 0.8)).normalize();

			let f = (size - 0.4) / (7.90 - 0.4);
            //cameraPosition.scaleInPlace(Math.pow(size, 0.6) * 3.2);
            cameraPosition.scaleInPlace(1 * (1 - f) + 12 * f).scaleInPlace(1);
            cameraPosition.addInPlace(this.camera.target);
            this.camera.setPosition(cameraPosition);

			if (this.sizeMarkers) {
				this.sizeMarkers.dispose();
			}
            /*
			if (useSizeMarker) {
				this.sizeMarkers = new BABYLON.Mesh("size-markers");
				let n = 0;
				for (let x = bbox.minimum.x; x < bbox.maximum.x - DX05; x += DX) {
					let cylinder = BABYLON.MeshBuilder.CreateCylinder("x", { diameter: 0.04, height: (n % 2 === 0) ? 0.8 : 0.3 });
					cylinder.material = this.sizeMarkerMaterial;
					cylinder.position.x = x;
					cylinder.position.z = bbox.maximum.z + ((n % 2 === 0) ? 0.6 : 0.35);
					cylinder.rotation.x = Math.PI / 2;
					cylinder.parent = this.sizeMarkers;
					cylinder.layerMask = 1;
					n++;
				}
				n = 0;
				for (let y = bbox.minimum.y; y < bbox.maximum.y + DY05; y += DY) {
					let cylinder = BABYLON.MeshBuilder.CreateCylinder("y", { diameter: 0.04, height: (n % 3 === 0) ? 0.8 : 0.3 });
					cylinder.material = this.sizeMarkerMaterial;
					cylinder.position.x = bbox.maximum.x;
					cylinder.position.y = y;
					cylinder.position.z = bbox.maximum.z + ((n % 3 === 0) ? 0.6 : 0.35);
					cylinder.rotation.x = Math.PI / 2;
					cylinder.parent = this.sizeMarkers;
					cylinder.layerMask = 1;
					n++;
				}
				n = 0;
				for (let z = bbox.minimum.z; z < bbox.maximum.z + DX05; z += DX) {
					let cylinder = BABYLON.MeshBuilder.CreateCylinder("z", { diameter: 0.04, height: (n % 2 === 0) ? 0.8 : 0.3 });
					cylinder.material = this.sizeMarkerMaterial;
					cylinder.position.x = bbox.minimum.x - ((n % 2 === 0) ? 0.6 : 0.35);
					cylinder.position.z = z;
					cylinder.rotation.z = Math.PI / 2;
					cylinder.parent = this.sizeMarkers;
					cylinder.layerMask = 1;
					n++;
				}
			}
            */
        }
    }

    public async initialize(): Promise<void> {
        super.initialize();
        this.camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, BABYLON.Vector3.Zero());
        this.camera.wheelPrecision *= 10;
		this.scene.activeCamera = this.camera;

		this.sizeMarkerMaterial = new BABYLON.StandardMaterial("size-marker-material", Main.Scene);
		this.sizeMarkerMaterial.specularColor.copyFromFloats(0, 0, 0);
		this.sizeMarkerMaterial.diffuseColor.copyFromFloats(0, 0, 0);

		Main.Scene.clearColor.copyFromFloats(0, 0, 0, 0);

		window.addEventListener("pointerup", () => {
			setTimeout(
				async () => {
					for (let i = BlockType.Grass; i < BlockType.Unknown; i++) {
						await this.createBlock(i);
					}
				},
				300
			);
		});
	}

	public async createBlock(blockType: BlockType): Promise<void> {
		
        let vertexData = (await this.vertexDataLoader.get("chunck-part"))[0];
        let colors = [];
        let uvs = [];
		let uvs2 = [];
        for (let i = 0; i < vertexData.positions.length / 3; i++) {
            colors[4 * i] = Math.SQRT2;
            colors[4 * i + 1] = 0;
            colors[4 * i + 2] = Math.SQRT2;
            colors[4 * i + 3] = blockType / 128;
			uvs[2 * i] = vertexData.positions[3 * i] * 0.25;
			uvs[2 * i + 1] = vertexData.positions[3 * i + 2] * 0.25;
			
			uvs2[2 * i] = vertexData.positions[3 * i + 1] * 0.25;
			uvs2[2 * i + 1] = 1;
        }
        vertexData.colors = colors;
        vertexData.uvs = uvs;
		vertexData.uvs2 = uvs2;

        let block = BABYLON.MeshBuilder.CreateBox("block");
        vertexData.applyToMesh(block);
		
		let material = new PlanetMaterial("chunck-material", this.scene);
		material.setLightInvDir((new BABYLON.Vector3(- 3, 2, 1)).normalize());
        material.setPlanetPos(new BABYLON.Vector3(0, - 10, 0));
        block.material = material;
		
		this.targets = [block];
		
		return new Promise<void>(
            resolve => {
                setTimeout(
                    () => {
                        this.updateCameraPosition();
                        setTimeout(
                            async () => {
								await this.makeScreenShot("block-icon-" + BlockTypeNames[blockType], 0);
								block.dispose();
                                resolve();
                            },
                            200
                        )
                    },
                    200
                )
            }
        )
	}

	public async makeScreenShot(miniatureName?: string, desaturation: number = 0): Promise<void> {
		return new Promise<void>(
			resolve => {
				requestAnimationFrame(
					() => {
						BABYLON.ScreenshotTools.CreateScreenshot(
							Main.Engine,
							this.camera,
							{
								width: 256 * this.canvas.width / this.canvas.height,
								height: 256
							},
							(data) => {
								let img = document.createElement("img");
								img.src = data;
								img.onload = () => {
									let sx = (img.width - 256) * 0.5;
									let sy = (img.height - 256) * 0.5;
									let canvas = document.createElement("canvas");
									canvas.width = 256;
									canvas.height = 256;
									let context = canvas.getContext("2d");
									context.drawImage(img, sx, sy, 256, 256, 0, 0, 256, 256);

									let data = context.getImageData(0, 0, 256, 256);

									if (desaturation > 0) {
										for (let i = 0; i < data.data.length / 4; i++) {
											let r = data.data[4 * i];
											let g = data.data[4 * i + 1];
											let b = data.data[4 * i + 2];
											let desat = (r + g + b) / 3;
											desat = Math.floor(Math.sqrt(desat / 255) * 255);
	
											data.data[4 * i] = Math.floor(data.data[4 * i] * (1 - desaturation) + desat * desaturation);
											data.data[4 * i + 1] = Math.floor(data.data[4 * i + 1] * (1 - desaturation) + desat * desaturation);
											data.data[4 * i + 2] = Math.floor(data.data[4 * i + 2] * (1 - desaturation) + desat * desaturation);
										}
									}
																		
									context.putImageData(data, 0, 0);

									var tmpLink = document.createElement( 'a' );
									let name = "Unknown";
									if (miniatureName) {
										name = miniatureName;
									}
									tmpLink.download = name + "-miniature.png";
									tmpLink.href = canvas.toDataURL();  
									
									document.body.appendChild( tmpLink );
									tmpLink.click(); 
									document.body.removeChild( tmpLink );
									resolve();
								}
							}
						);
					}
				)
			}
		)
	}
}