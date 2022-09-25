var BlockType;
(function (BlockType) {
    BlockType[BlockType["Grass"] = 1] = "Grass";
    BlockType[BlockType["Dirt"] = 2] = "Dirt";
    BlockType[BlockType["Sand"] = 3] = "Sand";
    BlockType[BlockType["Rock"] = 4] = "Rock";
    BlockType[BlockType["RedDirt"] = 5] = "RedDirt";
    BlockType[BlockType["RedDust"] = 6] = "RedDust";
    BlockType[BlockType["RedRock"] = 7] = "RedRock";
})(BlockType || (BlockType = {}));
var CameraMode;
(function (CameraMode) {
    CameraMode[CameraMode["Sky"] = 0] = "Sky";
    CameraMode[CameraMode["Player"] = 1] = "Player";
    CameraMode[CameraMode["Plane"] = 2] = "Plane";
})(CameraMode || (CameraMode = {}));
class CameraManager {
    constructor() {
        this.cameraMode = CameraMode.Sky;
        this._update = () => {
            if (this.cameraMode === CameraMode.Plane) {
                this._planeCameraUpdate();
            }
        };
        this.arcRotateCamera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 100, BABYLON.Vector3.Zero(), Game.Scene);
        this.arcRotateCamera.attachControl(Game.Canvas);
        this.freeCamera = new BABYLON.FreeCamera("Camera", BABYLON.Vector3.Zero(), Game.Scene);
        this.freeCamera.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.freeCamera.minZ = 0.1;
        Game.Scene.onBeforeRenderObservable.add(this._update);
        OutlinePostProcess.AddOutlinePostProcess(this.freeCamera);
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
            if (this.plane) {
                this.plane.planeHud.hide();
            }
            if (this.cameraMode === CameraMode.Sky) {
                this.arcRotateCamera.detachControl(Game.Canvas);
            }
            this.cameraMode = newCameraMode;
            if (this.cameraMode === CameraMode.Player) {
                this.freeCamera.parent = this.player.camPos;
                this.freeCamera.position.copyFromFloats(0, 0, 0);
                this.freeCamera.rotationQuaternion.copyFrom(BABYLON.Quaternion.Identity());
                Game.Scene.activeCamera = this.freeCamera;
            }
            if (this.cameraMode === CameraMode.Plane) {
                this.freeCamera.position.copyFrom(this.freeCamera.globalPosition);
                this.freeCamera.parent = undefined;
                this.plane.planeHud.show();
                Game.Scene.activeCamera = this.freeCamera;
            }
            if (this.cameraMode === CameraMode.Sky) {
                Game.Scene.activeCamera = this.arcRotateCamera;
                this.arcRotateCamera.attachControl(Game.Canvas);
            }
        }
    }
    _planeCameraUpdate() {
        if (this.plane) {
            let targetPosition = this.plane.camPosition.absolutePosition;
            BABYLON.Vector3.LerpToRef(this.freeCamera.position, targetPosition, 0.05, this.freeCamera.position);
            let z = this.plane.camTarget.absolutePosition.subtract(this.plane.camPosition.absolutePosition).normalize();
            let y = this.plane.position.clone().normalize();
            let x = BABYLON.Vector3.Cross(y, z);
            y = BABYLON.Vector3.Cross(z, x);
            let targetQuaternion = BABYLON.Quaternion.RotationQuaternionFromAxis(x, y, z);
            BABYLON.Quaternion.SlerpToRef(this.freeCamera.rotationQuaternion, targetQuaternion, 0.05, this.freeCamera.rotationQuaternion);
        }
    }
}
/// <reference path="../lib/babylon.d.ts"/>
class Game {
    constructor(canvasElement) {
        Game.Instance = this;
        Game.Canvas = document.getElementById(canvasElement);
        Game.Engine = new BABYLON.Engine(Game.Canvas, true);
    }
    createScene() {
        Game.Scene = new BABYLON.Scene(Game.Engine);
        Game.Scene.actionManager = new BABYLON.ActionManager(Game.Scene);
        Game.Scene.clearColor.copyFromFloats(166 / 255, 231 / 255, 255 / 255, 1);
        Game.Light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0.6, 1, 0.3), Game.Scene);
        Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
        Game.Light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        Game.CameraManager = new CameraManager();
        this.chunckManager = new PlanetChunckManager(Game.Scene);
        this.chunckManager.initialize();
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
        let meshesInfoTotalElement = document.getElementById("meshes-info-total");
        let meshesInfoNonStaticUniqueElement = document.getElementById("meshes-info-nonstatic-unique");
        let meshesInfoStaticUniqueElement = document.getElementById("meshes-info-static-unique");
        let meshesInfoNonStaticInstanceElement = document.getElementById("meshes-info-nonstatic-instance");
        let meshesInfoStaticInstanceElement = document.getElementById("meshes-info-static-instance");
        Game.Engine.runRenderLoop(() => {
            Game.Scene.render();
            //PlanetChunck.InitializeLoop();
            Game.AnimateWater();
            fpsInfoElement.innerText = Game.Engine.getFps().toFixed(0) + " fps";
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
    let planetTest = new Planet("Paulita", 9, game.chunckManager);
    let heightMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(8), 80, 5);
    let heightMap4 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(8), 80, 15, {
        firstNoiseDegree: 1,
        postComputation: (v) => {
            let delta = Math.abs(60 - v);
            if (delta > 2) {
                return 1;
            }
            return 4 - delta;
        }
    });
    heightMap.substractInPlace(heightMap4);
    let heightMap5 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(8), 80, 15, {
        firstNoiseDegree: 4,
        postComputation: (v) => {
            if (v > 80) {
                return (v - 80) * 1.5;
            }
            return 1;
        }
    });
    heightMap.addInPlace(heightMap5);
    planetTest.generator = new PlanetGeneratorDebug2(planetTest);
    //planetTest.generator.showDebug();
    //Game.Player = new Player(new BABYLON.Vector3(10, 60, 0), planetTest);
    //Game.Player.registerControl();
    Game.PlanetEditor = new PlanetEditor(planetTest);
    //Game.PlanetEditor.initialize();
    //Game.Plane = new Plane(new BABYLON.Vector3(0, 80, 0), planetTest);
    //Game.Plane.instantiate();
    //Game.CameraManager.plane = Game.Plane;
    //Game.CameraManager.player = Game.Player;
    Game.CameraManager.setMode(CameraMode.Sky);
    //planetTest.AsyncInitialize();
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
        if (block != BlockType.RedDirt) {
            block = Math.min(block, 128 + 8);
            i = (block - 128 - 1) % 4;
            j = Math.floor((block - 128 - 1) / 4);
        }
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
        if (block != BlockType.RedDirt) {
            block = Math.min(block, 128 + 8);
            i = (block - 128 - 1) % 4;
            j = Math.floor((block - 128 - 1) / 4);
        }
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
        BABYLON.Engine.ShadersRepository = "./shaders/";
        let depthMap = scene.enableDepthRenderer(camera).getDepthMap();
        let postProcess = new BABYLON.PostProcess("Edge", "Edge", ["width", "height"], ["depthSampler"], 1, camera);
        postProcess.onApply = (effect) => {
            effect.setTexture("depthSampler", depthMap);
            effect.setFloat("width", engine.getRenderWidth());
            effect.setFloat("height", engine.getRenderHeight());
        };
    }
}
class Plane extends BABYLON.Mesh {
    constructor(position, planet) {
        super("Plane", Game.Scene);
        this.mass = 1;
        this.velocity = BABYLON.Vector3.Zero();
        this.alphaSpeed = 0;
        this.pitchSpeed = 0;
        this.rollSpeed = 0;
        this.lift = 0.05;
        this.thrust = 0;
        this.alpha = Math.PI / 4;
        //public targetAltitude: number = 60;
        this.targetPitch = 0;
        this.targetRoll = Math.PI / 8;
        this.targetAirspeed = 0;
        this.xInput = 0;
        this.yInput = 0;
        this.throttleUpInput = false;
        this.throttleDownInput = false;
        this._keyDown = (e) => {
            if (e.code === "Space") {
                this.throttleUpInput = true;
            }
            if (e.code === "ControlLeft") {
                this.throttleDownInput = true;
            }
        };
        this._keyUp = (e) => {
            if (e.code === "Space") {
                this.throttleUpInput = false;
            }
            if (e.code === "ControlLeft") {
                this.throttleDownInput = false;
            }
            if (e.code === "KeyX") {
                this.exit();
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
                if (!isNaN(movementX)) {
                    this.xInput += movementX / 200;
                }
                if (!isNaN(movementY)) {
                    this.yInput += -movementY / 200;
                }
                this.xInput = Math.min(Math.max(this.xInput, -1), 1);
                this.yInput = Math.min(Math.max(this.yInput, -1), 1);
                let ll = this.xInput * this.xInput + this.yInput * this.yInput;
                if (ll > 1) {
                    let l = Math.sqrt(ll);
                    this.xInput /= l;
                    this.yInput /= l;
                }
                this.planeHud.target.setAttribute("cx", (500 + this.xInput * 450).toFixed(0));
                this.planeHud.target.setAttribute("cy", (500 - this.yInput * 450).toFixed(0));
            }
        };
        this._gravityFactor = BABYLON.Vector3.Zero();
        this._groundFactor = BABYLON.Vector3.Zero();
        this._thrustYFactor = BABYLON.Vector3.Zero();
        this._thrustZFactor = BABYLON.Vector3.Zero();
        this._liftFactor = BABYLON.Vector3.Zero();
        this._rightDirection = new BABYLON.Vector3(1, 0, 0);
        this._leftDirection = new BABYLON.Vector3(-1, 0, 0);
        this._upDirection = new BABYLON.Vector3(0, 1, 0);
        this._downDirection = new BABYLON.Vector3(0, -1, 0);
        this._forwardDirection = new BABYLON.Vector3(0, 0, 1);
        this._backwardDirection = new BABYLON.Vector3(0, 0, -1);
        this.planetRight = new BABYLON.Vector3(1, 0, 0);
        this.planetUp = new BABYLON.Vector3(0, 1, 0);
        this.planetForward = new BABYLON.Vector3(0, 0, 1);
        this._feetPosition = BABYLON.Vector3.Zero();
        this._collisionAxis = [];
        this._collisionPositions = [];
        this._jumpTimer = 0;
        this._isGrounded = false;
        this._update = () => {
            if (Game.CameraManager.cameraMode != CameraMode.Plane) {
                return;
            }
            let deltaTime = Game.Engine.getDeltaTime() / 1000;
            this.planetUp.copyFrom(this.position).normalize();
            this.getDirectionToRef(BABYLON.Axis.X, this._rightDirection);
            this._leftDirection.copyFrom(this._rightDirection);
            this._leftDirection.scaleInPlace(-1);
            this.getDirectionToRef(BABYLON.Axis.Y, this._upDirection);
            this._downDirection.copyFrom(this._upDirection);
            this._downDirection.scaleInPlace(-1);
            this.getDirectionToRef(BABYLON.Axis.Z, this._forwardDirection);
            this._backwardDirection.copyFrom(this._forwardDirection);
            this._backwardDirection.scaleInPlace(-1);
            BABYLON.Vector3.CrossToRef(this.planetUp, this._forwardDirection, this.planetRight);
            BABYLON.Vector3.CrossToRef(this.planetRight, this.planetUp, this.planetForward);
            this.camPosition.position.copyFrom(this.position);
            //this.camPosition.position.addInPlace(this.planetRight.scale(25));
            this.camPosition.position.addInPlace(this.planetUp.scale(7));
            this.camPosition.position.addInPlace(this.planetForward.scale(-10));
            this.camTarget.position.copyFrom(this.position);
            this.camTarget.position.addInPlace(this.planetUp.scale(2));
            this.camTarget.position.addInPlace(this.planetForward.scale(2));
            // Add gravity and ground reaction.
            this._gravityFactor.copyFrom(this.planetUp).scaleInPlace(-this.mass * 9.8 * deltaTime);
            this._groundFactor.copyFromFloats(0, 0, 0);
            let ray = new BABYLON.Ray(this.position, this._downDirection, 1);
            let hit = Game.Scene.pickWithRay(ray, (mesh) => {
                return (mesh instanceof PlanetChunck);
            });
            if (hit.pickedPoint) {
                let d = hit.pickedPoint.subtract(this.position).length();
                if (d > 0.01) {
                    this._groundFactor.copyFrom(this._gravityFactor).scaleInPlace(-1).scaleInPlace(Math.pow(1.5 / d, 1));
                }
            }
            this._thrustYFactor.copyFrom(this._upDirection).scaleInPlace(this.mass * Math.cos(this.alpha) * this.thrust * deltaTime);
            this._thrustZFactor.copyFrom(this._forwardDirection).scaleInPlace(this.mass * Math.sin(this.alpha) * this.thrust * deltaTime);
            if (!VMath.IsFinite(this._gravityFactor)) {
                debugger;
            }
            this.velocity.addInPlace(this._gravityFactor);
            this.velocity.addInPlace(this._groundFactor);
            if (!VMath.IsFinite(this._thrustYFactor)) {
                debugger;
            }
            this.velocity.addInPlace(this._thrustYFactor);
            if (!VMath.IsFinite(this._thrustZFactor)) {
                debugger;
            }
            this.velocity.addInPlace(this._thrustZFactor);
            // Add friction
            let downVelocity = this._downDirection.scale(BABYLON.Vector3.Dot(this.velocity, this._downDirection));
            if (!VMath.IsFinite(downVelocity)) {
                debugger;
            }
            this.velocity.subtractInPlace(downVelocity);
            downVelocity.scaleInPlace(Math.pow(0.5, deltaTime));
            this.velocity.scaleInPlace(Math.pow(0.01, deltaTime));
            if (!VMath.IsFinite(downVelocity)) {
                debugger;
            }
            this.velocity.addInPlace(downVelocity);
            //Plane.Instance.targetAltitude = Plane.Instance.targetAltitude + this.yInput * deltaTime;
            let vSpeed = BABYLON.Vector3.Dot(this.velocity, this.planetUp);
            //let deltaAltitude = this.position.length() + vSpeed * 2 - this.targetAltitude;
            let airspeed = BABYLON.Vector3.Dot(this.velocity, this._forwardDirection);
            let pitch = VMath.AngleFromToAround(this._upDirection, this.planetUp, this._rightDirection);
            if (isNaN(pitch)) {
                pitch = 0;
            }
            let roll = VMath.AngleFromToAround(this.planetUp, this._upDirection, this._forwardDirection);
            if (isNaN(roll)) {
                roll = 0;
            }
            this._liftFactor.copyFrom(this._upDirection).scaleInPlace(airspeed * this.lift * deltaTime);
            if (!VMath.IsFinite(this._liftFactor)) {
                debugger;
            }
            this.velocity.addInPlace(this._liftFactor);
            //let targetVSpeed: number = (this.targetAltitude - this.position.length()) * 0.5;
            let targetVSpeed = this.yInput * 5;
            if (this.throttleUpInput) {
                this.targetAirspeed += 2 * deltaTime;
            }
            else if (this.throttleDownInput) {
                this.targetAirspeed -= 2 * deltaTime;
            }
            this.targetAirspeed = Math.max(Math.min(this.targetAirspeed, 20), 0);
            this.targetPitch = 0;
            let tVS = 3;
            if (airspeed < 3) {
                tVS += 3 - airspeed;
            }
            if (vSpeed < targetVSpeed) {
                this.thrust += tVS * deltaTime;
            }
            else if (vSpeed > targetVSpeed) {
                this.thrust -= tVS * deltaTime;
            }
            let tAS = 3;
            if (airspeed > 3) {
                tAS += airspeed - 3;
            }
            if (airspeed < this.targetAirspeed) {
                this.thrust += tAS * deltaTime;
            }
            else if (airspeed > this.targetAirspeed) {
                this.thrust -= tAS * deltaTime;
            }
            this.thrust = Math.max(0.1, this.thrust);
            let cos = (Math.cos(pitch) * this.mass * 9.8 - this.targetAirspeed * this.lift) / this.thrust;
            cos = Math.max(Math.min(cos, 1), -1);
            this.alpha = Math.acos(cos);
            this.alpha = Math.min(Math.max(this.alpha, (-3 * Math.PI) / 4), (3 * Math.PI) / 4);
            if (isNaN(this.alpha)) {
                debugger;
            }
            this.targetPitch = (Math.PI / 4) * this.yInput + 3 / 180 * Math.PI;
            if (this.targetAirspeed < 3) {
                this.targetPitch *= (this.targetAirspeed + 1) / 4;
            }
            let dPitch = pitch - this.targetPitch;
            this.pitchSpeed += dPitch * 10 * deltaTime;
            this.pitchSpeed *= Math.pow(0.1, deltaTime);
            this.rotationQuaternion = BABYLON.Quaternion.RotationAxis(this._rightDirection, this.pitchSpeed * deltaTime).multiply(this.rotationQuaternion);
            this.targetRoll = (-Math.PI / 4) * this.xInput;
            if (isFinite(roll)) {
                let dRoll = this.targetRoll - roll;
                this.rollSpeed += dRoll * 10 * deltaTime;
                this.rollSpeed *= Math.pow(0.1, deltaTime);
                this.rotationQuaternion = BABYLON.Quaternion.RotationAxis(this._forwardDirection, this.rollSpeed * deltaTime).multiply(this.rotationQuaternion);
                this.rotationQuaternion = BABYLON.Quaternion.RotationAxis(this._upDirection, -roll * 0.2 * Math.PI * deltaTime).multiply(this.rotationQuaternion);
            }
            let a2 = Math.asin((Math.sin(pitch) * this.mass * 9.8 + 0.01 * airspeed) / this.thrust);
            // Safety check.
            if (!VMath.IsFinite(this.velocity)) {
                debugger;
                this.velocity.copyFromFloats(-0.1 + 0.2 * Math.random(), -0.1 + 0.2 * Math.random(), -0.1 + 0.2 * Math.random());
            }
            this.position.addInPlace(this.velocity.scale(deltaTime));
            if (this.leftEngine) {
                this.leftEngine.rotation.x = this.alpha;
            }
            if (this.rightEngine) {
                this.rightEngine.rotation.x = this.alpha;
            }
            document.getElementById("plane-altitude").innerText = this.position.length().toFixed(1) + " m";
            document.getElementById("plane-airspeed").innerText = airspeed.toFixed(1) + " m/s";
            document.getElementById("plane-vspeed").innerText = vSpeed.toFixed(1) + " (" + targetVSpeed.toFixed(1) + ") m/s";
            document.getElementById("plane-pitch").innerText = (pitch / Math.PI * 180).toFixed(1) + " (" + (this.targetPitch / Math.PI * 180).toFixed(1) + ") °";
            document.getElementById("plane-roll").innerText = roll.toFixed(1) + " (" + this.targetRoll.toFixed(1) + ") °";
            document.getElementById("x-input").innerText = this.xInput.toFixed(4);
            document.getElementById("y-input").innerText = this.yInput.toFixed(4);
            if (this.leftEngineThrust) {
                this.leftEngineThrust.position.y = -this.thrust * 0.125;
                this.leftEngineThrust.scaling.y = this.thrust * 0.5;
            }
            if (this.rightEngineThrust) {
                this.rightEngineThrust.position.y = -this.thrust * 0.125;
                this.rightEngineThrust.scaling.y = this.thrust * 0.5;
            }
            this.planeHud.updateAirspeed(airspeed);
            this.planeHud.updateTargetAirspeed(this.targetAirspeed);
        };
        console.log("Create Plane");
        this.planet = planet;
        this.position = position;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        Plane.Instance = this;
        this.camPosition = new BABYLON.Mesh("cam-position", Game.Scene);
        this.camTarget = new BABYLON.Mesh("cam-target", Game.Scene);
        this.planeHud = new PlaneHud();
        this.planeHud.instantiate();
        this.planeHud.hide();
        Game.Scene.onBeforeRenderObservable.add(this._update);
    }
    static Position() {
        return Plane.Instance.position;
    }
    instantiate() {
        BABYLON.SceneLoader.ImportMesh("", "./resources/models/plane.babylon", "", Game.Scene, (meshes) => {
            this.planeMesh = meshes.find((m) => {
                return m.name === "plane";
            });
            this.leftEngine = meshes.find((m) => {
                return m.name === "engine-left";
            });
            this.rightEngine = meshes.find((m) => {
                return m.name === "engine-right";
            });
            this.landingGearMesh = meshes.find((m) => {
                return m.name === "landing-gear";
            });
            this.planeMesh.parent = this;
            this.leftEngine.parent = this;
            this.leftEngineThrust = BABYLON.MeshBuilder.CreateBox("left-engine-thrust", { size: 0.5 }, Game.Scene);
            this.leftEngineThrust.parent = this.leftEngine;
            this.rightEngine.parent = this;
            this.rightEngineThrust = BABYLON.MeshBuilder.CreateBox("right-engine-thrust", { size: 0.5 }, Game.Scene);
            this.rightEngineThrust.parent = this.rightEngine;
        });
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
    exit() {
        this.unregisterControl();
        Game.Player.registerControl();
        Game.CameraManager.setMode(CameraMode.Player);
    }
}
class PlaneHud {
    _alphaRadiusToX(a, r) {
        return 500 + r * Math.cos(a);
    }
    _alphaRadiusToY(a, r) {
        return 500 - r * Math.sin(a);
    }
    _makeArc(a0, a1, radius) {
        let arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
        let x0 = this._alphaRadiusToX(a0, radius);
        let y0 = this._alphaRadiusToY(a0, radius);
        let x1 = this._alphaRadiusToX(a1, radius);
        let y1 = this._alphaRadiusToY(a1, radius);
        arc.setAttribute("d", "M " + x0 + " " + y0 + " A " + radius + " " + radius + " 0 0 1 " + x1 + " " + y1);
        return arc;
    }
    _makeThickArc(a0, a1, radius, thickness, arc) {
        if (!arc) {
            arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
        }
        let x00 = this._alphaRadiusToX(a0, radius);
        let y00 = this._alphaRadiusToY(a0, radius);
        let x10 = this._alphaRadiusToX(a1, radius);
        let y10 = this._alphaRadiusToY(a1, radius);
        let x01 = this._alphaRadiusToX(a0, radius + thickness);
        let y01 = this._alphaRadiusToY(a0, radius + thickness);
        let x11 = this._alphaRadiusToX(a1, radius + thickness);
        let y11 = this._alphaRadiusToY(a1, radius + thickness);
        arc.setAttribute("d", "M " + x00 + " " + y00 + " A " + radius + " " + radius + " 0 0 1 " + x10 + " " + y10 + " " +
            "L " + x11 + " " + y11 + " " +
            "A " + (radius + thickness) + " " + (radius + thickness) + " 0 0 0 " + x01 + " " + y01 + " " +
            "L " + x00 + " " + y00 + " ");
        return arc;
    }
    _setStyleBase(e) {
        e.setAttribute("stroke", "white");
        e.setAttribute("stroke-width", "4");
        e.setAttribute("fill", "none");
    }
    instantiate() {
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        this.svg.setAttribute("viewBox", "0 0 1000 1000");
        this.svg.style.position = "fixed";
        this.svg.style.zIndex = "1";
        this.svg.style.pointerEvents = "none";
        this.svg.style.overflow = "visible";
        document.body.appendChild(this.svg);
        this.mainFrame = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.mainFrame.setAttribute("cx", "500");
        this.mainFrame.setAttribute("cy", "500");
        this.mainFrame.setAttribute("r", "500");
        this._setStyleBase(this.mainFrame);
        this.svg.appendChild(this.mainFrame);
        this.target = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.target.setAttribute("cx", "500");
        this.target.setAttribute("cy", "500");
        this.target.setAttribute("r", "50");
        this._setStyleBase(this.target);
        this.svg.appendChild(this.target);
        this.targetAirspeedValue = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.targetAirspeedValue.setAttribute("d", "M 1050 500 L 1025 515 L 1025 485 L 1050 500");
        this._setStyleBase(this.targetAirspeedValue);
        this.svg.appendChild(this.targetAirspeedValue);
        this.airspeedValue = this._makeThickArc(Math.PI / 6, -Math.PI / 6, 550, 100);
        this.airspeedValue.setAttribute("stroke", "none");
        this.airspeedValue.setAttribute("fill", "cyan");
        this.svg.appendChild(this.airspeedValue);
        let airspeedFrame = this._makeThickArc(Math.PI / 6, -Math.PI / 6, 550, 100);
        this._setStyleBase(airspeedFrame);
        this.svg.appendChild(airspeedFrame);
        this.resize();
    }
    updateAirspeed(v) {
        this._makeThickArc(-Math.PI / 6 + v / 20 * (Math.PI / 3), -Math.PI / 6, 550, 100, this.airspeedValue);
    }
    updateTargetAirspeed(v) {
        let a = (10 - v) / 10 * Math.PI / 6;
        a = a / Math.PI * 180;
        this.targetAirspeedValue.setAttribute("transform", "rotate(" + a + ", 500, 500)");
    }
    show() {
        this.svg.style.display = "block";
    }
    hide() {
        this.svg.style.display = "none";
    }
    resize() {
        let w = window.innerWidth;
        let h = window.innerHeight;
        if (w > h) {
            this.svg.style.width = (h * 0.5).toFixed(0) + "px";
            this.svg.style.height = (h * 0.5).toFixed(0) + "px";
            this.svg.style.top = (h * 0.25).toFixed(0) + "px";
            this.svg.style.left = ((w - h * 0.5) * 0.5).toFixed(0) + "px";
        }
        else {
            this.svg.style.width = (w * 0.5).toFixed(0) + "px";
            this.svg.style.height = (w * 0.5).toFixed(0) + "px";
            this.svg.style.left = (w * 0.25).toFixed(0) + "px";
            this.svg.style.left = ((h - w * 0.5) * 0.5).toFixed(0) + "px";
        }
    }
}
class PlanetChunckMeshBuilderNew {
    static BuildVertexData(size, iPos, jPos, kPos, chunck) {
        let vertexData = new BABYLON.VertexData();
        let r = 1;
        for (let i = -r; i < PlanetTools.CHUNCKSIZE + r; i++) {
            for (let j = -r; j < PlanetTools.CHUNCKSIZE + r; j++) {
                for (let k = -r; k < PlanetTools.CHUNCKSIZE + r; k++) {
                    let iGlobal = i + chunck.iPos * PlanetTools.CHUNCKSIZE;
                    let jGlobal = j + chunck.jPos * PlanetTools.CHUNCKSIZE;
                    let kGlobal = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    let data = chunck.planetSide.GetData(iGlobal, jGlobal, kGlobal);
                }
            }
        }
        return vertexData;
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
class PlanetGeneratorChaos extends PlanetGenerator {
    constructor(planet) {
        super(planet);
        let hMax = this.planet.kPosMax * PlanetTools.CHUNCKSIZE;
        let heightMap1 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(this.planet.kPosMax), hMax * 0.5, hMax * 0.15);
        let heightMap2 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(this.planet.kPosMax), hMax * 0.5, hMax * 0.25, {
            firstNoiseDegree: 4,
            postComputation: (v) => {
                if (v > hMax * 0.60) {
                    return (v - hMax * 0.60) * 1.5;
                }
                return 0;
            }
        });
        let heightMap3 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(this.planet.kPosMax), hMax * 0.5, hMax * 0.25, {
            firstNoiseDegree: 3,
            postComputation: (v) => {
                let delta = Math.abs(hMax * 0.5 - v);
                if (delta > 2) {
                    return 0;
                }
                return 3 - delta;
            }
        });
        this.heightMaps = [heightMap1, heightMap2, heightMap3];
        if (Game.ShowDebugPlanetHeightMap) {
            this.showDebug();
        }
    }
    makeData(chunck) {
        let f = Math.pow(2, this.heightMaps[0].degree - PlanetTools.KPosToDegree(chunck.kPos));
        let hMax = this.planet.kPosMax * PlanetTools.CHUNCKSIZE;
        return PlanetTools.Data((i, j, k) => {
            let h1 = this.heightMaps[0].getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
            let h2 = this.heightMaps[1].getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
            let h3 = this.heightMaps[2].getForSide(chunck.side, (chunck.iPos * PlanetTools.CHUNCKSIZE + i) * f, (chunck.jPos * PlanetTools.CHUNCKSIZE + j) * f);
            let globalK = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
            let hGround = h1 - h3;
            if (globalK < hGround) {
                if (h3 > 0) {
                    return BlockType.RedRock;
                }
                if (globalK < hMax * 0.5) {
                    return BlockType.RedDust;
                }
                return BlockType.RedDirt;
            }
            if (globalK < hGround + h2) {
                return BlockType.RedRock;
            }
            return 0;
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
                    return BlockType.RedDirt;
                }
                if (jGlobal < 5) {
                    return BlockType.RedRock;
                }
                return BlockType.RedDust;
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
class PlanetHeightMap {
    constructor(degree) {
        this.degree = degree;
        this.map = [];
        this.size = Math.pow(2, this.degree);
    }
    static CreateMap(degree, seaLevel, maxAltitude, options) {
        let map = new PlanetHeightMap(0);
        let firstNoiseDegree = 1;
        if (options && isFinite(options.firstNoiseDegree)) {
            firstNoiseDegree = options.firstNoiseDegree;
        }
        for (let i = 0; i <= map.size; i++) {
            for (let j = 0; j <= map.size; j++) {
                for (let k = 0; k <= map.size; k++) {
                    if (map.isValid(i, j, k)) {
                        map.setValue(seaLevel, i, j, k);
                    }
                }
            }
        }
        let noise = maxAltitude;
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
        map.seaLevel = seaLevel;
        map.maxAltitude = maxAltitude;
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
            maxValue = this.seaLevel + this.maxAltitude;
        }
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                let v = this.getForSide(side, i, j);
                let c = v / maxValue * 256;
                context.fillStyle = "rgb(" + c.toFixed(0) + ", " + c.toFixed(0) + ", " + c.toFixed(0) + ")";
                context.fillRect(i, j, 1, 1);
            }
        }
        texture.update(false);
        return texture;
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
class Player extends BABYLON.Mesh {
    constructor(position, planet) {
        super("Player", Game.Scene);
        this.mass = 1;
        this.speed = 5;
        this.velocity = BABYLON.Vector3.Zero();
        this.underWater = false;
        this._keyDown = (e) => {
            if (e.key === "z" || e.key === "w") {
                this.pForward = true;
            }
            if (e.key === "s") {
                this.back = true;
            }
            if (e.key === "q" || e.key === "a") {
                this.left = true;
            }
            if (e.key === "d") {
                this.pRight = true;
            }
            if (e.keyCode === 32) {
                this.fly = true;
            }
        };
        this._keyUp = (e) => {
            if (e.key === "z" || e.key === "w") {
                this.pForward = false;
            }
            if (e.key === "s") {
                this.back = false;
            }
            if (e.key === "q" || e.key === "a") {
                this.left = false;
            }
            if (e.key === "d") {
                this.pRight = false;
            }
            if (e.keyCode === 32) {
                if (this._isGrounded) {
                    this.velocity.addInPlace(this.getDirection(BABYLON.Axis.Y).scale(5));
                    this._isGrounded = false;
                    this._jumpTimer = 0.2;
                }
            }
            if (e.code === "KeyX") {
                this.pilot();
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
                    return mesh instanceof PlanetChunck;
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
        };
        console.log("Create Player");
        this.planet = planet;
        this.position = position;
        this.rotationQuaternion = BABYLON.Quaternion.Identity();
        this.camPos = new BABYLON.Mesh("Dummy", Game.Scene);
        this.camPos.parent = this;
        this.camPos.position = new BABYLON.Vector3(0, 0, 0);
        Game.Scene.onBeforeRenderObservable.add(this._update);
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
    pilot(plane) {
        if (!plane) {
            plane = Game.Plane;
        }
        if (!plane) {
            return;
        }
        this.unregisterControl();
        plane.registerControl();
        Game.CameraManager.setMode(CameraMode.Plane);
    }
}
class SharedMaterials {
    static MainMaterial() {
        if (!SharedMaterials.mainMaterial) {
            SharedMaterials.mainMaterial = new BABYLON.StandardMaterial("mainMaterial", Game.Scene);
            //SharedMaterials.mainMaterial.diffuseTexture = new BABYLON.Texture("./resources/textures/mainTexture.png", Game.Scene);
            SharedMaterials.mainMaterial.specularColor = BABYLON.Color3.Black();
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
class PlanetChunck extends BABYLON.Mesh {
    constructor(iPos, jPos, kPos, planetSide) {
        super("chunck-" + iPos + "-" + jPos + "-" + kPos, Game.Scene);
        this._dataInitialized = false;
        this._isEmpty = true;
        this._isFull = false;
        this.planetSide = planetSide;
        this.iPos = iPos;
        this.jPos = jPos;
        this.kPos = kPos;
        this.name = "chunck:" + this.side + ":" + this.iPos + "-" + this.jPos + "-" + this.kPos;
        this.barycenter = PlanetTools.EvaluateVertex(this.GetSize(), PlanetTools.CHUNCKSIZE * this.iPos + PlanetTools.CHUNCKSIZE / 2, PlanetTools.CHUNCKSIZE * this.jPos + PlanetTools.CHUNCKSIZE / 2).scale(PlanetTools.CHUNCKSIZE * this.kPos + PlanetTools.CHUNCKSIZE / 2);
        this.barycenter = BABYLON.Vector3.TransformCoordinates(this.barycenter, planetSide.computeWorldMatrix());
        this.normal = BABYLON.Vector3.Normalize(this.barycenter);
        if (this.kPos === 0) {
            this.bedrock = new BABYLON.Mesh(this.name + "-bedrock", Game.Scene);
            this.bedrock.parent = this;
        }
        this.chunckManager.requestDraw(this);
    }
    get side() {
        return this.planetSide.side;
    }
    get chunckManager() {
        return this.planetSide.chunckManager;
    }
    get degree() {
        return PlanetTools.KPosToDegree(this.kPos);
    }
    GetSize() {
        return PlanetTools.DegreeToSize(this.degree);
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
        if (this.data[i]) {
            if (this.data[i][j]) {
                if (this.data[i][j][k]) {
                    return this.data[i][j][k];
                }
            }
        }
        return 0;
    }
    GetDataGlobal(iGlobal, jGlobal, kGlobal) {
        return this.planetSide.GetData(iGlobal, jGlobal, kGlobal);
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
    initialize() {
        this.initializeData();
        this.initializeMesh();
    }
    initializeData() {
        if (!this.dataInitialized) {
            this.data = this.planetSide.planet.generator.makeData(this);
            this.updateIsEmptyIsFull();
            this.saveToLocalStorage();
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
    SetMesh() {
        if (this.isFull || this.isEmpty) {
            let iPrev = this.planetSide.getChunck(this.iPos - 1, this.jPos, this.kPos, this.degree);
            let iNext = this.planetSide.getChunck(this.iPos + 1, this.jPos, this.kPos, this.degree);
            let jPrev = this.planetSide.getChunck(this.iPos, this.jPos - 1, this.kPos, this.degree);
            let jNext = this.planetSide.getChunck(this.iPos, this.jPos + 1, this.kPos, this.degree);
            let kPrev = this.planetSide.getChunck(this.iPos, this.jPos, this.kPos - 1, this.degree);
            let kNext = this.planetSide.getChunck(this.iPos, this.jPos, this.kPos + 1, this.degree);
            if (iPrev && iNext && jPrev && jNext && kPrev && kNext) {
                iPrev.initializeData();
                iNext.initializeData();
                jPrev.initializeData();
                jNext.initializeData();
                kPrev.initializeData();
                kNext.initializeData();
                if (this.isFull && iPrev.isFull && iNext.isFull && jPrev.isFull && jNext.isFull && kPrev.isFull && kNext.isFull) {
                    return;
                }
                if (this.isEmpty && iPrev.isEmpty && iNext.isEmpty && jPrev.isEmpty && jNext.isEmpty && kPrev.isEmpty && kNext.isEmpty) {
                    return;
                }
            }
        }
        let vertexData = PlanetChunckMeshBuilder.BuildVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, this.data);
        if (vertexData.positions.length > 0) {
            vertexData.applyToMesh(this);
            this.material = SharedMaterials.MainMaterial();
        }
        if (this.kPos === 0) {
            vertexData = PlanetChunckMeshBuilder.BuildBedrockVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, 8, this.data);
            vertexData.applyToMesh(this.bedrock);
            this.bedrock.material = SharedMaterials.BedrockMaterial();
        }
        this.computeWorldMatrix();
        this.refreshBoundingInfo();
    }
    Dispose() {
        PlanetTools.EmptyVertexData().applyToMesh(this);
        if (this.bedrock) {
            PlanetTools.EmptyVertexData().applyToMesh(this.bedrock);
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
        this._update = () => {
            let t0 = performance.now();
            let t = t0;
            while (this._needRedraw.length > 0 && (t - t0) < 1000 / 24) {
                let request = this._needRedraw.pop();
                request.chunck.initialize();
                t = performance.now();
            }
        };
    }
    initialize() {
        this.scene.onBeforeRenderObservable.add(this._update);
    }
    dispose() {
        this.scene.onBeforeRenderObservable.removeCallback(this._update);
    }
    async requestDraw(chunck) {
        return new Promise(resolve => {
            if (!this._needRedraw.find(request => { return request.chunck === chunck; })) {
                this._needRedraw.push(new PlanetChunckRedrawRequest(chunck, resolve));
            }
        });
    }
}
class PlanetChunckMeshBuilder {
    static get BlockColor() {
        if (!PlanetChunckMeshBuilder._BlockColor) {
            PlanetChunckMeshBuilder._BlockColor = new Map();
            PlanetChunckMeshBuilder._BlockColor.set(BlockType.RedDirt, BABYLON.Color3.FromHexString("#fa591e"));
            PlanetChunckMeshBuilder._BlockColor.set(BlockType.RedDust, BABYLON.Color3.FromHexString("#ad7c6a"));
            PlanetChunckMeshBuilder._BlockColor.set(BlockType.RedRock, BABYLON.Color3.FromHexString("#4f1a06"));
            PlanetChunckMeshBuilder._BlockColor.set(128 + 8, BABYLON.Color3.FromHexString("#FFFFFF"));
            PlanetChunckMeshBuilder._BlockColor.set(128 + 9, BABYLON.Color3.FromHexString("#81FF36"));
            PlanetChunckMeshBuilder._BlockColor.set(128 + 10, BABYLON.Color3.FromHexString("#36E6FF"));
            PlanetChunckMeshBuilder._BlockColor.set(128 + 11, BABYLON.Color3.FromHexString("#B436FF"));
            PlanetChunckMeshBuilder._BlockColor.set(128 + 12, BABYLON.Color3.FromHexString("#FF4F36"));
        }
        return PlanetChunckMeshBuilder._BlockColor;
    }
    static GetVertex(size, i, j) {
        let out = BABYLON.Vector3.Zero();
        return PlanetChunckMeshBuilder.GetVertexToRef(size, i, j, out);
    }
    static GetVertexToRef(size, i, j, out) {
        if (!PlanetChunckMeshBuilder.cachedVertices) {
            PlanetChunckMeshBuilder.cachedVertices = [];
        }
        if (!PlanetChunckMeshBuilder.cachedVertices[size]) {
            PlanetChunckMeshBuilder.cachedVertices[size] = [];
        }
        if (!PlanetChunckMeshBuilder.cachedVertices[size][i]) {
            PlanetChunckMeshBuilder.cachedVertices[size][i] = [];
        }
        if (!PlanetChunckMeshBuilder.cachedVertices[size][i][j]) {
            PlanetChunckMeshBuilder.cachedVertices[size][i][j] = PlanetTools.EvaluateVertex(size, i, j);
        }
        out.copyFrom(PlanetChunckMeshBuilder.cachedVertices[size][i][j]);
        return out;
    }
    static BuildBlockVertexData(size, iGlobal, jGlobal, hGlobal, data, scale = 1) {
        let vertexData = new BABYLON.VertexData();
        if (!PlanetChunckMeshBuilder.tmpVertices) {
            PlanetChunckMeshBuilder.tmpVertices = [];
            for (let i = 0; i < 8; i++) {
                PlanetChunckMeshBuilder.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        else {
            for (let i = 0; i < 8; i++) {
                PlanetChunckMeshBuilder.tmpVertices[i].copyFromFloats(0, 0, 0);
            }
        }
        let positions = [];
        let indices = [];
        let uvs = [];
        let colors = [];
        PlanetChunckMeshBuilder.GetVertexToRef(size, iGlobal, jGlobal, PlanetChunckMeshBuilder.tmpVertices[0]);
        PlanetChunckMeshBuilder.GetVertexToRef(size, iGlobal, jGlobal + 1, PlanetChunckMeshBuilder.tmpVertices[1]);
        PlanetChunckMeshBuilder.GetVertexToRef(size, iGlobal + 1, jGlobal, PlanetChunckMeshBuilder.tmpVertices[2]);
        PlanetChunckMeshBuilder.GetVertexToRef(size, iGlobal + 1, jGlobal + 1, PlanetChunckMeshBuilder.tmpVertices[3]);
        let hLow = PlanetTools.KGlobalToAltitude(hGlobal);
        let hHigh = PlanetTools.KGlobalToAltitude(hGlobal + 1);
        PlanetChunckMeshBuilder.tmpVertices[0].scaleToRef(hHigh, PlanetChunckMeshBuilder.tmpVertices[4]);
        PlanetChunckMeshBuilder.tmpVertices[1].scaleToRef(hHigh, PlanetChunckMeshBuilder.tmpVertices[5]);
        PlanetChunckMeshBuilder.tmpVertices[2].scaleToRef(hHigh, PlanetChunckMeshBuilder.tmpVertices[6]);
        PlanetChunckMeshBuilder.tmpVertices[3].scaleToRef(hHigh, PlanetChunckMeshBuilder.tmpVertices[7]);
        PlanetChunckMeshBuilder.tmpVertices[0].scaleInPlace(hLow);
        PlanetChunckMeshBuilder.tmpVertices[1].scaleInPlace(hLow);
        PlanetChunckMeshBuilder.tmpVertices[2].scaleInPlace(hLow);
        PlanetChunckMeshBuilder.tmpVertices[3].scaleInPlace(hLow);
        if (scale != 1) {
            this._tmpBlockCenter.copyFrom(PlanetChunckMeshBuilder.tmpVertices[0]);
            for (let v = 1; v < PlanetChunckMeshBuilder.tmpVertices.length; v++) {
                this._tmpBlockCenter.addInPlace(PlanetChunckMeshBuilder.tmpVertices[v]);
            }
            this._tmpBlockCenter.scaleInPlace(1 / PlanetChunckMeshBuilder.tmpVertices.length);
            for (let v = 0; v < PlanetChunckMeshBuilder.tmpVertices.length; v++) {
                PlanetChunckMeshBuilder.tmpVertices[v].subtractInPlace(this._tmpBlockCenter);
                PlanetChunckMeshBuilder.tmpVertices[v].scaleInPlace(scale);
                PlanetChunckMeshBuilder.tmpVertices[v].addInPlace(this._tmpBlockCenter);
            }
        }
        let c = PlanetChunckMeshBuilder.BlockColor.get(data);
        if (!c) {
            c = PlanetChunckMeshBuilder.BlockColor.get(136);
        }
        MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 1, 5, 4, 0, positions, indices);
        MeshTools.PushSideQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 0, 4, 6, 2, positions, indices);
        MeshTools.PushSideQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 0, 2, 3, 1, positions, indices);
        MeshTools.PushTopQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 2, 6, 7, 3, positions, indices);
        MeshTools.PushSideQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 3, 7, 5, 1, positions, indices);
        MeshTools.PushSideQuadUvs(data, uvs);
        MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
        MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 4, 5, 7, 6, positions, indices);
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
    static BuildVertexData(size, iPos, jPos, kPos, data) {
        let vertexData = new BABYLON.VertexData();
        if (!PlanetChunckMeshBuilder.tmpVertices) {
            PlanetChunckMeshBuilder.tmpVertices = [];
            for (let i = 0; i < 8; i++) {
                PlanetChunckMeshBuilder.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        else {
            for (let i = 0; i < 8; i++) {
                PlanetChunckMeshBuilder.tmpVertices[i].copyFromFloats(0, 0, 0);
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
                        PlanetChunckMeshBuilder.GetVertexToRef(size, y, z, PlanetChunckMeshBuilder.tmpVertices[0]);
                        PlanetChunckMeshBuilder.GetVertexToRef(size, y, z + 1, PlanetChunckMeshBuilder.tmpVertices[1]);
                        PlanetChunckMeshBuilder.GetVertexToRef(size, y + 1, z, PlanetChunckMeshBuilder.tmpVertices[2]);
                        PlanetChunckMeshBuilder.GetVertexToRef(size, y + 1, z + 1, PlanetChunckMeshBuilder.tmpVertices[3]);
                        let hGlobal = (k + kPos * PlanetTools.CHUNCKSIZE + 1);
                        ;
                        let hLow = PlanetTools.KGlobalToAltitude(hGlobal);
                        let hHigh = PlanetTools.KGlobalToAltitude(hGlobal + 1);
                        PlanetChunckMeshBuilder.tmpVertices[0].scaleToRef(hHigh, PlanetChunckMeshBuilder.tmpVertices[4]);
                        PlanetChunckMeshBuilder.tmpVertices[1].scaleToRef(hHigh, PlanetChunckMeshBuilder.tmpVertices[5]);
                        PlanetChunckMeshBuilder.tmpVertices[2].scaleToRef(hHigh, PlanetChunckMeshBuilder.tmpVertices[6]);
                        PlanetChunckMeshBuilder.tmpVertices[3].scaleToRef(hHigh, PlanetChunckMeshBuilder.tmpVertices[7]);
                        PlanetChunckMeshBuilder.tmpVertices[0].scaleInPlace(hLow);
                        PlanetChunckMeshBuilder.tmpVertices[1].scaleInPlace(hLow);
                        PlanetChunckMeshBuilder.tmpVertices[2].scaleInPlace(hLow);
                        PlanetChunckMeshBuilder.tmpVertices[3].scaleInPlace(hLow);
                        let c = PlanetChunckMeshBuilder.BlockColor.get(data[i][j][k]);
                        if (!c) {
                            c = PlanetChunckMeshBuilder.BlockColor.get(136);
                        }
                        if (i - 1 < 0 || data[i - 1][j][k] === 0) {
                            MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 1, 5, 4, 0, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (j - 1 < 0 || data[i][j - 1][k] === 0) {
                            MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 0, 4, 6, 2, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (k - 1 < 0 || data[i][j][k - 1] === 0) {
                            MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 0, 2, 3, 1, positions, indices);
                            MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (i + 1 >= PlanetTools.CHUNCKSIZE || data[i + 1][j][k] === 0) {
                            MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 2, 6, 7, 3, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (j + 1 >= PlanetTools.CHUNCKSIZE || data[i][j + 1][k] === 0) {
                            MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 3, 7, 5, 1, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(c.r, c.g, c.b, 1, colors);
                        }
                        if (k + 1 >= PlanetTools.CHUNCKSIZE || data[i][j][k + 1] === 0) {
                            MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 4, 5, 7, 6, positions, indices);
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
                vertices[0] = PlanetChunckMeshBuilder.GetVertex(size, y, z);
                vertices[1] = PlanetChunckMeshBuilder.GetVertex(size, y, z + 1);
                vertices[2] = PlanetChunckMeshBuilder.GetVertex(size, y + 1, z);
                vertices[3] = PlanetChunckMeshBuilder.GetVertex(size, y + 1, z + 1);
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
                    vertices[0] = PlanetChunckMeshBuilder.GetVertex(size, y, z);
                    vertices[1] = PlanetChunckMeshBuilder.GetVertex(size, y, z + 1);
                    vertices[2] = PlanetChunckMeshBuilder.GetVertex(size, y + 1, z);
                    vertices[3] = PlanetChunckMeshBuilder.GetVertex(size, y + 1, z + 1);
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
}
PlanetChunckMeshBuilder._tmpBlockCenter = BABYLON.Vector3.Zero();
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
                    this.chuncks[k][i][j].parent = this;
                    this.chuncks[k][i][j].computeWorldMatrix();
                    this.chuncks[k][i][j].freezeWorldMatrix();
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
    GetData(iGlobal, jGlobal, kGlobal) {
        let chuncksCount = PlanetTools.DegreeToChuncksCount(PlanetTools.KGlobalToDegree(kGlobal));
        let L = chuncksCount * PlanetTools.CHUNCKSIZE;
        if (iGlobal < 0) {
            if (this.side <= Side.Left) {
                let chunck = this.planet.GetSide((this.side + 3) % 4);
                return chunck.GetData(iGlobal + L, jGlobal, kGlobal);
            }
            else if (this.side === Side.Top) {
                return this.planet.GetSide(Side.Back).GetData(L - 1 - jGlobal, L + iGlobal, kGlobal);
            }
            else if (this.side === Side.Bottom) {
                return this.planet.GetSide(Side.Back).GetData(jGlobal, -1 - iGlobal, kGlobal);
            }
        }
        else if (iGlobal >= L) {
            if (this.side <= Side.Left) {
                let chunck = this.planet.GetSide((this.side + 1) % 4);
                return chunck.GetData(iGlobal - L, jGlobal, kGlobal);
            }
            else if (this.side === Side.Top) {
                return this.planet.GetSide(Side.Front).GetData(jGlobal, 2 * L - 1 - iGlobal, kGlobal);
            }
            else if (this.side === Side.Bottom) {
                return this.planet.GetSide(Side.Front).GetData(L - 1 - jGlobal, iGlobal - L, kGlobal);
            }
        }
        if (jGlobal < 0) {
        }
        else if (jGlobal >= L) {
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
        if (side === Side.Right) {
            return BABYLON.Quaternion.Identity();
        }
        else if (side === Side.Left) {
            return BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), Math.PI);
        }
        else if (side === Side.Front) {
            return BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), (3 * Math.PI) / 2.0);
        }
        else if (side === Side.Back) {
            return BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), Math.PI / 2.0);
        }
        else if (side === Side.Top) {
            return BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), Math.PI / 2.0);
        }
        else if (side === Side.Bottom) {
            return BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), (3 * Math.PI) / 2.0);
        }
    }
    static EvaluateVertex(size, i, j) {
        let xRad = PI4;
        let yRad = -PI4 + PI2 * (j / size);
        let zRad = -PI4 + PI2 * (i / size);
        return new BABYLON.Vector3(Math.tan(xRad), Math.tan(yRad), Math.tan(zRad)).normalize();
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
