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
        Game.Scene.clearColor.copyFromFloats(0.1, 0.1, 0.1, 1);
        if (Game.WorldCameraMode) {
            Game.Camera = new BABYLON.ArcRotateCamera("Camera", 0, Math.PI / 2, 100, BABYLON.Vector3.Zero(), Game.Scene);
            Game.Camera.attachControl(Game.Canvas);
        }
        else {
            Game.Camera = new BABYLON.FreeCamera("Camera", BABYLON.Vector3.Zero(), Game.Scene);
        }
        Game.Camera.minZ = 0.1;
        Game.Light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), Game.Scene);
        Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
        Game.Light.specular = new BABYLON.Color3(1, 1, 1);
        Game.Light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
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
    static AnimateLight() {
        let position;
        if (Game.WorldCameraMode) {
            position = Game.Camera.position;
        }
        else {
            position = Player.Position();
        }
        Game.Light.direction = position;
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
            PlanetChunck.InitializeLoop();
            Game.AnimateWater();
            Game.AnimateLight();
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
Game.WorldCameraMode = true;
Game.ShowDebugPlanetHeightMap = false;
Game.DebugLodDistanceFactor = 1;
Game.LockedMouse = false;
Game.ClientXOnLock = -1;
Game.ClientYOnLock = -1;
window.addEventListener("DOMContentLoaded", () => {
    let game = new Game("renderCanvas");
    game.createScene();
    let planetTest = new Planet("Paulita", 5);
    let heightMap = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(5), 60, 10);
    let heightMap2 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(5), 60, 20, {
        firstNoiseDegree: 3,
        postComputation: (v) => {
            let delta = Math.abs(60 - v);
            if (delta > 2) {
                return 1;
            }
            return 4 - delta;
        }
    });
    let heightMap3 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(5), 60, 20);
    let heightMap4 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(5), 60, 30, {
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
    let heightMap5 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(5), 60, 30, {
        firstNoiseDegree: 4,
        postComputation: (v) => {
            if (v > 70) {
                return (v - 70) * 1.5;
            }
            return 1;
        }
    });
    heightMap.addInPlace(heightMap5);
    planetTest.generator = new PlanetGeneratorChaos(planetTest);
    if (!Game.WorldCameraMode) {
        new Player(new BABYLON.Vector3(0, 64, 0), planetTest);
        Game.PlanetEditor = new PlanetEditor(planetTest);
        Game.PlanetEditor.initialize();
    }
    planetTest.AsyncInitialize();
    game.animate();
    if (Game.WorldCameraMode) {
    }
    else {
        Game.Canvas.addEventListener("pointerup", (event) => {
            if (!Game.LockedMouse) {
                Game.LockMouse(event);
            }
        });
        document.addEventListener("pointermove", (event) => {
            if (Game.LockedMouse) {
                if (event.clientX !== Game.ClientXOnLock) {
                    Game.UnlockMouse();
                }
                else if (event.clientY !== Game.ClientYOnLock) {
                    Game.UnlockMouse();
                }
            }
        });
    }
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
        return;
        block = Math.min(block, 128 + 8);
        let i = (block - 128 - 1) % 4;
        let j = Math.floor((block - 128 - 1) / 4);
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
        return;
        block = Math.min(block, 128 + 8);
        let i = (block - 128 - 1) % 4;
        let j = Math.floor((block - 128 - 1) / 4);
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
class Planet extends BABYLON.Mesh {
    constructor(name, kPosMax) {
        super(name, Game.Scene);
        this.kPosMax = kPosMax;
        this.sides = [];
        this.sides[Side.Right] = new PlanetSide(Side.Right, this);
        this.sides[Side.Left] = new PlanetSide(Side.Left, this);
        this.sides[Side.Front] = new PlanetSide(Side.Front, this);
        this.sides[Side.Back] = new PlanetSide(Side.Back, this);
        this.sides[Side.Top] = new PlanetSide(Side.Top, this);
        this.sides[Side.Bottom] = new PlanetSide(Side.Bottom, this);
    }
    GetSide(side) {
        return this.sides[side];
    }
    GetPlanetName() {
        return this.name;
    }
    Initialize() {
        for (let i = 0; i < this.sides.length; i++) {
            this.sides[i].Initialize();
        }
    }
    AsyncInitialize() {
        for (let i = 0; i < this.sides.length; i++) {
            this.sides[i].AsyncInitialize();
        }
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
    }
    get side() {
        return this.planetSide.side;
    }
    GetDegree() {
        return PlanetTools.KPosToDegree(this.kPos);
    }
    GetSize() {
        return PlanetTools.DegreeToSize(this.GetDegree());
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
    PushToBuffer() {
        let position;
        if (Game.WorldCameraMode) {
            position = Game.Camera.position;
        }
        else {
            position = Player.Position();
        }
        let sqrDist = position
            .subtract(this.barycenter)
            .lengthSquared();
        if (sqrDist < Game.DebugLodDistanceFactor * PlanetTools.DISTANCELIMITSQUARED) {
            this.PushToInitializationBuffer();
        }
        else {
            PlanetChunck.delayBuffer.push(this);
        }
    }
    PushToInitializationBuffer() {
        let position;
        if (Game.WorldCameraMode) {
            position = Game.Camera.position;
        }
        else {
            position = Player.Position();
        }
        let thisDistance = position
            .subtract(this.barycenter)
            .lengthSquared();
        let lastIDistance = -1;
        for (let i = 0; i < PlanetChunck.initializationBuffer.length; i++) {
            let iDistance = position
                .subtract(PlanetChunck.initializationBuffer[i].GetBaryCenter())
                .lengthSquared();
            if (thisDistance > iDistance) {
                PlanetChunck.initializationBuffer.splice(i, 0, this);
                return;
            }
            lastIDistance = iDistance;
        }
        PlanetChunck.initializationBuffer.push(this);
    }
    AsyncInitialize() {
        this.PushToBuffer();
    }
    Initialize() {
        let data = localStorage.getItem(this.name);
        if (data && false) {
            this.deserialize(data);
        }
        else {
            this.data = this.planetSide.planet.generator.makeData(this);
            this.saveToLocalStorage();
        }
        this.SetMesh();
    }
    SetMesh() {
        let vertexData = PlanetChunckMeshBuilder.BuildVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, this.data);
        vertexData.applyToMesh(this);
        this.material = SharedMaterials.MainMaterial();
        if (this.kPos === 0) {
            vertexData = PlanetChunckMeshBuilder.BuildBedrockVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, 8, this.data);
            vertexData.applyToMesh(this.bedrock);
            this.bedrock.material = SharedMaterials.BedrockMaterial();
        }
        this.computeWorldMatrix();
        this.refreshBoundingInfo();
        PlanetChunck.initializedBuffer.push(this);
    }
    Dispose() {
        PlanetTools.EmptyVertexData().applyToMesh(this);
        if (this.bedrock) {
            PlanetTools.EmptyVertexData().applyToMesh(this.bedrock);
        }
    }
    static InitializeLoop() {
        let position;
        if (Game.WorldCameraMode) {
            position = Game.Camera.position;
        }
        else {
            position = Player.Position();
        }
        let chunck = PlanetChunck.initializationBuffer.pop();
        if (chunck) {
            chunck.Initialize();
            // chunck.RandomInitialize();
        }
        for (let i = 0; i < 5; i++) {
            if (PlanetChunck.delayBuffer.length > 0) {
                let delayedChunck = PlanetChunck.delayBuffer.splice(0, 1)[0];
                delayedChunck.PushToBuffer();
            }
        }
        for (let i = 0; i < 5; i++) {
            if (PlanetChunck.initializedBuffer.length > 0) {
                let initializedChunck = PlanetChunck.initializedBuffer.splice(0, 1)[0];
                let sqrDist = position
                    .subtract(initializedChunck.barycenter)
                    .lengthSquared();
                if (sqrDist > Game.DebugLodDistanceFactor * PlanetTools.DISTANCELIMITSQUARED) {
                    initializedChunck.Dispose();
                    PlanetChunck.delayBuffer.push(initializedChunck);
                }
                else {
                    PlanetChunck.initializedBuffer.push(initializedChunck);
                }
            }
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
        console.log("Compressed " + this.name + " data to " + (compressed.length / output.length * 100).toFixed(0) + "% of uncompressed size.");
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
PlanetChunck.initializationBuffer = new Array();
PlanetChunck.delayBuffer = new Array();
PlanetChunck.initializedBuffer = new Array();
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
        let h = (hGlobal + 1) * PlanetTools.BLOCKSIZE;
        PlanetChunckMeshBuilder.tmpVertices[0].scaleToRef(h, PlanetChunckMeshBuilder.tmpVertices[4]);
        PlanetChunckMeshBuilder.tmpVertices[1].scaleToRef(h, PlanetChunckMeshBuilder.tmpVertices[5]);
        PlanetChunckMeshBuilder.tmpVertices[2].scaleToRef(h, PlanetChunckMeshBuilder.tmpVertices[6]);
        PlanetChunckMeshBuilder.tmpVertices[3].scaleToRef(h, PlanetChunckMeshBuilder.tmpVertices[7]);
        PlanetChunckMeshBuilder.tmpVertices[0].scaleInPlace(h - PlanetTools.BLOCKSIZE);
        PlanetChunckMeshBuilder.tmpVertices[1].scaleInPlace(h - PlanetTools.BLOCKSIZE);
        PlanetChunckMeshBuilder.tmpVertices[2].scaleInPlace(h - PlanetTools.BLOCKSIZE);
        PlanetChunckMeshBuilder.tmpVertices[3].scaleInPlace(h - PlanetTools.BLOCKSIZE);
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
                        let h = (k + kPos * PlanetTools.CHUNCKSIZE + 1) * PlanetTools.BLOCKSIZE;
                        PlanetChunckMeshBuilder.tmpVertices[0].scaleToRef(h, PlanetChunckMeshBuilder.tmpVertices[4]);
                        PlanetChunckMeshBuilder.tmpVertices[1].scaleToRef(h, PlanetChunckMeshBuilder.tmpVertices[5]);
                        PlanetChunckMeshBuilder.tmpVertices[2].scaleToRef(h, PlanetChunckMeshBuilder.tmpVertices[6]);
                        PlanetChunckMeshBuilder.tmpVertices[3].scaleToRef(h, PlanetChunckMeshBuilder.tmpVertices[7]);
                        PlanetChunckMeshBuilder.tmpVertices[0].scaleInPlace(h - PlanetTools.BLOCKSIZE);
                        PlanetChunckMeshBuilder.tmpVertices[1].scaleInPlace(h - PlanetTools.BLOCKSIZE);
                        PlanetChunckMeshBuilder.tmpVertices[2].scaleInPlace(h - PlanetTools.BLOCKSIZE);
                        PlanetChunckMeshBuilder.tmpVertices[3].scaleInPlace(h - PlanetTools.BLOCKSIZE);
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
class PlanetEditor {
    constructor(planet) {
        this.planet = planet;
        this.data = 0;
        this._update = () => {
            let removeMode = this.data === 0;
            let worldPos = PlanetEditor.GetHitWorldPos(removeMode);
            if (worldPos) {
                if (this.data === 0 || worldPos.subtract(Player.Instance.PositionHead()).lengthSquared() > 1) {
                    if (this.data === 0 || worldPos.subtract(Player.Instance.PositionLeg()).lengthSquared() > 1) {
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
            if (this.data === 0 || worldPos.subtract(Player.Instance.PositionHead()).lengthSquared() > 1) {
                if (this.data === 0 || worldPos.subtract(Player.Instance.PositionLeg()).lengthSquared() > 1) {
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
        let heightMap3 = PlanetHeightMap.CreateMap(PlanetTools.KPosToDegree(5), hMax * 0.5, hMax * 0.25, {
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
var Side;
(function (Side) {
    Side[Side["Right"] = 0] = "Right";
    Side[Side["Left"] = 1] = "Left";
    Side[Side["Top"] = 2] = "Top";
    Side[Side["Bottom"] = 3] = "Bottom";
    Side[Side["Front"] = 4] = "Front";
    Side[Side["Back"] = 5] = "Back";
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
    GetPlanetName() {
        return this.planet.GetPlanetName();
    }
    get kPosMax() {
        return this.planet.kPosMax;
    }
    GetChunck(i, j, k) {
        return this.chuncks[k][i][j];
    }
    GetData(iGlobal, jGlobal, kGlobal) {
        let iPos = Math.floor(iGlobal / PlanetTools.CHUNCKSIZE);
        let jPos = Math.floor(jGlobal / PlanetTools.CHUNCKSIZE);
        let kPos = Math.floor(kGlobal / PlanetTools.CHUNCKSIZE);
        if (this.chuncks[kPos]) {
            if (this.chuncks[kPos][iPos]) {
                if (this.chuncks[kPos][iPos][jPos]) {
                    let i = iGlobal - iPos * PlanetTools.CHUNCKSIZE;
                    let j = jGlobal - jPos * PlanetTools.CHUNCKSIZE;
                    let k = kGlobal - kPos * PlanetTools.CHUNCKSIZE;
                    return this.chuncks[kPos][iPos][jPos].GetData(i, j, k);
                }
            }
        }
        return 0;
    }
    Initialize() {
        for (let i = 0; i < this.chuncksLength; i++) {
            for (let j = 0; j < this.chuncksLength; j++) {
                for (let k = 0; k < this.chuncksLength / 2; k++) {
                    this.chuncks[i][j][k].Initialize();
                }
            }
        }
    }
    AsyncInitialize() {
        for (let k = 0; k < this.chuncks.length; k++) {
            for (let i = 0; i < this.chuncks[k].length; i++) {
                for (let j = 0; j < this.chuncks[k][i].length; j++) {
                    this.chuncks[k][i][j].AsyncInitialize();
                }
            }
        }
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
        let k = Math.floor(r / PlanetTools.BLOCKSIZE);
        let i = Math.floor(((zDeg + 45) / 90) * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));
        let j = Math.floor(((yDeg + 45) / 90) * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));
        return { i: i, j: j, k: k };
    }
    static GlobalIJKToLocalIJK(planetSide, global) {
        return {
            planetChunck: planetSide.GetChunck(Math.floor(global.i / PlanetTools.CHUNCKSIZE), Math.floor(global.j / PlanetTools.CHUNCKSIZE), Math.floor(global.k / PlanetTools.CHUNCKSIZE)),
            i: global.i % PlanetTools.CHUNCKSIZE,
            j: global.j % PlanetTools.CHUNCKSIZE,
            k: global.k % PlanetTools.CHUNCKSIZE,
        };
    }
    static KGlobalToDegree(k) {
        return PlanetTools.KPosToDegree(Math.floor(k / PlanetTools.CHUNCKSIZE));
    }
    static KPosToDegree(kPos) {
        return PlanetTools.KPosToDegree16(kPos);
    }
    static KPosToDegree16(kPos) {
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
    static KPosToDegree32(kPos) {
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
    static DegreeToSize(degree) {
        return Math.pow(2, degree);
    }
    static DegreeToChuncksCount(degree) {
        return PlanetTools.DegreeToSize(degree) / PlanetTools.CHUNCKSIZE;
    }
}
PlanetTools.BLOCKSIZE = 1;
PlanetTools.CHUNCKSIZE = 16;
PlanetTools.ALPHALIMIT = Math.PI / 4;
PlanetTools.DISTANCELIMITSQUARED = 128 * 128;
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
                    return (mesh instanceof PlanetChunck);
                });
                if (hit.pickedPoint) {
                    let d = hit.pickedPoint.subtract(this.position).length();
                    if (d > 0.01) {
                        this._groundFactor.copyFrom(this._gravityFactor).scaleInPlace(-1).scaleInPlace(Math.pow(1.5 / d, 1));
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
            this._controlFactor.scaleInPlace(20 / this.mass * deltaTime);
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
                            this._surfaceFactor.addInPlace((axis).scale(-10 / this.mass * 0.30 / d * deltaTime));
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
        Game.Camera.parent = this.camPos;
        Game.Camera.position.copyFromFloats(0, 0, 0);
        this.RegisterControl();
        Player.Instance = this;
        Game.Scene.onBeforeRenderObservable.add(this._update);
    }
    static Position() {
        return Player.Instance.position;
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
    RegisterControl() {
        let scene = Game.Scene;
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (event) => {
            if (event.sourceEvent.key === "z" ||
                event.sourceEvent.key === "w") {
                this.pForward = true;
            }
            if (event.sourceEvent.key === "s") {
                this.back = true;
            }
            if (event.sourceEvent.key === "q" ||
                event.sourceEvent.key === "a") {
                this.left = true;
            }
            if (event.sourceEvent.key === "d") {
                this.pRight = true;
            }
            if (event.sourceEvent.keyCode === 32) {
                this.fly = true;
            }
        }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (event) => {
            if (event.sourceEvent.key === "z" ||
                event.sourceEvent.key === "w") {
                this.pForward = false;
            }
            if (event.sourceEvent.key === "s") {
                this.back = false;
            }
            if (event.sourceEvent.key === "q" ||
                event.sourceEvent.key === "a") {
                this.left = false;
            }
            if (event.sourceEvent.key === "d") {
                this.pRight = false;
            }
            if (event.sourceEvent.keyCode === 32) {
                if (this._isGrounded) {
                    this.velocity.addInPlace(this.getDirection(BABYLON.Axis.Y).scale(5));
                    this._isGrounded = false;
                    this._jumpTimer = 0.2;
                }
            }
        }));
        Game.Canvas.addEventListener("mousemove", (event) => {
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
                let localY = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, Player.Instance.getWorldMatrix());
                let rotation = BABYLON.Quaternion.RotationAxis(localY, rotationPower);
                Player.Instance.rotationQuaternion = rotation.multiply(Player.Instance.rotationQuaternion);
                let rotationCamPower = movementY / 500;
                Player.Instance.camPos.rotation.x += rotationCamPower;
                Player.Instance.camPos.rotation.x = Math.max(Player.Instance.camPos.rotation.x, -Math.PI / 2);
                Player.Instance.camPos.rotation.x = Math.min(Player.Instance.camPos.rotation.x, Math.PI / 2);
            }
        });
    }
    _keepUp() {
        if (!Player.Instance) {
            return;
        }
        let currentUp = BABYLON.Vector3.Normalize(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, Player.Instance.getWorldMatrix()));
        let targetUp = BABYLON.Vector3.Normalize(Player.Instance.position);
        let correctionAxis = BABYLON.Vector3.Cross(currentUp, targetUp);
        let correctionAngle = Math.abs(Math.asin(correctionAxis.length()));
        if (correctionAngle > 0.001) {
            let rotation = BABYLON.Quaternion.RotationAxis(correctionAxis, correctionAngle / 5);
            Player.Instance.rotationQuaternion = rotation.multiply(Player.Instance.rotationQuaternion);
        }
    }
}
class SharedMaterials {
    static MainMaterial() {
        if (!SharedMaterials.mainMaterial) {
            SharedMaterials.mainMaterial = new BABYLON.StandardMaterial("mainMaterial", Game.Scene);
            SharedMaterials.mainMaterial.diffuseTexture = new BABYLON.Texture("./resources/textures/mainTexture.png", Game.Scene);
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
            Game.Camera.computeWorldMatrix();
            debugPlanet.position.copyFrom(Game.Camera.position);
            debugPlanet.position.addInPlace(Game.Camera.getDirection(BABYLON.Axis.Z).scale(7));
            debugPlanet.position.addInPlace(Game.Camera.getDirection(BABYLON.Axis.X).scale(x));
            debugPlanet.position.addInPlace(Game.Camera.getDirection(BABYLON.Axis.Y).scale(y));
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
}
