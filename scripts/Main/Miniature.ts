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

        setTimeout(
            async () => {
                for (let i = BlockType.Grass; i < BlockType.Unknown; i++) {
                    await this.createBlock(i);
                }
            },
            100
        );
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
								await this.makeScreenShot("block-icon-" + BlockTypeNames[blockType], false);
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

	public async makeScreenShot(miniatureName?: string, desaturate: boolean = true): Promise<void> {
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
									for (let i = 0; i < data.data.length / 4; i++) {
										let r = data.data[4 * i];
										let g = data.data[4 * i + 1];
										let b = data.data[4 * i + 2];
										/*if (r === 0 && g === 255 && b === 0) {
											data.data[4 * i] = 0;
											data.data[4 * i + 1] = 0;
											data.data[4 * i + 2] = 0;
											data.data[4 * i + 3] = 0;
										}
										else*/ if (desaturate) {
											let desat = (r + g + b) / 3;
											desat = Math.floor(Math.sqrt(desat / 255) * 255);
											data.data[4 * i] = desat;
											data.data[4 * i + 1] = desat;
											data.data[4 * i + 2] = desat;
											data.data[4 * i + 3] = 255;
										}
									}
									/*
									for (let i = 0; i < data.data.length / 4; i++) {
										let a = data.data[4 * i + 3];
										if (a === 0) {
											let hasColoredNeighbour = false;
											for (let ii = -2; ii <= 2; ii++) {
												for (let jj = -2; jj <= 2; jj++) {
													if (ii !== 0 || jj !== 0) {
														let index = 4 * i + 3;
														index += ii * 4;
														index += jj * 4 * 256;
														if (index >= 0 && index < data.data.length) {
															let aNeighbour = data.data[index];
															if (aNeighbour === 255) {
																hasColoredNeighbour = true;
															}
														}
													}
												}
											}
											if (hasColoredNeighbour) {
												data.data[4 * i] = 255;
												data.data[4 * i + 1] = 255;
												data.data[4 * i + 2] = 255;
												data.data[4 * i + 3] = 254;
											}
										}
									}
									*/
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