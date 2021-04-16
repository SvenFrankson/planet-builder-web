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
        Game.Camera = new BABYLON.FreeCamera("Camera", BABYLON.Vector3.Zero(), Game.Scene);
        Game.Camera.minZ = 0.1;
        Game.Light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), Game.Scene);
        Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
        Game.Light.specular = new BABYLON.Color3(1, 1, 1);
        Game.Light.groundColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        Game.CreateSky();
    }
    static CreateSky() {
        Game.Sky = BABYLON.MeshBuilder.CreateBox("Sky", { size: 1000, sideOrientation: 1 }, Game.Scene);
        Game.Sky.material = SharedMaterials.SkyMaterial();
    }
    static AnimateSky() {
        Game.Sky.rotation.x += 0.0001;
        Game.Sky.rotation.y += 0.0001;
        Game.Sky.rotation.z += 0.0001;
    }
    static AnimateWater() {
        SharedMaterials.WaterMaterial().diffuseTexture.uOffset += 0.005;
        SharedMaterials.WaterMaterial().diffuseTexture.vOffset += 0.005;
    }
    static AnimateLight() {
        Game.Light.direction = Player.Instance.position;
    }
    animate() {
        Game.Engine.runRenderLoop(() => {
            Game.Scene.render();
            PlanetChunck.InitializeLoop();
            Game.AnimateSky();
            Game.AnimateWater();
            Game.AnimateLight();
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
Game.LockedMouse = false;
Game.ClientXOnLock = -1;
Game.ClientYOnLock = -1;
window.addEventListener("DOMContentLoaded", () => {
    let game = new Game("renderCanvas");
    game.createScene();
    game.animate();
    PlanetEditor.RegisterControl();
    let planetTest = new Planet("Paulita", 1);
    new Player(new BABYLON.Vector3(0, 64, 0), planetTest);
    planetTest.AsyncInitialize();
    Game.Canvas.addEventListener("pointerup", (event) => {
        if (!Game.LockedMouse) {
            Game.LockMouse(event);
        }
        else {
            PlanetEditor.OnClick(planetTest);
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
        this.totalRadiusWaterSquared = this.GetRadiusWater() * this.GetRadiusWater();
        console.log(this.totalRadiusWaterSquared);
        this.sides = new Array();
        this.sides[Side.Right] = new PlanetSide(Side.Right, this);
        this.sides[Side.Left] = new PlanetSide(Side.Left, this);
        this.sides[Side.Front] = new PlanetSide(Side.Front, this);
        this.sides[Side.Back] = new PlanetSide(Side.Back, this);
        this.sides[Side.Top] = new PlanetSide(Side.Top, this);
        this.sides[Side.Bottom] = new PlanetSide(Side.Bottom, this);
        console.log("KPosMax = " + this.kPosMax);
        console.log("RadiusWater = " + this.GetRadiusWater());
    }
    GetSide(side) {
        return this.sides[side];
    }
    GetKPosMax() {
        return this.kPosMax;
    }
    GetRadiusWater() {
        return 22.8;
    }
    GetTotalRadiusWaterSquared() {
        return this.totalRadiusWaterSquared;
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
        this.barycenter = PlanetTools.EvaluateVertex(this.GetSize(), PlanetTools.CHUNCKSIZE * this.iPos + PlanetTools.CHUNCKSIZE / 2, PlanetTools.CHUNCKSIZE * this.jPos + PlanetTools.CHUNCKSIZE / 2).scale(PlanetTools.CHUNCKSIZE * this.kPos + PlanetTools.CHUNCKSIZE / 2);
        this.barycenter = BABYLON.Vector3.TransformCoordinates(this.barycenter, planetSide.computeWorldMatrix());
        this.normal = BABYLON.Vector3.Normalize(this.barycenter);
        this.water = new Water(this.name + "-water");
        this.water.parent = this;
        this.bedrock = new BABYLON.Mesh(this.name + "-bedrock", Game.Scene);
        this.bedrock.parent = this;
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
    GetKPosMax() {
        return this.planetSide.GetKPosMax();
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
    GetRadiusWater() {
        return this.planetSide.GetRadiusWater();
    }
    PushToBuffer() {
        let sqrDist = Player.Position()
            .subtract(this.barycenter)
            .lengthSquared();
        if (sqrDist < PlanetTools.DISTANCELIMITSQUARED) {
            this.PushToInitializationBuffer();
        }
        else {
            PlanetChunck.delayBuffer.push(this);
        }
    }
    PushToInitializationBuffer() {
        let thisDistance = Player.Position()
            .subtract(this.barycenter)
            .lengthSquared();
        let lastIDistance = -1;
        for (let i = 0; i < PlanetChunck.initializationBuffer.length; i++) {
            let iDistance = Player.Position()
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
        this.data = PlanetTools.FilledData();
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
        PlanetTools.EmptyVertexData().applyToMesh(this.water);
        PlanetTools.EmptyVertexData().applyToMesh(this.bedrock);
    }
    static InitializeLoop() {
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
                let sqrDist = Player.Position()
                    .subtract(initializedChunck.barycenter)
                    .lengthSquared();
                if (sqrDist > 4 * PlanetTools.DISTANCELIMITSQUARED) {
                    initializedChunck.Dispose();
                    PlanetChunck.delayBuffer.push(initializedChunck);
                }
                else {
                    PlanetChunck.initializedBuffer.push(initializedChunck);
                }
            }
        }
    }
}
PlanetChunck.initializationBuffer = new Array();
PlanetChunck.delayBuffer = new Array();
PlanetChunck.initializedBuffer = new Array();
class PlanetChunckMeshBuilder {
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
                        //let lum: number = h / 96;
                        let lum = 1;
                        if (i - 1 < 0 || data[i - 1][j][k] === 0) {
                            MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 1, 5, 4, 0, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
                        }
                        if (j - 1 < 0 || data[i][j - 1][k] === 0) {
                            MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 0, 4, 6, 2, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
                        }
                        if (k - 1 < 0 || data[i][j][k - 1] === 0) {
                            MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 0, 2, 3, 1, positions, indices);
                            MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
                        }
                        if (i + 1 >= PlanetTools.CHUNCKSIZE || data[i + 1][j][k] === 0) {
                            MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 2, 6, 7, 3, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
                        }
                        if (j + 1 >= PlanetTools.CHUNCKSIZE || data[i][j + 1][k] === 0) {
                            MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 3, 7, 5, 1, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
                        }
                        if (k + 1 >= PlanetTools.CHUNCKSIZE || data[i][j][k + 1] === 0) {
                            MeshTools.PushQuad(PlanetChunckMeshBuilder.tmpVertices, 4, 5, 7, 6, positions, indices);
                            MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
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
class PlanetEditor extends BABYLON.Mesh {
    static GetHitWorldPos(remove = false) {
        console.log("Canvas Width : " + Game.Canvas.width);
        console.log("Canvas Height : " + Game.Canvas.height);
        let pickInfo = Game.Scene.pick(Game.Canvas.width / 2, Game.Canvas.height / 2, (mesh) => {
            return !(mesh instanceof Water);
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
    static OnClick(planet) {
        let removeMode = PlanetEditor.data === 0;
        let worldPos = PlanetEditor.GetHitWorldPos(removeMode);
        console.log("WorldPos : " + worldPos);
        if (worldPos) {
            if (PlanetEditor.data === 0 ||
                worldPos
                    .subtract(Player.Instance.PositionHead())
                    .lengthSquared() > 1) {
                if (PlanetEditor.data === 0 ||
                    worldPos
                        .subtract(Player.Instance.PositionLeg())
                        .lengthSquared() > 1) {
                    let planetSide = PlanetTools.WorldPositionToPlanetSide(planet, worldPos);
                    console.log("PlanetSide : " + Side[planetSide.side]);
                    if (planetSide) {
                        let global = PlanetTools.WorldPositionToGlobalIJK(planetSide, worldPos);
                        console.log("Globals : " + JSON.stringify(global));
                        let local = PlanetTools.GlobalIJKToLocalIJK(planetSide, global);
                        console.log("Chunck : " +
                            JSON.stringify(local.planetChunck.Position()));
                        console.log("Block : I=" +
                            local.i +
                            " , J=" +
                            local.j +
                            " , K=" +
                            local.k);
                        local.planetChunck.SetData(local.i, local.j, local.k, PlanetEditor.data);
                        local.planetChunck.SetMesh();
                    }
                }
            }
        }
    }
    static RegisterControl() {
        let scene = Game.Scene;
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (event) => {
            if (event.sourceEvent.keyCode === 48 ||
                event.sourceEvent.keyCode === 88) {
                PlanetEditor.SetData(0);
            }
            if (event.sourceEvent.keyCode === 49) {
                PlanetEditor.SetData(129);
            }
            if (event.sourceEvent.keyCode === 50) {
                PlanetEditor.SetData(130);
            }
            if (event.sourceEvent.keyCode === 51) {
                PlanetEditor.SetData(131);
            }
            if (event.sourceEvent.keyCode === 52) {
                PlanetEditor.SetData(132);
            }
            if (event.sourceEvent.keyCode === 53) {
                PlanetEditor.SetData(133);
            }
            if (event.sourceEvent.keyCode === 54) {
                PlanetEditor.SetData(134);
            }
            if (event.sourceEvent.keyCode === 55) {
                PlanetEditor.SetData(135);
            }
            if (event.sourceEvent.keyCode === 17) {
                PlanetEditor.SetData(PlanetEditor.data - 1);
            }
            if (event.sourceEvent.keyCode === 16) {
                PlanetEditor.SetData(PlanetEditor.data + 1);
            }
        }));
    }
    static SetData(newData) {
        if (newData < 0) {
            newData = 0;
        }
        if (newData > 0 && newData < 129) {
            if (newData > PlanetEditor.data) {
                newData = 129;
            }
            else {
                newData = 0;
            }
        }
        if (newData > 135) {
            newData = 0;
        }
        PlanetEditor.data = newData;
    }
}
PlanetEditor.data = 0;
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
        for (let k = 0; k <= this.GetKPosMax(); k++) {
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
    GetRadiusWater() {
        return this.planet.GetRadiusWater();
    }
    GetKPosMax() {
        return this.planet.GetKPosMax();
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
        if (!PlanetTools.emptyVertexData) {
            let emptyMesh = new BABYLON.Mesh("Empty", Game.Scene);
            PlanetTools.emptyVertexData = BABYLON.VertexData.ExtractFromMesh(emptyMesh);
            emptyMesh.dispose();
        }
        return PlanetTools.emptyVertexData;
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
    static FilledData() {
        let data = [];
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = [];
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = [];
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    data[i][j][k] = 129;
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
        console.log("YDeg : " + yDeg);
        console.log("ZDeg : " + zDeg);
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
    static StringColorRGBInterpolation(c1, c2, dt) {
        let offset1 = 0;
        if (c1[0] === "#") {
            offset1 = 1;
        }
        let r1 = parseInt(c1.substr(0 + offset1, 2), 16);
        let g1 = parseInt(c1.substr(2 + offset1, 2), 16);
        let b1 = parseInt(c1.substr(4 + offset1, 2), 16);
        let offset2 = 0;
        if (c2[0] === "#") {
            offset2 = 1;
        }
        let r2 = parseInt(c2.substr(0 + offset1, 2), 16);
        let g2 = parseInt(c2.substr(2 + offset1, 2), 16);
        let b2 = parseInt(c2.substr(4 + offset1, 2), 16);
        let r = Math.round(r1 * (1 - dt) + r2 * dt);
        let g = Math.round(g1 * (1 - dt) + g2 * dt);
        let b = Math.round(b1 * (1 - dt) + b2 * dt);
        let rs = "00" + r.toString(16);
        rs = rs.substr(-2, 2);
        let gs = "00" + g.toString(16);
        gs = gs.substr(-2, 2);
        let bs = "00" + b.toString(16);
        bs = bs.substr(-2, 2);
        return "#" + rs + gs + bs;
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
        this._groundReaction = BABYLON.Vector3.Zero();
        this._controlFactor = BABYLON.Vector3.Zero();
        this._forwardDirection = new BABYLON.Vector3(0, -1, 0);
        this._downDirection = new BABYLON.Vector3(0, -1, 0);
        this._jumpTimer = 0;
        this._isGrounded = false;
        this._update = () => {
            let deltaTime = Game.Engine.getDeltaTime() / 1000;
            this._jumpTimer = Math.max(this._jumpTimer - deltaTime, 0);
            this._keepUp();
            this.getDirectionToRef(BABYLON.Axis.Y, this._downDirection);
            this._downDirection.scaleInPlace(-1);
            this._downDirection.normalize();
            this._gravityFactor.copyFrom(this._downDirection).scaleInPlace(9.8 * deltaTime);
            this._groundReaction.copyFromFloats(0, 0, 0);
            let f = 1;
            if (this._jumpTimer === 0) {
                Player._downRaycastDir.copyFrom(this.position);
                Player._downRaycastDir.scaleInPlace(-1);
                Player._downRaycastDir.normalize();
                let ray = new BABYLON.Ray(this.position, Player._downRaycastDir, 1.7);
                let hit = Game.Scene.pickWithRay(ray, (mesh) => {
                    return !(mesh instanceof Water);
                });
                if (hit.pickedPoint) {
                    let d = hit.pickedPoint.subtract(this.position).length();
                    this._groundReaction.copyFrom(this._gravityFactor).scaleInPlace(-1).scaleInPlace(Math.pow(1.5 / d, 1));
                    f = 0.005;
                    this._isGrounded = true;
                }
            }
            this.velocity.addInPlace(this._gravityFactor);
            this.velocity.addInPlace(this._groundReaction);
            this._controlFactor.copyFromFloats(0, 0, 0);
            if (this.pForward) {
                this.getDirectionToRef(BABYLON.Axis.Z, this._forwardDirection);
                this._controlFactor.addInPlace(this._forwardDirection);
            }
            if (this._controlFactor.lengthSquared() > 0.1) {
                this._controlFactor.normalize();
            }
            this._controlFactor.scaleInPlace(40 / this.mass * deltaTime);
            this.velocity.addInPlace(this._controlFactor);
            let downVelocity = this._downDirection.scale(BABYLON.Vector3.Dot(this.velocity, this._downDirection));
            this.velocity.subtractInPlace(downVelocity);
            downVelocity.scaleInPlace(Math.pow(0.75 * f, deltaTime));
            this.velocity.scaleInPlace(Math.pow(0.01, deltaTime));
            this.velocity.addInPlace(downVelocity);
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
    static DownRayCast() {
        let pos = Player.Instance.position;
        Player._downRaycastDir.copyFrom(this.Position());
        Player._downRaycastDir.scaleInPlace(-1);
        Player._downRaycastDir.normalize();
        let ray = new BABYLON.Ray(pos, Player._downRaycastDir, 1.6);
        let hit = Game.Scene.pickWithRay(ray, (mesh) => {
            return !(mesh instanceof Water);
        });
        if (!hit.pickedPoint) {
            return -1;
        }
        let d = hit.pickedPoint.subtract(pos).length();
        if (d < 1.5) {
            return 1;
        }
        return 0;
    }
    static CanGoSide(axis) {
        let localAxis = BABYLON.Vector3.TransformNormal(axis, Player.Instance.getWorldMatrix());
        let ray = new BABYLON.Ray(Player.Instance.PositionLeg(), localAxis, 0.6);
        let hit = Game.Scene.pickWithRay(ray, (mesh) => {
            return !(mesh instanceof Water);
        });
        if (hit.pickedPoint) {
            return false;
        }
        ray = new BABYLON.Ray(Player.Instance.PositionHead(), localAxis, 0.6);
        hit = Game.Scene.pickWithRay(ray, (mesh) => {
            return !(mesh instanceof Water);
        });
        if (hit.pickedPoint) {
            return false;
        }
        return true;
    }
    static CanGoUp() {
        let localAxis = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, Player.Instance.getWorldMatrix());
        let ray = new BABYLON.Ray(Player.Instance.PositionHead(), localAxis, 0.6);
        let hit = Game.Scene.pickWithRay(ray, (mesh) => {
            return !(mesh instanceof Water);
        });
        if (hit.pickedPoint) {
            return false;
        }
        return true;
    }
}
Player._downRaycastDir = new BABYLON.Vector3(0, -1, 0);
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
class Water extends BABYLON.Mesh {
    constructor(name) {
        super(name, Game.Scene);
    }
}
