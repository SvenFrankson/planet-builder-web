class Utils {

    public static showDebugPlanetHeightMap(heightMap: PlanetHeightMap, x: number, y: number, maxValue?: number, scene?: BABYLON.Scene): void {
        let debugPlanet = new BABYLON.Mesh("debug-planet");
        if (!scene) {
            scene = BABYLON.Engine.Instances[0].scenes[0];
        }
		for (let i = 0; i < 6; i++) {
			BABYLON.SceneLoader.ImportMesh(
				"",
				"./resources/models/planet-side.babylon",
				"",
				scene,
				(meshes) => {
					let debugPlanetSide = meshes[0];
					if (debugPlanetSide instanceof(BABYLON.Mesh)) {
						let debugPlanetSideMaterial = new BABYLON.StandardMaterial("debub-planet-side-material", scene);
						debugPlanetSideMaterial.diffuseTexture = heightMap.getTexture(i, maxValue);
						debugPlanetSideMaterial.emissiveColor = BABYLON.Color3.White();
						debugPlanetSideMaterial.specularColor = BABYLON.Color3.Black();
						debugPlanetSide.material = debugPlanetSideMaterial;
						debugPlanetSide.rotationQuaternion = PlanetTools.QuaternionForSide(i);
						debugPlanetSide.parent = debugPlanet;
					}
				}
			)
		}
		scene.onBeforeRenderObservable.add(
			() => {
                let activeCamera = scene.activeCameras[0];
                activeCamera.computeWorldMatrix();
				debugPlanet.position.copyFrom(activeCamera.position);
				debugPlanet.position.addInPlace(activeCamera.getDirection(BABYLON.Axis.Z).scale(7));
				debugPlanet.position.addInPlace(activeCamera.getDirection(BABYLON.Axis.X).scale(x));
				debugPlanet.position.addInPlace(activeCamera.getDirection(BABYLON.Axis.Y).scale(y));
			}
		)
    }

    public static showDebugPlanetMap(generator: PlanetGenerator, x: number, y: number, maxValue?: number, scene?: BABYLON.Scene): void {
        let debugPlanet = new BABYLON.Mesh("debug-planet");
        if (!scene) {
            scene = BABYLON.Engine.Instances[0].scenes[0];
        }
		for (let i = 0; i < 6; i++) {
			BABYLON.SceneLoader.ImportMesh(
				"",
				"./resources/models/planet-side.babylon",
				"",
				scene,
				(meshes) => {
					let debugPlanetSide = meshes[0];
					if (debugPlanetSide instanceof(BABYLON.Mesh)) {
						let debugPlanetSideMaterial = new BABYLON.StandardMaterial("debub-planet-side-material", scene);
						debugPlanetSideMaterial.diffuseTexture = generator.getTexture(i, Config.performanceConfiguration.shellMeshTextureSize);
						debugPlanetSideMaterial.emissiveColor = BABYLON.Color3.White();
						debugPlanetSideMaterial.specularColor = BABYLON.Color3.Black();
						debugPlanetSide.material = debugPlanetSideMaterial;
						debugPlanetSide.rotationQuaternion = PlanetTools.QuaternionForSide(i);
						debugPlanetSide.parent = debugPlanet;
					}
				}
			)
		}
		scene.onBeforeRenderObservable.add(
			() => {
                let activeCamera = scene.activeCameras[0];
                activeCamera.computeWorldMatrix();
				debugPlanet.position.copyFrom(activeCamera.position);
				debugPlanet.position.addInPlace(activeCamera.getDirection(BABYLON.Axis.Z).scale(7));
				debugPlanet.position.addInPlace(activeCamera.getDirection(BABYLON.Axis.X).scale(x));
				debugPlanet.position.addInPlace(activeCamera.getDirection(BABYLON.Axis.Y).scale(y));
			}
		)
    }

    public static compress(input: string): string {
        let output = "";
        let i = 0;
        let l = input.length;
        let lastC = "";
        let lastCount = 0;

        while (i < l) {
            let c = input[i];
            if (c === lastC) {
                lastCount++;
            }
            else {
                if (lastCount > 3) {
                    if (lastCount < 10) {
                        output += ".";
                    }
                    else if (lastCount < 100) {
                        output += ":";
                    }
                    else if (lastCount < 1000) {
                        output += ";";
                    }
                    else if (lastCount < 10000) {
                        output += "!";
                    }
                    else if (lastCount < 100000) {
                        output += "?";
                    }
                    else {
                        output += "X_ERROR_TOO_MANY_REP_" + lastC + "_X";
                        return output;
                    }
                    output += lastCount.toFixed(0) + lastC;
                    lastC = c;
                    lastCount = 1;
                }
                else {
                    for (let n = 0; n < lastCount; n++) {
                        output += lastC;
                    }
                    lastC = c;
                    lastCount = 1;
                }
            }
            i++;
        }

        if (lastCount > 3) {
            if (lastCount < 10) {
                output += ".";
            }
            else if (lastCount < 100) {
                output += ":";
            }
            else if (lastCount < 1000) {
                output += ";";
            }
            else if (lastCount < 10000) {
                output += "!";
            }
            else if (lastCount < 100000) {
                output += "?";
            }
            else {
                output += "X_ERROR_TOO_MANY_REP_" + lastC + "_X";
                return output;
            }
            output += lastCount.toFixed(0) + lastC;
        }
        else {
            for (let n = 0; n < lastCount; n++) {
                output += lastC;
            }
        }

        return output;
    }

    public static decompress(input: string): string {
        let output = "";
        let i = - 1;
        let l = input.length;
        
        while (i < l - 1) {
            let c = input[++i];
            if (c === ".") {
                let countS = input[++i];
                let count = parseInt(countS);
                c = input[++i];
                for (let n = 0; n < count; n++) {
                    output += c;
                }
            }
            else if (c === ":") {
                let countS = input[++i] + input[++i];
                let count = parseInt(countS);
                c = input[++i];
                for (let n = 0; n < count; n++) {
                    output += c;
                }
            }
            else if (c === ";") {
                let countS = input[++i] + input[++i] + input[++i];
                let count = parseInt(countS);
                c = input[++i];
                for (let n = 0; n < count; n++) {
                    output += c;
                }
            }
            else if (c === "!") {
                let countS = input[++i] + input[++i] + input[++i] + input[++i];
                let count = parseInt(countS);
                c = input[++i];
                for (let n = 0; n < count; n++) {
                    output += c;
                }
            }
            else if (c === "?") {
                let countS = input[++i] + input[++i] + input[++i] + input[++i] + input[++i];
                let count = parseInt(countS);
                c = input[++i];
                for (let n = 0; n < count; n++) {
                    output += c;
                }
            }
            else {
                output += c;
            }
        }

        return output;
    }
}