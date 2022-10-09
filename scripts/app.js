var CameraMode;
(function (CameraMode) {
    CameraMode[CameraMode["Sky"] = 0] = "Sky";
    CameraMode[CameraMode["Player"] = 1] = "Player";
})(CameraMode || (CameraMode = {}));
class CameraManager {
    constructor() {
        this.cameraMode = CameraMode.Sky;
        this.arcRotateCamera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 100, BABYLON.Vector3.Zero(), Game.Scene);
        this.arcRotateCamera.attachControl(Game.Canvas);
        this.freeCamera = new BABYLON.FreeCamera("Camera", BABYLON.Vector3.Zero(), Game.Scene);
        this.freeCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.freeCamera.minZ = 0.1;
        //OutlinePostProcess.AddOutlinePostProcess(this.freeCamera);
    }
    get absolutePosition() {
        if (this.cameraMode === CameraMode.Sky) {
            return this.arcRotateCamera.position;
        }
        else {
            return this.freeCamera.globalPosition;
        }
    }
    setMode(newCameraMode) {
        if (newCameraMode != this.cameraMode) {
            if (this.cameraMode === CameraMode.Sky) {
                this.arcRotateCamera.detachControl(Game.Canvas);
            }
            this.cameraMode = newCameraMode;
            if (this.cameraMode === CameraMode.Player) {
                this.freeCamera.parent = this.player.camPos;
                this.freeCamera.position.copyFromFloats(0, 0, 0);
                this.freeCamera.rotationQuaternion.copyFrom(BABYLON.Quaternion.Identity());
                this.freeCamera.computeWorldMatrix();
                Game.Scene.activeCamera = this.freeCamera;
            }
            if (this.cameraMode === CameraMode.Sky) {
                Game.Scene.activeCamera = this.arcRotateCamera;
                this.arcRotateCamera.attachControl(Game.Canvas);
            }
        }
    }
}
/// <reference path="../lib/babylon.d.ts"/>
class Game {
    constructor(canvasElement) {
        Game.Instance = this;
        Game.Canvas = document.getElementById(canvasElement);
        Game.Engine = new BABYLON.Engine(Game.Canvas, true);
        BABYLON.Engine.ShadersRepository = "./shaders/";
        console.log(Game.Engine.webGLVersion);
    }
    createScene() {
        Game.Scene = new BABYLON.Scene(Game.Engine);
        Game.Scene.actionManager = new BABYLON.ActionManager(Game.Scene);
        Game.Scene.clearColor.copyFromFloats(166 / 255, 231 / 255, 255 / 255, 1);
        Game.Light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.6, 1, 0.3), Game.Scene);
        Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
        Game.Light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        Game.CameraManager = new CameraManager();
        /*
        let water = BABYLON.MeshBuilder.CreateSphere("water", { diameter: 78 - 0.4 }, Game.Scene);
        let waterMaterial = new BABYLON.StandardMaterial("water-material", Game.Scene);
        waterMaterial.diffuseColor.copyFromFloats(0.1, 0.5, 0.9);
        waterMaterial.alpha = 0.5;
        water.material = waterMaterial;
        */
    }
    static AnimateWater() {
        SharedMaterials.WaterMaterial().diffuseTexture.uOffset += 0.005;
        SharedMaterials.WaterMaterial().diffuseTexture.vOffset += 0.005;
    }
    animate() {
        let fpsInfoElement = document.getElementById("fps-info");
        let fpsGraphElement = document.getElementById("frame-rate");
        let meshesInfoTotalElement = document.getElementById("meshes-info-total");
        let meshesInfoNonStaticUniqueElement = document.getElementById("meshes-info-nonstatic-unique");
        let meshesInfoStaticUniqueElement = document.getElementById("meshes-info-static-unique");
        let meshesInfoNonStaticInstanceElement = document.getElementById("meshes-info-nonstatic-instance");
        let meshesInfoStaticInstanceElement = document.getElementById("meshes-info-static-instance");
        Game.Engine.runRenderLoop(() => {
            Game.Scene.render();
            //PlanetChunck.InitializeLoop();
            Game.AnimateWater();
            fpsGraphElement.addValue(Game.Engine.getFps());
            let uniques = Game.Scene.meshes.filter(m => { return !(m instanceof BABYLON.InstancedMesh); });
            let uniquesNonStatic = uniques.filter(m => { return !m.isWorldMatrixFrozen; });
            let uniquesStatic = uniques.filter(m => { return m.isWorldMatrixFrozen; });
            let instances = Game.Scene.meshes.filter(m => { return m instanceof BABYLON.InstancedMesh; });
            let instancesNonStatic = instances.filter(m => { return !m.isWorldMatrixFrozen; });
            let instancesStatic = instances.filter(m => { return m.isWorldMatrixFrozen; });
            meshesInfoTotalElement.innerText = Game.Scene.meshes.length.toFixed(0).padStart(4, "0");
            meshesInfoNonStaticUniqueElement.innerText = uniquesNonStatic.length.toFixed(0).padStart(4, "0");
            meshesInfoStaticUniqueElement.innerText = uniquesStatic.length.toFixed(0).padStart(4, "0");
            meshesInfoNonStaticInstanceElement.innerText = instancesNonStatic.length.toFixed(0).padStart(4, "0");
            meshesInfoStaticInstanceElement.innerText = instancesStatic.length.toFixed(0).padStart(4, "0");
        });
        window.addEventListener("resize", () => {
            Game.Engine.resize();
        });
    }
    static LockMouse(event) {
        if (Game.LockedMouse) {
            console.log("No need to lock.");
            return;
        }
        Game.Canvas.requestPointerLock =
            Game.Canvas.requestPointerLock ||
                Game.Canvas.msRequestPointerLock ||
                Game.Canvas.mozRequestPointerLock ||
                Game.Canvas.webkitRequestPointerLock;
        if (Game.Canvas.requestPointerLock) {
            Game.Canvas.requestPointerLock();
            Game.LockedMouse = true;
            Game.ClientXOnLock = event.clientX;
            Game.ClientYOnLock = event.clientY;
            console.log("Lock");
        }
    }
    static UnlockMouse() {
        if (!Game.LockMouse) {
            return;
        }
        document.exitPointerLock();
        Game.LockedMouse = false;
        console.log("Unlock");
    }
}
Game.ShowDebugPlanetHeightMap = false;
Game.DebugLodDistanceFactor = 100;
Game.LockedMouse = false;
Game.ClientXOnLock = -1;
Game.ClientYOnLock = -1;
window.addEventListener("DOMContentLoaded", () => {
    let game = new Game("renderCanvas");
    game.createScene();
    game.chunckManager = new PlanetChunckManager(Game.Scene);
    let degree = 10;
    let planetTest = new Planet("Paulita", degree, game.chunckManager);
    planetTest.generator = new PlanetGeneratorEarth(planetTest, 0.60, 0.1);
    //planetTest.generator = new PlanetGeneratorDebug4(planetTest);
    let r = degree * PlanetTools.CHUNCKSIZE * 0.7;
    document.querySelector("#planet-surface").textContent = (4 * Math.PI * r * r / 1000 / 1000).toFixed(2) + " km²";
    //planetTest.generator.showDebug();
    Game.Player = new Player(new BABYLON.Vector3(0, degree * PlanetTools.CHUNCKSIZE, 0), planetTest);
    Game.Player.registerControl();
    game.chunckManager.onNextInactive(() => {
        Game.Player.initialize();
    });
    Game.PlanetEditor = new PlanetEditor(planetTest);
    //Game.PlanetEditor.initialize();
    //Game.Plane = new Plane(new BABYLON.Vector3(0, 80, 0), planetTest);
    //Game.Plane.instantiate();
    //Game.CameraManager.plane = Game.Plane;
    Game.CameraManager.player = Game.Player;
    Game.CameraManager.setMode(CameraMode.Player);
    //planetTest.AsyncInitialize();
    PlanetChunckVertexData.InitializeData().then(() => {
        game.chunckManager.initialize();
        planetTest.register();
        let debugTerrainColor = new DebugTerrainColor();
        debugTerrainColor.show();
    });
    game.animate();
    Game.Canvas.addEventListener("pointerup", (event) => {
        if (Game.CameraManager.cameraMode === CameraMode.Sky) {
            return;
        }
        if (!Game.LockedMouse) {
            Game.LockMouse(event);
        }
    });
    document.addEventListener("pointermove", (event) => {
        if (Game.CameraManager.cameraMode === CameraMode.Sky) {
            return;
        }
        if (Game.LockedMouse) {
            if (event.clientX !== Game.ClientXOnLock) {
                Game.UnlockMouse();
            }
            else if (event.clientY !== Game.ClientYOnLock) {
                Game.UnlockMouse();
            }
        }
    });
});
// get shared VertexData from exposed arrays.
// obviously not the easiest way to get shapes: mostly an attempt at complete procedural generation.
class MeshTools {
    static Angle(v1, v2) {
        return Math.acos(BABYLON.Vector3.Dot(BABYLON.Vector3.Normalize(v1), BABYLON.Vector3.Normalize(v2)));
    }
    // tool method to add a mesh triangle.
    static PushTriangle(vertices, a, b, c, positions, indices) {
        let index = positions.length / 3;
        for (let n in vertices[a]) {
            if (vertices[a] != null) {
                positions.push(vertices[a][n]);
            }
        }
        for (let n in vertices[b]) {
            if (vertices[b] != null) {
                positions.push(vertices[b][n]);
            }
        }
        for (let n in vertices[c]) {
            if (vertices[c] != null) {
                positions.push(vertices[c][n]);
            }
        }
        indices.push(index);
        indices.push(index + 1);
        indices.push(index + 2);
    }
    // tool method to add two triangles forming a mesh quad.
    static PushQuad(vertices, a, b, c, d, positions, indices) {
        let index = positions.length / 3;
        positions.push(vertices[a].x);
        positions.push(vertices[a].y);
        positions.push(vertices[a].z);
        positions.push(vertices[b].x);
        positions.push(vertices[b].y);
        positions.push(vertices[b].z);
        positions.push(vertices[c].x);
        positions.push(vertices[c].y);
        positions.push(vertices[c].z);
        positions.push(vertices[d].x);
        positions.push(vertices[d].y);
        positions.push(vertices[d].z);
        indices.push(index);
        indices.push(index + 2);
        indices.push(index + 1);
        indices.push(index + 3);
        indices.push(index + 2);
        indices.push(index);
    }
    static PushTopQuadUvs(block, uvs) {
        let i = 1;
        let j = 0;
        block = Math.min(block, 128 + 8);
        i = (block - 128 - 1) % 4;
        j = Math.floor((block - 128 - 1) / 4);
        uvs.push(0 + i * 0.25);
        uvs.push(0.75 - j * 0.25);
        uvs.push(0 + i * 0.25);
        uvs.push(1 - j * 0.25);
        uvs.push(0.25 + i * 0.25);
        uvs.push(1 - j * 0.25);
        uvs.push(0.25 + i * 0.25);
        uvs.push(0.75 - j * 0.25);
    }
    static PushSideQuadUvs(block, uvs) {
        let i = 1;
        let j = 0;
        block = Math.min(block, 128 + 8);
        i = (block - 128 - 1) % 4;
        j = Math.floor((block - 128 - 1) / 4);
        uvs.push(0 + i * 0.25);
        uvs.push(0.25 - j * 0.25);
        uvs.push(0 + i * 0.25);
        uvs.push(0.5 - j * 0.25);
        uvs.push(0.25 + i * 0.25);
        uvs.push(0.5 - j * 0.25);
        uvs.push(0.25 + i * 0.25);
        uvs.push(0.25 - j * 0.25);
    }
    static PushQuadColor(r, g, b, a, colors) {
        colors.push(r, g, b, a);
        colors.push(r, g, b, a);
        colors.push(r, g, b, a);
        colors.push(r, g, b, a);
    }
    static PushWaterUvs(uvs) {
        uvs.push(0);
        uvs.push(0);
        uvs.push(0);
        uvs.push(1);
        uvs.push(1);
        uvs.push(1);
        uvs.push(1);
        uvs.push(0);
    }
    static VertexDataFromJSON(jsonData) {
        let tmp = JSON.parse(jsonData);
        let vertexData = new BABYLON.VertexData();
        vertexData.positions = tmp.positions;
        vertexData.normals = tmp.normals;
        vertexData.matricesIndices = tmp.matricesIndices;
        vertexData.matricesWeights = tmp.matricesWeights;
        vertexData.indices = tmp.indices;
        return vertexData;
    }
}
class OutlinePostProcess {
    static AddOutlinePostProcess(camera) {
        let scene = camera.getScene();
        let engine = scene.getEngine();
        BABYLON.Effect.ShadersStore["EdgeFragmentShader"] = `
			#ifdef GL_ES
			precision highp float;
			#endif
			varying vec2 vUV;
			uniform sampler2D textureSampler;
			uniform sampler2D depthSampler;
			uniform float 		width;
			uniform float 		height;
			void make_kernel_color(inout vec4 n[9], sampler2D tex, vec2 coord)
			{
				float w = 1.0 / width;
				float h = 1.0 / height;
				n[0] = texture2D(tex, coord + vec2( -w, -h));
				n[1] = texture2D(tex, coord + vec2(0.0, -h));
				n[2] = texture2D(tex, coord + vec2(  w, -h));
				n[3] = texture2D(tex, coord + vec2( -w, 0.0));
				n[4] = texture2D(tex, coord);
				n[5] = texture2D(tex, coord + vec2(  w, 0.0));
				n[6] = texture2D(tex, coord + vec2( -w, h));
				n[7] = texture2D(tex, coord + vec2(0.0, h));
				n[8] = texture2D(tex, coord + vec2(  w, h));
			}
			void make_kernel_depth(inout float n[9], sampler2D tex, vec2 coord)
			{
				float w = 1.0 / width;
				float h = 1.0 / height;
				n[0] = texture2D(tex, coord + vec2( -w, -h)).r;
				n[1] = texture2D(tex, coord + vec2(0.0, -h)).r;
				n[2] = texture2D(tex, coord + vec2(  w, -h)).r;
				n[3] = texture2D(tex, coord + vec2( -w, 0.0)).r;
				n[4] = texture2D(tex, coord).r;
				n[5] = texture2D(tex, coord + vec2(  w, 0.0)).r;
				n[6] = texture2D(tex, coord + vec2( -w, h)).r;
				n[7] = texture2D(tex, coord + vec2(0.0, h)).r;
				n[8] = texture2D(tex, coord + vec2(  w, h)).r;
			}
			void main(void) 
			{
				vec4 d = texture2D(depthSampler, vUV);
				float depth = d.r * (2000.0 - 0.2) + 0.2;
				
				float nD[9];
				make_kernel_depth( nD, depthSampler, vUV );
				float sobel_depth_edge_h = nD[2] + (2.0*nD[5]) + nD[8] - (nD[0] + (2.0*nD[3]) + nD[6]);
				float sobel_depth_edge_v = nD[0] + (2.0*nD[1]) + nD[2] - (nD[6] + (2.0*nD[7]) + nD[8]);
				float sobel_depth = sqrt((sobel_depth_edge_h * sobel_depth_edge_h) + (sobel_depth_edge_v * sobel_depth_edge_v));
				float thresholdDepth = 0.002;

				vec4 n[9];
				make_kernel_color( n, textureSampler, vUV );
				vec4 sobel_edge_h = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
				vec4 sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
				vec4 sobel = sqrt((sobel_edge_h * sobel_edge_h) + (sobel_edge_v * sobel_edge_v));
				float threshold = 0.1;
				
				gl_FragColor = vec4(n[4]) * 0.5;
				gl_FragColor.a = 1.0;
				if (sobel_depth < thresholdDepth || depth > 1000.) {
					if (max(sobel.r, max(sobel.g, sobel.b)) < threshold) {
						gl_FragColor = n[4];
					}
				}
			}
        `;
        let depthMap = scene.enableDepthRenderer(camera).getDepthMap();
        let postProcess = new BABYLON.PostProcess("Edge", "Edge", ["width", "height"], ["depthSampler"], 1, camera);
        postProcess.onApply = (effect) => {
            effect.setTexture("depthSampler", depthMap);
            effect.setFloat("width", engine.getRenderWidth());
            effect.setFloat("height", engine.getRenderHeight());
        };
    }
}
class PlanetEditor {
    constructor(planet) {
        this.planet = planet;
        this.data = 0;
        this._update = () => {
            let removeMode = this.data === 0;
            let worldPos = PlanetEditor.GetHitWorldPos(removeMode);
            if (worldPos) {
                if (this.data === 0 || worldPos.subtract(Game.Player.PositionHead()).lengthSquared() > 1) {
                    if (this.data === 0 || worldPos.subtract(Game.Player.PositionLeg()).lengthSquared() > 1) {
                        let planetSide = PlanetTools.WorldPositionToPlanetSide(this.planet, worldPos);
                        if (planetSide) {
                            let global = PlanetTools.WorldPositionToGlobalIJK(planetSide, worldPos);
                            if (!this._previewMesh) {
                                this._previewMesh = new BABYLON.Mesh("preview-mesh");
                                this._previewMesh.visibility = 0.5;
                            }
                            let vertexData = PlanetChunckMeshBuilder.BuildBlockVertexData(PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(global.k)), global.i, global.j, global.k, 140, this.data === 0 ? 1.1 : 0.9);
                            vertexData.applyToMesh(this._previewMesh);
                            this._previewMesh.rotationQuaternion = PlanetTools.QuaternionForSide(planetSide.side);
                            return;
                        }
                    }
                }
            }
            if (this._previewMesh) {
                this._previewMesh.dispose();
                this._previewMesh = undefined;
            }
        };
    }
    static GetHitWorldPos(remove = false) {
        let pickInfo = Game.Scene.pick(Game.Canvas.width / 2, Game.Canvas.height / 2, (mesh) => {
            return !(mesh.name === "preview-mesh");
        });
        if (pickInfo.hit) {
            if (pickInfo.pickedMesh instanceof PlanetChunck) {
                let offset = 0.25;
                if (remove) {
                    offset = -0.25;
                }
                return pickInfo.pickedPoint.add(pickInfo.getNormal(true, false).scale(offset));
            }
        }
        return undefined;
    }
    initialize() {
        Game.Scene.onBeforeRenderObservable.add(this._update);
        Game.Canvas.addEventListener("pointerup", (event) => {
            if (Game.LockedMouse) {
                this._pointerUp();
            }
        });
        let keyDataMap = new Map();
        keyDataMap.set("Digit1", 129);
        keyDataMap.set("Digit2", 130);
        keyDataMap.set("Digit3", 131);
        keyDataMap.set("Digit4", 132);
        keyDataMap.set("Digit5", 133);
        keyDataMap.set("Digit6", 134);
        keyDataMap.set("Digit7", 135);
        keyDataMap.set("Digit8", 136);
        keyDataMap.set("Digit9", 137);
        keyDataMap.set("Digit0", 0);
        keyDataMap.set("KeyX", 0);
        Game.Canvas.addEventListener("keyup", (event) => {
            if (keyDataMap.has(event.code)) {
                this.data = keyDataMap.get(event.code);
            }
        });
    }
    dispose() {
        Game.Scene.onBeforeRenderObservable.removeCallback(this._update);
    }
    _pointerUp() {
        let removeMode = this.data === 0;
        let worldPos = PlanetEditor.GetHitWorldPos(removeMode);
        if (worldPos) {
            if (this.data === 0 || worldPos.subtract(Game.Player.PositionHead()).lengthSquared() > 1) {
                if (this.data === 0 || worldPos.subtract(Game.Player.PositionLeg()).lengthSquared() > 1) {
                    let planetSide = PlanetTools.WorldPositionToPlanetSide(this.planet, worldPos);
                    if (planetSide) {
                        let global = PlanetTools.WorldPositionToGlobalIJK(planetSide, worldPos);
                        let local = PlanetTools.GlobalIJKToLocalIJK(planetSide, global);
                        local.planetChunck.SetData(local.i, local.j, local.k, this.data);
                        local.planetChunck.SetMesh();
                        local.planetChunck.saveToLocalStorage();
                    }
                }
            }
        }
    }
}
class PlanetToolsTest {
    static Run() {
        if (PlanetToolsTest.Corner00()) {
            console.log("PASS : Corner00");
        }
        else {
            console.log("FAIL : Corner00");
        }
        if (PlanetToolsTest.Corner01()) {
            console.log("PASS : Corner10");
        }
        else {
            console.log("FAIL : Corner10");
        }
        if (PlanetToolsTest.Corner11()) {
            console.log("PASS : Corner11");
        }
        else {
            console.log("FAIL : Corner11");
        }
        if (PlanetToolsTest.Corner01()) {
            console.log("PASS : Corner01");
        }
        else {
            console.log("FAIL : Corner01");
        }
    }
    static Corner00() {
        return PlanetTools.EvaluateVertex(8, 0, 0).subtract(new BABYLON.Vector3(1, -1, -1).normalize()).lengthSquared() < 0.0001;
    }
    static Corner10() {
        return PlanetTools.EvaluateVertex(8, 0, 8).subtract(new BABYLON.Vector3(1, -1, 1).normalize()).lengthSquared() < 0.0001;
    }
    static Corner11() {
        return PlanetTools.EvaluateVertex(8, 8, 8).subtract(new BABYLON.Vector3(1, 1, 1).normalize()).lengthSquared() < 0.0001;
    }
    static Corner01() {
        return PlanetTools.EvaluateVertex(8, 8, 0).subtract(new BABYLON.Vector3(1, 1, -1).normalize()).lengthSquared() < 0.0001;
    }
}
window.addEventListener("DOMContentLoaded", () => {
    console.log("TEST : PlanetToolsTest");
    PlanetToolsTest.Run();
});
class SharedMaterials {
    static MainMaterial() {
        if (!SharedMaterials.mainMaterial) {
            SharedMaterials.mainMaterial = new TerrainToonMaterial("mainMaterial", Game.Scene);
        }
        return SharedMaterials.mainMaterial;
    }
    static WaterMaterial() {
        if (!SharedMaterials.waterMaterial) {
            SharedMaterials.waterMaterial = new BABYLON.StandardMaterial("waterMaterial", Game.Scene);
            SharedMaterials.waterMaterial.diffuseTexture = new BABYLON.Texture("./resources/textures/water.png", Game.Scene);
            SharedMaterials.waterMaterial.specularColor = BABYLON.Color3.Black();
            SharedMaterials.waterMaterial.alpha = 0.5;
        }
        return SharedMaterials.waterMaterial;
    }
    static BedrockMaterial() {
        if (!SharedMaterials.bedrockMaterial) {
            SharedMaterials.bedrockMaterial = new BABYLON.StandardMaterial("waterMaterial", Game.Scene);
            SharedMaterials.bedrockMaterial.diffuseTexture = new BABYLON.Texture("./resources/textures/bedrock.png", Game.Scene);
            SharedMaterials.bedrockMaterial.specularColor = BABYLON.Color3.Black();
        }
        return SharedMaterials.bedrockMaterial;
    }
    static SkyMaterial() {
        if (!SharedMaterials.skyMaterial) {
            SharedMaterials.skyMaterial = new BABYLON.StandardMaterial("skyMaterial", Game.Scene);
            SharedMaterials.skyMaterial.emissiveTexture = new BABYLON.Texture("./resources/textures/sky.png", Game.Scene);
            SharedMaterials.skyMaterial.diffuseColor = BABYLON.Color3.Black();
            SharedMaterials.skyMaterial.specularColor = BABYLON.Color3.Black();
        }
        return SharedMaterials.skyMaterial;
    }
}
class Utils {
    static showDebugPlanetHeightMap(heightMap, x, y, maxValue) {
        let debugPlanet = new BABYLON.Mesh("debug-planet");
        for (let i = 0; i < 6; i++) {
            BABYLON.SceneLoader.ImportMesh("", "./resources/models/planet-side.babylon", "", Game.Scene, (meshes) => {
                let debugPlanetSide = meshes[0];
                if (debugPlanetSide instanceof (BABYLON.Mesh)) {
                    let debugPlanetSideMaterial = new BABYLON.StandardMaterial("debub-planet-side-material", Game.Scene);
                    debugPlanetSideMaterial.diffuseTexture = heightMap.getTexture(i, maxValue);
                    debugPlanetSideMaterial.emissiveColor = BABYLON.Color3.White();
                    debugPlanetSideMaterial.specularColor = BABYLON.Color3.Black();
                    debugPlanetSide.material = debugPlanetSideMaterial;
                    debugPlanetSide.rotationQuaternion = PlanetTools.QuaternionForSide(i);
                    debugPlanetSide.parent = debugPlanet;
                }
            });
        }
        Game.Scene.onBeforeRenderObservable.add(() => {
            Game.Scene.activeCamera.computeWorldMatrix();
            debugPlanet.position.copyFrom(Game.CameraManager.absolutePosition);
            debugPlanet.position.addInPlace(Game.Scene.activeCamera.getDirection(BABYLON.Axis.Z).scale(7));
            debugPlanet.position.addInPlace(Game.Scene.activeCamera.getDirection(BABYLON.Axis.X).scale(x));
            debugPlanet.position.addInPlace(Game.Scene.activeCamera.getDirection(BABYLON.Axis.Y).scale(y));
        });
    }
    static compress(input) {
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
    static decompress(input) {
        let output = "";
        let i = -1;
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
class VMath {
    static IsFinite(o) {
        if (o instanceof BABYLON.Vector3) {
            return isFinite(o.x) && isFinite(o.y) && isFinite(o.z);
        }
        return false;
    }
    static ProjectPerpendicularAt(v, at) {
        let p = BABYLON.Vector3.Zero();
        let k = (v.x * at.x + v.y * at.y + v.z * at.z);
        k = k / (at.x * at.x + at.y * at.y + at.z * at.z);
        p.copyFrom(v);
        p.subtractInPlace(at.multiplyByFloats(k, k, k));
        return p;
    }
    static Angle(from, to) {
        let pFrom = BABYLON.Vector3.Normalize(from);
        let pTo = BABYLON.Vector3.Normalize(to);
        let angle = Math.acos(BABYLON.Vector3.Dot(pFrom, pTo));
        return angle;
    }
    static AngleFromToAround(from, to, around) {
        let pFrom = VMath.ProjectPerpendicularAt(from, around).normalize();
        let pTo = VMath.ProjectPerpendicularAt(to, around).normalize();
        let dot = BABYLON.Vector3.Dot(pFrom, pTo);
        if (isNaN(dot)) {
            debugger;
        }
        let angle = Math.acos(dot);
        if (BABYLON.Vector3.Dot(BABYLON.Vector3.Cross(pFrom, pTo), around) < 0) {
            angle = -angle;
        }
        return angle;
    }
}
class DebugDisplayColorInput extends HTMLElement {
    constructor() {
        super(...arguments);
        this._initialized = false;
        this._onInput = () => {
            let color = BABYLON.Color3.FromHexString(this._colorInput.value);
            this._colorFloat.innerText = color.r.toFixed(3) + ", " + color.g.toFixed(3) + ", " + color.b.toFixed(3);
            if (this.onInput) {
                this.onInput(color);
            }
        };
    }
    static get observedAttributes() {
        return [
            "label"
        ];
    }
    connectedCallback() {
        this.initialize();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (this._initialized) {
            if (name === "label") {
                this._label = newValue;
                this._labelElement.textContent = this._label;
            }
        }
    }
    initialize() {
        if (!this._initialized) {
            this.style.position = "relative";
            this._labelElement = document.createElement("div");
            this._labelElement.style.display = "inline-block";
            this._labelElement.style.width = "33%";
            this._labelElement.style.marginRight = "2%";
            this.appendChild(this._labelElement);
            this._colorInput = document.createElement("input");
            this._colorInput.setAttribute("type", "color");
            this._colorInput.style.display = "inline-block";
            this._colorInput.style.verticalAlign = "middle";
            this._colorInput.style.width = "65%";
            this.appendChild(this._colorInput);
            this._colorInput.oninput = this._onInput;
            this._colorFloat = document.createElement("span");
            this._colorFloat.innerText = "0.324, 0.123, 0.859";
            this._colorFloat.style.display = "block";
            this._colorFloat.style.verticalAlign = "middle";
            this._colorFloat.style.width = "100%";
            this._colorFloat.style.userSelect = "none";
            let color = BABYLON.Color3.FromHexString(this._colorInput.value);
            this._colorFloat.innerText = color.r.toFixed(3) + ", " + color.g.toFixed(3) + ", " + color.b.toFixed(3);
            this._colorFloat.onclick = () => {
                navigator.clipboard.writeText(this._colorFloat.innerText);
            };
            this.appendChild(this._colorFloat);
            this._initialized = true;
            for (let i = 0; i < DebugDisplayFrameValue.observedAttributes.length; i++) {
                let name = DebugDisplayFrameValue.observedAttributes[i];
                let value = this.getAttribute(name);
                this.attributeChangedCallback(name, value + "_forceupdate", value);
            }
        }
    }
    setColor(color) {
        this._colorInput.value = color.toHexString();
        this._colorFloat.innerText = color.r.toFixed(3) + ", " + color.g.toFixed(3) + ", " + color.b.toFixed(3);
    }
}
customElements.define("debug-display-color-input", DebugDisplayColorInput);
class DebugDisplayFrameValue extends HTMLElement {
    constructor() {
        super(...arguments);
        this.size = 2;
        this.frameCount = 300;
        this._minValue = 0;
        this._maxValue = 100;
        this._values = [];
        this._initialized = false;
    }
    static get observedAttributes() {
        return [
            "label",
            "min",
            "max"
        ];
    }
    connectedCallback() {
        this.initialize();
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (this._initialized) {
            if (name === "min") {
                let v = parseFloat(newValue);
                if (isFinite(v)) {
                    this._minValue = v;
                    this._minElement.textContent = this._minValue.toFixed(0);
                }
            }
            if (name === "max") {
                let v = parseFloat(newValue);
                if (isFinite(v)) {
                    this._maxValue = v;
                    this._maxElement.textContent = this._maxValue.toFixed(0);
                }
            }
            if (name === "label") {
                this._label = newValue;
                this._labelElement.textContent = this._label;
            }
        }
    }
    initialize() {
        if (!this._initialized) {
            this.style.position = "relative";
            this._labelElement = document.createElement("div");
            this._labelElement.style.display = "inline-block";
            this._labelElement.style.width = "33%";
            this._labelElement.style.marginRight = "2%";
            this.appendChild(this._labelElement);
            this._minElement = document.createElement("span");
            this._minElement.style.position = "absolute";
            this._minElement.style.bottom = "0%";
            this._minElement.style.right = "1%";
            this._minElement.style.fontSize = "80%";
            this.appendChild(this._minElement);
            this._maxElement = document.createElement("span");
            this._maxElement.style.position = "absolute";
            this._maxElement.style.top = "0%";
            this._maxElement.style.right = "1%";
            this._maxElement.style.fontSize = "80%";
            this.appendChild(this._maxElement);
            let container = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            container.style.display = "inline-block";
            container.style.verticalAlign = "middle";
            container.style.width = "57%";
            container.style.marginRight = "8%";
            container.setAttribute("viewBox", "0 0 600 100");
            this.appendChild(container);
            this._valuesElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this._valuesElement.setAttribute("stroke", "#00FF00");
            this._valuesElement.setAttribute("stroke-width", "2");
            container.appendChild(this._valuesElement);
            this._initialized = true;
            for (let i = 0; i < DebugDisplayFrameValue.observedAttributes.length; i++) {
                let name = DebugDisplayFrameValue.observedAttributes[i];
                let value = this.getAttribute(name);
                this.attributeChangedCallback(name, value + "_forceupdate", value);
            }
        }
    }
    _redraw() {
        let d = "";
        for (let i = 0; i < this._values.length; i++) {
            let x = (i * this.size).toFixed(1);
            d += "M" + x + " 100 L" + x + " " + (100 - (this._values[i] - this._minValue) / (this._maxValue - this._minValue) * 100).toFixed(1) + " ";
        }
        this._valuesElement.setAttribute("d", d);
    }
    addValue(v) {
        if (isFinite(v)) {
            this._values.push(v);
            while (this._values.length > this.frameCount) {
                this._values.splice(0, 1);
            }
            this._redraw();
        }
    }
}
customElements.define("debug-display-frame-value", DebugDisplayFrameValue);
class DebugTerrainColor {
    constructor() {
        this._initialized = false;
    }
    get initialized() {
        return this._initialized;
    }
    initialize() {
        this.container = document.querySelector("#debug-terrain-color");
        for (let i = 1; i < BlockTypeCount; i++) {
            let blockType = i;
            let input = document.querySelector("#terrain-" + BlockTypeNames[blockType].toLowerCase() + "-color");
            input.setColor(SharedMaterials.MainMaterial().getColor(blockType));
            input.onInput = (color) => {
                SharedMaterials.MainMaterial().setColor(blockType, color);
            };
        }
        this._initialized = true;
    }
    show() {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
    }
    hide() {
        this.container.classList.add("hidden");
    }
}
var BlockTypeNames = [
    "None",
    "Grass",
    "Dirt",
    "Sand",
    "Rock",
    "Wood",
    "Leaf"
];
var BlockTypeCount = 7;
var BlockType;
(function (BlockType) {
    BlockType[BlockType["None"] = 0] = "None";
    BlockType[BlockType["Grass"] = 1] = "Grass";
    BlockType[BlockType["Dirt"] = 2] = "Dirt";
    BlockType[BlockType["Sand"] = 3] = "Sand";
    BlockType[BlockType["Rock"] = 4] = "Rock";
    BlockType[BlockType["Wood"] = 5] = "Wood";
    BlockType[BlockType["Leaf"] = 6] = "Leaf";
})(BlockType || (BlockType = {}));
class Planet extends BABYLON.Mesh {
    constructor(name, kPosMax, chunckManager) {
        super(name, Game.Scene);
        this.chunckManager = chunckManager;
        this.kPosMax = kPosMax;
        this.sides = [];
        this.sides[Side.Front] = new PlanetSide(Side.Front, this);
        this.sides[Side.Right] = new PlanetSide(Side.Right, this);
        this.sides[Side.Back] = new PlanetSide(Side.Back, this);
        this.sides[Side.Left] = new PlanetSide(Side.Left, this);
        this.sides[Side.Top] = new PlanetSide(Side.Top, this);
        this.sides[Side.Bottom] = new PlanetSide(Side.Bottom, this);
    }
    GetSide(side) {
        return this.sides[side];
    }
    GetPlanetName() {
        return this.name;
    }
    register() {
        let chunckCount = 0;
        let t0 = performance.now();
        for (let i = 0; i < this.sides.length; i++) {
            chunckCount += this.sides[i].register();
        }
        let t1 = performance.now();
        console.log("Planet " + this.name + " registered in " + (t1 - t0).toFixed(1) + "ms");
        console.log("Planet " + this.name + " has " + chunckCount.toFixed(0) + " chuncks");
    }
}
var Neighbour;
(function (Neighbour) {
    Neighbour[Neighbour["IPlus"] = 0] = "IPlus";
    Neighbour[Neighbour["JPlus"] = 1] = "JPlus";
    Neighbour[Neighbour["KPlus"] = 2] = "KPlus";
    Neighbour[Neighbour["IMinus"] = 3] = "IMinus";
    Neighbour[Neighbour["JMinus"] = 4] = "JMinus";
    Neighbour[Neighbour["KMinus"] = 5] = "KMinus";
})(Neighbour || (Neighbour = {}));
class PlanetChunck {
    constructor(iPos, jPos, kPos, planetSide) {
        this._degree = 0;
        this._chunckCount = 0;
        this._size = 0;
        this._dataInitialized = false;
        this.lod = 2;
        this._isEmpty = true;
        this._isFull = false;
        this.planetSide = planetSide;
        this.iPos = iPos;
        this.jPos = jPos;
        this.kPos = kPos;
        this._degree = PlanetTools.KPosToDegree(this.kPos);
        this._size = PlanetTools.DegreeToSize(this.degree);
        this._chunckCount = PlanetTools.DegreeToChuncksCount(this.degree);
        this.name = "chunck:" + this.side + ":" + this.iPos + "-" + this.jPos + "-" + this.kPos;
        this.barycenter = PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * this.iPos + PlanetTools.CHUNCKSIZE / 2, PlanetTools.CHUNCKSIZE * this.jPos + PlanetTools.CHUNCKSIZE / 2).scale(PlanetTools.KGlobalToAltitude((this.kPos + 0.5) * PlanetTools.CHUNCKSIZE));
        this.barycenter = BABYLON.Vector3.TransformCoordinates(this.barycenter, planetSide.computeWorldMatrix(true));
        this.normal = BABYLON.Vector3.Normalize(this.barycenter);
        if (this.kPos === 0) {
            this.bedrock = new BABYLON.Mesh(this.name + "-bedrock", Game.Scene);
            this.bedrock.parent = this.planetSide;
            this.isDegreeLayerBottom = true;
        }
        else {
            let degreeBellow = PlanetTools.KPosToDegree(this.kPos - 1);
            if (degreeBellow != this.degree) {
                this.isDegreeLayerBottom = true;
            }
        }
        this.isCorner = false;
        if (this.iPos === 0) {
            if (this.jPos === 0) {
                this.isCorner = true;
            }
            else if (this.jPos === this.chunckCount - 1) {
                this.isCorner = true;
            }
        }
        if (this.iPos === this.chunckCount - 1) {
            if (this.jPos === 0) {
                this.isCorner = true;
            }
            else if (this.jPos === this.chunckCount - 1) {
                this.isCorner = true;
            }
        }
    }
    get side() {
        return this.planetSide.side;
    }
    get chunckManager() {
        return this.planetSide.chunckManager;
    }
    get degree() {
        return this._degree;
    }
    get chunckCount() {
        return this._chunckCount;
    }
    get size() {
        return this._size;
    }
    GetPlanetName() {
        return this.planetSide.GetPlanetName();
    }
    get kPosMax() {
        return this.planetSide.kPosMax;
    }
    Position() {
        return {
            i: this.iPos,
            j: this.jPos,
            k: this.kPos,
        };
    }
    get dataInitialized() {
        return this._dataInitialized;
    }
    GetData(i, j, k) {
        if (!this.dataInitialized) {
            this.initializeData();
        }
        if (this.side <= Side.Left && this.isCorner) {
            if (this.jPos === this.chunckCount - 1) {
                if (this.iPos === 0) {
                    if (i === 0) {
                        if (j === PlanetTools.CHUNCKSIZE - 1) {
                            return this.GetData(0, PlanetTools.CHUNCKSIZE, k);
                        }
                    }
                }
                if (this.iPos === this.chunckCount - 1) {
                    if (i === PlanetTools.CHUNCKSIZE - 1) {
                        if (j === PlanetTools.CHUNCKSIZE - 1) {
                            return this.GetData(PlanetTools.CHUNCKSIZE - 1, PlanetTools.CHUNCKSIZE, k);
                        }
                    }
                }
            }
            if (this.jPos === 0) {
                if (this.iPos === 0) {
                    if (i === 0) {
                        if (j === 0) {
                            return this.GetData(0, -1, k);
                        }
                    }
                }
                if (this.iPos === this.chunckCount - 1) {
                    if (i === PlanetTools.CHUNCKSIZE - 1) {
                        if (j === 0) {
                            return this.GetData(PlanetTools.CHUNCKSIZE - 1, -1, k);
                        }
                    }
                }
            }
        }
        if (i >= 0 && i < PlanetTools.CHUNCKSIZE) {
            if (j >= 0 && j < PlanetTools.CHUNCKSIZE) {
                if (k >= 0 && k < PlanetTools.CHUNCKSIZE) {
                    return this.data[i][j][k];
                }
            }
        }
        return this.GetDataGlobal(this.iPos * PlanetTools.CHUNCKSIZE + i, this.jPos * PlanetTools.CHUNCKSIZE + j, this.kPos * PlanetTools.CHUNCKSIZE + k);
    }
    GetDataGlobal(iGlobal, jGlobal, kGlobal) {
        return this.planetSide.GetData(iGlobal, jGlobal, kGlobal, this.degree);
    }
    SetData(i, j, k, value) {
        this.data[i][j][k] = value;
    }
    GetBaryCenter() {
        return this.barycenter;
    }
    GetNormal() {
        return this.normal;
    }
    get isEmpty() {
        return this._isEmpty;
    }
    get isFull() {
        return this._isFull;
    }
    isMeshDrawn() {
        return this.mesh && !this.mesh.isDisposed();
    }
    isMeshDisposed() {
        return !this.mesh || this.mesh.isDisposed();
    }
    register() {
        this.chunckManager.registerChunck(this);
    }
    initialize() {
        this.initializeData();
        this.initializeMesh();
    }
    initializeData() {
        if (!this.dataInitialized) {
            this.data = this.planetSide.planet.generator.makeData(this);
            this.updateIsEmptyIsFull();
            //this.saveToLocalStorage();
            this._dataInitialized = true;
        }
    }
    initializeMesh() {
        if (this.dataInitialized) {
            this.SetMesh();
        }
    }
    updateIsEmptyIsFull() {
        this._isEmpty = true;
        this._isFull = true;
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let block = this.data[i][j][k] > 0;
                    this._isFull = this._isFull && block;
                    this._isEmpty = this._isEmpty && !block;
                    if (!this._isFull && !this._isEmpty) {
                        return;
                    }
                }
            }
        }
    }
    isEmptyOrHidden() {
        if (this.isFull || this.isEmpty) {
            let iPrev = this.planetSide.getChunck(this.iPos - 1, this.jPos, this.kPos, this.degree);
            let iNext = this.planetSide.getChunck(this.iPos + 1, this.jPos, this.kPos, this.degree);
            let jPrev = this.planetSide.getChunck(this.iPos, this.jPos - 1, this.kPos, this.degree);
            let jNext = this.planetSide.getChunck(this.iPos, this.jPos + 1, this.kPos, this.degree);
            let kPrev = this.planetSide.getChunck(this.iPos, this.jPos, this.kPos - 1, this.degree);
            let kNext = this.planetSide.getChunck(this.iPos, this.jPos, this.kPos + 1, this.degree);
            if (iPrev instanceof PlanetChunck && iNext instanceof PlanetChunck && jPrev instanceof PlanetChunck && jNext instanceof PlanetChunck && kPrev instanceof PlanetChunck && kNext) {
                iPrev.initializeData();
                iNext.initializeData();
                jPrev.initializeData();
                jNext.initializeData();
                kPrev.initializeData();
                let kNextIsFull = true;
                let kNextIsEmpty = true;
                if (kNext instanceof PlanetChunck) {
                    kNext.initializeData();
                    kNextIsFull = kNext.isFull;
                    kNextIsEmpty = kNext.isEmpty;
                }
                else {
                    kNext.forEach(c => {
                        c.initializeData();
                        kNextIsFull = kNextIsFull && c.isFull;
                        kNextIsEmpty = kNextIsEmpty && c.isEmpty;
                    });
                }
                if (this.isFull && iPrev.isFull && iNext.isFull && jPrev.isFull && jNext.isFull && kPrev.isFull && kNextIsFull) {
                    return true;
                }
                if (this.isEmpty && iPrev.isEmpty && iNext.isEmpty && jPrev.isEmpty && jNext.isEmpty && kPrev.isEmpty && kNextIsEmpty) {
                    return true;
                }
            }
        }
        return false;
    }
    SetMesh() {
        if (this.isEmptyOrHidden()) {
            return;
        }
        if (this.isMeshDisposed()) {
            this.mesh = new BABYLON.Mesh("chunck-" + this.iPos + "-" + this.jPos + "-" + this.kPos, Game.Scene);
        }
        let vertexData;
        vertexData = PlanetChunckMeshBuilder.BuildVertexData(this, this.iPos, this.jPos, this.kPos);
        if (vertexData.positions.length > 0) {
            vertexData.applyToMesh(this.mesh);
            this.mesh.material = SharedMaterials.MainMaterial();
        }
        if (this.kPos === 0) {
            vertexData = PlanetChunckMeshBuilder.BuildBedrockVertexData(this.size, this.iPos, this.jPos, this.kPos, 8, this.data);
            vertexData.applyToMesh(this.bedrock);
            this.bedrock.material = SharedMaterials.BedrockMaterial();
        }
        this.mesh.parent = this.planetSide;
        this.mesh.freezeWorldMatrix();
        this.mesh.refreshBoundingInfo();
    }
    disposeMesh() {
        if (this.mesh) {
            this.mesh.dispose();
        }
    }
    serialize() {
        let output = "";
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    output += this.data[i][j][k].toFixed(0);
                }
            }
        }
        let compressed = Utils.compress(output);
        //console.log("Compressed " + this.name + " data to " + (compressed.length / output.length * 100).toFixed(0) + "% of uncompressed size.");
        return compressed;
    }
    deserialize(input) {
        let data = Utils.decompress(input);
        this.data = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            this.data[i] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                this.data[i][j] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let n = k + j * PlanetTools.CHUNCKSIZE + i * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE;
                    this.data[i][j][k] = parseInt(data[n]);
                }
            }
        }
    }
    saveToLocalStorage() {
        localStorage.setItem(this.name, this.serialize());
    }
}
class PlanetChunckRedrawRequest {
    constructor(chunck, callback) {
        this.chunck = chunck;
        this.callback = callback;
    }
}
class PlanetChunckManager {
    constructor(scene) {
        this.scene = scene;
        this._needRedraw = [];
        this._lodLayersCount = 6;
        // estimated percentage of chuncks in the adequate layer
        this.chunckSortedRatio = 0;
        // activity increase while manager is redrawing Chuncks.
        this._maxActivity = 10;
        this._activity = this._maxActivity;
        this._update = () => {
            this._viewpoint.copyFrom(this.scene.activeCamera.globalPosition);
            let t0 = performance.now();
            let t = t0;
            let sortedCount = 0;
            let unsortedCount = 0;
            let duration = 0.5 + 150 * (1 - this.chunckSortedRatio);
            duration = Math.min(duration, 1000 / 24);
            while ((t - t0) < duration) {
                for (let prevLayerIndex = 0; prevLayerIndex < this._lodLayersCount; prevLayerIndex++) {
                    let cursor = this._lodLayersCursors[prevLayerIndex];
                    let chunck = this._lodLayers[prevLayerIndex][cursor];
                    if (chunck) {
                        chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.GetBaryCenter());
                        let newLayerIndex = this._getLayerIndex(chunck.sqrDistanceToViewpoint);
                        if (newLayerIndex != prevLayerIndex) {
                            let adequateLayerCursor = this._lodLayersCursors[newLayerIndex];
                            this._lodLayers[prevLayerIndex].splice(cursor, 1);
                            this._lodLayers[newLayerIndex].splice(adequateLayerCursor, 0, chunck);
                            chunck.lod = newLayerIndex;
                            if (newLayerIndex === 0) {
                                this.requestDraw(chunck);
                            }
                            else if (newLayerIndex === 1) {
                                if (prevLayerIndex != 0) {
                                    this.requestDraw(chunck);
                                }
                            }
                            else if (newLayerIndex > 1) {
                                chunck.disposeMesh();
                            }
                            this._lodLayersCursors[newLayerIndex]++;
                            if (this._lodLayersCursors[newLayerIndex] >= this._lodLayers[newLayerIndex].length) {
                                this._lodLayersCursors[newLayerIndex] = 0;
                            }
                            unsortedCount++;
                        }
                        else {
                            this._lodLayersCursors[prevLayerIndex]++;
                            if (this._lodLayersCursors[prevLayerIndex] >= this._lodLayers[prevLayerIndex].length) {
                                this._lodLayersCursors[prevLayerIndex] = 0;
                            }
                            sortedCount++;
                        }
                    }
                }
                t = performance.now();
            }
            if (this._needRedraw.length > 0) {
                this._activity++;
                this._activity = Math.min(this._activity, this._maxActivity);
            }
            else {
                this._activity--;
                this._activity = Math.max(this._activity, 0);
                if (this._activity < 1) {
                    if (this._onNextInactiveCallback) {
                        this._onNextInactiveCallback();
                        this._onNextInactiveCallback = undefined;
                    }
                }
            }
            // Recalculate chunck meshes.
            t0 = performance.now();
            while (this._needRedraw.length > 0 && (t - t0) < 1000 / 60) {
                let request = this._needRedraw.pop();
                if (request.chunck.lod <= 1) {
                    request.chunck.initialize();
                }
                else {
                    request.chunck.disposeMesh();
                }
                t = performance.now();
            }
            this.chunckSortedRatio = (this.chunckSortedRatio + sortedCount / (sortedCount + unsortedCount)) * 0.5;
            document.getElementById("chunck-sort").addValue(this.chunckSortedRatio * 100);
        };
    }
    initialize() {
        this._viewpoint = this.scene.activeCamera.globalPosition.clone();
        this._lodLayers = [];
        this._lodLayersCursors = [];
        this._lodLayersSqrDistances = [];
        for (let i = 0; i < this._lodLayersCount - 1; i++) {
            let d = (i + 1) * 60;
            this._lodLayers[i] = [];
            this._lodLayersCursors[i] = 0;
            this._lodLayersSqrDistances[i] = d * d;
        }
        this._lodLayers[this._lodLayersCount - 1] = [];
        this._lodLayersCursors[this._lodLayersCount - 1] = 0;
        this._lodLayersSqrDistances[this._lodLayersCount - 1] = Infinity;
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    dispose() {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
    registerChunck(chunck) {
        if (!chunck.isEmptyOrHidden()) {
            chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.GetBaryCenter());
            let layerIndex = this._getLayerIndex(chunck.sqrDistanceToViewpoint);
            if (this._lodLayers[layerIndex].indexOf(chunck) === -1) {
                this._lodLayers[layerIndex].push(chunck);
                chunck.lod = layerIndex;
                if (layerIndex <= 1) {
                    this.requestDraw(chunck);
                }
            }
        }
    }
    async requestDraw(chunck) {
        return new Promise(resolve => {
            if (!this._needRedraw.find(request => { return request.chunck === chunck; })) {
                this._needRedraw.push(new PlanetChunckRedrawRequest(chunck, resolve));
            }
        });
    }
    _getLayerIndex(sqrDistance) {
        for (let i = 0; i < this._lodLayersCount - 1; i++) {
            if (sqrDistance < this._lodLayersSqrDistances[i]) {
                return i;
            }
        }
        return this._lodLayersCount - 1;
    }
    isActive() {
        return this._activity > 1;
    }
    onNextInactive(callback) {
        if (!this.isActive()) {
            console.log("direct onNextInactive");
            callback();
        }
        else {
            this._onNextInactiveCallback = callback;
        }
    }
}
class PlanetChunckMeshBuilder {
    static getTmpData(i, j, k) {
        return PCMB.tmpData[i - PCMB.firstI][j - PCMB.firstJ][k - PCMB.firstK];
    }
    static get BlockColor() {
        if (!PCMB._BlockColor) {
            PCMB._BlockColor = new Map();
            PCMB._BlockColor.set(BlockType.None, undefined);
            PCMB._BlockColor.set(BlockType.Grass, BABYLON.Color3.FromHexString("#50723C"));
            PCMB._BlockColor.set(BlockType.Dirt, BABYLON.Color3.FromHexString("#462521"));
            PCMB._BlockColor.set(BlockType.Sand, BABYLON.Color3.FromHexString("#F5B700"));
            PCMB._BlockColor.set(BlockType.Rock, BABYLON.Color3.FromHexString("#9DB5B2"));
            PCMB._BlockColor.set(BlockType.Wood, BABYLON.Color3.FromHexString("#965106"));
            PCMB._BlockColor.set(BlockType.Leaf, BABYLON.Color3.FromHexString("#27a800"));
        }
        return PCMB._BlockColor;
    }
    static GetVertex(size, i, j) {
        let out = BABYLON.Vector3.Zero();
        return PCMB.GetVertexToRef(size, i, j, out);
    }
    static GetVertexToRef(size, i, j, out) {
        if (!PCMB.cachedVertices) {
            PCMB.cachedVertices = [];
        }
        if (!PCMB.cachedVertices[size]) {
            PCMB.cachedVertices[size] = [];
        }
        if (!PCMB.cachedVertices[size][i]) {
            PCMB.cachedVertices[size][i] = [];
        }
        if (!PCMB.cachedVertices[size][i][j]) {
            PCMB.cachedVertices[size][i][j] = PlanetTools.EvaluateVertex(size, i, j);
        }
        out.copyFrom(PCMB.cachedVertices[size][i][j]);
        return out;
    }
    static BuildBlockVertexData(size, iGlobal, jGlobal, hGlobal, data, scale = 1) {
        let vertexData = new BABYLON.VertexData();
        if (!PCMB.tmpVertices) {
            PCMB.tmpVertices = [];
            for (let i = 0; i < 8; i++) {
                PCMB.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        else {
            for (let i = 0; i < 8; i++) {
                PCMB.tmpVertices[i].copyFromFloats(0, 0, 0);
            }
        }
        let positions = [];
        let indices = [];
        let uvs = [];
        let colors = [];
        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[0]);
        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[1]);
        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[2]);
        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[3]);
        let center = PCMB.tmpVertices[0].add(PCMB.tmpVertices[1]).add(PCMB.tmpVertices[2]).add(PCMB.tmpVertices[3]);
        center.scaleInPlace(0.25);
        for (let i = 0; i < 4; i++) {
            PCMB.tmpVertices[i].scaleInPlace(0.8).addInPlace(center.scale(0.2));
        }
        let hLow = PlanetTools.KGlobalToAltitude(hGlobal);
        let hHigh = PlanetTools.KGlobalToAltitude(hGlobal + 1);
        PCMB.tmpVertices[0].scaleToRef(hHigh, PCMB.tmpVertices[4]);
        PCMB.tmpVertices[1].scaleToRef(hHigh, PCMB.tmpVertices[5]);
        PCMB.tmpVertices[2].scaleToRef(hHigh, PCMB.tmpVertices[6]);
        PCMB.tmpVertices[3].scaleToRef(hHigh, PCMB.tmpVertices[7]);
        PCMB.tmpVertices[0].scaleInPlace(hLow);
        PCMB.tmpVertices[1].scaleInPlace(hLow);
        PCMB.tmpVertices[2].scaleInPlace(hLow);
        PCMB.tmpVertices[3].scaleInPlace(hLow);
        if (scale != 1) {
            this._tmpBlockCenter.copyFrom(PCMB.tmpVertices[0]);
            for (let v = 1; v < PCMB.tmpVertices.length; v++) {
                this._tmpBlockCenter.addInPlace(PCMB.tmpVertices[v]);
            }
            this._tmpBlockCenter.scaleInPlace(1 / PCMB.tmpVertices.length);
            for (let v = 0; v < PCMB.tmpVertices.length; v++) {
                PCMB.tmpVertices[v].subtractInPlace(this._tmpBlockCenter);
                PCMB.tmpVertices[v].scaleInPlace(scale);
                PCMB.tmpVertices[v].addInPlace(this._tmpBlockCenter);
            }
        }
        let c = PCMB.BlockColor.get(data);
        if (!c) {
            c = PCMB.BlockColor.get(136);
        }
        MeshTools.PushQuad(PCMB.tmpVertices, 1, 5, 4, 0, positions, indices);
        MeshTools.PushSideQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PCMB.tmpVertices, 0, 4, 6, 2, positions, indices);
        MeshTools.PushSideQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PCMB.tmpVertices, 0, 2, 3, 1, positions, indices);
        MeshTools.PushTopQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PCMB.tmpVertices, 2, 6, 7, 3, positions, indices);
        MeshTools.PushSideQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PCMB.tmpVertices, 3, 7, 5, 1, positions, indices);
        MeshTools.PushSideQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PCMB.tmpVertices, 4, 5, 7, 6, positions, indices);
        MeshTools.PushTopQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        let normals = [];
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.uvs = uvs;
        vertexData.colors = colors;
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;
        return vertexData;
    }
    static ManhattanLength(x, y, z) {
        return x + y + z;
    }
    static SquaredLength(x, y, z) {
        return x * x + y * y + z * z;
    }
    static Length(x, y, z) {
        return Math.sqrt(PCMB.SquaredLength(x, y, z));
    }
    static Distance(x0, y0, z0, x1, y1, z1) {
        let x = x1 - x0;
        let y = y1 - y0;
        let z = z1 - z0;
        return Math.sqrt(x * x + y * y + z * z);
    }
    static BuildVertexData(chunck, iPos, jPos, kPos) {
        let lod = chunck.lod;
        let size = chunck.size;
        let vertexData = new BABYLON.VertexData();
        if (!PCMB.tmpVertices || PCMB.tmpVertices.length < 15) {
            PCMB.tmpVertices = [];
            for (let i = 0; i < 30; i++) {
                PCMB.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        if (!PCMB.tmpQuaternions || PCMB.tmpQuaternions.length < 1) {
            PCMB.tmpQuaternions = [];
            for (let i = 0; i < 30; i++) {
                PCMB.tmpQuaternions[i] = BABYLON.Quaternion.Identity();
            }
        }
        let positions = [];
        let indices = [];
        let uvs = [];
        let normals = [];
        let colors = [];
        let v0 = PCMB.tmpVertices[0];
        let v1 = PCMB.tmpVertices[1];
        let v2 = PCMB.tmpVertices[2];
        let v3 = PCMB.tmpVertices[3];
        let v4 = PCMB.tmpVertices[4];
        let v5 = PCMB.tmpVertices[5];
        let v6 = PCMB.tmpVertices[6];
        let v7 = PCMB.tmpVertices[7];
        let v01 = PCMB.tmpVertices[8];
        let v32 = PCMB.tmpVertices[9];
        let v45 = PCMB.tmpVertices[10];
        let v76 = PCMB.tmpVertices[11];
        let v0132 = PCMB.tmpVertices[12];
        let v4576 = PCMB.tmpVertices[13];
        let v = PCMB.tmpVertices[14];
        let norm = PCMB.tmpVertices[15];
        let blockCenter = PCMB.tmpVertices[16];
        let blockAxis = PCMB.tmpVertices[17];
        let blockQuaternion = PCMB.tmpQuaternions[0];
        let chunckCornerCase = false;
        PCMB.firstI = 0;
        PCMB.firstJ = 0;
        let lastJ = PlanetTools.CHUNCKSIZE;
        PCMB.firstK = 0;
        if (chunck.side === Side.Top || chunck.side === Side.Bottom) {
            if (chunck.iPos === 0) {
                PCMB.firstI = -1;
            }
            if (chunck.jPos === 0) {
                PCMB.firstJ = -1;
            }
            chunckCornerCase = chunck.isCorner;
        }
        if (chunck.side <= Side.Left) {
            if (chunck.jPos === chunck.chunckCount - 1) {
                lastJ = PlanetTools.CHUNCKSIZE - 1;
            }
        }
        if (chunck.isDegreeLayerBottom) {
            PCMB.firstK = -1;
        }
        PCMB.tmpData = [];
        for (let i = PCMB.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
            PCMB.tmpData[i - PCMB.firstI] = [];
            for (let j = PCMB.firstJ; j <= lastJ; j++) {
                PCMB.tmpData[i - PCMB.firstI][j - PCMB.firstJ] = [];
                for (let k = PCMB.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                    PCMB.tmpData[i - PCMB.firstI][j - PCMB.firstJ][k - PCMB.firstK] = chunck.GetData(i, j, k);
                }
            }
        }
        for (let i = PCMB.firstI; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = PCMB.firstJ; j < lastJ; j++) {
                for (let k = PCMB.firstK; k < PlanetTools.CHUNCKSIZE; k++) {
                    let cornerCase = false;
                    if (chunckCornerCase) {
                        if (chunck.iPos === 0) {
                            if (chunck.jPos === 0) {
                                if (i === PCMB.firstI) {
                                    if (j === PCMB.firstJ) {
                                        cornerCase = true;
                                    }
                                }
                            }
                            if (chunck.jPos === chunck.chunckCount - 1) {
                                if (i === PCMB.firstI) {
                                    if (j === lastJ - 1) {
                                        cornerCase = true;
                                    }
                                }
                            }
                        }
                        if (chunck.iPos === chunck.chunckCount - 1) {
                            if (chunck.jPos === 0) {
                                if (i === PlanetTools.CHUNCKSIZE - 1) {
                                    if (j === PCMB.firstJ) {
                                        cornerCase = true;
                                    }
                                }
                            }
                            if (chunck.jPos === chunck.chunckCount - 1) {
                                if (i === PlanetTools.CHUNCKSIZE - 1) {
                                    if (j === lastJ - 1) {
                                        cornerCase = true;
                                    }
                                }
                            }
                        }
                    }
                    if (cornerCase) {
                        let d = PCMB.getTmpData(i, j, k);
                        if (d != BlockType.None) {
                            if (PCMB.getTmpData(i, j, k + 1) === BlockType.None) {
                                let iGlobal = i + iPos * PlanetTools.CHUNCKSIZE;
                                let jGlobal = j + jPos * PlanetTools.CHUNCKSIZE;
                                PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[0]);
                                PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[1]);
                                PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[2]);
                                PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[3]);
                                let hGlobal = (k + kPos * PlanetTools.CHUNCKSIZE + 1);
                                let hLow = PlanetTools.KGlobalToAltitude(hGlobal) * 0.5 + PlanetTools.KGlobalToAltitude(hGlobal + 1) * 0.5;
                                let hHigh = PlanetTools.KGlobalToAltitude(hGlobal + 1) * 0.5 + PlanetTools.KGlobalToAltitude(hGlobal + 2) * 0.5;
                                let h = hLow * 0.5 + hHigh * 0.5;
                                PCMB.tmpVertices[0].scaleInPlace(h);
                                PCMB.tmpVertices[1].scaleInPlace(h);
                                PCMB.tmpVertices[2].scaleInPlace(h);
                                PCMB.tmpVertices[3].scaleInPlace(h);
                                if (BABYLON.Vector3.DistanceSquared(v0, v1) === 0) {
                                    v1.copyFrom(v2);
                                    v2.copyFrom(v3);
                                }
                                else if (BABYLON.Vector3.DistanceSquared(v1, v2) === 0) {
                                    v2.copyFrom(v3);
                                }
                                else if (BABYLON.Vector3.DistanceSquared(v0, v2) === 0) {
                                    v2.copyFrom(v3);
                                }
                                let c = PCMB.BlockColor.get(PCMB.getTmpData(i, j, k));
                                if (!c) {
                                    c = PCMB.BlockColor.get(136);
                                }
                                let l = positions.length / 3;
                                positions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
                                let color = PCMB.BlockColor.get(d);
                                for (let n = 0; n < 3; n++) {
                                    colors.push(...color.asArray(), 1);
                                }
                                normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
                                indices.push(l, l + 2, l + 1);
                            }
                        }
                    }
                    else {
                        let ref = 0b0;
                        let d0 = PCMB.getTmpData(i, j, k);
                        if (d0) {
                            ref |= 0b1 << 0;
                        }
                        let d1 = PCMB.getTmpData(i + 1, j, k);
                        if (d1) {
                            ref |= 0b1 << 1;
                        }
                        let d2 = PCMB.getTmpData(i + 1, j + 1, k);
                        if (d2) {
                            ref |= 0b1 << 2;
                        }
                        let d3 = PCMB.getTmpData(i, j + 1, k);
                        if (d3) {
                            ref |= 0b1 << 3;
                        }
                        let d4 = PCMB.getTmpData(i, j, k + 1);
                        if (d4) {
                            ref |= 0b1 << 4;
                        }
                        let d5 = PCMB.getTmpData(i + 1, j, k + 1);
                        if (d5) {
                            ref |= 0b1 << 5;
                        }
                        let d6 = PCMB.getTmpData(i + 1, j + 1, k + 1);
                        if (d6) {
                            ref |= 0b1 << 6;
                        }
                        let d7 = PCMB.getTmpData(i, j + 1, k + 1);
                        if (d7) {
                            ref |= 0b1 << 7;
                        }
                        if (ref === 0b0 || ref === 0b11111111) {
                            continue;
                        }
                        let partVertexData = PlanetChunckVertexData.Get(lod, ref);
                        let iGlobal = i + iPos * PlanetTools.CHUNCKSIZE;
                        let jGlobal = j + jPos * PlanetTools.CHUNCKSIZE;
                        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[0]);
                        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[1]);
                        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[2]);
                        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[3]);
                        blockCenter.copyFrom(PCMB.tmpVertices[0]).addInPlace(PCMB.tmpVertices[2]).scaleInPlace(0.5);
                        let angle = VMath.Angle(BABYLON.Axis.Y, blockCenter);
                        BABYLON.Vector3.CrossToRef(BABYLON.Axis.Y, blockCenter, blockAxis);
                        BABYLON.Quaternion.RotationAxisToRef(blockAxis, angle, blockQuaternion);
                        let hGlobal = (k + kPos * PlanetTools.CHUNCKSIZE + 1);
                        let hLow = PlanetTools.KGlobalToAltitude(hGlobal) * 0.5 + PlanetTools.KGlobalToAltitude(hGlobal + 1) * 0.5;
                        let hHigh = PlanetTools.KGlobalToAltitude(hGlobal + 1) * 0.5 + PlanetTools.KGlobalToAltitude(hGlobal + 2) * 0.5;
                        PCMB.tmpVertices[0].scaleToRef(hHigh, PCMB.tmpVertices[4]);
                        PCMB.tmpVertices[1].scaleToRef(hHigh, PCMB.tmpVertices[5]);
                        PCMB.tmpVertices[2].scaleToRef(hHigh, PCMB.tmpVertices[6]);
                        PCMB.tmpVertices[3].scaleToRef(hHigh, PCMB.tmpVertices[7]);
                        PCMB.tmpVertices[0].scaleInPlace(hLow);
                        PCMB.tmpVertices[1].scaleInPlace(hLow);
                        PCMB.tmpVertices[2].scaleInPlace(hLow);
                        PCMB.tmpVertices[3].scaleInPlace(hLow);
                        let l = positions.length / 3;
                        for (let n = 0; n < partVertexData.indices.length / 3; n++) {
                            let n1 = partVertexData.indices[3 * n];
                            let n2 = partVertexData.indices[3 * n + 1];
                            let n3 = partVertexData.indices[3 * n + 2];
                            let x0 = partVertexData.positions[3 * n1];
                            let y0 = partVertexData.positions[3 * n1 + 1];
                            let z0 = partVertexData.positions[3 * n1 + 2];
                            let x1 = partVertexData.positions[3 * n2];
                            let y1 = partVertexData.positions[3 * n2 + 1];
                            let z1 = partVertexData.positions[3 * n2 + 2];
                            let x2 = partVertexData.positions[3 * n3];
                            let y2 = partVertexData.positions[3 * n3 + 1];
                            let z2 = partVertexData.positions[3 * n3 + 2];
                            let blocks = [];
                            let xs = [x0, x1, x2];
                            let ys = [y0, y1, y2];
                            let zs = [z0, z1, z2];
                            let ds = [];
                            for (let vIndex = 0; vIndex < 3; vIndex++) {
                                let d = BlockType.None;
                                let minDistance = Infinity;
                                if (d0) {
                                    let distance = PCMB.SquaredLength(xs[vIndex], ys[vIndex], zs[vIndex]);
                                    if (distance < minDistance) {
                                        d = d0;
                                        blocks[vIndex] = 0;
                                        minDistance = distance;
                                    }
                                }
                                if (d1) {
                                    let distance = PCMB.SquaredLength((1 - xs[vIndex]), ys[vIndex], zs[vIndex]);
                                    if (distance < minDistance) {
                                        d = d1;
                                        blocks[vIndex] = 1;
                                        minDistance = distance;
                                    }
                                }
                                if (d2) {
                                    let distance = PCMB.SquaredLength((1 - xs[vIndex]), ys[vIndex], (1 - zs[vIndex]));
                                    if (distance < minDistance) {
                                        d = d2;
                                        blocks[vIndex] = 2;
                                        minDistance = distance;
                                    }
                                }
                                if (d3) {
                                    let distance = PCMB.SquaredLength(xs[vIndex], ys[vIndex], (1 - zs[vIndex]));
                                    if (distance < minDistance) {
                                        d = d3;
                                        blocks[vIndex] = 3;
                                        minDistance = distance;
                                    }
                                }
                                if (d4) {
                                    let distance = PCMB.SquaredLength(xs[vIndex], (1 - ys[vIndex]), zs[vIndex]);
                                    if (distance < minDistance) {
                                        d = d4;
                                        blocks[vIndex] = 4;
                                        minDistance = distance;
                                    }
                                }
                                if (d5) {
                                    let distance = PCMB.SquaredLength((1 - xs[vIndex]), (1 - ys[vIndex]), zs[vIndex]);
                                    if (distance < minDistance) {
                                        d = d5;
                                        blocks[vIndex] = 5;
                                        minDistance = distance;
                                    }
                                }
                                if (d6) {
                                    let distance = PCMB.SquaredLength((1 - xs[vIndex]), (1 - ys[vIndex]), (1 - zs[vIndex]));
                                    if (distance < minDistance) {
                                        d = d6;
                                        blocks[vIndex] = 6;
                                        minDistance = distance;
                                    }
                                }
                                if (d7) {
                                    let distance = PCMB.SquaredLength(xs[vIndex], (1 - ys[vIndex]), (1 - zs[vIndex]));
                                    if (distance < minDistance) {
                                        d = d7;
                                        blocks[vIndex] = 7;
                                        minDistance = distance;
                                    }
                                }
                                ds[vIndex] = d;
                            }
                            let alpha = ds[0] / 32;
                            let u = ds[1] / 32;
                            let v = ds[2] / 32;
                            if (lod === 0) {
                                let corner0 = PCMB.Corners[blocks[0]];
                                let corner1 = PCMB.Corners[blocks[1]];
                                let corner2 = PCMB.Corners[blocks[2]];
                                colors[4 * (l + n1)] = 1 - PCMB.Distance(x0, y0, z0, corner0.x, corner0.y, corner0.z);
                                colors[4 * (l + n1) + 1] = 1 - PCMB.Distance(x0, y0, z0, corner1.x, corner1.y, corner1.z);
                                colors[4 * (l + n1) + 2] = 1 - PCMB.Distance(x0, y0, z0, corner2.x, corner2.y, corner2.z);
                                colors[4 * (l + n1) + 3] = alpha;
                                colors[4 * (l + n2)] = 1 - PCMB.Distance(x1, y1, z1, corner0.x, corner0.y, corner0.z);
                                colors[4 * (l + n2) + 1] = 1 - PCMB.Distance(x1, y1, z1, corner1.x, corner1.y, corner1.z);
                                colors[4 * (l + n2) + 2] = 1 - PCMB.Distance(x1, y1, z1, corner2.x, corner2.y, corner2.z);
                                colors[4 * (l + n2) + 3] = alpha;
                                colors[4 * (l + n3)] = 1 - PCMB.Distance(x2, y2, z2, corner0.x, corner0.y, corner0.z);
                                colors[4 * (l + n3) + 1] = 1 - PCMB.Distance(x2, y2, z2, corner1.x, corner1.y, corner1.z);
                                colors[4 * (l + n3) + 2] = 1 - PCMB.Distance(x2, y2, z2, corner2.x, corner2.y, corner2.z);
                                colors[4 * (l + n3) + 3] = alpha;
                            }
                            else {
                                colors[4 * (l + n1)] = 1;
                                colors[4 * (l + n1) + 1] = 0;
                                colors[4 * (l + n1) + 2] = 0;
                                colors[4 * (l + n1) + 3] = alpha;
                                colors[4 * (l + n2)] = 0;
                                colors[4 * (l + n2) + 1] = 1;
                                colors[4 * (l + n2) + 2] = 0;
                                colors[4 * (l + n2) + 3] = alpha;
                                colors[4 * (l + n3)] = 0;
                                colors[4 * (l + n3) + 1] = 0;
                                colors[4 * (l + n3) + 2] = 1;
                                colors[4 * (l + n3) + 3] = alpha;
                            }
                            uvs[2 * (l + n1)] = u;
                            uvs[2 * (l + n1) + 1] = v;
                            uvs[2 * (l + n2)] = u;
                            uvs[2 * (l + n2) + 1] = v;
                            uvs[2 * (l + n3)] = u;
                            uvs[2 * (l + n3) + 1] = v;
                        }
                        for (let n = 0; n < partVertexData.positions.length / 3; n++) {
                            let x = partVertexData.positions[3 * n];
                            let y = partVertexData.positions[3 * n + 1];
                            let z = partVertexData.positions[3 * n + 2];
                            v01.copyFrom(v1).subtractInPlace(v0).scaleInPlace(x).addInPlace(v0);
                            v32.copyFrom(v2).subtractInPlace(v3).scaleInPlace(x).addInPlace(v3);
                            v45.copyFrom(v5).subtractInPlace(v4).scaleInPlace(x).addInPlace(v4);
                            v76.copyFrom(v6).subtractInPlace(v7).scaleInPlace(x).addInPlace(v7);
                            v0132.copyFrom(v32).subtractInPlace(v01).scaleInPlace(z).addInPlace(v01);
                            v4576.copyFrom(v76).subtractInPlace(v45).scaleInPlace(z).addInPlace(v45);
                            v.copyFrom(v4576).subtractInPlace(v0132).scaleInPlace(y).addInPlace(v0132);
                            positions.push(v.x);
                            positions.push(v.y);
                            positions.push(v.z);
                            norm.x = partVertexData.normals[3 * n];
                            norm.y = partVertexData.normals[3 * n + 1];
                            norm.z = partVertexData.normals[3 * n + 2];
                            norm.rotateByQuaternionToRef(blockQuaternion, norm);
                            normals.push(norm.x);
                            normals.push(norm.y);
                            normals.push(norm.z);
                        }
                        for (let n = 0; n < partVertexData.indices.length; n++) {
                            indices.push(partVertexData.indices[n] + l);
                        }
                    }
                }
            }
        }
        //BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.uvs = uvs;
        vertexData.colors = colors;
        vertexData.normals = normals;
        return vertexData;
    }
    static BuildWaterVertexData(size, iPos, jPos, kPos, rWater) {
        let vertexData = new BABYLON.VertexData();
        let vertices = [];
        let positions = [];
        let indices = [];
        let uvs = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                let y = i + iPos * PlanetTools.CHUNCKSIZE;
                let z = j + jPos * PlanetTools.CHUNCKSIZE;
                // following vertices should be lazy-computed
                vertices[0] = PCMB.GetVertex(size, y, z);
                vertices[1] = PCMB.GetVertex(size, y, z + 1);
                vertices[2] = PCMB.GetVertex(size, y + 1, z);
                vertices[3] = PCMB.GetVertex(size, y + 1, z + 1);
                vertices[1].scaleInPlace(rWater);
                vertices[2].scaleInPlace(rWater);
                vertices[3].scaleInPlace(rWater);
                vertices[0].scaleInPlace(rWater);
                MeshTools.PushQuad(vertices, 0, 1, 3, 2, positions, indices);
                MeshTools.PushWaterUvs(uvs);
                MeshTools.PushQuad(vertices, 0, 2, 3, 1, positions, indices);
                MeshTools.PushWaterUvs(uvs);
            }
        }
        let normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;
        return vertexData;
    }
    static BuildBedrockVertexData(size, iPos, jPos, kPos, r, data) {
        let vertexData = new BABYLON.VertexData();
        let vertices = [];
        let positions = [];
        let indices = [];
        let uvs = [];
        if (kPos === 0) {
            for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
                for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                    let y = i + iPos * PlanetTools.CHUNCKSIZE;
                    let z = j + jPos * PlanetTools.CHUNCKSIZE;
                    // following vertices should be lazy-computed
                    vertices[0] = PCMB.GetVertex(size, y, z);
                    vertices[1] = PCMB.GetVertex(size, y, z + 1);
                    vertices[2] = PCMB.GetVertex(size, y + 1, z);
                    vertices[3] = PCMB.GetVertex(size, y + 1, z + 1);
                    vertices[1].scaleInPlace(r);
                    vertices[2].scaleInPlace(r);
                    vertices[3].scaleInPlace(r);
                    vertices[0].scaleInPlace(r);
                    MeshTools.PushQuad(vertices, 0, 1, 3, 2, positions, indices);
                    MeshTools.PushWaterUvs(uvs);
                }
            }
        }
        let normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;
        return vertexData;
    }
    static BuildVertexData_Cubic(size, iPos, jPos, kPos, data) {
        let vertexData = new BABYLON.VertexData();
        if (!PCMB.tmpVertices) {
            PCMB.tmpVertices = [];
            for (let i = 0; i < 8; i++) {
                PCMB.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        else {
            for (let i = 0; i < 8; i++) {
                PCMB.tmpVertices[i].copyFromFloats(0, 0, 0);
            }
        }
        let positions = [];
        let indices = [];
        let uvs = [];
        let colors = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    if (data[i][j][k] !== 0) {
                        let y = i + iPos * PlanetTools.CHUNCKSIZE;
                        let z = j + jPos * PlanetTools.CHUNCKSIZE;
                        PCMB.GetVertexToRef(size, y, z, PCMB.tmpVertices[0]);
                        PCMB.GetVertexToRef(size, y, z + 1, PCMB.tmpVertices[1]);
                        PCMB.GetVertexToRef(size, y + 1, z, PCMB.tmpVertices[2]);
                        PCMB.GetVertexToRef(size, y + 1, z + 1, PCMB.tmpVertices[3]);
                        let hGlobal = (k + kPos * PlanetTools.CHUNCKSIZE + 1);
                        let hLow = PlanetTools.KGlobalToAltitude(hGlobal);
                        let hHigh = PlanetTools.KGlobalToAltitude(hGlobal + 1);
                        PCMB.tmpVertices[0].scaleToRef(hHigh, PCMB.tmpVertices[4]);
                        PCMB.tmpVertices[1].scaleToRef(hHigh, PCMB.tmpVertices[5]);
                        PCMB.tmpVertices[2].scaleToRef(hHigh, PCMB.tmpVertices[6]);
                        PCMB.tmpVertices[3].scaleToRef(hHigh, PCMB.tmpVertices[7]);
                        PCMB.tmpVertices[0].scaleInPlace(hLow);
                        PCMB.tmpVertices[1].scaleInPlace(hLow);
                        PCMB.tmpVertices[2].scaleInPlace(hLow);
                        PCMB.tmpVertices[3].scaleInPlace(hLow);
                        let c = PCMB.BlockColor.get(data[i][j][k]);
                        if (!c) {
                            c = PCMB.BlockColor.get(136);
                        }
                        if (i - 1 < 0 || data[i - 1][j][k] === 0) {
                            MeshTools.PushQuad(PCMB.tmpVertices, 1, 5, 4, 0, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (j - 1 < 0 || data[i][j - 1][k] === 0) {
                            MeshTools.PushQuad(PCMB.tmpVertices, 0, 4, 6, 2, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (k - 1 < 0 || data[i][j][k - 1] === 0) {
                            MeshTools.PushQuad(PCMB.tmpVertices, 0, 2, 3, 1, positions, indices);
                            MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (i + 1 >= PlanetTools.CHUNCKSIZE || data[i + 1][j][k] === 0) {
                            MeshTools.PushQuad(PCMB.tmpVertices, 2, 6, 7, 3, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (j + 1 >= PlanetTools.CHUNCKSIZE || data[i][j + 1][k] === 0) {
                            MeshTools.PushQuad(PCMB.tmpVertices, 3, 7, 5, 1, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (k + 1 >= PlanetTools.CHUNCKSIZE || data[i][j][k + 1] === 0) {
                            MeshTools.PushQuad(PCMB.tmpVertices, 4, 5, 7, 6, positions, indices);
                            MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                    }
                }
            }
        }
        let normals = [];
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.uvs = uvs;
        vertexData.colors = colors;
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;
        return vertexData;
    }
}
PlanetChunckMeshBuilder.Corners = [
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(1, 0, 0),
    new BABYLON.Vector3(1, 0, 1),
    new BABYLON.Vector3(0, 0, 1),
    new BABYLON.Vector3(0, 1, 0),
    new BABYLON.Vector3(1, 1, 0),
    new BABYLON.Vector3(1, 1, 1),
    new BABYLON.Vector3(0, 1, 1),
];
PlanetChunckMeshBuilder._tmpBlockCenter = BABYLON.Vector3.Zero();
var PCMB = PlanetChunckMeshBuilder;
class PlanetChunckVertexData {
    static NameToRef(name) {
        let v = 0b0;
        for (let i = 0; i < name.length; i++) {
            if (name[i] === "1") {
                v |= (0b1 << i);
            }
        }
        return v;
    }
    static RotateYChunckPartRef(ref) {
        return PlanetChunckVertexData.ReOrder(ref, 1, 2, 3, 0, 5, 6, 7, 4);
    }
    static FlipChunckPartRef(ref) {
        return ref ^ 0b11111111;
    }
    static MirrorXChunckPartRef(ref) {
        return PlanetChunckVertexData.ReOrder(ref, 1, 0, 3, 2, 5, 4, 7, 6);
    }
    static MirrorYChunckPartRef(ref) {
        return PlanetChunckVertexData.ReOrder(ref, 4, 5, 6, 7, 0, 1, 2, 3);
    }
    static MirrorZChunckPartRef(ref) {
        return PlanetChunckVertexData.ReOrder(ref, 3, 2, 1, 0, 7, 6, 5, 4);
    }
    static _TryAddMirrorXChunckPart(lod, ref, data) {
        let mirrorXRef = PlanetChunckVertexData.MirrorXChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(mirrorXRef)) {
            let mirrorXData = PlanetChunckVertexData.MirrorX(data);
            PlanetChunckVertexData._VertexDatas[lod].set(mirrorXRef, mirrorXData);
            PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, mirrorXRef, mirrorXData);
            return true;
        }
        return false;
    }
    static _TryAddMirrorYChunckPart(lod, ref, data) {
        let mirrorYRef = PlanetChunckVertexData.MirrorYChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(mirrorYRef)) {
            let mirrorYData = PlanetChunckVertexData.MirrorY(data);
            PlanetChunckVertexData._VertexDatas[lod].set(mirrorYRef, mirrorYData);
            PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, mirrorYRef, mirrorYData);
            return true;
        }
        return false;
    }
    static _TryAddMirrorZChunckPart(lod, ref, data) {
        let mirrorZRef = PlanetChunckVertexData.MirrorZChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(mirrorZRef)) {
            let mirrorZData = PlanetChunckVertexData.MirrorZ(data);
            PlanetChunckVertexData._VertexDatas[lod].set(mirrorZRef, mirrorZData);
            return true;
        }
        return false;
    }
    static SplitVertexDataTriangles(data) {
        let splitData = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let normals = [];
        let uvs = [];
        let colors = [];
        let useUvs = data.uvs && data.uvs.length > 0;
        let useColors = data.colors && data.colors.length > 0;
        for (let i = 0; i < data.indices.length / 3; i++) {
            let l = positions.length / 3;
            let i0 = data.indices[3 * i];
            let i1 = data.indices[3 * i + 1];
            let i2 = data.indices[3 * i + 2];
            let x0 = data.positions[3 * i0];
            let y0 = data.positions[3 * i0 + 1];
            let z0 = data.positions[3 * i0 + 2];
            let x1 = data.positions[3 * i1];
            let y1 = data.positions[3 * i1 + 1];
            let z1 = data.positions[3 * i1 + 2];
            let x2 = data.positions[3 * i2];
            let y2 = data.positions[3 * i2 + 1];
            let z2 = data.positions[3 * i2 + 2];
            /*
            let x = x0 + x1 + x2;
            x = x / 3;
            x0 = 0.98 * x0 + 0.02 * x;
            x1 = 0.98 * x1 + 0.02 * x;
            x2 = 0.98 * x2 + 0.02 * x;
            
            let y = y0 + y1 + y2;
            y = y / 3;
            y0 = 0.98 * y0 + 0.02 * y;
            y1 = 0.98 * y1 + 0.02 * y;
            y2 = 0.98 * y2 + 0.02 * y;
            
            let z = z0 + z1 + z2;
            z = z / 3;
            z0 = 0.98 * z0 + 0.02 * z;
            z1 = 0.98 * z1 + 0.02 * z;
            z2 = 0.98 * z2 + 0.02 * z;
            */
            positions.push(x0, y0, z0);
            positions.push(x1, y1, z1);
            positions.push(x2, y2, z2);
            let nx0 = data.normals[3 * i0];
            let ny0 = data.normals[3 * i0 + 1];
            let nz0 = data.normals[3 * i0 + 2];
            let nx1 = data.normals[3 * i1];
            let ny1 = data.normals[3 * i1 + 1];
            let nz1 = data.normals[3 * i1 + 2];
            let nx2 = data.normals[3 * i2];
            let ny2 = data.normals[3 * i2 + 1];
            let nz2 = data.normals[3 * i2 + 2];
            normals.push(nx0, ny0, nz0);
            normals.push(nx1, ny1, nz1);
            normals.push(nx2, ny2, nz2);
            let u0;
            let v0;
            let u1;
            let v1;
            let u2;
            let v2;
            if (useUvs) {
                u0 = data.positions[2 * i0];
                v0 = data.positions[2 * i0 + 1];
                u1 = data.positions[2 * i1];
                v1 = data.positions[2 * i1 + 1];
                u2 = data.positions[2 * i2];
                v2 = data.positions[2 * i2 + 1];
                uvs.push(u0, v0);
                uvs.push(u1, v1);
                uvs.push(u2, v2);
            }
            let r0;
            let g0;
            let b0;
            let a0;
            let r1;
            let g1;
            let b1;
            let a1;
            let r2;
            let g2;
            let b2;
            let a2;
            if (useColors) {
                r0 = data.colors[4 * i0];
                g0 = data.colors[4 * i0 + 1];
                b0 = data.colors[4 * i0 + 2];
                a0 = data.colors[4 * i0 + 3];
                r1 = data.colors[4 * i0];
                g1 = data.colors[4 * i0 + 1];
                b1 = data.colors[4 * i0 + 2];
                a1 = data.colors[4 * i0 + 3];
                r2 = data.colors[4 * i0];
                g2 = data.colors[4 * i0 + 1];
                b2 = data.colors[4 * i0 + 2];
                a2 = data.colors[4 * i0 + 3];
                colors.push(r0, g0, b0, a0);
                colors.push(r1, g1, b1, a1);
                colors.push(r2, g2, b2, a2);
            }
            indices.push(l, l + 1, l + 2);
        }
        splitData.positions = positions;
        splitData.indices = indices;
        splitData.normals = normals;
        if (useUvs) {
            splitData.uvs = uvs;
        }
        if (useColors) {
            splitData.colors = colors;
        }
        return splitData;
    }
    static async _LoadChunckVertexDatas(lod) {
        return new Promise(resolve => {
            BABYLON.SceneLoader.ImportMesh("", "./datas/meshes/chunck-parts-lod-" + lod.toFixed(0) + ".babylon", "", Game.Scene, (meshes) => {
                for (let i = 0; i < meshes.length; i++) {
                    let mesh = meshes[i];
                    if (mesh instanceof BABYLON.Mesh && mesh.name != "zero") {
                        let useful = false;
                        let name = mesh.name;
                        let ref = PlanetChunckVertexData.NameToRef(name);
                        let data = BABYLON.VertexData.ExtractFromMesh(mesh);
                        data = PlanetChunckVertexData.SplitVertexDataTriangles(data);
                        //data.positions = data.positions.map((n: number) => { return n * 0.98 + 0.01; });
                        if (!data.colors || data.colors.length / 4 != data.positions.length / 3) {
                            let colors = [];
                            for (let j = 0; j < data.positions.length / 3; j++) {
                                colors.push(1, 1, 1, 1);
                            }
                            data.colors = colors;
                        }
                        mesh.dispose();
                        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref)) {
                            PlanetChunckVertexData._VertexDatas[lod].set(ref, data);
                            useful = true;
                        }
                        useful = PlanetChunckVertexData._TryAddMirrorXChunckPart(lod, ref, data) || useful;
                        useful = PlanetChunckVertexData._TryAddMirrorYChunckPart(lod, ref, data) || useful;
                        useful = PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, ref, data) || useful;
                        let rotatedRef = ref;
                        for (let j = 0; j < 3; j++) {
                            rotatedRef = PlanetChunckVertexData.RotateYChunckPartRef(rotatedRef);
                            data = PlanetChunckVertexData.RotateY(data, -Math.PI / 2);
                            if (!PlanetChunckVertexData._VertexDatas[lod].has(rotatedRef)) {
                                PlanetChunckVertexData._VertexDatas[lod].set(rotatedRef, data);
                                useful = true;
                            }
                            useful = PlanetChunckVertexData._TryAddMirrorXChunckPart(lod, rotatedRef, data) || useful;
                            useful = PlanetChunckVertexData._TryAddMirrorYChunckPart(lod, rotatedRef, data) || useful;
                            useful = PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, rotatedRef, data) || useful;
                        }
                        if (!useful) {
                            console.warn("Chunck-Part " + name + " is redundant.");
                        }
                    }
                }
                resolve();
            });
        });
    }
    static async InitializeData() {
        await PlanetChunckVertexData._LoadChunckVertexDatas(0);
        await PlanetChunckVertexData._LoadChunckVertexDatas(1);
        return true;
    }
    static Clone(data) {
        let clonedData = new BABYLON.VertexData();
        clonedData.positions = [...data.positions];
        clonedData.indices = [...data.indices];
        clonedData.normals = [...data.normals];
        if (data.uvs) {
            clonedData.uvs = [...data.uvs];
        }
        if (data.colors) {
            clonedData.colors = [...data.colors];
        }
        return clonedData;
    }
    static Get(lod, ref) {
        return PlanetChunckVertexData._VertexDatas[lod].get(ref);
    }
    static RotateY(baseData, angle) {
        let data = new BABYLON.VertexData();
        let positions = [...baseData.positions];
        let normals;
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            normals = [...baseData.normals];
        }
        data.indices = [...baseData.indices];
        let cosa = Math.cos(angle);
        let sina = Math.sin(angle);
        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i] - 0.5;
            let z = positions[3 * i + 2] - 0.5;
            positions[3 * i] = x * cosa - z * sina + 0.5;
            positions[3 * i + 2] = x * sina + z * cosa + 0.5;
            if (normals) {
                let xn = normals[3 * i];
                let zn = normals[3 * i + 2];
                normals[3 * i] = xn * cosa - zn * sina;
                normals[3 * i + 2] = xn * sina + zn * cosa;
            }
        }
        data.positions = positions;
        if (normals) {
            data.normals = normals;
        }
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static Flip(baseData) {
        let data = new BABYLON.VertexData();
        data.positions = [...baseData.positions];
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(-baseData.normals[3 * i], -baseData.normals[3 * i + 1], -baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static MirrorX(baseData) {
        let data = new BABYLON.VertexData();
        let positions = [];
        for (let i = 0; i < baseData.positions.length / 3; i++) {
            positions.push(1 - baseData.positions[3 * i], baseData.positions[3 * i + 1], baseData.positions[3 * i + 2]);
        }
        data.positions = positions;
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(-baseData.normals[3 * i], baseData.normals[3 * i + 1], baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static MirrorY(baseData) {
        let data = new BABYLON.VertexData();
        let positions = [];
        for (let i = 0; i < baseData.positions.length / 3; i++) {
            positions.push(baseData.positions[3 * i], 1 - baseData.positions[3 * i + 1], baseData.positions[3 * i + 2]);
        }
        data.positions = positions;
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(baseData.normals[3 * i], -baseData.normals[3 * i + 1], baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
    static MirrorZ(baseData) {
        let data = new BABYLON.VertexData();
        let positions = [];
        for (let i = 0; i < baseData.positions.length / 3; i++) {
            positions.push(baseData.positions[3 * i], baseData.positions[3 * i + 1], 1 - baseData.positions[3 * i + 2]);
        }
        data.positions = positions;
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(baseData.normals[3 * i], baseData.normals[3 * i + 1], -baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        return data;
    }
}
PlanetChunckVertexData._VertexDatas = [
    new Map(),
    new Map()
];
PlanetChunckVertexData.ReOrder = (ref, ...order) => {
    let v = [];
    for (let i = 0; i < order.length; i++) {
        v[i] = ref & (0b1 << i);
    }
    ref = 0b0;
    for (let i = 0; i < order.length; i++) {
        if (v[order[i]]) {
            ref |= 0b1 << i;
        }
    }
    return ref;
};
class PlanetGenerator {
    constructor(planet) {
        this.planet = planet;
    }
    showDebug() {
        for (let i = 0; i < this.heightMaps.length; i++) {
            let x = -3.5 + Math.floor(i / 3) * 7;
            if (i === 1) {
                x -= 1;
            }
            if (i === 4) {
                x += 1;
            }
            Utils.showDebugPlanetHeightMap(this.heightMaps[i], x, 1.5 - 1.5 * (i % 3));
        }
    }
}
class PlanetGeneratorEarth extends PlanetGenerator {
    constructor(planet, _seaLevel, _mountainHeight) {
        super(planet);
        this._seaLevel = _seaLevel;
        this._mountainHeight = _mountainHeight;
        this._mainHeightMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(planet.kPosMax));
        this._treeMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(planet.kPosMax), { firstNoiseDegree: PlanetTools.KPosToDegree(planet.kPosMax) - 2 });
        this.heightMaps = [this._mainHeightMap];
    }
    makeData(chunck) {
        let f = Math.pow(2, this._mainHeightMap.degree - chunck.degree);
        return PlanetTools.Data((i, j, k) => {
            let v = this._mainHeightMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
            let tree = this._treeMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
            let altitude = Math.floor((this._seaLevel + v * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
            let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
            if (globalK <= altitude) {
                if (globalK > altitude - 2) {
                    if (globalK < this._seaLevel * (this.planet.kPosMax * PlanetTools.CHUNCKSIZE) + 1) {
                        //return BlockType.Grass;
                        return BlockType.Sand;
                    }
                    return BlockType.Grass;
                }
                //return BlockType.Grass;
                return BlockType.Rock;
            }
            if (altitude >= this._seaLevel * this.planet.kPosMax * PlanetTools.CHUNCKSIZE) {
                if (tree > 0.6) {
                    if (globalK <= altitude + 7) {
                        //return BlockType.Grass;
                        return BlockType.Wood;
                    }
                    if (globalK <= altitude + 9) {
                        //return BlockType.Grass;
                        return BlockType.Leaf;
                    }
                }
                else if (tree > 0.5) {
                    if (globalK <= altitude + 1) {
                        //return BlockType.Grass;
                        return BlockType.Wood;
                    }
                }
            }
            return BlockType.None;
        });
    }
}
class PlanetGeneratorDebug extends PlanetGenerator {
    constructor(planet) {
        super(planet);
    }
    makeData(chunck) {
        return PlanetTools.Data((i, j, k) => {
            let iGlobal = i + chunck.iPos * PlanetTools.CHUNCKSIZE;
            let jGlobal = j + chunck.jPos * PlanetTools.CHUNCKSIZE;
            let kGlobal = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
            let h = 25;
            if (chunck.side === Side.Front) {
                h = 28;
            }
            if (jGlobal < 5) {
                h = 30;
            }
            if (kGlobal < h) {
                if (iGlobal < 5) {
                    return BlockType.Grass;
                }
                if (jGlobal < 5) {
                    return BlockType.Rock;
                }
                return BlockType.Sand;
            }
            return 0;
        });
    }
}
class PlanetGeneratorDebug2 extends PlanetGenerator {
    constructor(planet) {
        super(planet);
    }
    makeData(chunck) {
        let c = Math.floor(Math.random() * 7 + 1);
        return PlanetTools.Data((i, j, k) => {
            return c;
        });
    }
}
class PlanetGeneratorDebug3 extends PlanetGenerator {
    constructor(planet) {
        super(planet);
    }
    makeData(chunck) {
        return PlanetTools.Data((i, j, k) => {
            let c = Math.floor(Math.random() * 7 + 1);
            return c;
        });
    }
}
class PlanetGeneratorDebug4 extends PlanetGenerator {
    constructor(planet) {
        super(planet);
    }
    makeData(chunck) {
        return PlanetTools.Data((i, j, k) => {
            let iGlobal = i + chunck.iPos * PlanetTools.CHUNCKSIZE;
            let jGlobal = j + chunck.jPos * PlanetTools.CHUNCKSIZE;
            let kGlobal = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
            let h = this.planet.kPosMax * PlanetTools.CHUNCKSIZE * 0.7 + 3 * Math.random();
            if (iGlobal === 0 || iGlobal === PlanetTools.DegreeToSize(chunck.degree) - 1) {
                if (jGlobal === 0 || jGlobal === PlanetTools.DegreeToSize(chunck.degree) - 1) {
                    //h = this.planet.kPosMax * PlanetTools.CHUNCKSIZE * 0.7 + 4;
                }
            }
            if (kGlobal < h) {
                return BlockType.Rock;
            }
            return BlockType.None;
        });
    }
}
class PlanetHeightMap {
    constructor(degree) {
        this.degree = degree;
        this.map = [];
        this.size = Math.pow(2, this.degree);
    }
    static CreateMap(degree, options) {
        let map = new PlanetHeightMap(0);
        let firstNoiseDegree = 1;
        if (options && isFinite(options.firstNoiseDegree)) {
            firstNoiseDegree = options.firstNoiseDegree;
        }
        for (let i = 0; i <= map.size; i++) {
            for (let j = 0; j <= map.size; j++) {
                for (let k = 0; k <= map.size; k++) {
                    if (map.isValid(i, j, k)) {
                        map.setValue(0, i, j, k);
                    }
                }
            }
        }
        let noise = 1;
        while (map.degree < degree) {
            map = map.scale2();
            if (map.degree >= firstNoiseDegree) {
                noise = noise * 0.5;
                map.noise(noise);
            }
        }
        if (options && options.postComputation) {
            for (let i = 0; i <= map.size; i++) {
                for (let j = 0; j <= map.size; j++) {
                    for (let k = 0; k <= map.size; k++) {
                        if (map.isValid(i, j, k)) {
                            let v = map.getValue(i, j, k);
                            map.setValue(options.postComputation(v), i, j, k);
                        }
                    }
                }
            }
        }
        return map;
    }
    noise(range) {
        for (let i = 0; i <= this.size; i++) {
            for (let j = 0; j <= this.size; j++) {
                for (let k = 0; k <= this.size; k++) {
                    if (this.isValid(i, j, k)) {
                        let v = this.getValue(i, j, k);
                        v += (Math.random() * 2 - 1) * range;
                        this.setValue(v, i, j, k);
                    }
                }
            }
        }
    }
    addInPlace(other) {
        if (other.degree = this.degree) {
            for (let i = 0; i <= this.size; i++) {
                for (let j = 0; j <= this.size; j++) {
                    for (let k = 0; k <= this.size; k++) {
                        if (this.isValid(i, j, k)) {
                            let v = this.getValue(i, j, k);
                            v += other.getValue(i, j, k);
                            this.setValue(v, i, j, k);
                        }
                    }
                }
            }
        }
    }
    substractInPlace(other) {
        if (other.degree = this.degree) {
            for (let i = 0; i <= this.size; i++) {
                for (let j = 0; j <= this.size; j++) {
                    for (let k = 0; k <= this.size; k++) {
                        if (this.isValid(i, j, k)) {
                            let v = this.getValue(i, j, k);
                            v -= other.getValue(i, j, k);
                            this.setValue(v, i, j, k);
                        }
                    }
                }
            }
        }
    }
    scale2() {
        let scaledMap = new PlanetHeightMap(this.degree + 1);
        for (let I = 0; I <= this.size; I++) {
            for (let J = 0; J <= this.size; J++) {
                for (let K = 0; K <= this.size; K++) {
                    if (this.isValid(I, J, K)) {
                        let v = this.getValue(I, J, K);
                        scaledMap.setValue(v, 2 * I, 2 * J, 2 * K);
                    }
                }
            }
        }
        for (let i = 0; i <= this.size; i++) {
            for (let j = 0; j <= this.size; j++) {
                for (let k = 0; k <= this.size; k++) {
                    if (scaledMap.isValid(2 * i + 1, 2 * j, 2 * k)) {
                        let v1 = scaledMap.getValue(2 * i, 2 * j, 2 * k);
                        let v2 = scaledMap.getValue(2 * i + 2, 2 * j, 2 * k);
                        if (isFinite(v1) && isFinite(v2)) {
                            scaledMap.setValue((v1 + v2) * 0.5, 2 * i + 1, 2 * j, 2 * k);
                        }
                    }
                    if (scaledMap.isValid(2 * i, 2 * j + 1, 2 * k)) {
                        let v1 = scaledMap.getValue(2 * i, 2 * j, 2 * k);
                        let v2 = scaledMap.getValue(2 * i, 2 * j + 2, 2 * k);
                        if (isFinite(v1) && isFinite(v2)) {
                            scaledMap.setValue((v1 + v2) * 0.5, 2 * i, 2 * j + 1, 2 * k);
                        }
                    }
                    if (scaledMap.isValid(2 * i, 2 * j, 2 * k + 1)) {
                        let v1 = scaledMap.getValue(2 * i, 2 * j, 2 * k);
                        let v2 = scaledMap.getValue(2 * i, 2 * j, 2 * k + 2);
                        if (isFinite(v1) && isFinite(v2)) {
                            scaledMap.setValue((v1 + v2) * 0.5, 2 * i, 2 * j, 2 * k + 1);
                        }
                    }
                }
            }
        }
        for (let i = 0; i <= this.size; i++) {
            for (let j = 0; j <= this.size; j++) {
                for (let k = 0; k <= this.size; k++) {
                    if (scaledMap.isValid(2 * i + 1, 2 * j + 1, 2 * k)) {
                        let v1 = scaledMap.getValue(2 * i, 2 * j + 1, 2 * k);
                        let v2 = scaledMap.getValue(2 * i + 2, 2 * j + 1, 2 * k);
                        let v3 = scaledMap.getValue(2 * i + 1, 2 * j + 2, 2 * k);
                        let v4 = scaledMap.getValue(2 * i + 1, 2 * j, 2 * k);
                        let c = 0;
                        let v = 0;
                        if (isFinite(v1)) {
                            c++;
                            v += v1;
                        }
                        if (isFinite(v2)) {
                            c++;
                            v += v2;
                        }
                        if (isFinite(v3)) {
                            c++;
                            v += v3;
                        }
                        if (isFinite(v4)) {
                            c++;
                            v += v4;
                        }
                        v /= c;
                        if (isNaN(v)) {
                            debugger;
                        }
                        scaledMap.setValue(v, 2 * i + 1, 2 * j + 1, 2 * k);
                    }
                    if (scaledMap.isValid(2 * i + 1, 2 * j, 2 * k + 1)) {
                        let v1 = scaledMap.getValue(2 * i, 2 * j, 2 * k + 1);
                        let v2 = scaledMap.getValue(2 * i + 2, 2 * j, 2 * k + 1);
                        let v3 = scaledMap.getValue(2 * i + 1, 2 * j, 2 * k);
                        let v4 = scaledMap.getValue(2 * i + 1, 2 * j, 2 * k + 2);
                        let c = 0;
                        let v = 0;
                        if (isFinite(v1)) {
                            c++;
                            v += v1;
                        }
                        if (isFinite(v2)) {
                            c++;
                            v += v2;
                        }
                        if (isFinite(v3)) {
                            c++;
                            v += v3;
                        }
                        if (isFinite(v4)) {
                            c++;
                            v += v4;
                        }
                        v /= c;
                        if (isNaN(v)) {
                            debugger;
                        }
                        scaledMap.setValue(v, 2 * i + 1, 2 * j, 2 * k + 1);
                    }
                    if (scaledMap.isValid(2 * i, 2 * j + 1, 2 * k + 1)) {
                        let v1 = scaledMap.getValue(2 * i, 2 * j, 2 * k + 1);
                        let v2 = scaledMap.getValue(2 * i, 2 * j + 2, 2 * k + 1);
                        let v3 = scaledMap.getValue(2 * i, 2 * j + 1, 2 * k);
                        let v4 = scaledMap.getValue(2 * i, 2 * j + 1, 2 * k + 2);
                        let c = 0;
                        let v = 0;
                        if (isFinite(v1)) {
                            c++;
                            v += v1;
                        }
                        if (isFinite(v2)) {
                            c++;
                            v += v2;
                        }
                        if (isFinite(v3)) {
                            c++;
                            v += v3;
                        }
                        if (isFinite(v4)) {
                            c++;
                            v += v4;
                        }
                        v /= c;
                        if (isNaN(v)) {
                            debugger;
                        }
                        scaledMap.setValue(v, 2 * i, 2 * j + 1, 2 * k + 1);
                    }
                }
            }
        }
        if (!scaledMap.sanityCheck()) {
            debugger;
        }
        return scaledMap;
    }
    isValid(i, j, k) {
        return (i === 0 || j === 0 || k === 0 || i === this.size || j === this.size || k === this.size) && (i >= 0 && j >= 0 && k >= 0 && i <= this.size && j <= this.size && k <= this.size);
    }
    sanityCheck() {
        for (let i = 0; i <= this.size; i++) {
            for (let j = 0; j <= this.size; j++) {
                for (let k = 0; k <= this.size; k++) {
                    if (this.isValid(i, j, k)) {
                        if (isNaN(this.getValue(i, j, k))) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    getForSide(side, i, j) {
        if (side === Side.Top) {
            return this.getValue(this.size - j, this.size, i);
        }
        else if (side === Side.Right) {
            return this.getValue(this.size, j, i);
        }
        else if (side === Side.Front) {
            return this.getValue(this.size - i, j, this.size);
        }
        else if (side === Side.Left) {
            return this.getValue(0, j, this.size - i);
        }
        else if (side === Side.Back) {
            return this.getValue(i, j, 0);
        }
        if (side === Side.Bottom) {
            return this.getValue(j, 0, i);
        }
        else {
            return 0;
        }
    }
    getValue(i, j, k) {
        if (this.map[i]) {
            if (this.map[i][j]) {
                return this.map[i][j][k];
            }
        }
        debugger;
    }
    setValue(v, i, j, k) {
        if (!this.map[i]) {
            this.map[i] = [];
        }
        if (!this.map[i][j]) {
            this.map[i][j] = [];
        }
        this.map[i][j][k] = v;
    }
    getTexture(side, maxValue) {
        let texture = new BABYLON.DynamicTexture("texture-" + side, this.size, Game.Scene, false);
        let context = texture.getContext();
        if (!isFinite(maxValue)) {
            maxValue = 1;
        }
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                let v = this.getForSide(side, i, j);
                let c = (v + 1) * 0.5 / maxValue * 256;
                context.fillStyle = "rgb(" + c.toFixed(0) + ", " + c.toFixed(0) + ", " + c.toFixed(0) + ")";
                context.fillRect(i, j, 1, 1);
            }
        }
        texture.update(false);
        return texture;
    }
}
class TerrainToonMaterial extends BABYLON.ShaderMaterial {
    constructor(name, scene) {
        super(name, scene, {
            vertex: "terrainToon",
            fragment: "terrainToon",
        }, {
            attributes: ["position", "normal", "uv", "color"],
            uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
        });
        this.setVector3("lightInvDirW", (new BABYLON.Vector3(0.5 + Math.random(), 2.5 + Math.random(), 1.5 + Math.random())).normalize());
        this._terrainColors = [];
        this._terrainColors[BlockType.None] = new BABYLON.Color3(0, 0, 0);
        this._terrainColors[BlockType.Grass] = new BABYLON.Color3(0.384, 0.651, 0.349);
        this._terrainColors[BlockType.Dirt] = new BABYLON.Color3(0, 0, 0);
        this._terrainColors[BlockType.Sand] = new BABYLON.Color3(0.761, 0.627, 0.141);
        this._terrainColors[BlockType.Rock] = new BABYLON.Color3(0, 0, 0);
        this._terrainColors[BlockType.Wood] = new BABYLON.Color3(0.600, 0.302, 0.020);
        this._terrainColors[BlockType.Leaf] = new BABYLON.Color3(0.431, 0.839, 0.020);
        this.setColor3Array("terrainColors", this._terrainColors);
    }
    getColor(blockType) {
        return this._terrainColors[blockType];
    }
    setColor(blockType, color) {
        this._terrainColors[blockType].copyFrom(color);
        this.setColor3Array("terrainColors", this._terrainColors);
    }
}
var Side;
(function (Side) {
    Side[Side["Front"] = 0] = "Front";
    Side[Side["Right"] = 1] = "Right";
    Side[Side["Back"] = 2] = "Back";
    Side[Side["Left"] = 3] = "Left";
    Side[Side["Top"] = 4] = "Top";
    Side[Side["Bottom"] = 5] = "Bottom";
})(Side || (Side = {}));
class PlanetSide extends BABYLON.Mesh {
    constructor(side, planet) {
        let name = "side-" + side;
        super(name, Game.Scene);
        this.planet = planet;
        this._side = side;
        this.rotationQuaternion = PlanetTools.QuaternionForSide(this._side);
        this.computeWorldMatrix();
        this.freezeWorldMatrix();
        this.chuncks = new Array();
        for (let k = 0; k <= this.kPosMax; k++) {
            this.chuncks[k] = new Array();
            let chuncksCount = PlanetTools.DegreeToChuncksCount(PlanetTools.KPosToDegree(k));
            for (let i = 0; i < chuncksCount; i++) {
                this.chuncks[k][i] = new Array();
                for (let j = 0; j < chuncksCount; j++) {
                    this.chuncks[k][i][j] = new PlanetChunck(i, j, k, this);
                }
            }
        }
    }
    get side() {
        return this._side;
    }
    get chunckManager() {
        return this.planet.chunckManager;
    }
    GetPlanetName() {
        return this.planet.GetPlanetName();
    }
    get kPosMax() {
        return this.planet.kPosMax;
    }
    getChunck(iPos, jPos, kPos, degree) {
        if (PlanetTools.KPosToDegree(kPos) === degree + 1) {
            let chunck00 = this.getChunck(Math.floor(iPos * 2), Math.floor(jPos * 2), kPos, degree + 1);
            let chunck10 = this.getChunck(Math.floor(iPos * 2 + 1), Math.floor(jPos * 2), kPos, degree + 1);
            let chunck01 = this.getChunck(Math.floor(iPos * 2), Math.floor(jPos * 2 + 1), kPos, degree + 1);
            let chunck11 = this.getChunck(Math.floor(iPos * 2 + 1), Math.floor(jPos * 2 + 1), kPos, degree + 1);
            if (chunck00 instanceof PlanetChunck) {
                if (chunck10 instanceof PlanetChunck) {
                    if (chunck01 instanceof PlanetChunck) {
                        if (chunck11 instanceof PlanetChunck) {
                            return [chunck00, chunck10, chunck01, chunck11];
                        }
                    }
                }
            }
        }
        if (PlanetTools.KPosToDegree(kPos) < degree) {
            return this.getChunck(Math.floor(iPos / 2), Math.floor(jPos / 2), kPos, degree - 1);
        }
        if (this.chuncks[kPos]) {
            if (this.chuncks[kPos][iPos]) {
                let chunck = this.chuncks[kPos][iPos][jPos];
                if (chunck && chunck.degree === degree) {
                    return chunck;
                }
            }
        }
        if (kPos >= 0 && kPos < this.kPosMax) {
            let chunckCount = this.chuncks[kPos].length;
            if (iPos < 0) {
                if (this.side <= Side.Left) {
                    let side = this.planet.GetSide((this.side + 3) % 4);
                    return side.getChunck(chunckCount + iPos, jPos, kPos, degree);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Back);
                    return side.getChunck(chunckCount - 1 - jPos, chunckCount + iPos, kPos, degree);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Back);
                    return side.getChunck(jPos, -1 - iPos, kPos, degree);
                }
            }
            else if (iPos >= chunckCount) {
                if (this.side <= Side.Left) {
                    let side = this.planet.GetSide((this.side + 3) % 4);
                    return side.getChunck(-chunckCount + iPos, jPos, kPos, degree);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Front);
                    return side.getChunck(jPos, 2 * chunckCount - iPos - 1, kPos, degree);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Front);
                    return side.getChunck(chunckCount - 1 - jPos, chunckCount - iPos, kPos, degree);
                }
            }
            else if (jPos < 0) {
                if (this.side === Side.Front) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(chunckCount + jPos, chunckCount - 1 - iPos, kPos, degree);
                }
                else if (this.side === Side.Right) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(iPos, chunckCount + jPos, kPos, degree);
                }
                else if (this.side === Side.Back) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(-1 - jPos, iPos, kPos, degree);
                }
                else if (this.side === Side.Left) {
                    let side = this.planet.GetSide(Side.Bottom);
                    return side.getChunck(chunckCount - 1 - iPos, -1 - jPos, kPos, degree);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Right);
                    return side.getChunck(iPos, chunckCount + jPos, kPos, degree);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Left);
                    return side.getChunck(chunckCount - 1 - iPos, -1 - jPos, kPos, degree);
                }
            }
            else if (jPos >= chunckCount) {
                if (this.side === Side.Front) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(2 * chunckCount - 1 - jPos, iPos, kPos, degree);
                }
                else if (this.side === Side.Right) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(iPos, -chunckCount + jPos, kPos, degree);
                }
                else if (this.side === Side.Back) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(-chunckCount + jPos, chunckCount - 1 - iPos, kPos, degree);
                }
                else if (this.side === Side.Left) {
                    let side = this.planet.GetSide(Side.Top);
                    return side.getChunck(chunckCount - 1 - iPos, 2 * chunckCount - 1 - jPos, kPos, degree);
                }
                else if (this.side === Side.Top) {
                    let side = this.planet.GetSide(Side.Left);
                    return side.getChunck(chunckCount - 1 - iPos, 2 * chunckCount - 1 - jPos, kPos, degree);
                }
                else if (this.side === Side.Bottom) {
                    let side = this.planet.GetSide(Side.Right);
                    return side.getChunck(iPos, -chunckCount + jPos, kPos, degree);
                }
            }
        }
    }
    GetData(iGlobal, jGlobal, kGlobal, degree) {
        if (PlanetTools.KGlobalToDegree(kGlobal) != degree) {
            return 0;
        }
        let chuncksCount = PlanetTools.DegreeToChuncksCount(PlanetTools.KGlobalToDegree(kGlobal));
        let L = chuncksCount * PlanetTools.CHUNCKSIZE;
        if (iGlobal < 0) {
            if (this.side <= Side.Left) {
                let side = this.planet.GetSide((this.side + 3) % 4);
                return side.GetData(L + iGlobal, jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Top) {
                let side = this.planet.GetSide(Side.Back);
                return side.GetData(L - 1 - jGlobal, L + iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Bottom) {
                let side = this.planet.GetSide(Side.Back);
                return side.GetData(jGlobal, -1 - iGlobal, kGlobal, degree);
            }
        }
        else if (iGlobal >= L) {
            if (this.side <= Side.Left) {
                let side = this.planet.GetSide((this.side + 3) % 4);
                return side.GetData(-L + iGlobal, jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Top) {
                let side = this.planet.GetSide(Side.Front);
                return side.GetData(jGlobal, 2 * L - iGlobal - 1, kGlobal, degree);
            }
            else if (this.side === Side.Bottom) {
                let side = this.planet.GetSide(Side.Front);
                return side.GetData(L - 1 - jGlobal, L - iGlobal, kGlobal, degree);
            }
        }
        else if (jGlobal < 0) {
            if (this.side === Side.Front) {
                let side = this.planet.GetSide(Side.Bottom);
                return side.GetData(L + jGlobal, L - 1 - iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Right) {
                let side = this.planet.GetSide(Side.Bottom);
                return side.GetData(iGlobal, L + jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Back) {
                let side = this.planet.GetSide(Side.Bottom);
                return side.GetData(-1 - jGlobal, iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Left) {
                let side = this.planet.GetSide(Side.Bottom);
                return side.GetData(L - 1 - iGlobal, -1 - jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Top) {
                let side = this.planet.GetSide(Side.Right);
                return side.GetData(iGlobal, L + jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Bottom) {
                let side = this.planet.GetSide(Side.Left);
                return side.GetData(L - 1 - iGlobal, -1 - jGlobal, kGlobal, degree);
            }
        }
        else if (jGlobal >= L) {
            if (this.side === Side.Front) {
                let side = this.planet.GetSide(Side.Top);
                return side.GetData(2 * L - 1 - jGlobal, iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Right) {
                let side = this.planet.GetSide(Side.Top);
                return side.GetData(iGlobal, -L + jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Back) {
                let side = this.planet.GetSide(Side.Top);
                return side.GetData(-L + jGlobal, L - 1 - iGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Left) {
                let side = this.planet.GetSide(Side.Top);
                return side.GetData(L - 1 - iGlobal, 2 * L - 1 - jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Top) {
                let side = this.planet.GetSide(Side.Left);
                return side.GetData(L - 1 - iGlobal, 2 * L - 1 - jGlobal, kGlobal, degree);
            }
            else if (this.side === Side.Bottom) {
                let side = this.planet.GetSide(Side.Right);
                return side.GetData(iGlobal, -L + jGlobal, kGlobal, degree);
            }
        }
        let iChunck = Math.floor(iGlobal / PlanetTools.CHUNCKSIZE);
        let jChunck = Math.floor(jGlobal / PlanetTools.CHUNCKSIZE);
        let kChunck = Math.floor(kGlobal / PlanetTools.CHUNCKSIZE);
        if (this.chuncks[kChunck]) {
            if (this.chuncks[kChunck][iChunck]) {
                if (this.chuncks[kChunck][iChunck][jChunck]) {
                    let i = iGlobal - iChunck * PlanetTools.CHUNCKSIZE;
                    let j = jGlobal - jChunck * PlanetTools.CHUNCKSIZE;
                    let k = kGlobal - kChunck * PlanetTools.CHUNCKSIZE;
                    return this.chuncks[kChunck][iChunck][jChunck].GetData(i, j, k);
                }
            }
        }
        return 0;
    }
    register() {
        let chunckCount = 0;
        for (let k = 0; k <= this.kPosMax; k++) {
            for (let i = 0; i < this.chuncks[k].length; i++) {
                for (let j = 0; j < this.chuncks[k][i].length; j++) {
                    this.chuncks[k][i][j].register();
                    chunckCount++;
                }
            }
        }
        return chunckCount;
    }
}
var PI4 = Math.PI / 4;
var PI2 = Math.PI / 2;
var PI = Math.PI;
class PlanetTools {
    static EmptyVertexData() {
        if (!PlanetTools._emptyVertexData) {
            let emptyMesh = new BABYLON.Mesh("Empty", Game.Scene);
            PlanetTools._emptyVertexData = BABYLON.VertexData.ExtractFromMesh(emptyMesh);
            emptyMesh.dispose();
        }
        return PlanetTools._emptyVertexData;
    }
    static QuaternionForSide(side) {
        if (side === Side.Top) {
            return BABYLON.Quaternion.Identity();
        }
        else if (side === Side.Left) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.X.scale(-1), BABYLON.Axis.Z, BABYLON.Axis.Y);
        }
        else if (side === Side.Front) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z, BABYLON.Axis.X, BABYLON.Axis.Y);
        }
        else if (side === Side.Back) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z.scale(-1), BABYLON.Axis.X.scale(-1), BABYLON.Axis.Y);
        }
        else if (side === Side.Right) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.X, BABYLON.Axis.Z.scale(-1), BABYLON.Axis.Y);
        }
        else if (side === Side.Bottom) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.X, BABYLON.Axis.Y.scale(-1), BABYLON.Axis.Z.scale(-1));
        }
    }
    static EvaluateVertex(size, i, j) {
        if (i < 0) {
            let v = PlanetTools.EvaluateVertex(size, i + size, j);
            return new BABYLON.Vector3(-v.y, v.x, v.z);
        }
        if (i > size) {
            let v = PlanetTools.EvaluateVertex(size, i - size, j);
            return new BABYLON.Vector3(v.y, -v.x, v.z);
        }
        if (j < 0) {
            let v = PlanetTools.EvaluateVertex(size, i, j + size);
            return new BABYLON.Vector3(v.x, v.z, -v.y);
        }
        if (j > size) {
            let v = PlanetTools.EvaluateVertex(size, i, j - size);
            return new BABYLON.Vector3(v.x, -v.z, v.y);
        }
        let xRad = -PI4 + PI2 * (i / size);
        let zRad = -PI4 + PI2 * (j / size);
        return new BABYLON.Vector3(Math.tan(xRad), 1, Math.tan(zRad)).normalize();
    }
    static Data(callback) {
        let data = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    data[i][j][k] = callback(i, j, k);
                }
            }
        }
        return data;
    }
    static FilledData() {
        let data = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    //data[i][j][k] = 128 + 9 + Math.floor(4 * Math.random());
                    data[i][j][k] = 3;
                }
            }
        }
        return data;
    }
    static RandomData() {
        let data = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    if (Math.random() < 0.5) {
                        data[i][j][k] = 0;
                    }
                    else {
                        data[i][j][k] = Math.floor(Math.random() * 7 + 129);
                    }
                }
            }
        }
        return data;
    }
    static DataFromHexString(hexString) {
        if (hexString.length !== PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * 2) {
            console.log("Invalid HexString. Length is =" +
                hexString.length +
                ". Expected length is = " +
                PlanetTools.CHUNCKSIZE *
                    PlanetTools.CHUNCKSIZE *
                    PlanetTools.CHUNCKSIZE *
                    2 +
                ".");
            return;
        }
        let data = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let index = 2 * (i * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE + j * PlanetTools.CHUNCKSIZE + k);
                    data[i][j][k] = parseInt(hexString.slice(index, index + 2), 16);
                }
            }
        }
        return data;
    }
    static HexStringFromData(data) {
        let hexString = "";
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    hexString += data[i][j][k].toString(16);
                }
            }
        }
        return hexString;
    }
    static WorldPositionToPlanetSide(planet, worldPos) {
        let angles = [];
        angles[Side.Back] = MeshTools.Angle(BABYLON.Axis.Z.scale(-1), worldPos);
        angles[Side.Right] = MeshTools.Angle(BABYLON.Axis.X, worldPos);
        angles[Side.Left] = MeshTools.Angle(BABYLON.Axis.X.scale(-1), worldPos);
        angles[Side.Top] = MeshTools.Angle(BABYLON.Axis.Y, worldPos);
        angles[Side.Bottom] = MeshTools.Angle(BABYLON.Axis.Y.scale(-1), worldPos);
        angles[Side.Front] = MeshTools.Angle(BABYLON.Axis.Z, worldPos);
        let min = Math.min(...angles);
        let sideIndex = angles.indexOf(min);
        return planet.GetSide(sideIndex);
    }
    static WorldPositionToGlobalIJK(planetSide, worldPos) {
        let invert = new BABYLON.Matrix();
        planetSide.getWorldMatrix().invertToRef(invert);
        let localPos = BABYLON.Vector3.TransformCoordinates(worldPos, invert);
        let r = localPos.length();
        if (Math.abs(localPos.x) > 1) {
            localPos = localPos.scale(1 / localPos.x);
        }
        if (Math.abs(localPos.y) > 1) {
            localPos = localPos.scale(1 / localPos.y);
        }
        if (Math.abs(localPos.z) > 1) {
            localPos = localPos.scale(1 / localPos.z);
        }
        let yDeg = (Math.atan(localPos.y) / Math.PI) * 180;
        let zDeg = (Math.atan(localPos.z) / Math.PI) * 180;
        let k = PlanetTools.AltitudeToKGlobal(r);
        let i = Math.floor(((zDeg + 45) / 90) * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));
        let j = Math.floor(((yDeg + 45) / 90) * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));
        return { i: i, j: j, k: k };
    }
    static GlobalIJKToLocalIJK(planetSide, global) {
        let kPos = Math.floor(global.k / PlanetTools.CHUNCKSIZE);
        let degree = PlanetTools.KPosToDegree(kPos);
        return {
            planetChunck: planetSide.getChunck(Math.floor(global.i / PlanetTools.CHUNCKSIZE), Math.floor(global.j / PlanetTools.CHUNCKSIZE), kPos, degree),
            i: global.i % PlanetTools.CHUNCKSIZE,
            j: global.j % PlanetTools.CHUNCKSIZE,
            k: global.k % PlanetTools.CHUNCKSIZE,
        };
    }
    static KGlobalToDegree(k) {
        return PlanetTools.KPosToDegree(Math.floor(k / PlanetTools.CHUNCKSIZE));
    }
    static KPosToDegree(kPos) {
        return PlanetTools.KPosToDegree8(kPos);
    }
    static get BSizes() {
        if (!PlanetTools._BSizes) {
            PlanetTools._ComputeBSizes();
        }
        return PlanetTools._BSizes;
    }
    static get Altitudes() {
        if (!PlanetTools._Altitudes) {
            PlanetTools._ComputeBSizes();
        }
        return PlanetTools._Altitudes;
    }
    static get SummedBSizesLength() {
        if (!PlanetTools._SummedBSizesLength) {
            PlanetTools._ComputeBSizes();
        }
        return PlanetTools._SummedBSizesLength;
    }
    static _ComputeBSizes() {
        PlanetTools._BSizes = [];
        PlanetTools._Altitudes = [];
        PlanetTools._SummedBSizesLength = [];
        let coreRadius = 7.6;
        let radius = coreRadius;
        let degree = 4;
        let bSizes = [];
        let altitudes = [];
        let summedBSizesLength = 0;
        while (radius < 1000) {
            let size = PlanetTools.DegreeToSize(degree);
            for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
                let a = Math.PI / 2 / size;
                let s = a * radius;
                bSizes.push(s);
                altitudes.push(radius);
                radius = radius + s;
            }
            let a = Math.PI / 2 / size;
            let s = a * radius;
            if (s > 1.3) {
                PlanetTools._SummedBSizesLength[degree] = summedBSizesLength;
                summedBSizesLength += bSizes.length;
                PlanetTools._BSizes[degree] = [...bSizes];
                bSizes = [];
                PlanetTools._Altitudes[degree] = [...altitudes];
                altitudes = [];
                degree++;
            }
        }
    }
    static KPosToDegree8(kPos) {
        let v = PlanetTools._KPosToDegree.get(kPos);
        if (isFinite(v)) {
            return v;
        }
        let degree = 4;
        let tmpKpos = kPos;
        while (degree < PlanetTools.BSizes.length) {
            let size = PlanetTools.BSizes[degree].length / PlanetTools.CHUNCKSIZE;
            if (tmpKpos < size) {
                PlanetTools._KPosToDegree.set(kPos, degree);
                return degree;
            }
            else {
                tmpKpos -= size;
                degree++;
            }
        }
    }
    static RecursiveFind(data, value, nMin, nMax) {
        let n = Math.floor(nMin * 0.5 + nMax * 0.5);
        if (nMax - nMin === 1) {
            return n;
        }
        let vn = data[n];
        if (nMax - nMin === 2) {
            if (vn > value) {
                return n - 1;
            }
            else {
                return n;
            }
        }
        if (vn > value) {
            return PlanetTools.RecursiveFind(data, value, nMin, n);
        }
        else {
            return PlanetTools.RecursiveFind(data, value, n, nMax);
        }
    }
    static AltitudeToKGlobal(altitude) {
        let degree = 4;
        while (degree < PlanetTools.Altitudes.length - 1) {
            let highest = PlanetTools.Altitudes[degree + 1][0];
            if (altitude < highest) {
                break;
            }
            else {
                altitude -= highest;
                degree++;
            }
        }
        let altitudes = PlanetTools.Altitudes[degree];
        let summedLength = PlanetTools.SummedBSizesLength[degree];
        return summedLength + PlanetTools.RecursiveFind(altitudes, altitude, 0, altitudes.length);
    }
    static KGlobalToAltitude(kGlobal) {
        let degree = PlanetTools.KGlobalToDegree(kGlobal);
        let altitudes = PlanetTools.Altitudes[degree];
        let summedLength = PlanetTools.SummedBSizesLength[degree];
        return altitudes[kGlobal - summedLength];
    }
    /*
    public static KPosToDegree16(kPos: number): number {
        if (kPos < 1) {
            return 4;
        }
        else if (kPos < 2) {
            return 5;
        }
        else if (kPos < 4) {
            return 6;
        }
        else if (kPos < 7) {
            return 7;
        }
        else if (kPos < 13) {
            return 8;
        }
        return 9;
    }

    public static KPosToDegree32(kPos: number): number {
        if (kPos < 1) {
            return 5;
        }
        else if (kPos < 2) {
            return 6;
        }
        else if (kPos < 4) {
            return 7;
        }
        else if (kPos < 7) {
            return 8;
        }
        return 9;
    }
    */
    static DegreeToSize(degree) {
        return Math.pow(2, degree);
    }
    static DegreeToChuncksCount(degree) {
        return PlanetTools.DegreeToSize(degree) / PlanetTools.CHUNCKSIZE;
    }
}
PlanetTools.CHUNCKSIZE = 8;
PlanetTools.ALPHALIMIT = Math.PI / 4;
PlanetTools.DISTANCELIMITSQUARED = 128 * 128;
PlanetTools._KPosToDegree = new Map();
class Player extends BABYLON.Mesh {
    constructor(position, planet) {
        super("Player", Game.Scene);
        this.mass = 1;
        this.speed = 5;
        this.velocity = BABYLON.Vector3.Zero();
        this.underWater = false;
        this._initialized = false;
        this._keyDown = (e) => {
            if (e.code === "KeyW") {
                this.pForward = true;
            }
            if (e.code === "KeyS") {
                this.back = true;
            }
            if (e.code === "KeyA") {
                this.left = true;
            }
            if (e.code === "KeyD") {
                this.pRight = true;
            }
        };
        this._keyUp = (e) => {
            if (e.code === "KeyW") {
                this.pForward = false;
            }
            if (e.code === "KeyS") {
                this.back = false;
            }
            if (e.code === "KeyA") {
                this.left = false;
            }
            if (e.code === "KeyD") {
                this.pRight = false;
            }
            if (e.code === "KeyG") {
                if (!this._initialized) {
                    this.initialize();
                }
                this.godMode = !this.godMode;
            }
            if (e.code === "Space") {
                if (this._isGrounded || this.godMode) {
                    this.velocity.addInPlace(this.getDirection(BABYLON.Axis.Y).scale(5));
                    this._isGrounded = false;
                    this._jumpTimer = 0.2;
                }
            }
            if (e.code === "ControlLeft") {
                if (this.godMode) {
                    this.velocity.subtractInPlace(this.getDirection(BABYLON.Axis.Y).scale(5));
                    this._isGrounded = false;
                    this._jumpTimer = 0.2;
                }
            }
        };
        this._mouseMove = (event) => {
            if (Game.LockedMouse) {
                let movementX = event.movementX;
                let movementY = event.movementY;
                if (movementX > 20) {
                    movementX = 20;
                }
                if (movementX < -20) {
                    movementX = -20;
                }
                if (movementY > 20) {
                    movementY = 20;
                }
                if (movementY < -20) {
                    movementY = -20;
                }
                let rotationPower = movementX / 500;
                let localY = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix());
                let rotation = BABYLON.Quaternion.RotationAxis(localY, rotationPower);
                this.rotationQuaternion = rotation.multiply(this.rotationQuaternion);
                let rotationCamPower = movementY / 500;
                this.camPos.rotation.x += rotationCamPower;
                this.camPos.rotation.x = Math.max(this.camPos.rotation.x, -Math.PI / 2);
                this.camPos.rotation.x = Math.min(this.camPos.rotation.x, Math.PI / 2);
            }
        };
        this._gravityFactor = BABYLON.Vector3.Zero();
        this._groundFactor = BABYLON.Vector3.Zero();
        this._surfaceFactor = BABYLON.Vector3.Zero();
        this._controlFactor = BABYLON.Vector3.Zero();
        this._rightDirection = new BABYLON.Vector3(1, 0, 0);
        this._leftDirection = new BABYLON.Vector3(-1, 0, 0);
        this._upDirection = new BABYLON.Vector3(0, 1, 0);
        this._downDirection = new BABYLON.Vector3(0, -1, 0);
        this._forwardDirection = new BABYLON.Vector3(0, 0, 1);
        this._backwardDirection = new BABYLON.Vector3(0, 0, -1);
        this._feetPosition = BABYLON.Vector3.Zero();
        this._collisionAxis = [];
        this._collisionPositions = [];
        this._jumpTimer = 0;
        this._isGrounded = false;
        this._update = () => {
            if (Game.CameraManager.cameraMode != CameraMode.Player) {
                return;
            }
            let deltaTime = Game.Engine.getDeltaTime() / 1000;
            this._jumpTimer = Math.max(this._jumpTimer - deltaTime, 0);
            this._keepUp();
            this._collisionPositions[0] = this.position;
            this._collisionPositions[1] = this._feetPosition;
            this._collisionAxis[0] = this._rightDirection;
            this._collisionAxis[1] = this._leftDirection;
            this._collisionAxis[2] = this._forwardDirection;
            this._collisionAxis[3] = this._backwardDirection;
            this.getDirectionToRef(BABYLON.Axis.X, this._rightDirection);
            this._leftDirection.copyFrom(this._rightDirection);
            this._leftDirection.scaleInPlace(-1);
            this._upDirection.copyFrom(this.position);
            this._upDirection.normalize();
            this._downDirection.copyFrom(this._upDirection);
            this._downDirection.scaleInPlace(-1);
            this.getDirectionToRef(BABYLON.Axis.Z, this._forwardDirection);
            this._backwardDirection.copyFrom(this._forwardDirection);
            this._backwardDirection.scaleInPlace(-1);
            this._feetPosition.copyFrom(this.position);
            this._feetPosition.addInPlace(this._downDirection);
            // Add gravity and ground reaction.
            this._gravityFactor.copyFrom(this._downDirection).scaleInPlace(9.8 * deltaTime);
            this._groundFactor.copyFromFloats(0, 0, 0);
            let fVert = 1;
            if (this._jumpTimer === 0) {
                let ray = new BABYLON.Ray(this.position, this._downDirection, 1.7);
                let hit = Game.Scene.pickWithRay(ray, (mesh) => {
                    return mesh.name.indexOf("chunck") != -1;
                });
                if (hit.pickedPoint) {
                    let d = hit.pickedPoint.subtract(this.position).length();
                    if (d > 0.01) {
                        this._groundFactor
                            .copyFrom(this._gravityFactor)
                            .scaleInPlace(-1)
                            .scaleInPlace(Math.pow(1.5 / d, 1));
                    }
                    fVert = 0.005;
                    this._isGrounded = true;
                }
            }
            this.velocity.addInPlace(this._gravityFactor);
            this.velocity.addInPlace(this._groundFactor);
            // Add input force.
            this._controlFactor.copyFromFloats(0, 0, 0);
            if (this.pRight) {
                this._controlFactor.addInPlace(this._rightDirection);
            }
            if (this.left) {
                this._controlFactor.addInPlace(this._leftDirection);
            }
            if (this.pForward) {
                this._controlFactor.addInPlace(this._forwardDirection);
            }
            if (this.back) {
                this._controlFactor.addInPlace(this._backwardDirection);
            }
            if (this._controlFactor.lengthSquared() > 0.1) {
                this._controlFactor.normalize();
            }
            this._controlFactor.scaleInPlace((20 / this.mass) * deltaTime);
            if (this.godMode) {
                this._controlFactor.scaleInPlace(5);
            }
            this.velocity.addInPlace(this._controlFactor);
            // Check wall collisions.
            let fLat = 1;
            this._surfaceFactor.copyFromFloats(0, 0, 0);
            for (let i = 0; i < this._collisionPositions.length; i++) {
                let pos = this._collisionPositions[i];
                for (let j = 0; j < this._collisionAxis.length; j++) {
                    let axis = this._collisionAxis[j];
                    let ray = new BABYLON.Ray(pos, axis, 0.35);
                    let hit = Game.Scene.pickWithRay(ray, (mesh) => {
                        return mesh instanceof PlanetChunck;
                    });
                    if (hit.pickedPoint) {
                        let d = hit.pickedPoint.subtract(pos).length();
                        if (d > 0.01) {
                            this._surfaceFactor.addInPlace(axis.scale((((-10 / this.mass) * 0.3) / d) * deltaTime));
                            fLat = 0.1;
                        }
                        else {
                            // In case where it stuck to the surface, force push.
                            this.position.addInPlace(hit.getNormal(true).scale(0.01));
                        }
                    }
                }
            }
            this.velocity.addInPlace(this._surfaceFactor);
            // Add friction
            let downVelocity = this._downDirection.scale(BABYLON.Vector3.Dot(this.velocity, this._downDirection));
            this.velocity.subtractInPlace(downVelocity);
            downVelocity.scaleInPlace(Math.pow(0.5 * fVert, deltaTime));
            this.velocity.scaleInPlace(Math.pow(0.01 * fLat, deltaTime));
            this.velocity.addInPlace(downVelocity);
            // Safety check.
            if (!VMath.IsFinite(this.velocity)) {
                this.velocity.copyFromFloats(-0.1 + 0.2 * Math.random(), -0.1 + 0.2 * Math.random(), -0.1 + 0.2 * Math.random());
            }
            this.position.addInPlace(this.velocity.scale(deltaTime));
            document.querySelector("#camera-altitude").textContent = this.camPos.absolutePosition.length().toFixed(1);
        };
        console.log("Create Player");
        this.planet = planet;
        this.position = position;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.camPos = new BABYLON.Mesh("Dummy", Game.Scene);
        this.camPos.parent = this;
        this.camPos.position = new BABYLON.Vector3(0, 1, 0);
    }
    PositionLeg() {
        let posLeg = this.position.add(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix()).scale(-1));
        return posLeg;
    }
    PositionRoot() {
        return this.position.add(this._downDirection.scale(0.75));
    }
    PositionHead() {
        return this.position;
    }
    initialize() {
        if (!this._initialized) {
            Game.Scene.onBeforeRenderObservable.add(this._update);
            this._initialized = true;
        }
    }
    registerControl() {
        Game.Canvas.addEventListener("keydown", this._keyDown);
        Game.Canvas.addEventListener("keyup", this._keyUp);
        Game.Canvas.addEventListener("mousemove", this._mouseMove);
    }
    unregisterControl() {
        Game.Canvas.removeEventListener("keydown", this._keyDown);
        Game.Canvas.removeEventListener("keyup", this._keyUp);
        Game.Canvas.removeEventListener("mousemove", this._mouseMove);
    }
    _keepUp() {
        if (!this) {
            return;
        }
        let currentUp = BABYLON.Vector3.Normalize(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix()));
        let targetUp = BABYLON.Vector3.Normalize(this.position);
        let correctionAxis = BABYLON.Vector3.Cross(currentUp, targetUp);
        let correctionAngle = Math.abs(Math.asin(correctionAxis.length()));
        if (correctionAngle > 0.001) {
            let rotation = BABYLON.Quaternion.RotationAxis(correctionAxis, correctionAngle / 5);
            this.rotationQuaternion = rotation.multiply(this.rotationQuaternion);
        }
    }
}
