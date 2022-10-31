var CameraMode;
(function (CameraMode) {
    CameraMode[CameraMode["Sky"] = 0] = "Sky";
    CameraMode[CameraMode["Player"] = 1] = "Player";
})(CameraMode || (CameraMode = {}));
class CameraManager {
    constructor(game) {
        this.game = game;
        this.cameraMode = CameraMode.Sky;
        this.arcRotateCamera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 100, BABYLON.Vector3.Zero(), Game.Scene);
        this.arcRotateCamera.attachControl(this.game.canvas);
        this.freeCamera = new BABYLON.FreeCamera("Camera", BABYLON.Vector3.Zero(), Game.Scene);
        this.freeCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.freeCamera.minZ = 0.1;
        const rtt = new BABYLON.RenderTargetTexture('render target', { width: this.game.engine.getRenderWidth(), height: this.game.engine.getRenderHeight() }, this.game.scene);
        rtt.samples = 1;
        this.freeCamera.outputRenderTarget = rtt;
        this.noOutlineCamera = new BABYLON.FreeCamera("Camera", BABYLON.Vector3.Zero(), game.scene);
        this.noOutlineCamera.minZ = 0.1;
        this.noOutlineCamera.layerMask = 0x10000000;
        this.noOutlineCamera.parent = this.freeCamera;
        let postProcess = OutlinePostProcess.AddOutlinePostProcess(this.freeCamera);
        postProcess.onSizeChangedObservable.add(() => {
            if (!postProcess.inputTexture.depthStencilTexture) {
                postProcess.inputTexture.createDepthStencilTexture(0, true, false, 4);
                postProcess.inputTexture._shareDepth(rtt.renderTarget);
            }
        });
        const pp = new BABYLON.PassPostProcess("pass", 1, this.noOutlineCamera);
        pp.inputTexture = rtt.renderTarget;
        pp.autoClear = false;
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
                this.arcRotateCamera.detachControl();
            }
            this.cameraMode = newCameraMode;
            if (this.cameraMode === CameraMode.Player) {
                this.freeCamera.parent = this.player.camPos;
                this.freeCamera.position.copyFromFloats(0, 0, 0);
                this.freeCamera.rotationQuaternion.copyFrom(BABYLON.Quaternion.Identity());
                this.freeCamera.computeWorldMatrix();
                Game.Scene.activeCameras = [this.freeCamera, this.noOutlineCamera];
            }
            if (this.cameraMode === CameraMode.Sky) {
                Game.Scene.activeCamera = this.arcRotateCamera;
                this.arcRotateCamera.attachControl(this.game.canvas);
            }
        }
    }
}
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
				float threshold = 0.2;
				
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
        return postProcess;
    }
}
class PlanetEditor {
    constructor(planet) {
        this.planet = planet;
        this.data = 0;
        this._update = () => {
            /*
            let removeMode: boolean = this.data === 0;
            let worldPos: BABYLON.Vector3 = PlanetEditor.GetHitWorldPos(removeMode);
    
            if (worldPos) {
                if (this.data === 0 || worldPos.subtract(Game.Player.PositionHead()).lengthSquared() > 1) {
                    if (this.data === 0 || worldPos.subtract(Game.Player.PositionLeg()).lengthSquared() > 1) {
                        let planetSide: PlanetSide = PlanetTools.WorldPositionToPlanetSide(this.planet, worldPos);
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
            */
        };
    }
    static GetHitWorldPos(remove = false) {
        let pickInfo = Game.Scene.pick(Game.Instance.canvas.width / 2, Game.Instance.canvas.height / 2, (mesh) => {
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
        Game.Instance.canvas.addEventListener("pointerup", (event) => {
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
        Game.Instance.canvas.addEventListener("keyup", (event) => {
            if (keyDataMap.has(event.code)) {
                this.data = keyDataMap.get(event.code);
            }
        });
    }
    dispose() {
        Game.Scene.onBeforeRenderObservable.removeCallback(this._update);
    }
    _pointerUp() {
        /*
        let removeMode: boolean = this.data === 0;
        let worldPos: BABYLON.Vector3 = PlanetEditor.GetHitWorldPos(removeMode);
        if (worldPos) {
            if (this.data === 0 || worldPos.subtract(Game.Player.PositionHead()).lengthSquared() > 1) {
                if (this.data === 0 || worldPos.subtract(Game.Player.PositionLeg()).lengthSquared() > 1) {
                    let planetSide: PlanetSide = PlanetTools.WorldPositionToPlanetSide(
                        this.planet,
                        worldPos
                    );
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
        */
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
    static HighlightChunckMaterial() {
        if (!SharedMaterials.highlightChunckMaterial) {
            SharedMaterials.highlightChunckMaterial = new TerrainToonMaterial("highlightChunckMaterial", Game.Scene);
            SharedMaterials.highlightChunckMaterial.setGlobalColor(new BABYLON.Color3(0, 1, 1));
        }
        return SharedMaterials.highlightChunckMaterial;
    }
    static DebugMaterial() {
        if (!SharedMaterials.debugMaterial) {
            SharedMaterials.debugMaterial = new BABYLON.StandardMaterial("debugMaterial", Game.Scene);
        }
        return SharedMaterials.debugMaterial;
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
class VertexDataLoader {
    constructor(scene) {
        this.scene = scene;
        this._vertexDatas = new Map();
        VertexDataLoader.instance = this;
    }
    static clone(data) {
        let clonedData = new BABYLON.VertexData();
        clonedData.positions = [...data.positions];
        clonedData.indices = [...data.indices];
        clonedData.normals = [...data.normals];
        if (data.matricesIndices) {
            clonedData.matricesIndices = [...data.matricesIndices];
        }
        if (data.matricesWeights) {
            clonedData.matricesWeights = [...data.matricesWeights];
        }
        if (data.uvs) {
            clonedData.uvs = [...data.uvs];
        }
        if (data.colors) {
            clonedData.colors = [...data.colors];
        }
        return clonedData;
    }
    async get(name) {
        if (this._vertexDatas.get(name)) {
            return this._vertexDatas.get(name);
        }
        let vertexData = undefined;
        let loadedFile = await BABYLON.SceneLoader.ImportMeshAsync("", "./datas/meshes/" + name + ".babylon", "", Main.Scene);
        let vertexDatas = [];
        let loadedFileMeshes = loadedFile.meshes.sort((m1, m2) => {
            if (m1.name < m2.name) {
                return -1;
            }
            else if (m1.name > m2.name) {
                return 1;
            }
            return 0;
        });
        for (let i = 0; i < loadedFileMeshes.length; i++) {
            let loadedMesh = loadedFileMeshes[i];
            if (loadedMesh instanceof BABYLON.Mesh) {
                vertexData = BABYLON.VertexData.ExtractFromMesh(loadedMesh);
                vertexDatas.push(vertexData);
            }
        }
        loadedFileMeshes.forEach(m => { m.dispose(); });
        loadedFile.skeletons.forEach(s => { s.dispose(); });
        return vertexDatas;
    }
    async getColorized(name, baseColorHex = "#FFFFFF", frameColorHex = "", color1Hex = "", // Replace red
    color2Hex = "", // Replace green
    color3Hex = "" // Replace blue
    ) {
        let vertexDatas = await this.getColorizedMultiple(name, baseColorHex, frameColorHex, color1Hex, color2Hex, color3Hex);
        return vertexDatas[0];
    }
    async getColorizedMultiple(name, baseColorHex = "#FFFFFF", frameColorHex = "", color1Hex = "", // Replace red
    color2Hex = "", // Replace green
    color3Hex = "" // Replace blue
    ) {
        let baseColor;
        if (baseColorHex !== "") {
            baseColor = BABYLON.Color3.FromHexString(baseColorHex);
        }
        let frameColor;
        if (frameColorHex !== "") {
            frameColor = BABYLON.Color3.FromHexString(frameColorHex);
        }
        let color1;
        if (color1Hex !== "") {
            color1 = BABYLON.Color3.FromHexString(color1Hex);
        }
        let color2;
        if (color2Hex !== "") {
            color2 = BABYLON.Color3.FromHexString(color2Hex);
        }
        let color3;
        if (color3Hex !== "") {
            color3 = BABYLON.Color3.FromHexString(color3Hex);
        }
        let vertexDatas = await VertexDataLoader.instance.get(name);
        let colorizedVertexDatas = [];
        for (let d = 0; d < vertexDatas.length; d++) {
            let vertexData = vertexDatas[d];
            let colorizedVertexData = VertexDataLoader.clone(vertexData);
            if (colorizedVertexData.colors) {
                for (let i = 0; i < colorizedVertexData.colors.length / 4; i++) {
                    let r = colorizedVertexData.colors[4 * i];
                    let g = colorizedVertexData.colors[4 * i + 1];
                    let b = colorizedVertexData.colors[4 * i + 2];
                    if (baseColor) {
                        if (r === 1 && g === 1 && b === 1) {
                            colorizedVertexData.colors[4 * i] = baseColor.r;
                            colorizedVertexData.colors[4 * i + 1] = baseColor.g;
                            colorizedVertexData.colors[4 * i + 2] = baseColor.b;
                            continue;
                        }
                    }
                    if (frameColor) {
                        if (r === 0.502 && g === 0.502 && b === 0.502) {
                            colorizedVertexData.colors[4 * i] = frameColor.r;
                            colorizedVertexData.colors[4 * i + 1] = frameColor.g;
                            colorizedVertexData.colors[4 * i + 2] = frameColor.b;
                            continue;
                        }
                    }
                    if (color1) {
                        if (r === 1 && g === 0 && b === 0) {
                            colorizedVertexData.colors[4 * i] = color1.r;
                            colorizedVertexData.colors[4 * i + 1] = color1.g;
                            colorizedVertexData.colors[4 * i + 2] = color1.b;
                            continue;
                        }
                    }
                    if (color2) {
                        if (r === 0 && g === 1 && b === 0) {
                            colorizedVertexData.colors[4 * i] = color2.r;
                            colorizedVertexData.colors[4 * i + 1] = color2.g;
                            colorizedVertexData.colors[4 * i + 2] = color2.b;
                            continue;
                        }
                    }
                    if (color3) {
                        if (r === 0 && g === 0 && b === 1) {
                            colorizedVertexData.colors[4 * i] = color3.r;
                            colorizedVertexData.colors[4 * i + 1] = color3.g;
                            colorizedVertexData.colors[4 * i + 2] = color3.b;
                            continue;
                        }
                    }
                }
            }
            else {
                let colors = [];
                for (let i = 0; i < colorizedVertexData.positions.length / 3; i++) {
                    colors[4 * i] = baseColor.r;
                    colors[4 * i + 1] = baseColor.g;
                    colors[4 * i + 2] = baseColor.b;
                    colors[4 * i + 3] = 1;
                }
                colorizedVertexData.colors = colors;
            }
            colorizedVertexDatas.push(colorizedVertexData);
        }
        return colorizedVertexDatas;
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
class DebugDisplayTextValue extends HTMLElement {
    constructor() {
        super(...arguments);
        this._label = "";
        this._initialized = false;
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
            this._textElement = document.createElement("div");
            this._textElement.style.display = "inline-block";
            this._textElement.style.marginLeft = "5%";
            this._textElement.style.width = "60%";
            this._textElement.style.textAlign = "left";
            this.appendChild(this._textElement);
            this._initialized = true;
            for (let i = 0; i < DebugDisplayTextValue.observedAttributes.length; i++) {
                let name = DebugDisplayTextValue.observedAttributes[i];
                let value = this.getAttribute(name);
                this.attributeChangedCallback(name, value + "_forceupdate", value);
            }
        }
    }
    setText(text) {
        this._textElement.textContent = text;
    }
}
customElements.define("debug-display-text-value", DebugDisplayTextValue);
class DebugDisplayVector3Value extends HTMLElement {
    constructor() {
        super(...arguments);
        this._label = "";
        this._useIJK = false;
        this._decimals = 3;
        this._x = 0;
        this._y = 0;
        this._z = 0;
        this._initialized = false;
    }
    static get observedAttributes() {
        return [
            "label",
            "useIJK",
            "decimals"
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
            if (name === "useIJK") {
                this._useIJK = newValue === "true" ? true : false;
                if (this._useIJK) {
                    this._xLabelElement.textContent = "i";
                    this._yLabelElement.textContent = "j";
                    this._zLabelElement.textContent = "k";
                }
                else {
                    this._xLabelElement.textContent = "x";
                    this._yLabelElement.textContent = "y";
                    this._zLabelElement.textContent = "z";
                }
            }
            if (name === "decimals") {
                let value = parseInt(newValue);
                if (isFinite(value)) {
                    this._decimals = value;
                }
                this.setValue({
                    x: this._x,
                    y: this._y,
                    z: this._z
                });
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
            this._xLabelElement = document.createElement("div");
            this._xLabelElement.style.display = "inline-block";
            this._xLabelElement.style.width = "6%";
            this._xLabelElement.style.marginRight = "2%";
            this._xLabelElement.style.fontSize = "80%";
            this.appendChild(this._xLabelElement);
            this._xElement = document.createElement("div");
            this._xElement.style.display = "inline-block";
            this._xElement.style.textAlign = "left";
            this._xElement.style.width = "13.66%";
            this._xElement.textContent = "10";
            this.appendChild(this._xElement);
            this._yLabelElement = document.createElement("div");
            this._yLabelElement.style.display = "inline-block";
            this._yLabelElement.style.width = "6%";
            this._yLabelElement.style.marginRight = "2%";
            this._yLabelElement.style.fontSize = "80%";
            this.appendChild(this._yLabelElement);
            this._yElement = document.createElement("div");
            this._yElement.style.display = "inline-block";
            this._yElement.style.textAlign = "left";
            this._yElement.style.width = "13.66%";
            this._yElement.textContent = "10";
            this.appendChild(this._yElement);
            this._zLabelElement = document.createElement("div");
            this._zLabelElement.style.display = "inline-block";
            this._zLabelElement.style.width = "6%";
            this._zLabelElement.style.marginRight = "2%";
            this._zLabelElement.style.fontSize = "80%";
            this.appendChild(this._zLabelElement);
            this._zElement = document.createElement("div");
            this._zElement.style.display = "inline-block";
            this._zElement.style.textAlign = "left";
            this._zElement.style.width = "13.66%";
            this._zElement.textContent = "10";
            this.appendChild(this._zElement);
            this._initialized = true;
            for (let i = 0; i < DebugDisplayVector3Value.observedAttributes.length; i++) {
                let name = DebugDisplayVector3Value.observedAttributes[i];
                let value = this.getAttribute(name);
                this.attributeChangedCallback(name, value + "_forceupdate", value);
            }
        }
    }
    setValue(vec3, j, k) {
        if (isFinite(j) && isFinite(k)) {
            this._x = vec3;
            this._y = j;
            this._z = k;
        }
        else {
            this._x = isFinite(vec3.x) ? vec3.x : vec3.i;
            this._y = isFinite(vec3.y) ? vec3.y : vec3.j;
            this._z = isFinite(vec3.z) ? vec3.z : vec3.k;
        }
        this._xElement.innerText = this._x.toFixed(this._decimals);
        this._yElement.innerText = this._y.toFixed(this._decimals);
        this._zElement.innerText = this._z.toFixed(this._decimals);
    }
}
customElements.define("debug-display-vector3-value", DebugDisplayVector3Value);
class DebugDefine {
}
DebugDefine.USE_VERTEX_SET_MESH_HISTORY = true;
class DebugPlanetPerf {
    constructor(game) {
        this.game = game;
        this._initialized = false;
        this._update = () => {
            this._frameRate.addValue(Game.Engine.getFps());
            this._chunckSort.addValue(this.game.chunckManager.chunckSortedRatio * 100);
            this._drawRequestCount.addValue(this.game.chunckManager.needRedrawCount);
            for (let i = 0; i < 6; i++) {
                this._layerCounts[i].setText(this.game.chunckManager.lodLayerCount(i).toFixed(0));
            }
        };
    }
    get initialized() {
        return this._initialized;
    }
    get scene() {
        return this.game.scene;
    }
    initialize() {
        this.container = document.querySelector("#debug-planet-perf");
        this._frameRate = document.querySelector("#frame-rate");
        this._chunckSort = document.querySelector("#chunck-sort");
        this._drawRequestCount = document.querySelector("#draw-request-count");
        this._layerCounts = [];
        for (let i = 0; i < 6; i++) {
            this._layerCounts[i] = document.querySelector("#layer-" + i + "-count");
        }
        this._initialized = true;
    }
    show() {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    hide() {
        this.container.classList.add("hidden");
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
}
class DebugPlanetSkyColor {
    constructor(game) {
        this.game = game;
        this._initialized = false;
    }
    get initialized() {
        return this._initialized;
    }
    initialize() {
        this.container = document.querySelector("#debug-planet-sky-color");
        let planetSky = this.game.planetSky;
        let inputDawnColor = document.querySelector("#planet-sky-dawn-color");
        inputDawnColor.setColor(planetSky.dawnColor);
        inputDawnColor.onInput = (color) => {
            planetSky.dawnColor.copyFrom(color);
        };
        let inputZenithColor = document.querySelector("#planet-sky-zenith-color");
        inputZenithColor.setColor(planetSky.zenithColor);
        inputZenithColor.onInput = (color) => {
            planetSky.zenithColor.copyFrom(color);
        };
        let inputNightColor = document.querySelector("#planet-sky-night-color");
        inputNightColor.setColor(planetSky.nightColor);
        inputNightColor.onInput = (color) => {
            planetSky.nightColor.copyFrom(color);
        };
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
class DebugPlayerPosition {
    constructor(game) {
        this.game = game;
        this._initialized = false;
        this._update = () => {
            let position = this.game.player.position.clone();
            let longitude = -VMath.AngleFromToAround(BABYLON.Axis.Z, position, BABYLON.Axis.Y) / Math.PI * 180;
            let latitude = 0;
            let heading = 0;
            if (position.y * position.y === position.lengthSquared()) {
                latitude = Math.sign(position.y) * 90;
            }
            else {
                let equatorPosition = position.clone();
                equatorPosition.y = 0;
                let axis = BABYLON.Vector3.Cross(position, BABYLON.Axis.Y);
                if (axis.lengthSquared() > 0) {
                    latitude = VMath.AngleFromToAround(equatorPosition, position, axis) / Math.PI * 180;
                }
                let northPole = new BABYLON.Vector3(0, this.game.player.planet.kPosMax * PlanetTools.CHUNCKSIZE, 0);
                let northDir = northPole.subtract(position);
                let dir = this.game.player.forward;
                heading = VMath.AngleFromToAround(northDir, dir, position) / Math.PI * 180;
            }
            this._playerCoordinates.setText("Lat " + latitude.toFixed(0) + "° Lon " + longitude.toFixed(0) + "° Hdg " + heading.toFixed(0) + "°");
            this._playerPosition.setValue(position);
            let planetSide = PlanetTools.WorldPositionToPlanetSide(this.game.player.planet, position);
            let quat = planetSide.rotationQuaternion.clone();
            let localPos = position.clone();
            position.rotateByQuaternionToRef(quat, localPos);
            this._playerLocalPosition.setValue(localPos);
            this._playerSide.setText(SideNames[planetSide.side]);
            let globalIJK = PlanetTools.WorldPositionToGlobalIJK(planetSide, position);
            this._playerGlobalIJK.setValue(globalIJK);
            let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
            let chunck = localIJK.planetChunck;
            if (chunck) {
                this._playerChunck.setValue(chunck.iPos, chunck.jPos, chunck.kPos);
                this._playerLocalIJK.setValue(localIJK);
            }
        };
    }
    get initialized() {
        return this._initialized;
    }
    get scene() {
        return this.game.scene;
    }
    initialize() {
        this.container = document.querySelector("#debug-player-position");
        this._playerCoordinates = document.querySelector("#player-coordinates");
        this._playerPosition = document.querySelector("#player-position");
        this._playerLocalPosition = document.querySelector("#player-local-position");
        this._playerSide = document.querySelector("#player-planet-side");
        this._playerGlobalIJK = document.querySelector("#player-global-ijk");
        this._playerChunck = document.querySelector("#player-chunck");
        this._playerLocalIJK = document.querySelector("#player-local-ijk");
        this._initialized = true;
    }
    show() {
        if (!this.initialized) {
            this.initialize();
        }
        this.container.classList.remove("hidden");
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    hide() {
        this.container.classList.add("hidden");
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
}
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
class Main {
    constructor(canvasElement) {
        this.canvas = document.getElementById(canvasElement);
        Main.Engine = new BABYLON.Engine(this.canvas, true);
        this.engine = Main.Engine;
        BABYLON.Engine.ShadersRepository = "./shaders/";
        console.log(Main.Engine.webGLVersion);
    }
    createScene() {
        Main.Scene = new BABYLON.Scene(Main.Engine);
        this.scene = Main.Scene;
        this.scene.clearColor.copyFromFloats(166 / 255, 231 / 255, 255 / 255, 1);
        this.vertexDataLoader = new VertexDataLoader(this.scene);
    }
    animate() {
        Main.Engine.runRenderLoop(() => {
            this.scene.render();
            this.update();
        });
        window.addEventListener("resize", () => {
            Main.Engine.resize();
        });
    }
    async initialize() {
    }
    update() {
    }
}
window.addEventListener("DOMContentLoaded", () => {
    console.log("DOMContentLoaded " + window.location.href);
    if (window.location.href.indexOf("planet-toy.html") != -1) {
        let planetToy = new PlanetToy("renderCanvas");
        planetToy.createScene();
        planetToy.initialize().then(() => {
            planetToy.animate();
        });
    }
    else if (window.location.href.indexOf("miniature.html") != -1) {
        let miniature = new Miniature("renderCanvas");
        miniature.createScene();
        miniature.initialize().then(() => {
            miniature.animate();
        });
    }
    else if (window.location.href.indexOf("demo.html") != -1) {
        let demo = new Demo("renderCanvas");
        demo.createScene();
        demo.initialize().then(() => {
            demo.animate();
        });
    }
    else {
        let game = new Game("renderCanvas");
        game.createScene();
        game.initialize().then(() => {
            game.animate();
        });
    }
});
/// <reference path="../../lib/babylon.d.ts"/>
/// <reference path="Main.ts"/>
class Demo extends Main {
    constructor(canvasElement) {
        super(canvasElement);
    }
    createScene() {
        super.createScene();
        this.light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.6, 1, 0.3), this.scene);
        this.light.diffuse = new BABYLON.Color3(1, 1, 1);
        this.light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        this.camera = new BABYLON.ArcRotateCamera("camera", 0, Math.PI / 4, 10, BABYLON.Vector3.Zero());
        this.camera.radius = 400;
        this.camera.speed *= 0.2;
        this.camera.attachControl(this.canvas);
    }
    async initialize() {
        return new Promise(resolve => {
            this.chunckManager = new PlanetChunckManager(this.scene);
            let kPosMax = 10;
            console.log("degree = " + PlanetTools.KPosToDegree(kPosMax));
            let planetTest = new Planet("Paulita", kPosMax, this.chunckManager);
            window["PlanetTest"] = planetTest;
            planetTest.generator = new PlanetGeneratorEarth(planetTest, 0.60, 0.1);
            this.planetSky = new PlanetSky();
            this.planetSky.setInvertLightDir((new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
            this.planetSky.initialize(this.scene);
            let debugPlanetPerf = new DebugPlanetPerf(this);
            debugPlanetPerf.show();
            PlanetChunckVertexData.InitializeData().then(() => {
                this.chunckManager.initialize();
                setTimeout(() => {
                    planetTest.register();
                }, 1000);
                resolve();
            });
        });
    }
    update() {
        //let dt = this.engine.getDeltaTime() / 1000;
        //this.camera.alpha += dt * 2 * Math.PI / 120;
    }
}
/// <reference path="../../lib/babylon.d.ts"/>
/// <reference path="Main.ts"/>
var InputMode;
(function (InputMode) {
    InputMode[InputMode["Unknown"] = 0] = "Unknown";
    InputMode[InputMode["Mouse"] = 1] = "Mouse";
    InputMode[InputMode["Touch"] = 2] = "Touch";
})(InputMode || (InputMode = {}));
class Game extends Main {
    constructor(canvasElement) {
        super(canvasElement);
        this.inputMode = InputMode.Unknown;
        Game.Instance = this;
    }
    createScene() {
        super.createScene();
        Game.Light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.6, 1, 0.3), this.scene);
        Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
        Game.Light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        Game.CameraManager = new CameraManager(this);
    }
    async initialize() {
        return new Promise(resolve => {
            this.chunckManager = new PlanetChunckManager(this.scene);
            let kPosMax = 10;
            let planetTest = new Planet("Paulita", kPosMax, this.chunckManager);
            window["PlanetTest"] = planetTest;
            planetTest.generator = new PlanetGeneratorChaos(planetTest, 0.60, 0.2);
            //planetTest.generator = new PlanetGeneratorFlat(planetTest, 0.60, 0.1);
            //planetTest.generator = new PlanetGeneratorDebug4(planetTest);
            let r = kPosMax * PlanetTools.CHUNCKSIZE * 0.7;
            //document.querySelector("#planet-surface").textContent = (4 * Math.PI * r * r / 1000 / 1000).toFixed(2) + " km²"
            //planetTest.generator.showDebug();
            Game.Player = new Player(new BABYLON.Vector3(0, (kPosMax + 1) * PlanetTools.CHUNCKSIZE * 0.8, 0), planetTest, this);
            this.player = Game.Player;
            this.inputManager = new InputManager();
            this.inputManager.initialize();
            this.actionManager = new PlayerActionManager(this.player, this);
            this.actionManager.initialize();
            let ass = async () => {
                let slotIndex = 1;
                for (let i = 1; i < BlockType.Unknown; i++) {
                    this.actionManager.linkAction(await PlayerActionTemplate.CreateBlockAction(this.player, i), slotIndex);
                    slotIndex++;
                }
            };
            ass();
            this.player.registerControl();
            Game.PlanetEditor = new PlanetEditor(planetTest);
            //Game.PlanetEditor.initialize();
            //Game.Plane = new Plane(new BABYLON.Vector3(0, 80, 0), planetTest);
            //Game.Plane.instantiate();
            //Game.CameraManager.plane = Game.Plane;
            Game.CameraManager.player = this.player;
            Game.CameraManager.setMode(CameraMode.Player);
            //planetTest.AsyncInitialize();
            this.planetSky = new PlanetSky();
            this.planetSky.setInvertLightDir((new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
            this.planetSky.initialize(this.scene);
            PlanetChunckVertexData.InitializeData().then(() => {
                this.chunckManager.initialize();
                planetTest.register();
                this.player.initialize();
                let debugPlanetPerf = new DebugPlanetPerf(this);
                debugPlanetPerf.show();
                //let debugPlanetSkyColor = new DebugPlanetSkyColor(this);
                //debugPlanetSkyColor.show();
                //let debugTerrainColor = new DebugTerrainColor();
                //debugTerrainColor.show();
                let debugPlayerPosition = new DebugPlayerPosition(this);
                debugPlayerPosition.show();
                resolve();
            });
            this.canvas.addEventListener("pointerup", (event) => {
                if (Game.CameraManager.cameraMode === CameraMode.Sky) {
                    return;
                }
                if (event["pointerType"] === "mouse") {
                    this.setInputMode(InputMode.Mouse);
                    if (!Game.LockedMouse) {
                        Game.LockMouse(event);
                    }
                }
            });
            this.canvas.addEventListener("touchstart", (event) => {
                this.setInputMode(InputMode.Touch);
            });
            document.addEventListener("mousemove", (event) => {
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
    }
    update() {
    }
    setInputMode(newInputMode) {
        if (newInputMode != this.inputMode) {
            this.inputMode = newInputMode;
            if (this.inputMode === InputMode.Touch) {
                this.movePad = new PlayerInputMovePad(this.player);
                this.movePad.connectInput(true);
                this.headPad = new PlayerInputHeadPad(this.player);
                this.headPad.connectInput(false);
                this.actionButton = new PlayerInputVirtualButton(this.player);
                this.actionButton.connectInput(() => {
                    if (this.player.currentAction) {
                        if (this.player.currentAction.onClick) {
                            this.player.currentAction.onClick();
                        }
                    }
                });
            }
            else {
                if (this.movePad) {
                    this.movePad.disconnect();
                }
                if (this.headPad) {
                    this.headPad.disconnect();
                }
            }
            return;
        }
    }
    static LockMouse(event) {
        if (Game.LockedMouse) {
            console.log("No need to lock.");
            return;
        }
        Game.Instance.canvas.requestPointerLock =
            Game.Instance.canvas.requestPointerLock ||
                Game.Instance.canvas.msRequestPointerLock ||
                Game.Instance.canvas.mozRequestPointerLock ||
                Game.Instance.canvas.webkitRequestPointerLock;
        if (Game.Instance.canvas.requestPointerLock) {
            Game.Instance.canvas.requestPointerLock();
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
/// <reference path="Main.ts"/>
class Miniature extends Main {
    constructor() {
        super(...arguments);
        this.targets = [];
    }
    updateCameraPosition(useSizeMarker = false) {
        if (this.camera instanceof BABYLON.ArcRotateCamera) {
            this.camera.lowerRadiusLimit = 0.01;
            this.camera.upperRadiusLimit = 1000;
            let size = 0;
            this.targets.forEach(t => {
                let bbox = t.getBoundingInfo();
                size = Math.max(size, bbox.maximum.x - bbox.minimum.x);
                size = Math.max(size, bbox.maximum.y - bbox.minimum.y);
                size = Math.max(size, bbox.maximum.z - bbox.minimum.z);
            });
            if (useSizeMarker) {
                size += 1.5;
            }
            let bbox = this.targets[0].getBoundingInfo();
            this.camera.target.copyFrom(bbox.maximum).addInPlace(bbox.minimum).scaleInPlace(0.5);
            let cameraPosition = (new BABYLON.Vector3(-1, 0.6, 0.8)).normalize();
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
    async initialize() {
        super.initialize();
        this.camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, BABYLON.Vector3.Zero());
        this.camera.wheelPrecision *= 10;
        this.sizeMarkerMaterial = new BABYLON.StandardMaterial("size-marker-material", Main.Scene);
        this.sizeMarkerMaterial.specularColor.copyFromFloats(0, 0, 0);
        this.sizeMarkerMaterial.diffuseColor.copyFromFloats(0, 0, 0);
        Main.Scene.clearColor.copyFromFloats(0, 0, 0, 0);
        setTimeout(async () => {
            for (let i = BlockType.Grass; i < BlockType.Unknown; i++) {
                await this.createBlock(i);
            }
        }, 100);
    }
    async createBlock(blockType) {
        let vertexData = (await this.vertexDataLoader.get("chunck-part"))[0];
        let colors = [];
        let uvs = [];
        for (let i = 0; i < vertexData.positions.length / 3; i++) {
            colors[4 * i] = 1;
            colors[4 * i + 1] = 1;
            colors[4 * i + 2] = 1;
            colors[4 * i + 3] = blockType / 128;
            uvs[2 * i] = blockType / 128;
            uvs[2 * i + 1] = blockType / 128;
        }
        vertexData.colors = colors;
        vertexData.uvs = uvs;
        let block = BABYLON.MeshBuilder.CreateBox("block");
        vertexData.applyToMesh(block);
        block.material = SharedMaterials.MainMaterial();
        this.targets = [block];
        return new Promise(resolve => {
            setTimeout(() => {
                this.updateCameraPosition();
                setTimeout(async () => {
                    await this.makeScreenShot("block-icon-" + BlockTypeNames[blockType], false);
                    block.dispose();
                    resolve();
                }, 200);
            }, 200);
        });
    }
    async makeScreenShot(miniatureName, desaturate = true) {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                BABYLON.ScreenshotTools.CreateScreenshot(Main.Engine, this.camera, {
                    width: 256 * this.canvas.width / this.canvas.height,
                    height: 256
                }, (data) => {
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
                        var tmpLink = document.createElement('a');
                        let name = "Unknown";
                        if (miniatureName) {
                            name = miniatureName;
                        }
                        tmpLink.download = name + "-miniature.png";
                        tmpLink.href = canvas.toDataURL();
                        document.body.appendChild(tmpLink);
                        tmpLink.click();
                        document.body.removeChild(tmpLink);
                        resolve();
                    };
                });
            });
        });
    }
}
/// <reference path="../../lib/babylon.d.ts"/>
/// <reference path="Main.ts"/>
class PlanetToy extends Main {
    constructor() {
        super(...arguments);
        this.periodPlanet = 7 * 1.5;
        this._tPlanet = 0;
        this.periodCamera = 11 * 1.5;
        this._tCamera = 0;
    }
    createScene() {
        super.createScene();
        let light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.6, 1, 0.3), this.scene);
        light.diffuse = new BABYLON.Color3(1, 1, 1);
        light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        this.camera = new BABYLON.ArcRotateCamera("camera", 0, 0, 10, BABYLON.Vector3.Zero(), this.scene);
        this.camera.radius = 50;
        this.camera.attachControl(this.canvas);
        this.scene.clearColor.copyFromFloats(0, 0, 0, 1);
    }
    async initialize() {
        return new Promise(resolve => {
            let core = BABYLON.MeshBuilder.CreateSphere("core", { diameter: 19.5 }, this.scene);
            let blackMat = new BABYLON.StandardMaterial("black", this.scene);
            blackMat.diffuseColor = BABYLON.Color3.Black();
            blackMat.specularColor = BABYLON.Color3.Black();
            core.material = blackMat;
            /*
            let XMesh = BABYLON.MeshBuilder.CreateLines(
                "XAxis",
                {
                    points: [new BABYLON.Vector3(1, 0, 0), new BABYLON.Vector3(14, 0, 0), new BABYLON.Vector3(14, 0, 1), new BABYLON.Vector3(15, 0, 0), new BABYLON.Vector3(14, 0, - 1)]
                }
            )
            let ZMesh = BABYLON.MeshBuilder.CreateLines(
                "ZAxis",
                {
                    points: [new BABYLON.Vector3(0, 0, 1), new BABYLON.Vector3(0, 0, 14), new BABYLON.Vector3(1, 0, 14), new BABYLON.Vector3(0, 0, 15), new BABYLON.Vector3(-1, 0, 14)]
                }
            )
            let YMesh = BABYLON.MeshBuilder.CreateLines(
                "YAxis",
                {
                    points: [new BABYLON.Vector3(0, -100, 0), new BABYLON.Vector3(0, 100, 0)]
                }
            )
            */
            let vertices = [];
            let n = 16;
            for (let i = 0; i <= n; i++) {
                vertices[i] = [];
                for (let j = 0; j <= n; j++) {
                    vertices[i][j] = PlanetTools.EvaluateVertex(n, i, j);
                }
            }
            let lines = [];
            let colors = [];
            for (let i = 1; i < n - 1; i++) {
                for (let j = 1; j < n - 1; j++) {
                    let v0 = vertices[i][j].clone();
                    let v1 = vertices[i + 1][j].clone();
                    let v2 = vertices[i + 1][j + 1].clone();
                    let v3 = vertices[i][j + 1].clone();
                    let center = v0.add(v1).add(v2).add(v3).scale(0.25).scale(0.2);
                    let h = Math.floor(Math.random() * 5) * 0.2;
                    v0.scaleInPlace(0.8).addInPlace(center).scaleInPlace(10 + h);
                    v1.scaleInPlace(0.8).addInPlace(center).scaleInPlace(10 + h);
                    v2.scaleInPlace(0.8).addInPlace(center).scaleInPlace(10 + h);
                    v3.scaleInPlace(0.8).addInPlace(center).scaleInPlace(10 + h);
                    lines.push([v0, v1, v2, v3, v0]);
                    let d = i + j;
                    let r = 1;
                    let g = 1;
                    let b = 1;
                    if (d <= n - 1) {
                        g = d / n;
                    }
                    else if (d > n - 1) {
                        r = 1 - (d - n) / n;
                    }
                    let c = new BABYLON.Color4(r, g, b, 1);
                    colors.push([c, c, c, c, c]);
                }
            }
            this.planet = new BABYLON.Mesh("planet", this.scene);
            for (let i = 0; i < 6; i++) {
                let face = BABYLON.MeshBuilder.CreateLineSystem("Top", {
                    lines: lines,
                    colors: colors
                }, this.scene);
                face.rotationQuaternion = PlanetTools.QuaternionForSide(i);
                face.parent = this.planet;
            }
            resolve();
        });
    }
    update() {
        this._tPlanet += this.engine.getDeltaTime() / 1000;
        if (this._tPlanet > this.periodPlanet) {
            this._tPlanet -= this.periodPlanet;
        }
        this.planet.rotation.y = Math.PI * 2 * (this._tPlanet / this.periodPlanet);
        this._tCamera += this.engine.getDeltaTime() / 1000;
        if (this._tCamera > this.periodCamera) {
            this._tCamera -= this.periodCamera;
        }
        this.camera.beta = Math.PI / 2 + Math.PI / 6 * Math.sin(this._tCamera / this.periodCamera * 2 * Math.PI);
    }
}
class AbstractPlanetChunck {
    constructor(iPos, jPos, kPos, planetSide, parentGroup) {
        this.iPos = iPos;
        this.jPos = jPos;
        this.kPos = kPos;
        this.planetSide = planetSide;
        this.parentGroup = parentGroup;
        this._degree = 0;
        this._chunckCount = 0;
        this._size = 0;
        this._registered = false;
        this.lod = NaN;
    }
    get scene() {
        return this.planetSide.getScene();
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
    get planetName() {
        return this.planetSide.GetPlanetName();
    }
    get kPosMax() {
        return this.planetSide.kPosMax;
    }
    get registered() {
        return this._registered;
    }
    get barycenter() {
        return this._barycenter;
    }
    get normal() {
        return this._normal;
    }
    register() {
        if (!this.registered) {
            this._registered = this.chunckManager.registerChunck(this);
        }
    }
    unregister() {
        if (this.registered) {
            this.chunckManager.unregister(this);
            this._registered = false;
        }
    }
    canCollapse() {
        if (this.parentGroup) {
            let siblings = this.parentGroup.children;
            let level = 0;
            if (this instanceof PlanetChunckGroup) {
                level = this.level;
            }
            for (let i = 0; i < siblings.length; i++) {
                let sib = siblings[i];
                if (sib.lod - 1 <= level) {
                    return false;
                }
            }
        }
        return true;
    }
}
var BlockTypeNames = [
    "None",
    "Grass",
    "Dirt",
    "Sand",
    "Rock",
    "Wood",
    "Leaf",
    "Unknown"
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
    BlockType[BlockType["Unknown"] = 7] = "Unknown";
})(BlockType || (BlockType = {}));
class Planet extends BABYLON.Mesh {
    constructor(name, kPosMax, chunckManager) {
        super(name, Game.Scene);
        this.chunckManager = chunckManager;
        Planet.DEBUG_INSTANCE = this;
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
class PlanetBlockMaker {
    static AddSphere(planet, world, radius, block) {
        let impactedChunck = [];
        for (let x = -radius; x < radius + 0.7; x += 0.7) {
            for (let y = -radius; y < radius + 0.7; y += 0.7) {
                for (let z = -radius; z < radius + 0.7; z += 0.7) {
                    x = Math.min(x, radius);
                    y = Math.min(y, radius);
                    z = Math.min(z, radius);
                    if (x * x + y * y + z * z < radius * radius) {
                        let p = new BABYLON.Vector3(world.x + x, world.y + y, world.z + z);
                        let planetSide = PlanetTools.WorldPositionToPlanetSide(planet, p);
                        let globalIJK = PlanetTools.WorldPositionToGlobalIJK(planetSide, p);
                        let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
                        let chunck = localIJK.planetChunck;
                        if (chunck) {
                            chunck.SetData(localIJK.i, localIJK.j, localIJK.k, block, true);
                            if (impactedChunck.indexOf(chunck) === -1) {
                                impactedChunck.push(chunck);
                            }
                        }
                    }
                }
            }
        }
        return impactedChunck;
    }
    static AddLine(planet, from, to, block) {
        let impactedChunck = [];
        let o = from.clone();
        let l = BABYLON.Vector3.Distance(from, to);
        let count = Math.round(l / 0.7);
        for (let i = 0; i <= count; i++) {
            let x = from.x + (to.x - from.x) * i / count;
            let y = from.y + (to.y - from.y) * i / count;
            let z = from.z + (to.z - from.z) * i / count;
            let p = new BABYLON.Vector3(x, y, z);
            let planetSide = PlanetTools.WorldPositionToPlanetSide(planet, p);
            let globalIJK = PlanetTools.WorldPositionToGlobalIJK(planetSide, p);
            let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
            let chunck = localIJK.planetChunck;
            if (chunck) {
                chunck.SetData(localIJK.i, localIJK.j, localIJK.k, block, true);
                if (impactedChunck.indexOf(chunck) === -1) {
                    impactedChunck.push(chunck);
                }
            }
        }
        return impactedChunck;
    }
}
/// <reference path="AbstractPlanetChunck.ts"/>
var Neighbour;
(function (Neighbour) {
    Neighbour[Neighbour["IPlus"] = 0] = "IPlus";
    Neighbour[Neighbour["JPlus"] = 1] = "JPlus";
    Neighbour[Neighbour["KPlus"] = 2] = "KPlus";
    Neighbour[Neighbour["IMinus"] = 3] = "IMinus";
    Neighbour[Neighbour["JMinus"] = 4] = "JMinus";
    Neighbour[Neighbour["KMinus"] = 5] = "KMinus";
})(Neighbour || (Neighbour = {}));
class PlanetChunck extends AbstractPlanetChunck {
    constructor(iPos, jPos, kPos, planetSide, parentGroup) {
        super(iPos, jPos, kPos, planetSide, parentGroup);
        this._dataInitialized = false;
        this._adjacentsDataSynced = false;
        this._proceduralItemsGenerated = false;
        this._isEmpty = true;
        this._isFull = false;
        this._isDirty = false;
        this._setMeshHistory = [];
        this._debugSyncCount = 0;
        this._degree = PlanetTools.KPosToDegree(this.kPos);
        this._size = PlanetTools.DegreeToSize(this.degree);
        this._chunckCount = PlanetTools.DegreeToChuncksCount(this.degree);
        this.name = "chunck:" + this.side + ":" + this.iPos + "-" + this.jPos + "-" + this.kPos;
        this._barycenter = PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0.5), PlanetTools.CHUNCKSIZE * (this.jPos + 0.5)).scale(PlanetTools.KGlobalToAltitude((this.kPos + 0.5) * PlanetTools.CHUNCKSIZE));
        this._barycenter = BABYLON.Vector3.TransformCoordinates(this._barycenter, planetSide.computeWorldMatrix(true));
        this._normal = BABYLON.Vector3.Normalize(this.barycenter);
        if (this.kPos === 0) {
            this.bedrock = new BABYLON.Mesh(this.name + "-bedrock", this.scene);
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
        this._firstI = 0;
        this._firstJ = 0;
        this._lastJ = PlanetTools.CHUNCKSIZE;
        this._firstK = 0;
        if (this.side === Side.Top || this.side === Side.Bottom) {
            if (this.iPos === 0) {
                this._firstI = -1;
            }
            if (this.jPos === 0) {
                this._firstJ = -1;
            }
        }
        if (this.side <= Side.Left) {
            if (this.jPos === this.chunckCount - 1) {
                this._lastJ = PlanetTools.CHUNCKSIZE - 1;
            }
        }
        if (this.isDegreeLayerBottom) {
            this._firstK = -1;
        }
    }
    Position() {
        return {
            i: this.iPos,
            j: this.jPos,
            k: this.kPos,
        };
    }
    findAdjacents() {
        this._adjacents = [];
        this.adjacentsAsArray = [];
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                for (let dk = -1; dk <= 1; dk++) {
                    if (di != 0 || dj != 0 || dk != 0) {
                        if (!this._adjacents[1 + di]) {
                            this._adjacents[1 + di] = [];
                        }
                        if (!this._adjacents[1 + di][1 + dj]) {
                            this._adjacents[1 + di][1 + dj] = [];
                        }
                        if (!this._adjacents[1 + di][1 + dj][1 + dk]) {
                            let n = this.planetSide.getChunck(this.iPos + di, this.jPos + dj, this.kPos + dk, this.degree);
                            if (n instanceof PlanetChunck) {
                                this._adjacents[1 + di][1 + dj][1 + dk] = [n];
                                this.adjacentsAsArray.push(n);
                            }
                            else if (n instanceof Array) {
                                this._adjacents[1 + di][1 + dj][1 + dk] = n;
                                this.adjacentsAsArray.push(...n);
                            }
                        }
                    }
                }
            }
        }
    }
    get dataInitialized() {
        return this._dataInitialized;
    }
    get dataNeighbourSynced() {
        return this._adjacentsDataSynced;
    }
    get firstI() {
        return this._firstI;
    }
    get firstJ() {
        return this._firstJ;
    }
    get lastJ() {
        return this._lastJ;
    }
    get firstK() {
        return this._firstK;
    }
    get proceduralItemsGenerated() {
        return this._proceduralItemsGenerated;
    }
    GetData(i, j, k) {
        if (!this.dataInitialized) {
            this.initializeData();
        }
        if (i >= this.firstI && i <= PlanetTools.CHUNCKSIZE) {
            if (j >= this.firstJ && j <= this.lastJ) {
                if (k >= this.firstK && k <= PlanetTools.CHUNCKSIZE) {
                    return this.data[i - this.firstI][j - this.firstJ][k - this.firstK];
                }
            }
        }
        return this.GetDataGlobal(this.iPos * PlanetTools.CHUNCKSIZE + i, this.jPos * PlanetTools.CHUNCKSIZE + j, this.kPos * PlanetTools.CHUNCKSIZE + k);
    }
    GetDataNice(i, j, k) {
        if (!this.dataInitialized) {
            this.initializeData();
        }
        if (i >= 0 && i < PlanetTools.CHUNCKSIZE) {
            if (j >= 0 && j < PlanetTools.CHUNCKSIZE) {
                if (k >= 0 && k < PlanetTools.CHUNCKSIZE) {
                    return this.data[i - this.firstI][j - this.firstJ][k - this.firstK];
                }
            }
        }
        return BlockType.None;
    }
    GetDataGlobal(iGlobal, jGlobal, kGlobal) {
        return this.planetSide.GetData(iGlobal, jGlobal, kGlobal, this.degree);
    }
    SetData(i, j, k, value, noDataSafety = false) {
        if (!this.dataInitialized) {
            this.initializeData();
        }
        if (!this.dataNeighbourSynced) {
            this.syncWithAdjacents();
        }
        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = value;
        if (noDataSafety) {
            return;
        }
        this.doDataSafety();
    }
    doDataSafety() {
        this.updateIsEmptyIsFull();
        this.adjacentsAsArray.forEach(adj => {
            if (adj.syncWithAdjacents()) {
                if (adj.lod <= 1) {
                    adj.chunckManager.requestDraw(adj, adj.lod, "PlanetChunck.doDataSafety");
                }
            }
        });
        this.register();
    }
    get isEmpty() {
        return this._isEmpty;
    }
    get isFull() {
        return this._isFull;
    }
    get isDirty() {
        return this._isDirty;
    }
    isMeshDrawn() {
        return this.mesh && !this.mesh.isDisposed();
    }
    isMeshDisposed() {
        return !this.mesh || this.mesh.isDisposed();
    }
    static CreateChunck(iPos, jPos, kPos, planetSide, parentGroup) {
        if (kPos < planetSide.kPosMax - 1) {
            let degree = PlanetTools.KPosToDegree(kPos);
            let chunckCount = PlanetTools.DegreeToChuncksCount(degree);
            if (planetSide.side <= Side.Left || iPos > 0 && iPos < chunckCount - 1) {
                if (jPos > 0 && jPos < chunckCount - 1) {
                    let degreeBellow = PlanetTools.KPosToDegree(kPos - 1);
                    if (degreeBellow === degree) {
                        let degreeAbove = PlanetTools.KPosToDegree(kPos + 1);
                        if (degreeAbove === degree) {
                            PlanetChunck._DEBUG_NICE_CHUNCK_COUNT++;
                            return new PlanetChunckNice(iPos, jPos, kPos, planetSide, parentGroup);
                        }
                        else {
                            PlanetChunck._DEBUG_NICE_CHUNCK_COUNT++;
                            return new PlanetChunckSemiNice(iPos, jPos, kPos, planetSide, parentGroup);
                        }
                    }
                }
            }
        }
        PlanetChunck._DEBUG_CHUNCK_COUNT++;
        return new PlanetChunck(iPos, jPos, kPos, planetSide, parentGroup);
    }
    initialize() {
        this.initializeData();
        this.initializeMesh();
    }
    initializeData() {
        if (!this.dataInitialized) {
            this.data = [];
            this.proceduralItems = [];
            this.planetSide.planet.generator.makeData(this, this.data, this.proceduralItems);
            for (let i = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
                if (!this.data[i - this.firstI]) {
                    this.data[i - this.firstI] = [];
                }
                for (let j = this.firstJ; j <= this.lastJ; j++) {
                    if (!this.data[i - this.firstI][j - this.firstJ]) {
                        this.data[i - this.firstI][j - this.firstJ] = [];
                    }
                    for (let k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                        if (!this.data[i - this.firstI][j - this.firstJ][k - this.firstK]) {
                            this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = BlockType.None;
                        }
                    }
                }
            }
            this._dataInitialized = true;
            this.updateIsEmptyIsFull();
        }
    }
    collapse() {
        if (this.canCollapse()) {
            if (this.parentGroup) {
                this.parentGroup.collapseChildren();
            }
        }
    }
    _syncStep(i, j, k) {
        let r = false;
        let d = this.GetDataGlobal(this.iPos * PlanetTools.CHUNCKSIZE + i, this.jPos * PlanetTools.CHUNCKSIZE + j, this.kPos * PlanetTools.CHUNCKSIZE + k);
        if (this.data[i - this.firstI][j - this.firstJ][k - this.firstK] != d) {
            r = true;
        }
        this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
        return r;
    }
    syncWithAdjacents() {
        let hasUpdated = false;
        if (!this.dataInitialized) {
            console.log("cancel sync");
            return hasUpdated;
        }
        this._adjacentsDataSynced = true;
        this.findAdjacents();
        this._debugSyncCount++;
        PlanetChunck._GLOBAL_DEBUG_SYNC_COUNT++;
        //console.log(this._debugSyncCount + " " + PlanetChunck._GLOBAL_DEBUG_SYNC_COUNT);
        let i = 0;
        let j = 0;
        let k = 0;
        for (i = this.firstI; i < 0; i++) {
            for (j = this.firstJ; j <= this.lastJ; j++) {
                for (k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                    hasUpdated = this._syncStep(i, j, k) || hasUpdated;
                }
            }
        }
        for (j = this.firstJ; j <= this.lastJ; j++) {
            for (k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                hasUpdated = this._syncStep(PlanetTools.CHUNCKSIZE, j, k) || hasUpdated;
            }
        }
        for (j = this.firstJ; j < 0; j++) {
            for (i = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
                for (k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                    hasUpdated = this._syncStep(i, j, k) || hasUpdated;
                }
            }
        }
        if (this._lastJ === PlanetTools.CHUNCKSIZE) {
            for (i = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
                for (k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                    hasUpdated = this._syncStep(i, PlanetTools.CHUNCKSIZE, k) || hasUpdated;
                }
            }
        }
        for (k = this.firstK; k < 0; k++) {
            for (i = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
                for (j = this.firstJ; j <= this.lastJ; j++) {
                    hasUpdated = this._syncStep(i, j, k) || hasUpdated;
                }
            }
        }
        for (i = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
            for (j = this.firstJ; j <= this.lastJ; j++) {
                hasUpdated = this._syncStep(i, j, PlanetTools.CHUNCKSIZE) || hasUpdated;
            }
        }
        if (this.side <= Side.Left && this.isCorner) {
            if (this.jPos === 0) {
                j = 0;
                if (this.iPos === 0) {
                    i = 0;
                    let d = this.GetDataGlobal(0, -1, this.kPos * PlanetTools.CHUNCKSIZE + k);
                    if (this.data[i - this.firstI][j - this.firstJ][k - this.firstK] != d) {
                        hasUpdated = true;
                    }
                    this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
                }
                if (this.iPos === this.chunckCount - 1) {
                    i = PlanetTools.CHUNCKSIZE - 1;
                    let d = this.GetDataGlobal(this.iPos * PlanetTools.CHUNCKSIZE + i, -1, this.kPos * PlanetTools.CHUNCKSIZE + k);
                    if (this.data[i - this.firstI][j - this.firstJ][k - this.firstK] != d) {
                        hasUpdated = true;
                    }
                    this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
                }
            }
            if (this.jPos === this.chunckCount - 1) {
                j = PlanetTools.CHUNCKSIZE - 1;
                if (this.iPos === 0) {
                    i = 0;
                    let d = this.GetDataGlobal(0, (this.jPos + 1) * PlanetTools.CHUNCKSIZE, this.kPos * PlanetTools.CHUNCKSIZE + k);
                    if (this.data[i - this.firstI][j - this.firstJ][k - this.firstK] != d) {
                        hasUpdated = true;
                    }
                    this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
                }
                if (this.iPos === this.chunckCount - 1) {
                    i = PlanetTools.CHUNCKSIZE - 1;
                    let d = this.GetDataGlobal(this.iPos * PlanetTools.CHUNCKSIZE + i, (this.jPos + 1) * PlanetTools.CHUNCKSIZE, this.kPos * PlanetTools.CHUNCKSIZE + k);
                    if (this.data[i - this.firstI][j - this.firstJ][k - this.firstK] != d) {
                        hasUpdated = true;
                    }
                    this.data[i - this.firstI][j - this.firstJ][k - this.firstK] = d;
                }
            }
        }
        this.updateIsEmptyIsFull();
        this.register();
        return hasUpdated;
    }
    initializeMesh() {
        if (this.dataInitialized) {
            this.SetMesh();
        }
    }
    updateIsEmptyIsFull() {
        this._isEmpty = true;
        this._isFull = true;
        for (let i = this.firstI; i <= PlanetTools.CHUNCKSIZE; i++) {
            for (let j = this.firstJ; j <= this.lastJ; j++) {
                for (let k = this.firstK; k <= PlanetTools.CHUNCKSIZE; k++) {
                    let block = this.data[i - this.firstI][j - this.firstJ][k - this.firstK] > 0;
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
        if (!this.dataInitialized) {
            this.initializeData();
        }
        if (!this.dataNeighbourSynced) {
            this.syncWithAdjacents();
        }
        return this.isEmpty || this.isFull;
    }
    SetMesh() {
        if (this.isEmptyOrHidden()) {
            return;
        }
        if (!this._adjacentsDataSynced) {
            this.syncWithAdjacents();
        }
        if (!this.proceduralItemsGenerated) {
            this._proceduralItemsGenerated = true;
            for (let i = 0; i < this.proceduralItems.length; i++) {
                this.proceduralItems[i].generateData();
            }
        }
        if (this.isMeshDisposed()) {
            this.mesh = new BABYLON.Mesh("chunck-" + this.iPos + "-" + this.jPos + "-" + this.kPos, this.scene);
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
        if (DebugDefine.USE_VERTEX_SET_MESH_HISTORY) {
            this._setMeshHistory.push(performance.now());
        }
    }
    highlight() {
        if (this.mesh) {
            this.mesh.material = SharedMaterials.HighlightChunckMaterial();
        }
    }
    unlit() {
        if (this.mesh) {
            this.mesh.material = SharedMaterials.MainMaterial();
        }
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
    debugTextInfo() {
        let textInfo = [];
        textInfo[0] = this.name + ". degree=" + this.degree + ". adjacentsCount=" + this.adjacentsAsArray.length + ".";
        if (DebugDefine.USE_VERTEX_SET_MESH_HISTORY) {
            for (let i = 0; i < this._setMeshHistory.length; i++) {
                textInfo.push(this._setMeshHistory[i].toFixed(0));
            }
        }
        return textInfo;
    }
}
PlanetChunck._DEBUG_NICE_CHUNCK_COUNT = 0;
PlanetChunck._DEBUG_CHUNCK_COUNT = 0;
PlanetChunck._GLOBAL_DEBUG_SYNC_COUNT = 0;
class PlanetChunckGroup extends AbstractPlanetChunck {
    constructor(iPos, jPos, kPos, planetSide, parentGroup, degree, level) {
        super(iPos, jPos, kPos, planetSide, parentGroup);
        this.level = level;
        this.children = [];
        this.lines = [];
        this._subdivisionsCount = 0;
        this._subdivisionsSkipedCount = 0;
        this._subdivided = false;
        this.name = "group:" + this.side + ":" + this.iPos + "-" + this.jPos + "-" + this.kPos + ":" + this.level;
        this._degree = degree;
        this._size = PlanetTools.DegreeToSize(this.degree);
        this._chunckCount = PlanetTools.DegreeToChuncksCount(this.degree);
        this.kOffset = PlanetTools.DegreeToKOffset(this.degree);
        this.kOffsetNext = PlanetTools.DegreeToKOffset(this.degree + 1);
        let levelCoef = Math.pow(2, level);
        this._barycenter = PlanetTools.EvaluateVertex(this.size, PlanetTools.CHUNCKSIZE * (this.iPos + 0.5) * levelCoef, PlanetTools.CHUNCKSIZE * (this.jPos + 0.5) * levelCoef).scale(PlanetTools.KGlobalToAltitude((this.kOffset + (this.kPos + 0.5) * levelCoef) * PlanetTools.CHUNCKSIZE));
        this._barycenter = BABYLON.Vector3.TransformCoordinates(this._barycenter, planetSide.computeWorldMatrix(true));
        /*
        if (this.degree === 4) {
            this.mesh = BABYLON.MeshBuilder.CreateBox(this.name);
        }
        else  if (this.degree === 5) {
            this.mesh = BABYLON.MeshBuilder.CreateSphere(this.name);
        }
        else if (this.degree === 6) {
            this.mesh = BABYLON.MeshBuilder.CreateBox(this.name, { width: 0.5, height: 2, depth: 0.5 });
        }
        else  if (this.degree === 7) {
            this.mesh = BABYLON.MeshBuilder.CreateSphere(this.name, { diameterY: 0.5, diameterX: 2, diameterZ: 0.2 });
        }
        else {
            this.mesh = BABYLON.MeshBuilder.CreateBox(this.name);
        }

        if (level === 1) {
            let material = new BABYLON.StandardMaterial("red");
            material.diffuseColor.copyFromFloats(1, 0, 0);
            this.mesh.material = material;
        }
        if (level === 2) {
            let material = new BABYLON.StandardMaterial("green");
            material.diffuseColor.copyFromFloats(0, 1, 0);
            this.mesh.material = material;
        }
        if (level === 3) {
            let material = new BABYLON.StandardMaterial("blue");
            material.diffuseColor.copyFromFloats(0, 0, 1);
            this.mesh.material = material;
        }
        this.mesh.position = this._barycenter;
        this.mesh.freezeWorldMatrix();
        */
    }
    getPlanetChunck(iPos, jPos, kPos) {
        if (!this.children || this.children.length === 0) {
            this.subdivide();
        }
        if (this.level === 1) {
            let i = Math.floor((iPos - 2 * this.iPos));
            let j = Math.floor((jPos - 2 * this.jPos));
            let k = Math.floor((kPos - (2 * this.kPos + this.kOffset)));
            let child = this.children[j + 2 * i + 4 * k];
            if (child instanceof PlanetChunck) {
                return child;
            }
            else {
                console.error("PlanetChunckGroup " + this.name + " of level == 1 has a child that is not a PlanetChunck.");
                debugger;
            }
        }
        else {
            let levelCoef = Math.pow(2, this.level);
            let i = Math.floor((iPos - levelCoef * this.iPos) / (levelCoef / 2));
            let j = Math.floor((jPos - levelCoef * this.jPos) / (levelCoef / 2));
            let k = Math.floor((kPos - this.kOffset - levelCoef * this.kPos) / (levelCoef / 2));
            let child = this.children[j + 2 * i + 4 * k];
            if (child instanceof PlanetChunckGroup) {
                return child.getPlanetChunck(iPos, jPos, kPos);
            }
            else {
                console.error("PlanetChunckGroup " + this.name + " of level > 1 has a child that is not a PlanetChunckGroup.");
                debugger;
            }
        }
        console.error("PlanetChunckGroup " + this.name + " does not contain PlanetChunck " + iPos + " " + jPos + " " + kPos);
        debugger;
    }
    get subdivided() {
        return this._subdivided;
    }
    subdivide() {
        this._subdivisionsSkipedCount++;
        this.unregister();
        if (this._subdivided) {
            return;
        }
        this._subdivided = true;
        for (let k = 0; k < 2; k++) {
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 2; j++) {
                    if (this.level === 1) {
                        let childKPos = this.kOffset + this.kPos * 2 + k;
                        if (childKPos < this.kOffsetNext) {
                            let chunck = this.children[j + 2 * i + 4 * k];
                            if (!chunck) {
                                chunck = PlanetChunck.CreateChunck(this.iPos * 2 + i, this.jPos * 2 + j, childKPos, this.planetSide, this);
                                //console.log(PlanetChunck._DEBUG_NICE_CHUNCK_COUNT + " " + PlanetChunck._DEBUG_CHUNCK_COUNT);
                                this.children[j + 2 * i + 4 * k] = chunck;
                            }
                            chunck.register();
                        }
                    }
                    else {
                        let levelCoef = Math.pow(2, this.level - 1);
                        let childKPos = this.kPos * 2 + k;
                        if (childKPos * levelCoef < this.kOffsetNext - this.kOffset) {
                            let chunck = this.children[j + 2 * i + 4 * k];
                            if (!chunck) {
                                chunck = new PlanetChunckGroup(this.iPos * 2 + i, this.jPos * 2 + j, childKPos, this.planetSide, this, this.degree, this.level - 1);
                                this.children[j + 2 * i + 4 * k] = chunck;
                            }
                            chunck.register();
                        }
                    }
                }
            }
        }
        this._subdivisionsCount++;
        //console.log(this.name + " " + this._subdivisionsCount + " (" + this._subdivisionsSkipedCount + ")");
    }
    collapse() {
        if (this.canCollapse()) {
            if (this.parentGroup) {
                this.parentGroup.collapseChildren();
            }
        }
    }
    collapseChildren() {
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            if (child instanceof PlanetChunck) {
                child.disposeMesh();
                child.unregister();
            }
            else if (child instanceof PlanetChunckGroup) {
                if (child.subdivided) {
                    child.collapseChildren();
                }
                if (child.mesh) {
                    child.mesh.dispose();
                }
                child.lines.forEach(l => { l.dispose(); });
                child.unregister();
            }
        }
        this._subdivided = false;
        this.register();
    }
}
class PlanetChunckRedrawRequest {
    constructor(chunck, callback, info = "") {
        this.chunck = chunck;
        this.callback = callback;
        this.info = info;
    }
}
class PlanetChunckManager {
    // activity increase while manager is redrawing Chuncks.
    //private _maxActivity: number = 20;
    //private _activity: number = this._maxActivity;
    constructor(scene) {
        this.scene = scene;
        this._needRedraw = [];
        this._lodLayersCount = 6;
        // estimated percentage of chuncks in the adequate layer
        this.chunckSortedRatio = 0;
        this._update = () => {
            if (this.scene.activeCameras && this.scene.activeCameras.length > 0) {
                this._viewpoint.copyFrom(this.scene.activeCameras[0].globalPosition);
            }
            else {
                this._viewpoint.copyFrom(this.scene.activeCamera.globalPosition);
            }
            let t0 = performance.now();
            let t = t0;
            let sortedCount = 0;
            let unsortedCount = 0;
            let todo = [];
            while ((t - t0) < 1 && todo.length < 50) {
                for (let prevLayerIndex = 0; prevLayerIndex < this._lodLayersCount; prevLayerIndex++) {
                    let cursor = this._lodLayersCursors[prevLayerIndex];
                    let chunck = this._lodLayers[prevLayerIndex][cursor];
                    if (chunck) {
                        chunck.sqrDistanceToViewpoint = BABYLON.Vector3.DistanceSquared(this._viewpoint, chunck.barycenter);
                        let newLayerIndex = this._getLayerIndex(chunck.sqrDistanceToViewpoint);
                        if (newLayerIndex != prevLayerIndex) {
                            let adequateLayerCursor = this._lodLayersCursors[newLayerIndex];
                            this._lodLayers[prevLayerIndex].splice(cursor, 1);
                            this._lodLayers[newLayerIndex].splice(adequateLayerCursor, 0, chunck);
                            chunck.lod = newLayerIndex;
                            todo.push(chunck);
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
                    else {
                        this._lodLayersCursors[prevLayerIndex] = 0;
                        if (prevLayerIndex === this._lodLayersCount) {
                            break;
                        }
                    }
                }
                t = performance.now();
            }
            for (let i = 0; i < todo.length; i++) {
                this.onChunckMovedToLayer(todo[i], todo[i].lod);
            }
            /*
            if (this._needRedraw.length > 0) {
                this._activity ++;
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
            */
            this._needRedraw = this._needRedraw.sort((r1, r2) => { return r2.chunck.sqrDistanceToViewpoint - r1.chunck.sqrDistanceToViewpoint; });
            // Recalculate chunck meshes.
            t0 = performance.now();
            while (this._needRedraw.length > 0 && (t - t0) < 1000 / 120) {
                let request = this._needRedraw.pop();
                if (request.chunck.lod <= 1) {
                    request.chunck.initialize();
                }
                else {
                    request.chunck.disposeMesh();
                }
                t = performance.now();
            }
            if ((t - t0) > 100) {
                console.log(((t - t0)).toFixed(3));
            }
            this.chunckSortedRatio = (this.chunckSortedRatio + sortedCount / (sortedCount + unsortedCount)) * 0.5;
            if (isNaN(this.chunckSortedRatio)) {
                this.chunckSortedRatio = 1;
            }
        };
    }
    get needRedrawCount() {
        return this._needRedraw.length;
    }
    lodLayerCount(layerIndex) {
        return this._lodLayers[layerIndex].length;
    }
    initialize() {
        if (this.scene.activeCameras && this.scene.activeCameras.length > 0) {
            this._viewpoint = this.scene.activeCameras[0].globalPosition.clone();
        }
        else {
            this._viewpoint = this.scene.activeCamera.globalPosition.clone();
        }
        this._lodLayers = [];
        this._lodLayersCursors = [];
        this._lodLayersSqrDistances = [];
        let distances = [120, 160, 200, 240, 280];
        for (let i = 0; i < this._lodLayersCount - 1; i++) {
            this._lodLayers[i] = [];
            this._lodLayersCursors[i] = 0;
            this._lodLayersSqrDistances[i] = distances[i] * distances[i];
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
        while (this.unregister(chunck)) {
        }
        if (this._lodLayers[this._lodLayersCount - 1].indexOf(chunck) === -1) {
            this._lodLayers[this._lodLayersCount - 1].push(chunck);
            chunck.lod = this._lodLayersCount - 1;
        }
        return true;
    }
    unregister(chunck) {
        for (let layerIndex = 0; layerIndex < this._lodLayers.length; layerIndex++) {
            let index = this._lodLayers[layerIndex].indexOf(chunck);
            if (index != -1) {
                this._lodLayers[layerIndex].splice(index, 1);
                return true;
            }
        }
        return false;
    }
    async requestDraw(chunck, prio, info) {
        prio = 0;
        return new Promise(resolve => {
            if (!this._needRedraw.find(request => { return request.chunck === chunck; })) {
                if (prio === 0) {
                    this._needRedraw.push(new PlanetChunckRedrawRequest(chunck, resolve, info));
                }
                else {
                    this._needRedraw.splice(0, 0, new PlanetChunckRedrawRequest(chunck, resolve, info));
                }
            }
        });
    }
    cancelDraw(chunck) {
        let index = this._needRedraw.findIndex(request => { return request.chunck === chunck; });
        if (index != -1) {
            this._needRedraw.splice(index, 1);
        }
    }
    _getLayerIndex(sqrDistance) {
        for (let i = 0; i < this._lodLayersCount - 1; i++) {
            if (sqrDistance < this._lodLayersSqrDistances[i]) {
                return i;
            }
        }
        return this._lodLayersCount - 1;
    }
    onChunckMovedToLayer(chunck, layerIndex) {
        if (layerIndex === 0) {
            if (chunck instanceof PlanetChunck) {
                this.requestDraw(chunck, 0, "ChunckManager.update");
            }
            else if (chunck instanceof PlanetChunckGroup) {
                chunck.subdivide();
            }
        }
        else if (layerIndex === 1) {
            if (chunck instanceof PlanetChunck) {
                chunck.disposeMesh();
                this.cancelDraw(chunck);
            }
            else if (chunck instanceof PlanetChunckGroup) {
                chunck.subdivide();
            }
        }
        else if (layerIndex === 2) {
            if (chunck instanceof PlanetChunck) {
                chunck.disposeMesh();
                this.cancelDraw(chunck);
            }
            else if (chunck instanceof PlanetChunckGroup) {
                if (chunck.level > 1) {
                    chunck.subdivide();
                }
            }
        }
        else if (layerIndex === 3) {
            if (chunck instanceof PlanetChunck) {
                chunck.disposeMesh();
                this.cancelDraw(chunck);
                chunck.collapse();
            }
            else if (chunck instanceof PlanetChunckGroup) {
                if (chunck.level < 1) {
                    chunck.collapse();
                }
                else if (chunck.level > 2) {
                    chunck.subdivide();
                }
            }
        }
        else if (layerIndex === 4) {
            if (chunck instanceof PlanetChunck) {
                chunck.disposeMesh();
                this.cancelDraw(chunck);
                chunck.collapse();
            }
            else if (chunck instanceof PlanetChunckGroup) {
                if (chunck.level < 2) {
                    chunck.collapse();
                }
                else if (chunck.level > 3) {
                    chunck.subdivide();
                }
            }
        }
        else if (layerIndex === 5) {
            if (chunck instanceof PlanetChunck) {
                chunck.disposeMesh();
                this.cancelDraw(chunck);
                chunck.collapse();
            }
            else if (chunck instanceof PlanetChunckGroup) {
                if (chunck.level < 3) {
                    chunck.collapse();
                }
                else if (chunck.level > 4) {
                    chunck.subdivide();
                }
            }
        }
        else {
            debugger;
        }
    }
}
class PlanetChunckMeshBuilder {
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
    static DistanceSquared(x0, y0, z0, x1, y1, z1) {
        let x = x1 - x0;
        let y = y1 - y0;
        let z = z1 - z0;
        return x * x + y * y + z * z;
    }
    static Distance(x0, y0, z0, x1, y1, z1) {
        return Math.sqrt(PCMB.DistanceSquared(x0, y0, z0, x1, y1, z1));
    }
    static BuildVertexData(chunck, iPos, jPos, kPos) {
        let lod = chunck.lod;
        lod = 1;
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
        for (let i = chunck.firstI; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = chunck.firstJ; j < chunck.lastJ; j++) {
                for (let k = chunck.firstK; k < PlanetTools.CHUNCKSIZE; k++) {
                    let cornerCase = false;
                    if ((chunck.side === Side.Top || chunck.side === Side.Bottom) && chunck.isCorner) {
                        if (chunck.iPos === 0) {
                            if (chunck.jPos === 0) {
                                if (i === chunck.firstI) {
                                    if (j === chunck.firstJ) {
                                        cornerCase = true;
                                    }
                                }
                            }
                            if (chunck.jPos === chunck.chunckCount - 1) {
                                if (i === chunck.firstI) {
                                    if (j === chunck.lastJ - 1) {
                                        cornerCase = true;
                                    }
                                }
                            }
                        }
                        if (chunck.iPos === chunck.chunckCount - 1) {
                            if (chunck.jPos === 0) {
                                if (i === PlanetTools.CHUNCKSIZE - 1) {
                                    if (j === chunck.firstJ) {
                                        cornerCase = true;
                                    }
                                }
                            }
                            if (chunck.jPos === chunck.chunckCount - 1) {
                                if (i === PlanetTools.CHUNCKSIZE - 1) {
                                    if (j === chunck.lastJ - 1) {
                                        cornerCase = true;
                                    }
                                }
                            }
                        }
                    }
                    if (cornerCase) {
                        let d = chunck.GetData(i, j, k);
                        if (d != BlockType.None) {
                            if (chunck.GetData(i, j, k + 1) === BlockType.None) {
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
                                let c = PCMB.BlockColor.get(d);
                                if (!c) {
                                    c = PCMB.BlockColor.get(136);
                                }
                                let l = positions.length / 3;
                                positions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
                                normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
                                indices.push(l, l + 2, l + 1);
                                let alpha = d / 128;
                                colors.push(1, 0, 0, alpha, 0, 1, 0, alpha, 0, 0, 1, alpha);
                                let u = d / 128;
                                let v = d / 128;
                                uvs.push(u, v, u, v, u, v);
                            }
                        }
                    }
                    else {
                        let ref = 0b0;
                        let d0 = chunck.GetData(i, j, k);
                        if (d0) {
                            ref |= 0b1 << 0;
                        }
                        let d1 = chunck.GetData(i + 1, j, k);
                        if (d1) {
                            ref |= 0b1 << 1;
                        }
                        let d2 = chunck.GetData(i + 1, j + 1, k);
                        if (d2) {
                            ref |= 0b1 << 2;
                        }
                        let d3 = chunck.GetData(i, j + 1, k);
                        if (d3) {
                            ref |= 0b1 << 3;
                        }
                        let d4 = chunck.GetData(i, j, k + 1);
                        if (d4) {
                            ref |= 0b1 << 4;
                        }
                        let d5 = chunck.GetData(i + 1, j, k + 1);
                        if (d5) {
                            ref |= 0b1 << 5;
                        }
                        let d6 = chunck.GetData(i + 1, j + 1, k + 1);
                        if (d6) {
                            ref |= 0b1 << 6;
                        }
                        let d7 = chunck.GetData(i, j + 1, k + 1);
                        if (d7) {
                            ref |= 0b1 << 7;
                        }
                        let blocks = [d0, d1, d2, d3, d4, d5, d6, d7];
                        if (ref === 0b0 || ref === 0b11111111) {
                            continue;
                        }
                        let extendedpartVertexData = PlanetChunckVertexData.Get(lod, ref);
                        let partVertexData = extendedpartVertexData.vertexData;
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
                        let hLow = PlanetTools.KGlobalToAltitude(hGlobal - 1) * 0.5 + PlanetTools.KGlobalToAltitude(hGlobal) * 0.5;
                        let hHigh = PlanetTools.KGlobalToAltitude(hGlobal) * 0.5 + PlanetTools.KGlobalToAltitude(hGlobal + 1) * 0.5;
                        PCMB.tmpVertices[0].scaleToRef(hHigh, PCMB.tmpVertices[4]);
                        PCMB.tmpVertices[1].scaleToRef(hHigh, PCMB.tmpVertices[5]);
                        PCMB.tmpVertices[2].scaleToRef(hHigh, PCMB.tmpVertices[6]);
                        PCMB.tmpVertices[3].scaleToRef(hHigh, PCMB.tmpVertices[7]);
                        PCMB.tmpVertices[0].scaleInPlace(hLow);
                        PCMB.tmpVertices[1].scaleInPlace(hLow);
                        PCMB.tmpVertices[2].scaleInPlace(hLow);
                        PCMB.tmpVertices[3].scaleInPlace(hLow);
                        /*
                        let center = BABYLON.Vector3.Zero();
                        for (let i = 0; i < 8; i++) {
                            center.addInPlace(PCMB.tmpVertices[i]);
                        }
                        center.scaleInPlace(1 / 8);

                        center.scaleInPlace(0.015);
                        for (let i = 0; i < 8; i++) {
                            PCMB.tmpVertices[i].scaleInPlace(0.985).addInPlace(center);
                        }
                        */
                        let l = positions.length / 3;
                        colors.push(...partVertexData.colors);
                        uvs.push(...partVertexData.uvs);
                        for (let n = 0; n < partVertexData.indices.length / 3; n++) {
                            let n1 = partVertexData.indices[3 * n];
                            let n2 = partVertexData.indices[3 * n + 1];
                            let n3 = partVertexData.indices[3 * n + 2];
                            let alpha = blocks[extendedpartVertexData.blocks[n][0]] / 128;
                            let u = blocks[extendedpartVertexData.blocks[n][1]] / 128;
                            let v = blocks[extendedpartVertexData.blocks[n][2]] / 128;
                            colors[4 * (l + n1) + 3] = alpha;
                            colors[4 * (l + n2) + 3] = alpha;
                            colors[4 * (l + n3) + 3] = alpha;
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
        if (positions.length / 3 != colors.length / 4) {
            debugger;
        }
        if (positions.length / 3 != uvs.length / 2) {
            debugger;
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
class PlanetChunckNice extends PlanetChunck {
    findAdjacents() {
        this._adjacents = [];
        this.adjacentsAsArray = [];
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                for (let dk = -1; dk <= 1; dk++) {
                    if (di != 0 || dj != 0 || dk != 0) {
                        if (!this._adjacents[1 + di]) {
                            this._adjacents[1 + di] = [];
                        }
                        if (!this._adjacents[1 + di][1 + dj]) {
                            this._adjacents[1 + di][1 + dj] = [];
                        }
                        if (!this._adjacents[1 + di][1 + dj][1 + dk]) {
                            let n = this.planetSide.getChunck(this.iPos + di, this.jPos + dj, this.kPos + dk, this.degree);
                            if (n instanceof PlanetChunck) {
                                this._adjacents[1 + di][1 + dj][1 + dk] = [n];
                                this.adjacentsAsArray.push(n);
                            }
                        }
                    }
                }
            }
        }
    }
    syncWithAdjacents() {
        let hasUpdated = false;
        if (!this.dataInitialized) {
            console.log("cancel sync");
            return hasUpdated;
        }
        this._adjacentsDataSynced = true;
        this.findAdjacents();
        let right = this._adjacents[2][1][1][0];
        for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
            for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                this.data[PlanetTools.CHUNCKSIZE][j][k] = right.GetDataNice(0, j, k);
            }
        }
        let front = this._adjacents[1][2][1][0];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                this.data[i][PlanetTools.CHUNCKSIZE][k] = front.GetDataNice(i, 0, k);
            }
        }
        let above = this._adjacents[1][1][2][0];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                this.data[i][j][PlanetTools.CHUNCKSIZE] = above.GetDataNice(i, j, 0);
            }
        }
        for (let n = 0; n < PlanetTools.CHUNCKSIZE; n++) {
            this.data[n][PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE] = this._adjacents[1][2][2][0].GetDataNice(n, 0, 0);
            this.data[PlanetTools.CHUNCKSIZE][n][PlanetTools.CHUNCKSIZE] = this._adjacents[2][1][2][0].GetDataNice(0, n, 0);
            this.data[PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE][n] = this._adjacents[2][2][1][0].GetDataNice(0, 0, n);
        }
        this.data[PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE] = this._adjacents[2][2][2][0].GetDataNice(0, 0, 0);
        this.updateIsEmptyIsFull();
        this.register();
        return hasUpdated;
    }
}
class PlanetChunckSemiNice extends PlanetChunck {
    syncWithAdjacents() {
        let hasUpdated = false;
        if (!this.dataInitialized) {
            console.log("cancel sync");
            return hasUpdated;
        }
        this._adjacentsDataSynced = true;
        this.findAdjacents();
        let right = this._adjacents[2][1][1][0];
        for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
            for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                this.data[PlanetTools.CHUNCKSIZE][j][k] = right.GetDataNice(0, j, k);
            }
        }
        let front = this._adjacents[1][2][1][0];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                this.data[i][PlanetTools.CHUNCKSIZE][k] = front.GetDataNice(i, 0, k);
            }
        }
        for (let n = 0; n < PlanetTools.CHUNCKSIZE; n++) {
            this.data[PlanetTools.CHUNCKSIZE][PlanetTools.CHUNCKSIZE][n] = this._adjacents[2][2][1][0].GetDataNice(0, 0, n);
        }
        this.updateIsEmptyIsFull();
        this.register();
        return hasUpdated;
    }
}
class ExtendedVertexData {
    constructor(ref, vertexData) {
        this.vertexData = vertexData;
        this.blocks = [];
        let colors = [];
        let uvs = [];
        let d0 = ref & (0b1 << 0);
        let d1 = ref & (0b1 << 1);
        let d2 = ref & (0b1 << 2);
        let d3 = ref & (0b1 << 3);
        let d4 = ref & (0b1 << 4);
        let d5 = ref & (0b1 << 5);
        let d6 = ref & (0b1 << 6);
        let d7 = ref & (0b1 << 7);
        for (let n = 0; n < this.vertexData.indices.length / 3; n++) {
            let n1 = this.vertexData.indices[3 * n];
            let n2 = this.vertexData.indices[3 * n + 1];
            let n3 = this.vertexData.indices[3 * n + 2];
            let x0 = this.vertexData.positions[3 * n1];
            let y0 = this.vertexData.positions[3 * n1 + 1];
            let z0 = this.vertexData.positions[3 * n1 + 2];
            let x1 = this.vertexData.positions[3 * n2];
            let y1 = this.vertexData.positions[3 * n2 + 1];
            let z1 = this.vertexData.positions[3 * n2 + 2];
            let x2 = this.vertexData.positions[3 * n3];
            let y2 = this.vertexData.positions[3 * n3 + 1];
            let z2 = this.vertexData.positions[3 * n3 + 2];
            let xs = [x0, x1, x2];
            let ys = [y0, y1, y2];
            let zs = [z0, z1, z2];
            this.blocks[n] = [];
            for (let vIndex = 0; vIndex < 3; vIndex++) {
                let minDistance = Infinity;
                if (d0) {
                    let distance = ExtendedVertexData.SquaredLength(xs[vIndex], ys[vIndex], zs[vIndex]);
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 0;
                        minDistance = distance;
                    }
                }
                if (d1) {
                    let distance = ExtendedVertexData.SquaredLength((1 - xs[vIndex]), ys[vIndex], zs[vIndex]);
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 1;
                        minDistance = distance;
                    }
                }
                if (d2) {
                    let distance = ExtendedVertexData.SquaredLength((1 - xs[vIndex]), ys[vIndex], (1 - zs[vIndex]));
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 2;
                        minDistance = distance;
                    }
                }
                if (d3) {
                    let distance = ExtendedVertexData.SquaredLength(xs[vIndex], ys[vIndex], (1 - zs[vIndex]));
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 3;
                        minDistance = distance;
                    }
                }
                if (d4) {
                    let distance = ExtendedVertexData.SquaredLength(xs[vIndex], (1 - ys[vIndex]), zs[vIndex]);
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 4;
                        minDistance = distance;
                    }
                }
                if (d5) {
                    let distance = ExtendedVertexData.SquaredLength((1 - xs[vIndex]), (1 - ys[vIndex]), zs[vIndex]);
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 5;
                        minDistance = distance;
                    }
                }
                if (d6) {
                    let distance = ExtendedVertexData.SquaredLength((1 - xs[vIndex]), (1 - ys[vIndex]), (1 - zs[vIndex]));
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 6;
                        minDistance = distance;
                    }
                }
                if (d7) {
                    let distance = ExtendedVertexData.SquaredLength(xs[vIndex], (1 - ys[vIndex]), (1 - zs[vIndex]));
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 7;
                        minDistance = distance;
                    }
                }
            }
            let corner0 = ExtendedVertexData.Corners[this.blocks[n][0]];
            let corner1 = ExtendedVertexData.Corners[this.blocks[n][1]];
            let corner2 = ExtendedVertexData.Corners[this.blocks[n][2]];
            colors[4 * n1] = 1 - ExtendedVertexData.Distance(x0, y0, z0, corner0.x, corner0.y, corner0.z);
            colors[4 * n1 + 1] = 1 - ExtendedVertexData.Distance(x0, y0, z0, corner1.x, corner1.y, corner1.z);
            colors[4 * n1 + 2] = 1 - ExtendedVertexData.Distance(x0, y0, z0, corner2.x, corner2.y, corner2.z);
            colors[4 * n1 + 3] = 1;
            colors[4 * n2] = 1 - ExtendedVertexData.Distance(x1, y1, z1, corner0.x, corner0.y, corner0.z);
            colors[4 * n2 + 1] = 1 - ExtendedVertexData.Distance(x1, y1, z1, corner1.x, corner1.y, corner1.z);
            colors[4 * n2 + 2] = 1 - ExtendedVertexData.Distance(x1, y1, z1, corner2.x, corner2.y, corner2.z);
            colors[4 * n2 + 3] = 1;
            colors[4 * n3] = 1 - ExtendedVertexData.Distance(x2, y2, z2, corner0.x, corner0.y, corner0.z);
            colors[4 * n3 + 1] = 1 - ExtendedVertexData.Distance(x2, y2, z2, corner1.x, corner1.y, corner1.z);
            colors[4 * n3 + 2] = 1 - ExtendedVertexData.Distance(x2, y2, z2, corner2.x, corner2.y, corner2.z);
            colors[4 * n3 + 3] = 1;
            uvs[2 * n1] = 1;
            uvs[2 * n1 + 1] = 1;
            uvs[2 * n2] = 1;
            uvs[2 * n2 + 1] = 1;
            uvs[2 * n3] = 1;
            uvs[2 * n3 + 1] = 1;
        }
        this.vertexData.colors = colors;
        this.vertexData.uvs = uvs;
    }
    static SquaredLength(x, y, z) {
        return x * x + y * y + z * z;
    }
    static DistanceSquared(x0, y0, z0, x1, y1, z1) {
        let x = x1 - x0;
        let y = y1 - y0;
        let z = z1 - z0;
        return x * x + y * y + z * z;
    }
    static Distance(x0, y0, z0, x1, y1, z1) {
        return Math.sqrt(ExtendedVertexData.DistanceSquared(x0, y0, z0, x1, y1, z1));
    }
}
ExtendedVertexData.Corners = [
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(1, 0, 0),
    new BABYLON.Vector3(1, 0, 1),
    new BABYLON.Vector3(0, 0, 1),
    new BABYLON.Vector3(0, 1, 0),
    new BABYLON.Vector3(1, 1, 0),
    new BABYLON.Vector3(1, 1, 1),
    new BABYLON.Vector3(0, 1, 1),
];
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
            PlanetChunckVertexData._VertexDatas[lod].set(mirrorXRef, new ExtendedVertexData(mirrorXRef, mirrorXData));
            PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, mirrorXRef, mirrorXData);
            return true;
        }
        return false;
    }
    static _TryAddMirrorYChunckPart(lod, ref, data) {
        let mirrorYRef = PlanetChunckVertexData.MirrorYChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(mirrorYRef)) {
            let mirrorYData = PlanetChunckVertexData.MirrorY(data);
            PlanetChunckVertexData._VertexDatas[lod].set(mirrorYRef, new ExtendedVertexData(mirrorYRef, mirrorYData));
            PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, mirrorYRef, mirrorYData);
            return true;
        }
        return false;
    }
    static _TryAddMirrorZChunckPart(lod, ref, data) {
        let mirrorZRef = PlanetChunckVertexData.MirrorZChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(mirrorZRef)) {
            let mirrorZData = PlanetChunckVertexData.MirrorZ(data);
            PlanetChunckVertexData._VertexDatas[lod].set(mirrorZRef, new ExtendedVertexData(mirrorZRef, mirrorZData));
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
                        if (ref === 0) {
                            continue;
                        }
                        let data = BABYLON.VertexData.ExtractFromMesh(mesh);
                        data = PlanetChunckVertexData.SplitVertexDataTriangles(data);
                        //data.positions = data.positions.map((n: number) => { return n * 0.98 + 0.01; });
                        /*
                        let normals = []
                        for (let j = 0; j < data.positions.length / 3; j++) {
                            let x = data.positions[3 * j];
                            let y = data.positions[3 * j + 1];
                            let z = data.positions[3 * j + 2];

                            let nx = data.normals[3 * j];
                            let ny = data.normals[3 * j + 1];
                            let nz = data.normals[3 * j + 2];
                            
                            if (x === 0 || x === 1) {
                                nx = 0;
                            }
                            if (y === 0 || y === 1) {
                                ny = 0;
                            }
                            if (z === 0 || z === 1) {
                                nz = 0;
                            }

                            let l = Math.sqrt(nx * nx + ny * ny + nz * nz);
                            normals[3 * j] = nx / l;
                            normals[3 * j + 1] = ny / l;
                            normals[3 * j + 2] = nz / l;
                        }
                        data.normals = normals;
                        */
                        if (!data.colors || data.colors.length / 4 != data.positions.length / 3) {
                            let colors = [];
                            for (let j = 0; j < data.positions.length / 3; j++) {
                                colors.push(1, 1, 1, 1);
                            }
                            data.colors = colors;
                        }
                        mesh.dispose();
                        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref)) {
                            PlanetChunckVertexData._VertexDatas[lod].set(ref, new ExtendedVertexData(ref, data));
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
                                PlanetChunckVertexData._VertexDatas[lod].set(rotatedRef, new ExtendedVertexData(rotatedRef, data));
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
        console.log("Generator Degree = " + PlanetTools.KPosToDegree(planet.kPosMax));
        this._mainHeightMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(planet.kPosMax));
        this._treeMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(planet.kPosMax), { firstNoiseDegree: PlanetTools.KPosToDegree(planet.kPosMax) - 2 });
        this._rockMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(planet.kPosMax), { firstNoiseDegree: PlanetTools.KPosToDegree(planet.kPosMax) - 3 });
        this.heightMaps = [this._mainHeightMap];
    }
    makeData(chunck, refData, refProcedural) {
        let f = Math.pow(2, this._mainHeightMap.degree - chunck.degree);
        let maxTree = 1;
        let treeCount = 0;
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];
                let v = this._mainHeightMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let tree = this._treeMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let rock = this._rockMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let altitude = Math.floor((this._seaLevel + v * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                let rockAltitude = altitude + Math.round((rock - 0.4) * this._mountainHeight * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                /*
                if (tree > 0.6 && treeCount < maxTree) {
                    let localK = altitude + 1 - chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if (localK >= 0 && localK < PlanetTools.CHUNCKSIZE) {
                        let tree = new ProceduralTree(chunck.chunckManager);
                        tree.chunck = chunck;
                        tree.i = i;
                        tree.j = j;
                        tree.k = localK;
                        refProcedural.push(tree);
                        treeCount++;
                    }
                }
                */
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if (globalK <= altitude) {
                        if (globalK > altitude - 2) {
                            if (globalK < this._seaLevel * (this.planet.kPosMax * PlanetTools.CHUNCKSIZE)) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Sand;
                            }
                            else {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Grass;
                            }
                        }
                        else {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                        }
                    }
                    else if (globalK <= rockAltitude) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                }
            }
        }
    }
}
class PlanetGeneratorChaos extends PlanetGenerator {
    constructor(planet, _seaLevel, _mountainHeight) {
        super(planet);
        this._seaLevel = _seaLevel;
        this._mountainHeight = _mountainHeight;
        console.log("Generator Degree = " + PlanetTools.KPosToDegree(planet.kPosMax));
        this._mainHeightMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(planet.kPosMax));
        this._tunnelMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(planet.kPosMax), { firstNoiseDegree: PlanetTools.KPosToDegree(planet.kPosMax) - 5 });
        this._tunnelAltitudeMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(planet.kPosMax));
        this._rockMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(planet.kPosMax), { firstNoiseDegree: PlanetTools.KPosToDegree(planet.kPosMax) - 3 });
        this.heightMaps = [this._tunnelMap, this._tunnelAltitudeMap];
    }
    makeData(chunck, refData, refProcedural) {
        let f = Math.pow(2, this._mainHeightMap.degree - chunck.degree);
        let maxTree = 1;
        let treeCount = 0;
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];
                let v = this._mainHeightMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let altitude = Math.floor((this._seaLevel + v * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                let rock = this._rockMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let rockAltitude = altitude + Math.round((rock - 0.4) * this._mountainHeight * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                let tunnel = Math.abs(this._tunnelMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f)) < 0.1;
                let tunnelV = this._tunnelMap.getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
                let tunnelAltitude = Math.floor((this._seaLevel + tunnelV * this._mountainHeight) * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                /*
                if (tree > 0.6 && treeCount < maxTree) {
                    let localK = altitude + 1 - chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if (localK >= 0 && localK < PlanetTools.CHUNCKSIZE) {
                        let tree = new ProceduralTree(chunck.chunckManager);
                        tree.chunck = chunck;
                        tree.i = i;
                        tree.j = j;
                        tree.k = localK;
                        refProcedural.push(tree);
                        treeCount++;
                    }
                }
                */
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if (globalK <= altitude) {
                        if (globalK > altitude - 2) {
                            if (globalK < this._seaLevel * (this.planet.kPosMax * PlanetTools.CHUNCKSIZE)) {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Sand;
                            }
                            else {
                                refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Grass;
                            }
                        }
                        else {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                        }
                    }
                    else if (globalK <= rockAltitude) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Rock;
                    }
                    if (tunnel) {
                        if (globalK >= tunnelAltitude - 1 && globalK <= tunnelAltitude + 1) {
                            refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.None;
                        }
                    }
                }
            }
        }
    }
}
class PlanetGeneratorFlat extends PlanetGenerator {
    constructor(planet, _seaLevel, _mountainHeight) {
        super(planet);
        this._seaLevel = _seaLevel;
        this._mountainHeight = _mountainHeight;
    }
    makeData(chunck, refData, refProcedural) {
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i - chunck.firstI] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i - chunck.firstI][j - chunck.firstJ] = [];
                let altitude = Math.floor(this._seaLevel * this.planet.kPosMax * PlanetTools.CHUNCKSIZE);
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    if (globalK <= altitude) {
                        refData[i - chunck.firstI][j - chunck.firstJ][k - chunck.firstK] = BlockType.Grass;
                    }
                }
            }
        }
    }
}
class PlanetGeneratorDebug extends PlanetGenerator {
    constructor(planet) {
        super(planet);
    }
    makeData(chunck, refData, refProcedural) {
        PlanetTools.Data(refData, (i, j, k) => {
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
    makeData(chunck, refData, refProcedural) {
        let c = Math.floor(Math.random() * 7 + 1);
        PlanetTools.Data(refData, (i, j, k) => {
            return c;
        });
    }
}
class PlanetGeneratorDebug3 extends PlanetGenerator {
    constructor(planet) {
        super(planet);
    }
    makeData(chunck, refData, refProcedural) {
        PlanetTools.Data(refData, (i, j, k) => {
            let c = Math.floor(Math.random() * 7 + 1);
            return c;
        });
    }
}
class PlanetGeneratorDebug4 extends PlanetGenerator {
    constructor(planet) {
        super(planet);
    }
    makeData(chunck, refData, refProcedural) {
        PlanetTools.Data(refData, (i, j, k) => {
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
        console.log(this.size);
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
        this._globalColor = BABYLON.Color3.Black();
        this.setVector3("lightInvDirW", (new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
        this._terrainColors = [];
        this._terrainColors[BlockType.None] = new BABYLON.Color3(0, 0, 0);
        this._terrainColors[BlockType.Grass] = new BABYLON.Color3(0.216, 0.616, 0.165);
        this._terrainColors[BlockType.Dirt] = new BABYLON.Color3(0.451, 0.263, 0.047);
        this._terrainColors[BlockType.Sand] = new BABYLON.Color3(0.761, 0.627, 0.141);
        this._terrainColors[BlockType.Rock] = new BABYLON.Color3(0.522, 0.522, 0.522);
        this._terrainColors[BlockType.Wood] = new BABYLON.Color3(0.600, 0.302, 0.020);
        this._terrainColors[BlockType.Leaf] = new BABYLON.Color3(0.431, 0.839, 0.020);
        this.setColor3("globalColor", this._globalColor);
        this.setColor3Array("terrainColors", this._terrainColors);
    }
    getGlobalColor() {
        return this._globalColor;
    }
    setGlobalColor(color) {
        this._globalColor.copyFrom(color);
        this.setColor3("globalColor", this._globalColor);
    }
    getColor(blockType) {
        return this._terrainColors[blockType];
    }
    setColor(blockType, color) {
        this._terrainColors[blockType].copyFrom(color);
        this.setColor3Array("terrainColors", this._terrainColors);
    }
}
var SideNames = [
    "Front",
    "Right",
    "Back",
    "Left",
    "Top",
    "Bottom"
];
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
        this.chunckGroups = [];
        for (let degree = PlanetTools.DEGREEMIN; degree <= PlanetTools.KPosToDegree(this.kPosMax); degree++) {
            this.chunckGroups[degree] = new PlanetChunckGroup(0, 0, 0, this, undefined, degree, degree - (PlanetTools.DEGREEMIN - 1));
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
        let chunckCount = PlanetTools.DegreeToChuncksCount(PlanetTools.KPosToDegree(kPos));
        if (iPos >= 0 && iPos < chunckCount) {
            if (jPos >= 0 && jPos < chunckCount) {
                if (kPos >= 0 && kPos < this.kPosMax) {
                    let group = this.chunckGroups[degree];
                    if (group) {
                        return group.getPlanetChunck(iPos, jPos, kPos);
                    }
                }
            }
        }
        if (kPos >= 0 && kPos < this.kPosMax) {
            if (iPos < 0) {
                if (this.side <= Side.Left) {
                    let side = this.planet.GetSide((this.side + 1) % 4);
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
        let chunckCount = PlanetTools.DegreeToChuncksCount(PlanetTools.KPosToDegree(kChunck));
        if (iChunck >= 0 && iChunck < chunckCount) {
            if (jChunck >= 0 && jChunck < chunckCount) {
                if (kChunck >= 0 && kChunck < this.kPosMax) {
                    let group = this.chunckGroups[degree];
                    if (group) {
                        let i = iGlobal - iChunck * PlanetTools.CHUNCKSIZE;
                        let j = jGlobal - jChunck * PlanetTools.CHUNCKSIZE;
                        let k = kGlobal - kChunck * PlanetTools.CHUNCKSIZE;
                        let chunck = group.getPlanetChunck(iChunck, jChunck, kChunck);
                        if (chunck) {
                            return chunck.GetData(i, j, k);
                        }
                    }
                }
            }
        }
        return 0;
    }
    register() {
        let chunckCount = 0;
        for (let degree = PlanetTools.DEGREEMIN; degree <= PlanetTools.KPosToDegree(this.kPosMax); degree++) {
            this.chunckGroups[degree].register();
        }
        return chunckCount;
    }
}
class PlanetSky {
    constructor() {
        this.invertLightDir = BABYLON.Vector3.Up();
        this._localUp = BABYLON.Vector3.Up();
        this.zenithColor = new BABYLON.Color3(0.478, 0.776, 1.000);
        this.dawnColor = new BABYLON.Color3(0.702, 0.373, 0.000);
        this.nightColor = new BABYLON.Color3(0.000, 0.008, 0.188);
        this._skyColor = BABYLON.Color3.Black();
        this._initialized = false;
        this._update = () => {
            if (this.scene.activeCamera) {
                this.scene.activeCamera.globalPosition.normalizeToRef(this._localUp);
                let factor = BABYLON.Vector3.Dot(this._localUp, this.invertLightDir);
                let sign = 0;
                if (factor != 0) {
                    sign = factor / Math.abs(factor);
                    factor = sign * Math.sqrt(Math.sqrt(Math.abs(factor)));
                }
                if (sign >= 0) {
                    BABYLON.Color3.LerpToRef(this.dawnColor, this.zenithColor, factor, this._skyColor);
                    this.scene.clearColor.copyFromFloats(this._skyColor.r, this._skyColor.g, this._skyColor.b, 1);
                }
                else {
                    BABYLON.Color3.LerpToRef(this.dawnColor, this.nightColor, Math.abs(factor), this._skyColor);
                    this.scene.clearColor.copyFromFloats(this._skyColor.r, this._skyColor.g, this._skyColor.b, 1);
                }
            }
        };
    }
    get initialized() {
        return this._initialized;
    }
    initialize(scene) {
        this.scene = scene;
        scene.onBeforeRenderObservable.add(this._update);
        this._initialized = true;
    }
    setInvertLightDir(invertLightDir) {
        this.invertLightDir = invertLightDir;
    }
}
var PI4 = Math.PI / 4;
var PI2 = Math.PI / 2;
var PI = Math.PI;
class PlanetTools {
    static get tmpVertices() {
        if (!PlanetTools._tmpVertices || PlanetTools._tmpVertices.length < 15) {
            PlanetTools._tmpVertices = [];
            for (let i = 0; i < 15; i++) {
                PlanetTools._tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        return PlanetTools._tmpVertices;
    }
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
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z, BABYLON.Axis.Y, BABYLON.Axis.X.scale(-1));
        }
        else if (side === Side.Left) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z.scale(-1), BABYLON.Axis.X.scale(-1), BABYLON.Axis.Y);
        }
        else if (side === Side.Front) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.X.scale(-1), BABYLON.Axis.Z, BABYLON.Axis.Y);
        }
        else if (side === Side.Back) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.X, BABYLON.Axis.Z.scale(-1), BABYLON.Axis.Y);
        }
        else if (side === Side.Right) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z, BABYLON.Axis.X, BABYLON.Axis.Y);
        }
        else if (side === Side.Bottom) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z, BABYLON.Axis.Y.scale(-1), BABYLON.Axis.X);
        }
    }
    static EvaluateVertex(size, i, j) {
        let v = new BABYLON.Vector3();
        return PlanetTools.EvaluateVertexToRef(size, i, j, v);
    }
    static EvaluateVertexToRef(size, i, j, ref) {
        if (i < 0) {
            let v = PlanetTools.EvaluateVertex(size, i + size, j);
            ref.copyFromFloats(-v.y, v.x, v.z);
            return ref;
        }
        if (i > size) {
            let v = PlanetTools.EvaluateVertex(size, i - size, j);
            ref.copyFromFloats(v.y, -v.x, v.z);
            return ref;
        }
        if (j < 0) {
            let v = PlanetTools.EvaluateVertex(size, i, j + size);
            ref.copyFromFloats(v.x, v.z, -v.y);
            return ref;
        }
        if (j > size) {
            let v = PlanetTools.EvaluateVertex(size, i, j - size);
            ref.copyFromFloats(v.x, -v.z, v.y);
            return ref;
        }
        let xRad = -PI4 + PI2 * (i / size);
        let zRad = -PI4 + PI2 * (j / size);
        ref.copyFromFloats(Math.tan(xRad), 1, Math.tan(zRad)).normalize();
        return ref;
    }
    static SkewVertexData(vertexData, size, i, j, k) {
        let h0 = PlanetTools.KGlobalToAltitude(k);
        let h1 = PlanetTools.KGlobalToAltitude(k + 1);
        let v0 = PlanetTools.tmpVertices[0];
        let v1 = PlanetTools.tmpVertices[1];
        let v2 = PlanetTools.tmpVertices[2];
        let v3 = PlanetTools.tmpVertices[3];
        let v4 = PlanetTools.tmpVertices[4];
        let v5 = PlanetTools.tmpVertices[5];
        let v6 = PlanetTools.tmpVertices[6];
        let v7 = PlanetTools.tmpVertices[7];
        let v01 = PlanetTools.tmpVertices[8];
        let v32 = PlanetTools.tmpVertices[9];
        let v45 = PlanetTools.tmpVertices[10];
        let v76 = PlanetTools.tmpVertices[11];
        let v0132 = PlanetTools.tmpVertices[12];
        let v4576 = PlanetTools.tmpVertices[13];
        let v = PlanetTools.tmpVertices[14];
        PlanetTools.EvaluateVertexToRef(size, i, j, v0);
        PlanetTools.EvaluateVertexToRef(size, i + 1, j, v1);
        PlanetTools.EvaluateVertexToRef(size, i + 1, j + 1, v2);
        PlanetTools.EvaluateVertexToRef(size, i, j + 1, v3);
        v4.copyFrom(v0).scaleInPlace(h1);
        v5.copyFrom(v1).scaleInPlace(h1);
        v6.copyFrom(v2).scaleInPlace(h1);
        v7.copyFrom(v3).scaleInPlace(h1);
        v0.scaleInPlace(h0);
        v1.scaleInPlace(h0);
        v2.scaleInPlace(h0);
        v3.scaleInPlace(h0);
        let skewedVertexData = new BABYLON.VertexData();
        let positions = [];
        let normals = [...vertexData.normals];
        let indices = [...vertexData.indices];
        let uvs = [...vertexData.uvs];
        let colors;
        if (vertexData.colors) {
            colors = [...vertexData.colors];
        }
        for (let n = 0; n < vertexData.positions.length / 3; n++) {
            let x = vertexData.positions[3 * n];
            let y = vertexData.positions[3 * n + 1];
            let z = vertexData.positions[3 * n + 2];
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
        }
        skewedVertexData.positions = positions;
        skewedVertexData.normals = normals;
        skewedVertexData.indices = indices;
        skewedVertexData.colors = colors;
        skewedVertexData.uvs = uvs;
        return skewedVertexData;
    }
    static Data(refData, callback) {
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i][j] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    refData[i][j][k] = callback(i, j, k);
                }
            }
        }
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
        let ax = Math.abs(worldPos.x);
        let ay = Math.abs(worldPos.y);
        let az = Math.abs(worldPos.z);
        if (ax >= ay && ax >= az) {
            if (worldPos.x >= 0) {
                return planet.GetSide(Side.Right);
            }
            return planet.GetSide(Side.Left);
        }
        if (ay >= ax && ay >= az) {
            if (worldPos.y >= 0) {
                return planet.GetSide(Side.Top);
            }
            return planet.GetSide(Side.Bottom);
        }
        if (az >= ax && az >= ay) {
            if (worldPos.z >= 0) {
                return planet.GetSide(Side.Front);
            }
            return planet.GetSide(Side.Back);
        }
    }
    static WorldPositionToGlobalIJK(planetSide, worldPos) {
        let invert = new BABYLON.Matrix();
        planetSide.computeWorldMatrix(true).invertToRef(invert);
        let localPos = BABYLON.Vector3.TransformCoordinates(worldPos, invert);
        let r = localPos.length();
        if (Math.abs(localPos.x) > 1) {
            localPos.scaleInPlace(Math.abs(1 / localPos.x));
        }
        if (Math.abs(localPos.y) > 1) {
            localPos.scaleInPlace(Math.abs(1 / localPos.y));
        }
        if (Math.abs(localPos.z) > 1) {
            localPos.scaleInPlace(Math.abs(1 / localPos.z));
        }
        let xDeg = (Math.atan(localPos.x) / Math.PI) * 180;
        let zDeg = (Math.atan(localPos.z) / Math.PI) * 180;
        let k = PlanetTools.AltitudeToKGlobal(r);
        let i = Math.floor(((xDeg + 45) / 90) * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));
        let j = Math.floor(((zDeg + 45) / 90) * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));
        return { i: i, j: j, k: k };
    }
    static WorldPositionToLocalIJK(planet, worldPos) {
        let planetSide = PlanetTools.WorldPositionToPlanetSide(planet, worldPos);
        let globalIJK = PlanetTools.WorldPositionToGlobalIJK(planetSide, worldPos);
        let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
        return localIJK;
    }
    static WorldPositionToChunck(planet, worldPos) {
        let localIJK = PlanetTools.WorldPositionToLocalIJK(planet, worldPos);
        return localIJK ? localIJK.planetChunck : undefined;
    }
    static GlobalIJKToWorldPosition(planetSide, globalIJK, middleAltitude) {
        let size = PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(globalIJK.k));
        let p = PlanetTools.EvaluateVertex(size, globalIJK.i + 0.5, globalIJK.j + 0.5);
        if (middleAltitude) {
            p.scaleInPlace(PlanetTools.KGlobalToAltitude(globalIJK.k) * 0.5 + PlanetTools.KGlobalToAltitude(globalIJK.k + 1) * 0.5);
        }
        else {
            p.scaleInPlace(PlanetTools.KGlobalToAltitude(globalIJK.k));
        }
        p = BABYLON.Vector3.TransformCoordinates(p, planetSide.computeWorldMatrix(true));
        return p;
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
    static LocalIJKToGlobalIJK(a, localI, localJ, localK) {
        let planetChunck;
        if (a instanceof PlanetChunck) {
            planetChunck = a;
        }
        else {
            planetChunck = a.planetChunck;
            localI = a.i;
            localJ = a.j;
            localK = a.k;
        }
        return {
            i: planetChunck.iPos * PlanetTools.CHUNCKSIZE + localI,
            j: planetChunck.jPos * PlanetTools.CHUNCKSIZE + localJ,
            k: planetChunck.kPos * PlanetTools.CHUNCKSIZE + localK
        };
    }
    static LocalIJKToWorldPosition(a, b, localJ, localK, middleAltitude) {
        let planetChunck;
        let localI;
        if (a instanceof PlanetChunck) {
            planetChunck = a;
            localI = b;
        }
        else {
            planetChunck = a.planetChunck;
            localI = a.i;
            localJ = a.j;
            localK = a.k;
            middleAltitude = b;
        }
        let globalIJK = PlanetTools.LocalIJKToGlobalIJK(planetChunck, localI, localJ, localK);
        return PlanetTools.GlobalIJKToWorldPosition(planetChunck.planetSide, globalIJK, middleAltitude);
    }
    static KGlobalToDegree(k) {
        return PlanetTools.KPosToDegree(Math.floor(k / PlanetTools.CHUNCKSIZE));
    }
    static KPosToDegree(kPos) {
        return PlanetTools.KPosToDegree16(kPos);
    }
    static KPosToSize(kPos) {
        return PlanetTools.DegreeToSize(PlanetTools.KPosToDegree(kPos));
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
        let coreRadius = 13.4;
        let radius = coreRadius;
        let degree = this.DEGREEMIN;
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
        let degree = this.DEGREEMIN;
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
    static KPosToDegree16(kPos) {
        let v = PlanetTools._KPosToDegree.get(kPos);
        if (isFinite(v)) {
            return v;
        }
        let degree = this.DEGREEMIN;
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
        let degree = this.DEGREEMIN;
        while (degree < PlanetTools.Altitudes.length - 1) {
            let highest = PlanetTools.Altitudes[degree + 1][0];
            if (altitude < highest) {
                break;
            }
            else {
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
    static KLocalToAltitude(chunck, k) {
        let degree = PlanetTools.KGlobalToDegree(chunck.kPos * PlanetTools.CHUNCKSIZE + k);
        let altitudes = PlanetTools.Altitudes[degree];
        let summedLength = PlanetTools.SummedBSizesLength[degree];
        return altitudes[chunck.kPos * PlanetTools.CHUNCKSIZE + k - summedLength];
    }
    static DegreeToKOffset(degree) {
        return PlanetTools._SummedBSizesLength[degree] / PlanetTools.CHUNCKSIZE;
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
PlanetTools.DEGREEMIN = 5;
PlanetTools.CHUNCKSIZE = 16;
PlanetTools.ALPHALIMIT = Math.PI / 4;
PlanetTools.DISTANCELIMITSQUARED = 128 * 128;
PlanetTools._KPosToDegree = new Map();
class ProceduralTree {
    constructor(chunckManager) {
        this.chunckManager = chunckManager;
    }
    generateData() {
        let w = PlanetTools.LocalIJKToWorldPosition(this.chunck, this.i, this.j, this.k);
        let n = this.chunck.normal;
        let chuncks = PlanetBlockMaker.AddLine(this.chunck.planetSide.planet, w, w.add(n.scale(5)), BlockType.Wood);
        chuncks.push(...PlanetBlockMaker.AddSphere(this.chunck.planetSide.planet, w.add(n.scale(5)), 3, BlockType.Leaf));
        for (let i = 0; i < chuncks.length; i++) {
            chuncks[i].doDataSafety();
            if (chuncks[i].lod <= 1) {
                this.chunckManager.requestDraw(chuncks[i], chuncks[i].lod, "ProceduralTree.generateData");
            }
        }
    }
}
var KeyInput;
(function (KeyInput) {
    KeyInput[KeyInput["NULL"] = -1] = "NULL";
    KeyInput[KeyInput["ACTION_SLOT_0"] = 0] = "ACTION_SLOT_0";
    KeyInput[KeyInput["ACTION_SLOT_1"] = 1] = "ACTION_SLOT_1";
    KeyInput[KeyInput["ACTION_SLOT_2"] = 2] = "ACTION_SLOT_2";
    KeyInput[KeyInput["ACTION_SLOT_3"] = 3] = "ACTION_SLOT_3";
    KeyInput[KeyInput["ACTION_SLOT_4"] = 4] = "ACTION_SLOT_4";
    KeyInput[KeyInput["ACTION_SLOT_5"] = 5] = "ACTION_SLOT_5";
    KeyInput[KeyInput["ACTION_SLOT_6"] = 6] = "ACTION_SLOT_6";
    KeyInput[KeyInput["ACTION_SLOT_7"] = 7] = "ACTION_SLOT_7";
    KeyInput[KeyInput["ACTION_SLOT_8"] = 8] = "ACTION_SLOT_8";
    KeyInput[KeyInput["ACTION_SLOT_9"] = 9] = "ACTION_SLOT_9";
    KeyInput[KeyInput["INVENTORY"] = 10] = "INVENTORY";
    KeyInput[KeyInput["MOVE_FORWARD"] = 11] = "MOVE_FORWARD";
    KeyInput[KeyInput["MOVE_LEFT"] = 12] = "MOVE_LEFT";
    KeyInput[KeyInput["MOVE_BACK"] = 13] = "MOVE_BACK";
    KeyInput[KeyInput["MOVE_RIGHT"] = 14] = "MOVE_RIGHT";
    KeyInput[KeyInput["JUMP"] = 15] = "JUMP";
})(KeyInput || (KeyInput = {}));
class InputManager {
    constructor() {
        this.keyInputMap = new Map();
        this.keyInputDown = new UniqueList();
        this.keyDownListeners = [];
        this.mappedKeyDownListeners = new Map();
        this.keyUpListeners = [];
        this.mappedKeyUpListeners = new Map();
    }
    initialize() {
        this.keyInputMap.set("Digit0", KeyInput.ACTION_SLOT_0);
        this.keyInputMap.set("Digit1", KeyInput.ACTION_SLOT_1);
        this.keyInputMap.set("Digit2", KeyInput.ACTION_SLOT_2);
        this.keyInputMap.set("Digit3", KeyInput.ACTION_SLOT_3);
        this.keyInputMap.set("Digit4", KeyInput.ACTION_SLOT_4);
        this.keyInputMap.set("Digit5", KeyInput.ACTION_SLOT_5);
        this.keyInputMap.set("Digit6", KeyInput.ACTION_SLOT_6);
        this.keyInputMap.set("Digit7", KeyInput.ACTION_SLOT_7);
        this.keyInputMap.set("Digit8", KeyInput.ACTION_SLOT_8);
        this.keyInputMap.set("Digit9", KeyInput.ACTION_SLOT_9);
        this.keyInputMap.set("KeyI", KeyInput.INVENTORY);
        this.keyInputMap.set("KeyW", KeyInput.MOVE_FORWARD);
        this.keyInputMap.set("KeyA", KeyInput.MOVE_LEFT);
        this.keyInputMap.set("KeyS", KeyInput.MOVE_BACK);
        this.keyInputMap.set("KeyD", KeyInput.MOVE_RIGHT);
        this.keyInputMap.set("Space", KeyInput.JUMP);
        window.addEventListener("keydown", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (isFinite(keyInput)) {
                this.keyInputDown.push(keyInput);
                for (let i = 0; i < this.keyDownListeners.length; i++) {
                    this.keyDownListeners[i](keyInput);
                }
                let listeners = this.mappedKeyDownListeners.get(keyInput);
                if (listeners) {
                    for (let i = 0; i < listeners.length; i++) {
                        listeners[i]();
                    }
                }
            }
        });
        window.addEventListener("keyup", (e) => {
            let keyInput = this.keyInputMap.get(e.code);
            if (isFinite(keyInput)) {
                this.keyInputDown.remove(keyInput);
                for (let i = 0; i < this.keyUpListeners.length; i++) {
                    this.keyUpListeners[i](keyInput);
                }
                let listeners = this.mappedKeyUpListeners.get(keyInput);
                if (listeners) {
                    for (let i = 0; i < listeners.length; i++) {
                        listeners[i]();
                    }
                }
            }
        });
    }
    addKeyDownListener(callback) {
        this.keyDownListeners.push(callback);
    }
    addMappedKeyDownListener(k, callback) {
        let listeners = this.mappedKeyDownListeners.get(k);
        if (listeners) {
            listeners.push(callback);
        }
        else {
            listeners = [callback];
            this.mappedKeyDownListeners.set(k, listeners);
        }
    }
    removeKeyDownListener(callback) {
        let i = this.keyDownListeners.indexOf(callback);
        if (i != -1) {
            this.keyDownListeners.splice(i, 1);
        }
    }
    removeMappedKeyDownListener(k, callback) {
        let listeners = this.mappedKeyDownListeners.get(k);
        if (listeners) {
            let i = listeners.indexOf(callback);
            if (i != -1) {
                listeners.splice(i, 1);
            }
        }
    }
    addKeyUpListener(callback) {
        this.keyUpListeners.push(callback);
    }
    addMappedKeyUpListener(k, callback) {
        let listeners = this.mappedKeyUpListeners.get(k);
        if (listeners) {
            listeners.push(callback);
        }
        else {
            listeners = [callback];
            this.mappedKeyUpListeners.set(k, listeners);
        }
    }
    removeKeyUpListener(callback) {
        let i = this.keyUpListeners.indexOf(callback);
        if (i != -1) {
            this.keyUpListeners.splice(i, 1);
        }
    }
    removeMappedKeyUpListener(k, callback) {
        let listeners = this.mappedKeyUpListeners.get(k);
        if (listeners) {
            let i = listeners.indexOf(callback);
            if (i != -1) {
                listeners.splice(i, 1);
            }
        }
    }
    isKeyInputDown(keyInput) {
        return this.keyInputDown.contains(keyInput);
    }
    getkeyInputActionSlotDown() {
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_0)) {
            return KeyInput.ACTION_SLOT_0;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_1)) {
            return KeyInput.ACTION_SLOT_1;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_2)) {
            return KeyInput.ACTION_SLOT_2;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_3)) {
            return KeyInput.ACTION_SLOT_3;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_4)) {
            return KeyInput.ACTION_SLOT_4;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_5)) {
            return KeyInput.ACTION_SLOT_5;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_6)) {
            return KeyInput.ACTION_SLOT_6;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_7)) {
            return KeyInput.ACTION_SLOT_7;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_8)) {
            return KeyInput.ACTION_SLOT_8;
        }
        if (this.keyInputDown.contains(KeyInput.ACTION_SLOT_9)) {
            return KeyInput.ACTION_SLOT_9;
        }
        return KeyInput.NULL;
    }
}
class Player extends BABYLON.Mesh {
    constructor(position, planet, game) {
        super("Player", Game.Scene);
        this.planet = planet;
        this.game = game;
        this.mass = 1;
        this.speed = 5;
        this.velocity = BABYLON.Vector3.Zero();
        this.underWater = false;
        this.inputForward = 0;
        this.inputRight = 0;
        this.inputHeadUp = 0;
        this.inputHeadRight = 0;
        this._initialized = false;
        this._keyUp = (e) => {
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
                this.inputHeadRight += movementX / 100;
                this.inputHeadUp += movementY / 100;
                this.inputHeadRight = Math.max(Math.min(this.inputHeadRight, 1), -1);
                this.inputHeadUp = Math.max(Math.min(this.inputHeadUp, 1), -1);
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
        this._headPosition = BABYLON.Vector3.Zero();
        this._collisionAxis = [];
        this._collisionPositions = [];
        this._jumpTimer = 0;
        this._isGrounded = false;
        this._chuncks = [];
        this._meshes = [];
        this._action = () => {
            let ray = new BABYLON.Ray(this.camPos.absolutePosition, this.camPos.forward);
            let hit = ray.intersectsMeshes(this._meshes);
            hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
            if (hit[0] && hit[0].pickedPoint) {
                if (!this._debugAimGroundMesh) {
                    this._debugAimGroundMesh = BABYLON.MeshBuilder.CreateSphere("debug-aim-mesh", { diameter: 0.2 }, this.getScene());
                    let material = new BABYLON.StandardMaterial("material", this.getScene());
                    material.alpha = 0.5;
                    this._debugAimGroundMesh.material = material;
                }
                this._debugAimGroundMesh.position.copyFrom(hit[0].pickedPoint);
                let chunck = PlanetTools.WorldPositionToChunck(this.planet, hit[0].pickedPoint);
                if (chunck) {
                    let textPage = new TextPage(this.game);
                    textPage.instantiate();
                    textPage.lines = chunck.debugTextInfo();
                    textPage.redraw();
                    textPage.setPosition(hit[0].pickedPoint);
                    textPage.setTarget(this.position);
                    textPage.open();
                }
            }
        };
        this._update = () => {
            if (Game.CameraManager.cameraMode != CameraMode.Player) {
                return;
            }
            let deltaTime = Game.Engine.getDeltaTime() / 1000;
            this._jumpTimer = Math.max(this._jumpTimer - deltaTime, 0);
            this._keepUp();
            let rotationPower = this.inputHeadRight * 0.05;
            let rotationCamPower = this.inputHeadUp * 0.05;
            let localY = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix());
            let rotation = BABYLON.Quaternion.RotationAxis(localY, rotationPower);
            this.rotationQuaternion = rotation.multiply(this.rotationQuaternion);
            this.camPos.rotation.x += rotationCamPower;
            this.camPos.rotation.x = Math.max(this.camPos.rotation.x, -Math.PI / 2);
            this.camPos.rotation.x = Math.min(this.camPos.rotation.x, Math.PI / 2);
            if (this.game.inputMode === InputMode.Mouse) {
                this.inputHeadRight *= 0.8;
                this.inputHeadUp *= 0.8;
            }
            this._collisionPositions[0] = this._headPosition;
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
            this._feetPosition.addInPlace(this._downDirection.scale(-0.5));
            this._headPosition.copyFrom(this.position);
            this._headPosition.addInPlace(this._downDirection.scale(0.5));
            // Add gravity and ground reaction.
            this._gravityFactor.copyFrom(this._downDirection).scaleInPlace(9.8 * deltaTime);
            this._groundFactor.copyFromFloats(0, 0, 0);
            let fVert = 1;
            this._chuncks.forEach((chunck) => {
                //chunck.unlit();
            });
            this._chuncks = [];
            this._meshes = [];
            if (this._jumpTimer === 0) {
                let chunck = PlanetTools.WorldPositionToChunck(this.planet, this.position);
                if (chunck) {
                    this._chuncks.push(chunck);
                    if (chunck.mesh) {
                        this._meshes.push(chunck.mesh);
                    }
                    if (chunck.adjacentsAsArray) {
                        for (let i = 0; i < chunck.adjacentsAsArray.length; i++) {
                            let adjChunck = chunck.adjacentsAsArray[i];
                            this._chuncks.push(adjChunck);
                            if (adjChunck.mesh) {
                                this._meshes.push(adjChunck.mesh);
                            }
                        }
                    }
                    this._chuncks.forEach((chunck) => {
                        //chunck.highlight();
                    });
                    let ray = new BABYLON.Ray(this.position.add(this.up), this._downDirection);
                    let hit = ray.intersectsMeshes(this._meshes);
                    hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
                    if (hit[0] && hit[0].pickedPoint) {
                        if (!this._debugCollisionGroundMesh) {
                            this._debugCollisionGroundMesh = BABYLON.MeshBuilder.CreateSphere("debug-collision-mesh", { diameter: 0.2 }, this.getScene());
                            let material = new BABYLON.StandardMaterial("material", this.getScene());
                            material.alpha = 0.5;
                            this._debugCollisionGroundMesh.material = material;
                        }
                        this._debugCollisionGroundMesh.position.copyFrom(hit[0].pickedPoint);
                        let d = BABYLON.Vector3.Dot(this.position.subtract(hit[0].pickedPoint), this.up) + 1;
                        if (d > 0 && d < 2.5) {
                            this._groundFactor
                                .copyFrom(this._gravityFactor)
                                .scaleInPlace(-1)
                                .scaleInPlace(1 / (d * 0.5));
                            fVert = 0.005;
                            this._isGrounded = true;
                        }
                    }
                }
            }
            this.velocity.addInPlace(this._gravityFactor);
            this.velocity.addInPlace(this._groundFactor);
            // Add input force.
            this._controlFactor.copyFromFloats(0, 0, 0);
            this._controlFactor.addInPlace(this._rightDirection.scale(this.inputRight));
            this._controlFactor.addInPlace(this._forwardDirection.scale(this.inputForward));
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
            if (!this.godMode) {
                for (let i = 0; i < this._collisionPositions.length; i++) {
                    let pos = this._collisionPositions[i];
                    for (let j = 0; j < this._collisionAxis.length; j++) {
                        let axis = this._collisionAxis[j];
                        let ray = new BABYLON.Ray(pos, axis, 0.35);
                        let hit = ray.intersectsMeshes(this._meshes);
                        hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
                        if (hit[0] && hit[0].pickedPoint) {
                            if (!this._debugCollisionWallMesh) {
                                this._debugCollisionWallMesh = BABYLON.MeshBuilder.CreateSphere("debug-collision-mesh", { diameter: 0.2 }, this.getScene());
                                let material = new BABYLON.StandardMaterial("material", this.getScene());
                                material.alpha = 0.5;
                                this._debugCollisionWallMesh.material = material;
                            }
                            this._debugCollisionWallMesh.position.copyFrom(hit[0].pickedPoint);
                            let d = hit[0].pickedPoint.subtract(pos).length();
                            if (d > 0.01) {
                                this._surfaceFactor.addInPlace(axis.scale((((-10 / this.mass) * 0.3) / d) * deltaTime));
                                fLat = 0.1;
                            }
                            else {
                                // In case where it stuck to the surface, force push.
                                this.position.addInPlace(hit[0].getNormal(true).scale(0.01));
                            }
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
            // Update action
            if (this.currentAction) {
                if (this.currentAction.onUpdate) {
                    this.currentAction.onUpdate();
                }
            }
            //document.querySelector("#camera-altitude").textContent = this.camPos.absolutePosition.length().toFixed(1);
        };
        this.planet = planet;
        this.position = position;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.camPos = new BABYLON.Mesh("Dummy", Game.Scene);
        this.camPos.parent = this;
        this.camPos.position = new BABYLON.Vector3(0, 1, 0);
        BABYLON.VertexData.CreateSphere({ diameterX: 1, diameterY: 2, diameterZ: 1 }).applyToMesh(this);
        let material = new BABYLON.StandardMaterial("material", this.getScene());
        material.alpha = 0.5;
        this.material = material;
        //this.layerMask = 0x10000000;
    }
    initialize() {
        if (!this._initialized) {
            Game.Scene.onBeforeRenderObservable.add(this._update);
            this._initialized = true;
        }
    }
    registerControl() {
        this.game.inputManager.addMappedKeyDownListener(KeyInput.MOVE_FORWARD, () => {
            this.inputForward = 1;
        });
        this.game.inputManager.addMappedKeyDownListener(KeyInput.MOVE_BACK, () => {
            this.inputForward = -1;
        });
        this.game.inputManager.addMappedKeyDownListener(KeyInput.MOVE_RIGHT, () => {
            this.inputRight = 1;
        });
        this.game.inputManager.addMappedKeyDownListener(KeyInput.MOVE_LEFT, () => {
            this.inputRight = -1;
        });
        this.game.inputManager.addMappedKeyUpListener(KeyInput.MOVE_FORWARD, () => {
            this.inputForward = 0;
        });
        this.game.inputManager.addMappedKeyUpListener(KeyInput.MOVE_BACK, () => {
            this.inputForward = 0;
        });
        this.game.inputManager.addMappedKeyUpListener(KeyInput.MOVE_RIGHT, () => {
            this.inputRight = 0;
        });
        this.game.inputManager.addMappedKeyUpListener(KeyInput.MOVE_LEFT, () => {
            this.inputRight = 0;
        });
        this.game.canvas.addEventListener("keyup", this._keyUp);
        this.game.canvas.addEventListener("mousemove", this._mouseMove);
        this.game.canvas.addEventListener("mouseup", () => {
            if (this.currentAction) {
                if (this.currentAction.onClick) {
                    this.currentAction.onClick();
                }
            }
        });
    }
    unregisterControl() {
        this.game.canvas.removeEventListener("keyup", this._keyUp);
        this.game.canvas.removeEventListener("mousemove", this._mouseMove);
        this.game.canvas.removeEventListener("mouseup", this._action);
    }
    get meshes() {
        return this._meshes;
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
var ACTIVE_DEBUG_PLAYER_ACTION = true;
var ADD_BRICK_ANIMATION_DURATION = 1000;
class PlayerActionTemplate {
    static async CreateBlockAction(player, blockType) {
        let action = new PlayerAction("cube-", player);
        let previewMesh;
        action.iconUrl = "/datas/images/block-icon-" + BlockTypeNames[blockType] + "-miniature.png";
        let vData = (await player.game.vertexDataLoader.get("chunck-part"))[0];
        let lastSize;
        let lastI;
        let lastJ;
        let lastK;
        action.onUpdate = () => {
            let ray = new BABYLON.Ray(player.camPos.absolutePosition, player.camPos.forward);
            let hit = ray.intersectsMeshes(player.meshes);
            hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
            if (hit[0] && hit[0].pickedPoint) {
                let n = hit[0].getNormal(true).scaleInPlace(0.2);
                let localIJK = PlanetTools.WorldPositionToLocalIJK(player.planet, hit[0].pickedPoint.add(n));
                if (localIJK) {
                    // Redraw block preview
                    if (!previewMesh) {
                        previewMesh = BABYLON.MeshBuilder.CreateSphere("preview-mesh", { diameter: 1 });
                        let material = new BABYLON.StandardMaterial("material");
                        material.alpha = 0.25;
                        previewMesh.material = material;
                    }
                    let globalIJK = PlanetTools.LocalIJKToGlobalIJK(localIJK);
                    let needRedrawMesh = false;
                    if (lastSize != localIJK.planetChunck.size) {
                        lastSize = localIJK.planetChunck.size;
                        needRedrawMesh = true;
                    }
                    if (lastI != localIJK.i) {
                        lastI = localIJK.i;
                        needRedrawMesh = true;
                    }
                    if (lastJ != localIJK.j) {
                        lastJ = localIJK.j;
                        needRedrawMesh = true;
                    }
                    if (lastK != localIJK.k) {
                        lastK = localIJK.k;
                        needRedrawMesh = true;
                    }
                    if (needRedrawMesh) {
                        PlanetTools.SkewVertexData(vData, localIJK.planetChunck.size, globalIJK.i, globalIJK.j, globalIJK.k).applyToMesh(previewMesh);
                        previewMesh.parent = localIJK.planetChunck.planetSide;
                    }
                    return;
                }
            }
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
        };
        action.onClick = () => {
            let ray = new BABYLON.Ray(player.camPos.absolutePosition, player.camPos.forward);
            let hit = ray.intersectsMeshes(player.meshes);
            hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
            if (hit[0] && hit[0].pickedPoint) {
                let n = hit[0].getNormal(true).scaleInPlace(0.2);
                let localIJK = PlanetTools.WorldPositionToLocalIJK(player.planet, hit[0].pickedPoint.add(n));
                if (localIJK) {
                    localIJK.planetChunck.SetData(localIJK.i, localIJK.j, localIJK.k, blockType);
                    Game.Instance.chunckManager.requestDraw(localIJK.planetChunck, localIJK.planetChunck.lod, "PlayerAction.onClick");
                }
            }
        };
        action.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
        };
        return action;
    }
}
class PlayerAction {
    constructor(name, player) {
        this.name = name;
        this.player = player;
        this.r = 0;
    }
}
class PlayerActionManager {
    constructor(player, game) {
        this.player = player;
        this.game = game;
        this.linkedActions = [];
        this.hintedSlotIndex = new UniqueList();
        this.update = () => {
            if (this.hintedSlotIndex.length > 0) {
                let t = (new Date()).getTime();
                let thickness = Math.cos(2 * Math.PI * t / 1000) * 2 + 3;
                let opacity = (Math.cos(2 * Math.PI * t / 1000) + 1) * 0.5 * 0.5 + 0.25;
                for (let i = 0; i < this.hintedSlotIndex.length; i++) {
                    let slotIndex = this.hintedSlotIndex.get(i);
                    console.log(thickness);
                    document.querySelector("#player-action-" + slotIndex).style.backgroundColor = "rgba(255, 255, 255, " + opacity.toFixed(2) + ")";
                }
            }
        };
    }
    initialize() {
        Main.Scene.onBeforeRenderObservable.add(this.update);
        this.game.inputManager.addKeyDownListener((e) => {
            let slotIndex = e;
            if (slotIndex >= 0 && slotIndex < 10) {
                if (!document.pointerLockElement) {
                    this.startHint(slotIndex);
                }
            }
        });
        this.game.inputManager.addKeyUpListener((e) => {
            let slotIndex = e;
            this.equipAction(slotIndex);
        });
        for (let i = 0; i < 10; i++) {
            let slotIndex = i;
            document.querySelector("#player-action-" + slotIndex).addEventListener("touchend", () => {
                this.equipAction(slotIndex);
            });
        }
    }
    linkAction(action, slotIndex) {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.linkedActions[slotIndex] = action;
            console.log(slotIndex + " " + action.iconUrl);
            document.querySelector("#player-action-" + slotIndex + " .icon").src = action.iconUrl;
        }
    }
    unlinkAction(slotIndex) {
        if (slotIndex >= 0 && slotIndex <= 9) {
            this.linkedActions[slotIndex] = undefined;
            document.querySelector("#player-action-" + slotIndex + " .icon").src = "";
        }
    }
    equipAction(slotIndex) {
        if (slotIndex >= 0 && slotIndex < 10) {
            this.stopHint(slotIndex);
            for (let i = 0; i < 10; i++) {
                document.querySelector("#player-action-" + i + " .background").src = "/datas/images/inventory-item-background.svg";
            }
            // Unequip current action
            if (this.player.currentAction) {
                if (this.player.currentAction.onUnequip) {
                    this.player.currentAction.onUnequip();
                }
            }
            if (this.linkedActions[slotIndex]) {
                // If request action was already equiped, remove it.
                if (this.player.currentAction === this.linkedActions[slotIndex]) {
                    this.player.currentAction = undefined;
                }
                // Otherwise, equip new action.
                else {
                    this.player.currentAction = this.linkedActions[slotIndex];
                    if (this.player.currentAction) {
                        document.querySelector("#player-action-" + slotIndex + " .background").src = "/datas/images/inventory-item-background-highlit.svg";
                        if (this.player.currentAction.onEquip) {
                            this.player.currentAction.onEquip();
                        }
                    }
                }
            }
            else {
                this.player.currentAction = undefined;
            }
        }
    }
    startHint(slotIndex) {
        this.hintedSlotIndex.push(slotIndex);
    }
    stopHint(slotIndex) {
        this.hintedSlotIndex.remove(slotIndex);
        document.querySelector("#player-action-" + slotIndex).style.backgroundColor = "";
    }
    serialize() {
        let linkedActionsNames = [];
        for (let i = 0; i < this.linkedActions.length; i++) {
            if (this.linkedActions[i]) {
                linkedActionsNames[i] = this.linkedActions[i].name;
            }
        }
        return {
            linkedActionsNames: linkedActionsNames
        };
    }
    deserialize(data) {
        if (data && data.linkedActionsNames) {
            for (let i = 0; i < data.linkedActionsNames.length; i++) {
                let linkedActionName = data.linkedActionsNames[i];
                //let item = this.player.inventory.getItemByPlayerActionName(linkedActionName);
                //if (item) {
                //    this.linkAction(item.playerAction, i);
                //    item.timeUse = (new Date()).getTime();
                //}
            }
        }
    }
}
// Code by Andrey Sitnik and Ivan Solovev https://github.com/ai/easings.net
class Easing {
    static easeInOutSine(x) {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    }
    static easeOutElastic(x) {
        const c4 = (2 * Math.PI) / 3;
        return x === 0
            ? 0
            : x === 1
                ? 1
                : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }
    static easeInOutBack(x) {
        const c1 = 1.70158;
        const c2 = c1 * 1.525;
        return x < 0.5
            ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
            : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
    }
}
class PlayerInput {
    constructor(player) {
        this.player = player;
        this.game = player.game;
    }
    connectInput() {
    }
}
/// <reference path="PlayerInput.ts"/>
class PlayerInputVirtualButton extends PlayerInput {
    constructor() {
        super(...arguments);
        this.clientWidth = 100;
        this.clientHeight = 100;
        this.size = 10;
        this.marginLeft = 10;
        this.marginBottom = 10;
        this.centerX = 20;
        this.centerY = 20;
    }
    connectInput(callback) {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 1000 1000");
        this.clientWidth = document.body.clientWidth;
        this.clientHeight = document.body.clientHeight;
        let ratio = this.clientWidth / this.clientHeight;
        if (ratio > 1) {
            this.size = this.clientHeight * 0.25;
        }
        else {
            this.size = this.clientWidth * 0.25;
        }
        let margin = Math.min(50, this.size * 0.3);
        this.centerX = this.clientWidth * 0.5;
        this.centerY = this.clientHeight - this.size * 0.5 - margin;
        this.svg.style.display = "block";
        this.svg.style.position = "fixed";
        this.svg.style.width = this.size.toFixed(0) + "px";
        this.svg.style.height = this.size.toFixed(0) + "px";
        this.svg.style.zIndex = "2";
        this.svg.style.left = (this.clientWidth * 0.75 * 0.5).toFixed(0) + "px";
        this.svg.style.bottom = margin.toFixed(0) + "px";
        this.svg.style.overflow = "visible";
        this.svg.style.pointerEvents = "none";
        document.body.appendChild(this.svg);
        let base = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        base.setAttribute("cx", "500");
        base.setAttribute("cy", "500");
        base.setAttribute("r", "500");
        base.setAttribute("fill", "white");
        base.setAttribute("fill-opacity", "10%");
        base.setAttribute("stroke-width", "4");
        base.setAttribute("stroke", "white");
        this.svg.appendChild(base);
        if (callback) {
            this.game.canvas.addEventListener("pointerdown", (ev) => {
                let dx = this.clientXToDX(ev.clientX);
                let dy = this.clientYToDY(ev.clientY);
                if (dx * dx + dy * dy < 1) {
                    callback(ev);
                }
            });
        }
    }
    clientXToDX(clientX) {
        return (clientX - this.centerX) / (this.size * 0.5);
    }
    clientYToDY(clientY) {
        return -(clientY - this.centerY) / (this.size * 0.5);
    }
    disconnect() {
        if (this.svg) {
            document.body.removeChild(this.svg);
        }
    }
}
/// <reference path="PlayerInput.ts"/>
class PlayerInputVirtualPad extends PlayerInput {
    constructor() {
        super(...arguments);
        this.clientWidth = 100;
        this.clientHeight = 100;
        this.size = 10;
        this.marginLeft = 10;
        this.marginBottom = 10;
        this.centerX = 20;
        this.centerY = 20;
        this._pointerDown = false;
        this._dx = 0;
        this._dy = 0;
        this._update = () => {
            if (!this._pointerDown) {
                if (Math.abs(this._dx) > 0.001 || Math.abs(this._dy) > 0.001) {
                    this._dx *= 0.9;
                    this._dy *= 0.9;
                    if (Math.abs(this._dx) > 0.001 || Math.abs(this._dy) > 0.001) {
                        this.updatePad(this._dx, this._dy);
                        this.updatePilot(this._dx, this._dy);
                    }
                    else {
                        this.updatePad(0, 0);
                        this.updatePilot(0, 0);
                    }
                }
            }
        };
    }
    connectInput(left) {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 1000 1000");
        this.clientWidth = document.body.clientWidth;
        this.clientHeight = document.body.clientHeight;
        let ratio = this.clientWidth / this.clientHeight;
        if (ratio > 1) {
            this.size = this.clientHeight * 0.25;
        }
        else {
            this.size = this.clientWidth * 0.25;
        }
        let margin = Math.min(50, this.size * 0.3);
        this.svg.style.display = "block";
        this.svg.style.position = "fixed";
        this.svg.style.width = this.size.toFixed(0) + "px";
        this.svg.style.height = this.size.toFixed(0) + "px";
        this.svg.style.zIndex = "2";
        if (left) {
            this.svg.style.left = margin.toFixed(0) + "px";
        }
        else {
            this.svg.style.right = margin.toFixed(0) + "px";
        }
        this.svg.style.bottom = margin.toFixed(0) + "px";
        this.svg.style.overflow = "visible";
        this.svg.style.pointerEvents = "none";
        document.body.appendChild(this.svg);
        let base = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        base.setAttribute("cx", "500");
        base.setAttribute("cy", "500");
        base.setAttribute("r", "500");
        base.setAttribute("fill", "white");
        base.setAttribute("fill-opacity", "10%");
        base.setAttribute("stroke-width", "4");
        base.setAttribute("stroke", "white");
        this.svg.appendChild(base);
        this.pad = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.pad.setAttribute("cx", "500");
        this.pad.setAttribute("cy", "500");
        this.pad.setAttribute("r", "250");
        this.pad.setAttribute("fill", "white");
        this.pad.setAttribute("fill-opacity", "50%");
        this.pad.setAttribute("stroke-width", "4");
        this.pad.setAttribute("stroke", "white");
        this.svg.appendChild(this.pad);
        if (left) {
            this.centerX = this.size * 0.5 + margin;
        }
        else {
            this.centerX = this.clientWidth - this.size * 0.5 - margin;
        }
        this.centerY = this.clientHeight - this.size * 0.5 - margin;
        this.game.canvas.addEventListener("pointerdown", (ev) => {
            let dx = this.clientXToDX(ev.clientX);
            let dy = this.clientYToDY(ev.clientY);
            if (dx * dx + dy * dy < 1) {
                this._pointerDown = true;
                this._dx = dx;
                this._dy = dy;
                this.updatePad(this._dx, this._dy);
                this.updatePilot(this._dx, this._dy);
            }
        });
        this.game.canvas.addEventListener("pointermove", (ev) => {
            if (this._pointerDown) {
                let dx = this.clientXToDX(ev.clientX);
                let dy = this.clientYToDY(ev.clientY);
                if (dx * dx + dy * dy < 1) {
                    this._dx = dx;
                    this._dy = dy;
                    this.updatePad(this._dx, this._dy);
                    this.updatePilot(this._dx, this._dy);
                }
                else if (dx * dx + dy * dy < 4) {
                    let l = Math.sqrt(dx * dx + dy * dy);
                    this._dx = dx / l;
                    this._dy = dy / l;
                    this.updatePad(this._dx, this._dy);
                    this.updatePilot(this._dx, this._dy);
                }
            }
        });
        this.game.canvas.addEventListener("pointerup", (ev) => {
            let dx = this.clientXToDX(ev.clientX);
            let dy = this.clientYToDY(ev.clientY);
            if (dx * dx + dy * dy < 4) {
                this._pointerDown = false;
            }
        });
        this.game.scene.onBeforeRenderObservable.add(this._update);
    }
    disconnect() {
        if (this.svg) {
            document.body.removeChild(this.svg);
        }
        this.game.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
    clientXToDX(clientX) {
        return (clientX - this.centerX) / (this.size * 0.5);
    }
    clientYToDY(clientY) {
        return -(clientY - this.centerY) / (this.size * 0.5);
    }
    updatePad(dx, dy) {
        let cx = 500 + dx * 250;
        this.pad.setAttribute("cx", cx.toFixed(1));
        let cy = 500 - dy * 250;
        this.pad.setAttribute("cy", cy.toFixed(1));
    }
    updatePilot(dx, dy) { }
}
class PlayerInputMovePad extends PlayerInputVirtualPad {
    updatePilot(dx, dy) {
        this.player.inputForward = dy;
        this.player.inputRight = dx;
    }
}
class PlayerInputHeadPad extends PlayerInputVirtualPad {
    updatePilot(dx, dy) {
        this.player.inputHeadUp = -dy * 0.5;
        this.player.inputHeadRight = dx * 0.5;
    }
}
class TextPage {
    constructor(game) {
        this.game = game;
        // 24 lines of 80 characters each
        this.lines = [];
        this._w = 1600;
        this._h = 1000;
        this._angle = 0.8;
        this._radius = 2;
        this._cz = -2;
    }
    xTextureToPos(x) {
        let a = (x - this._w / 2) / this._w * this._angle;
        return new BABYLON.Vector2(Math.sin(a) * this._radius, Math.cos(a) * this._radius + this._cz);
    }
    async _animatePosY(posYTarget, duration) {
        return new Promise(resolve => {
            let yZero = this.mesh.position.y;
            let t = 0;
            let cb = () => {
                t += this.game.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.mesh.position.y = yZero * (1 - f) + posYTarget * f;
                }
                else {
                    this.mesh.position.y = posYTarget;
                    this.game.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            };
            this.game.scene.onBeforeRenderObservable.add(cb);
        });
    }
    async _animateScaleX(xTarget, duration) {
        return new Promise(resolve => {
            let xZero = this.mesh.scaling.x;
            let t = 0;
            let cb = () => {
                t += this.game.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.mesh.scaling.x = xZero * (1 - f) + xTarget * f;
                }
                else {
                    this.mesh.scaling.x = xTarget;
                    this.game.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            };
            this.game.scene.onBeforeRenderObservable.add(cb);
        });
    }
    async _animateScaleY(yTarget, duration) {
        return new Promise(resolve => {
            let yZero = this.mesh.scaling.y;
            let t = 0;
            let cb = () => {
                t += this.game.engine.getDeltaTime() / 1000;
                if (t < duration) {
                    let f = t / duration;
                    this.mesh.scaling.y = yZero * (1 - f) + yTarget * f;
                }
                else {
                    this.mesh.scaling.y = yTarget;
                    this.game.scene.onBeforeRenderObservable.removeCallback(cb);
                    resolve();
                }
            };
            this.game.scene.onBeforeRenderObservable.add(cb);
        });
    }
    instantiate() {
        this.baseMesh = BABYLON.MeshBuilder.CreateCylinder("text-page-base", { height: 0.1, diameter: 0.5 });
        this.mesh = new BABYLON.Mesh("text-page");
        this.mesh.layerMask = 0x10000000;
        this.mesh.parent = this.baseMesh;
        this.mesh.position.y = 0;
        this.mesh.rotation.y = Math.PI;
        this.mesh.scaling.x = 0.1;
        this.mesh.scaling.y = 0.1;
        this.mesh.alphaIndex = 100;
        let data = new BABYLON.VertexData();
        let positions = [];
        let indices = [];
        let uvs = [];
        let normals = [];
        for (let i = 0; i <= 8; i++) {
            let p = this.xTextureToPos(i * 1600 / 8);
            let l = positions.length / 3;
            positions.push(p.x, -0.5, p.y);
            positions.push(p.x, 0.5, p.y);
            uvs.push(i / 8, 0);
            uvs.push(i / 8, 1);
            if (i < 8) {
                indices.push(l + 1, l, l + 2);
                indices.push(l + 1, l + 2, l + 3);
            }
        }
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        data.positions = positions;
        data.indices = indices;
        data.uvs = uvs;
        data.normals = normals;
        data.applyToMesh(this.mesh);
        this.material = new BABYLON.StandardMaterial("text-page-material", this.game.scene);
        this.material.useAlphaFromDiffuseTexture = true;
        this.material.specularColor.copyFromFloats(0, 0, 0);
        this.material.emissiveColor.copyFromFloats(1, 1, 1);
        this.mesh.material = this.material;
        this.texture = new BABYLON.DynamicTexture("text-page-texture", { width: this._w, height: this._h }, this.game.scene, true);
        this.texture.hasAlpha = true;
        this.material.diffuseTexture = this.texture;
        this.meshOnOff = new BABYLON.Mesh("text-page");
        this.meshOnOff.layerMask = 0x10000000;
        this.meshOnOff.parent = this.baseMesh;
        this.meshOnOff.position.y = 1.05;
        this.meshOnOff.position.z = 0.05;
        this.meshOnOff.rotation.y = Math.PI;
        data = new BABYLON.VertexData();
        positions = [];
        indices = [];
        uvs = [];
        normals = [];
        for (let i = 0; i <= 2; i++) {
            let p = this.xTextureToPos(730 + 70 * i);
            let l = positions.length / 3;
            positions.push(p.x, -0.07, p.y);
            positions.push(p.x, 0.07, p.y);
            uvs.push(i / 2, 0);
            uvs.push(i / 2, 1);
            if (i < 2) {
                indices.push(l + 1, l, l + 2);
                indices.push(l + 1, l + 2, l + 3);
            }
        }
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        data.positions = positions;
        data.indices = indices;
        data.uvs = uvs;
        data.normals = normals;
        data.applyToMesh(this.meshOnOff);
        this.materialOnOff = new BABYLON.StandardMaterial("text-page-material-on-off", this.game.scene);
        this.materialOnOff.useAlphaFromDiffuseTexture = true;
        this.materialOnOff.specularColor.copyFromFloats(0, 0, 0);
        this.materialOnOff.emissiveColor.copyFromFloats(1, 1, 1);
        this.meshOnOff.material = this.materialOnOff;
        this.textureOnOff = new BABYLON.DynamicTexture("text-page-texture-on-off", { width: 140, height: 140 }, this.game.scene, true);
        this.textureOnOff.hasAlpha = true;
        this.materialOnOff.diffuseTexture = this.textureOnOff;
        let context = this.textureOnOff.getContext();
        context.clearRect(0, 0, 140, 140);
        let path = TextPage.MakePath([
            50, 20,
            90, 20,
            120, 50,
            120, 90,
            90, 120,
            50, 120,
            20, 90,
            20, 50,
        ]);
        TextPage.FillPath(path, BABYLON.Color3.FromHexString("#3a3e45"), 0.8, context);
        TextPage.DrawGlowPath(path, 10, BABYLON.Color3.FromHexString("#2c4b7d"), 1, true, true, context);
        this.textureOnOff.update();
        this.lines[0] = "You know what? It is beets. I've crashed into a beet truck. Jaguar shark! So tell me - does it really exist? Is this my espresso machine? Wh-what is-h-how did you get my espresso machine? Hey, take a look at the earthlings. Goodbye! I was part of something special.";
        this.lines[1] = "Yeah, but John, if The Pirates of the Caribbean breaks down, the pirates don’t eat the tourists. Jaguar shark! So tell me - does it really exist? Did he just throw my cat out of the window? You're a very talented young man, with your own clever thoughts and ideas. Do you need a manager?";
        this.lines[2] = "Forget the fat lady! You're obsessed with the fat lady! Drive us out of here! God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs. You know what? It is beets. I've crashed into a beet truck. Hey, you know how I'm, like, always trying to save the planet? Here's my chance.";
        this.lines[3] = "Eventually, you do plan to have dinosaurs on your dinosaur tour, right? Just my luck, no ice. Remind me to thank John for a lovely weekend. This thing comes fully loaded. AM/FM radio, reclining bucket seats, and... power windows. Must go faster... go, go, go, go, go!";
        this.lines[4] = "Checkmate... Must go faster... go, go, go, go, go! Hey, you know how I'm, like, always trying to save the planet? Here's my chance. God creates dinosaurs. God destroys dinosaurs. God creates Man. Man destroys God. Man creates Dinosaurs. Checkmate... You're a very talented young man, with your own clever thoughts and ideas. Do you need a manager?";
    }
    async open() {
        await this._animatePosY(1.5, 0.3);
        await this._animateScaleX(1, 0.2);
        await this._animateScaleY(1, 0.2);
    }
    async close() {
        await this._animateScaleY(0.05, 0.1);
        await this._animateScaleX(0.05, 0.1);
        await this._animatePosY(0, 0.2);
    }
    setPosition(position) {
        if (this.baseMesh) {
            this.baseMesh.position = position;
        }
    }
    setTarget(target) {
        let y = this.baseMesh.position.clone().normalize();
        let z = target.subtract(this.baseMesh.position);
        let x = BABYLON.Vector3.Cross(y, z);
        z = BABYLON.Vector3.Cross(x, y);
        this.baseMesh.rotationQuaternion = BABYLON.Quaternion.RotationQuaternionFromAxis(x, y, z);
    }
    redraw() {
        let marginLeft = 142;
        let maxChar = 75;
        let marginTop = 130;
        let fontSize = 30;
        let texW = this._w;
        let texH = this._h;
        let frameOffset = 100;
        let frameW = this._w - 2 * frameOffset;
        let frameH = this._h - 2 * frameOffset;
        let cornerSize = 50;
        let sCornerSize = cornerSize * 0.5;
        let frameX0 = frameOffset;
        let frameX1 = frameOffset + frameW;
        let frameY0 = frameOffset;
        let frameY1 = frameOffset + frameH;
        let grey = new BABYLON.Color3(0.5, 0.5, 0.5);
        let context = this.texture.getContext();
        context.clearRect(0, 0, this._w, this._h);
        let decoyPath0 = TextPage.MakePath([
            frameX0 - sCornerSize, frameY0 + frameH * 0.25 + sCornerSize,
            frameX0 - sCornerSize, frameY0 + sCornerSize,
            frameX0 + sCornerSize, frameY0 - sCornerSize,
            frameX0 + frameW * 0.25 + sCornerSize, frameY0 - sCornerSize,
        ]);
        TextPage.DrawGlowPath(decoyPath0, 6, BABYLON.Color3.FromHexString("#2c4b7d"), 1, false, true, context);
        let decoyPath1 = TextPage.MakePath([
            frameX1 + sCornerSize, frameY0 + frameH * 0.25 + sCornerSize,
            frameX1 + sCornerSize, frameY0 + sCornerSize,
            frameX1 - sCornerSize, frameY0 - sCornerSize,
            frameX1 - frameW * 0.25 - sCornerSize, frameY0 - sCornerSize,
        ]);
        TextPage.DrawGlowPath(decoyPath1, 6, BABYLON.Color3.FromHexString("#2c4b7d"), 1, false, true, context);
        let decoyPath2 = TextPage.MakePath([
            frameX1 + sCornerSize, frameY1 - frameH * 0.25 - sCornerSize,
            frameX1 + sCornerSize, frameY1 - sCornerSize,
            frameX1 - sCornerSize, frameY1 + sCornerSize,
            frameX1 - frameW * 0.25 - sCornerSize, frameY1 + sCornerSize,
        ]);
        TextPage.DrawGlowPath(decoyPath2, 6, BABYLON.Color3.FromHexString("#2c4b7d"), 1, false, true, context);
        let decoyPath3 = TextPage.MakePath([
            frameX0 - sCornerSize, frameY1 - frameH * 0.25 - sCornerSize,
            frameX0 - sCornerSize, frameY1 - sCornerSize,
            frameX0 + sCornerSize, frameY1 + sCornerSize,
            frameX0 + frameW * 0.25 + sCornerSize, frameY1 + sCornerSize,
        ]);
        TextPage.DrawGlowPath(decoyPath3, 6, BABYLON.Color3.FromHexString("#2c4b7d"), 1, false, true, context);
        let path = TextPage.MakePath([
            frameX0 + cornerSize, frameY0,
            frameX0 + frameW * 0.25, frameY0,
            frameX0 + frameW * 0.25 + cornerSize, frameY0 - cornerSize,
            frameX1 - frameW * 0.25 - cornerSize, frameY0 - cornerSize,
            frameX1 - frameW * 0.25, frameY0,
            frameX1 - cornerSize, frameY0,
            frameX1, frameY0 + cornerSize,
            frameX1, frameY0 + frameH * 0.25,
            frameX1 + cornerSize, frameY0 + frameH * 0.25 + cornerSize,
            frameX1 + cornerSize, frameY1 - frameH * 0.25 - cornerSize,
            frameX1, frameY1 - frameH * 0.25,
            frameX1, frameY1 - cornerSize,
            frameX1 - cornerSize, frameY1,
            frameX1 - frameW * 0.25, frameY1,
            frameX1 - frameW * 0.25 - cornerSize, frameY1 + cornerSize,
            frameX0 + frameW * 0.25 + cornerSize, frameY1 + cornerSize,
            frameX0 + frameW * 0.25, frameY1,
            frameX0 + cornerSize, frameY1,
            frameX0, frameY1 - cornerSize,
            frameX0, frameY1 - frameH * 0.25,
            frameX0 - cornerSize, frameY1 - frameH * 0.25 - cornerSize,
            frameX0 - cornerSize, frameY0 + frameH * 0.25 + cornerSize,
            frameX0, frameY0 + frameH * 0.25,
            frameX0, frameY0 + cornerSize,
        ]);
        let nLine = 12;
        let step = frameW / nLine;
        for (let i = 0; i < nLine; i++) {
            let x = frameX0 + step * (i + 0.5);
            let y0 = frameY0;
            let y1 = frameY1;
            if (i >= nLine / 4 && i < 3 * nLine / 4) {
                y0 -= cornerSize;
                y1 += cornerSize;
            }
            TextPage.DrawGlowLine(x, y0, x, y1, 1, grey, 0.7, false, context);
        }
        nLine = 7;
        step = frameH / nLine;
        for (let i = 0; i < nLine; i++) {
            let x0 = frameX0;
            let x1 = frameX1;
            let y = frameY0 + step * (i + 0.5);
            if (i >= 2 && i <= 4) {
                x0 -= cornerSize;
                x1 += cornerSize;
            }
            TextPage.DrawGlowLine(x0, y, x1, y, 1, grey, 0.7, false, context);
        }
        TextPage.FillPath(path, BABYLON.Color3.FromHexString("#3a3e45"), 0.8, context);
        TextPage.DrawGlowPath(path, 10, BABYLON.Color3.FromHexString("#2c4b7d"), 1, true, true, context);
        context.fillStyle = "rgba(255, 255, 255, 1)";
        context.font = fontSize.toFixed(0) + "px Consolas";
        let line = this.lines[0];
        let i = 0;
        let ii = 0;
        while (line && ii < 1000 / fontSize) {
            //context.fillText((i + 1).toFixed(0) + ":", marginLeft - 2 * fontSize, marginTop + fontSize * (ii + 1));
            let cutLine = line.substring(0, 100);
            context.fillText(cutLine, marginLeft, marginTop + fontSize * (ii + 1));
            ii++;
            line = line.substring(100);
            while (line.length > 0) {
                cutLine = line.substring(0, 100);
                context.fillText(cutLine, marginLeft, marginTop + fontSize * (ii + 1));
                ii++;
                line = line.substring(100);
            }
            i++;
            line = this.lines[i];
        }
        this.texture.update();
    }
    static MakePath(points) {
        let path = [];
        for (let i = 0; i < points.length / 2; i++) {
            path.push(new BABYLON.Vector2(points[2 * i], points[2 * i + 1]));
        }
        return path;
    }
    static FillPath(path, color, alpha, context) {
        context.beginPath();
        context.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            context.lineTo(path[i].x, path[i].y);
        }
        context.closePath();
        let r = color.r * 255;
        let g = color.g * 255;
        let b = color.b * 255;
        context.fillStyle = "rgba(" + r.toFixed(0) + ", " + g.toFixed(0) + ", " + b.toFixed(0) + ", " + alpha.toFixed(2) + ")";
        context.fill();
    }
    static DrawGlowLine(x0, y0, x1, y1, width, color, alpha, outline, context) {
        TextPage.DrawGlowPath([new BABYLON.Vector2(x0, y0), new BABYLON.Vector2(x1, y1)], width, color, alpha, false, outline, context);
    }
    static DrawGlowPath(path, width, color, alpha, closePath, outline, context) {
        let w2 = width * 10;
        let w = width;
        let rMax = Math.min(1, 2 * color.r);
        let gMax = Math.min(1, 2 * color.g);
        let bMax = Math.min(1, 2 * color.b);
        context.beginPath();
        context.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            context.lineTo(path[i].x, path[i].y);
        }
        if (closePath) {
            context.closePath();
        }
        if (outline) {
            context.lineWidth = w + 4;
            context.strokeStyle = "black";
            context.stroke();
        }
        context.lineWidth = w;
        context.strokeStyle = "rgba(" + (color.r * 255).toFixed(0) + ", " + (color.g * 255).toFixed(0) + ", " + (color.b * 255).toFixed(0) + ", " + alpha.toFixed(2) + ")";
        context.stroke();
        context.lineWidth = w * 0.5;
        context.strokeStyle = "rgba(" + (rMax * 255).toFixed(0) + ", " + (gMax * 255).toFixed(0) + ", " + (bMax * 255).toFixed(0) + ", " + alpha.toFixed(2) + ")";
        context.stroke();
    }
}
class ColorUtils {
    static RGBToHSL(color) {
        let r = color.r;
        let g = color.g;
        let b = color.b;
        let cMax = Math.max(r, g, b);
        let cMin = Math.min(r, g, b);
        let d = cMax - cMin;
        let h = 0;
        let s = 0;
        let l = (cMax + cMin) * 0.5;
        if (d > 0) {
            if (d === r) {
                h = Math.round(60 * ((g - b) / d));
            }
            else if (d === g) {
                h = Math.round(60 * ((b - r) / d));
            }
            else if (d === b) {
                h = Math.round(60 * ((r - g) / d));
            }
            if (h >= 360) {
                h -= 360;
            }
            s = d / (1 - Math.abs(2 * l - 1));
        }
        return {
            h: h,
            s: s,
            l: l
        };
    }
    static HSLToRGBToRef(hsl, ref) {
        let c = (1 - Math.abs(2 * hsl.l - 1)) * hsl.s;
        let x = c * (1 - Math.abs((hsl.h / 60) % 2 - 1));
        let m = hsl.l - c / 2;
        if (hsl.h < 60) {
            ref.r = c + m;
            ref.g = x + m;
            ref.b = m;
        }
        else if (hsl.h < 120) {
            ref.r = x + m;
            ref.g = c + m;
            ref.b = m;
        }
        else if (hsl.h < 180) {
            ref.r = m;
            ref.g = c + m;
            ref.b = x + m;
        }
        else if (hsl.h < 240) {
            ref.r = m;
            ref.g = x + m;
            ref.b = c + m;
        }
        else if (hsl.h < 300) {
            ref.r = x + m;
            ref.g = m;
            ref.b = c + m;
        }
        else {
            ref.r = c + m;
            ref.g = m;
            ref.b = x + m;
        }
    }
}
class Random {
    static Initialize() {
        let piDecimals = [];
        for (let i = 0; i < Random.PiDecimalsString.length / 4 - 1; i++) {
            piDecimals.push(parseInt(Random.PiDecimalsString.substring(4 * i, 4 * (i + 1))));
        }
        Random.Values = (piDecimals.map(v => { return v / 9999; }));
        Random.Length1 = Random.Values.length;
        Random.Length2 = Math.floor(Math.pow(Random.Length1, 1 / 2));
        Random.Length3 = Math.floor(Math.pow(Random.Length1, 1 / 3));
        Random.Length4 = Math.floor(Math.pow(Random.Length1, 1 / 4));
    }
    static GetN1(n, s = Random.Seed) {
        let i = (n + s) % Random.Length1;
        return Random.Values[i];
    }
    static GetN2(x, y, s = Random.Seed) {
        let i = (x + s) % Random.Length2;
        let j = (y + s) % Random.Length2;
        return Random.Values[i + j * Random.Length2];
    }
    static GetN3(x, y, z, s = Random.Seed) {
        let i = (x + s) % Random.Length3;
        let j = (y + s) % Random.Length3;
        let k = (z + s) % Random.Length3;
        return Random.Values[i + j * Random.Length3 + k * Random.Length3 * Random.Length3];
    }
    static GetN4(x, y, z, w, s = Random.Seed) {
        let i = (x + s) % Random.Length4;
        let j = (y + s) % Random.Length4;
        let k = (z + s) % Random.Length4;
        let l = (w + s) % Random.Length4;
        return Random.Values[i + j * Random.Length4 + k * Random.Length4 * Random.Length4 + l * Random.Length4 * Random.Length4 * Random.Length4];
    }
}
Random.Seed = 0;
Random.Length1 = 1;
Random.Length2 = 1;
Random.Length3 = 1;
Random.Length4 = 1;
Random.PiDecimalsString = "14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214808651328230664709384460955058223172535940812848111745028410270193852110555964462294895493038196442881097566593344612847564823378678316527120190914564856692346034861045432664821339360726024914127372458700660631558817488152092096282925409171536436789259036001133053054882046652138414695194151160943305727036575959195309218611738193261179310511854807446237996274956735188575272489122793818301194912983367336244065664308602139494639522473719070217986094370277053921717629317675238467481846766940513200056812714526356082778577134275778960917363717872146844090122495343014654958537105079227968925892354201995611212902196086403441815981362977477130996051870721134999999837297804995105973173281609631859502445945534690830264252230825334468503526193118817101000313783875288658753320838142061717766914730359825349042875546873115956286388235378759375195778185778053217122680661300192787661119590921642019893809525720106548586327886593615338182796823030195203530185296899577362259941389124972177528347913151557485724245415069595082953311686172785588907509838175463746493931925506040092770167113900984882401285836160356370766010471018194295559619894676783744944825537977472684710404753464620804668425906949129331367702898915210475216205696602405803815019351125338243003558764024749647326391419927260426992279678235478163600934172164121992458631503028618297455570674983850549458858692699569092721079750930295532116534498720275596023648066549911988183479775356636980742654252786255181841757467289097777279380008164706001614524919217321721477235014144197356854816136115735255213347574184946843852332390739414333454776241686251898356948556209921922218427255025425688767179049460165346680498862723279178608578438382796797668145410095388378636095068006422512520511739298489608412848862694560424196528502221066118630674427862203919494504712371378696095636437191728746776465757396241389086583264599581339047802759009946576407895126946839835259570982582262052248940772671947826848260147699090264013639443745530506820349625245174939965143142980919065925093722169646151570985838741059788595977297549893016175392846813826868386894277415599185592524595395943104997252468084598727364469584865383673622262609912460805124388439045124413654976278079771569143599770012961608944169486855584840635342207222582848864815845602850601684273945226746767889525213852254995466672782398645659611635488623057745649803559363456817432411251507606947945109659609402522887971089314566913686722874894056010150330861792868092087476091782493858900971490967598526136554978189312978482168299894872265880485756401427047755513237964145152374623436454285844479526586782105114135473573952311342716610213596953623144295248493718711014576540359027993440374200731057853906219838744780847848968332144571386875194350643021845319104848100537061468067491927819119793995206141966342875444064374512371819217999839101591956181467514269123974894090718649423196156794520809514655022523160388193014209376213785595663893778708303906979207734672218256259966150142150306803844773454920260541466592520149744285073251866600213243408819071048633173464965145390579626856100550810665879699816357473638405257145910289706414011097120628043903975951567715770042033786993600723055876317635942187312514712053292819182618612586732157919841484882916447060957527069572209175671167229109816909152801735067127485832228718352093539657251210835791513698820914442100675103346711031412671113699086585163983150197016515116851714376576183515565088490998985998238734552833163550764791853589322618548963213293308985706420467525907091548141654985946163718027098199430992448895757128289059232332609729971208443357326548938239119325974636673058360414281388303203824903758985243744170291327656180937734440307074692112019130203303801976211011004492932151608424448596376698389522868478312355265821314495768572624334418930396864262434107732269780280731891544110104468232527162010526522721116603966655730925471105578537634668206531098965269186205647693125705863566201855810072936065987648611791045334885034611365768675324944166803962657978771855608455296541266540853061434443185867697514566140680070023787765913440171274947042056223053899456131407112700040785473326993908145466464588079727082668306343285878569830523580893306575740679545716377525420211495576158140025012622859413021647155097925923099079654737612551765675135751782966645477917450112996148903046399471329621073404375189573596145890193897131117904297828564750320319869151402870808599048010941214722131794764777262241425485454033215718530614228813758504306332175182979866223717215916077166925474873898665494945011465406284336639379003976926567214638530673609657120918076383271664162748888007869256029022847210403172118608204190004229661711963779213375751149595015660496318629472654736425230817703675159067350235072835405670403867435136222247715891504953098444893330963408780769325993978054193414473774418426312986080998886874132604721";
Random.Initialize();
class UniqueList {
    constructor() {
        this._elements = [];
    }
    get length() {
        return this._elements.length;
    }
    get(i) {
        return this._elements[i];
    }
    getLast() {
        return this.get(this.length - 1);
    }
    push(e) {
        if (this._elements.indexOf(e) === -1) {
            this._elements.push(e);
        }
    }
    remove(e) {
        let i = this._elements.indexOf(e);
        if (i != -1) {
            this._elements.splice(i, 1);
        }
    }
    contains(e) {
        return this._elements.indexOf(e) != -1;
    }
}
