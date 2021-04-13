/// <reference path="../lib/babylon.d.ts"/>
/// <reference path="../lib/jquery.d.ts"/>
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
        if (SharedMaterials.WaterMaterial().diffuseTexture instanceof BABYLON.Texture) {
            SharedMaterials.WaterMaterial().diffuseTexture.uOffset += 0.005;
            SharedMaterials.WaterMaterial().diffuseTexture.vOffset += 0.005;
        }
    }
    static AnimateLight() {
        Game.Light.direction = Player.Instance.position;
    }
    static UpdateFPS() {
        $("#fps-count").text(Game.Engine.getFps().toPrecision(2));
    }
    animate() {
        Game.Engine.runRenderLoop(() => {
            Game.Scene.render();
            PlanetChunck.InitializeLoop();
            Player.StillStanding();
            Player.GetMovin();
            Game.AnimateSky();
            Game.AnimateWater();
            Game.AnimateLight();
            Player.WaterFilter();
            Game.UpdateFPS();
        });
        window.addEventListener("resize", () => {
            Game.Engine.resize();
            Game.SetCursorPosition();
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
    static SetCursorPosition() {
        $("#cursor").css("top", $("#cursor").parent().height() / 2 - $("#cursor").height() / 2);
        $("#cursor").css("left", $("#cursor").parent().width() / 2 - $("#cursor").width() / 2);
    }
}
Game.LockedMouse = false;
Game.ClientXOnLock = -1;
Game.ClientYOnLock = -1;
window.addEventListener("DOMContentLoaded", () => {
    let game = new Game("renderCanvas");
    game.createScene();
    game.animate();
    Game.SetCursorPosition();
    PlanetEditor.RegisterControl();
    let planetTest = new Planet("Paulita", 3);
    new Player(new BABYLON.Vector3(0, 128, 0), planetTest);
    planetTest.AsyncInitialize();
    Game.Canvas.addEventListener("mouseup", (event) => {
        if (!Game.LockedMouse) {
            Game.LockMouse(event);
        }
        else {
            PlanetEditor.OnClick(planetTest);
        }
    });
    document.addEventListener("mousemove", (event) => {
        if (Game.LockedMouse) {
            if (event.clientX !== Game.ClientXOnLock) {
                Game.UnlockMouse();
            }
            else if (event.clientY !== Game.ClientYOnLock) {
                Game.UnlockMouse();
            }
        }
    });
    $("#camera-fov").val(Game.Camera.fov.toPrecision(3));
    $("#camera-fov").on("change", (e) => {
        if (e.target instanceof HTMLInputElement) {
            Game.Camera.fov = parseFloat(e.target.value);
        }
    });
    $("#camera-fov-reset").on("click", () => {
        Game.Camera.fov = 0.8;
        $("#camera-fov").val("0.8");
    });
});
// get shared VertexData from exposed arrays.
// obviously not the easiest way to get shapes: mostly an attempt at complete procedural generation.
class MeshTools {
    static Angle(v1, v2) {
        return Math.acos(BABYLON.Vector3.Dot(BABYLON.Vector3.Normalize(v1), BABYLON.Vector3.Normalize(v2)));
    }
    static FloatVector(size) {
        return new BABYLON.Vector3(size, size, size);
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
;
class PlanetChunck extends BABYLON.Mesh {
    constructor(iPos, jPos, kPos, planetSide) {
        super("chunck-" + iPos + "-" + jPos + "-" + kPos, Game.Scene);
        this.planetSide = planetSide;
        this.iPos = iPos;
        this.jPos = jPos;
        this.kPos = kPos;
        this.barycenter = PlanetTools.EvaluateVertex(this.GetSize(), PlanetTools.CHUNCKSIZE * this.iPos + PlanetTools.CHUNCKSIZE / 2, PlanetTools.CHUNCKSIZE * this.jPos + PlanetTools.CHUNCKSIZE / 2).multiply(MeshTools.FloatVector(PlanetTools.CHUNCKSIZE * this.kPos + PlanetTools.CHUNCKSIZE / 2));
        this.barycenter = BABYLON.Vector3.TransformCoordinates(this.barycenter, planetSide.computeWorldMatrix());
        this.normal = BABYLON.Vector3.Normalize(this.barycenter);
        this.water = new Water(this.name + "-water");
        this.water.parent = this;
        this.bedrock = new BABYLON.Mesh(this.name + "-bedrock", Game.Scene);
        this.bedrock.parent = this;
    }
    GetSide() {
        return this.planetSide.GetSide();
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
            k: this.kPos
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
        let sqrDist = Player.Position().subtract(this.barycenter).lengthSquared();
        if (sqrDist < PlanetTools.DISTANCELIMITSQUARED) {
            this.PushToInitializationBuffer();
        }
        else {
            PlanetChunck.delayBuffer.push(this);
        }
        /*
        let alpha: number = MeshTools.Angle(this.GetNormal(), Player.Position());
        if (alpha < PlanetTools.ALPHALIMIT) {
          this.PushToInitializationBuffer();
        } else {
          PlanetChunck.delayBuffer.push(this);
        }
        */
    }
    PushToInitializationBuffer() {
        let thisDistance = Player.Position().subtract(this.barycenter).lengthSquared();
        let lastIDistance = -1;
        for (let i = 0; i < PlanetChunck.initializationBuffer.length; i++) {
            let iDistance = Player.Position().subtract(PlanetChunck.initializationBuffer[i].GetBaryCenter()).lengthSquared();
            if (thisDistance > iDistance) {
                PlanetChunck.initializationBuffer.splice(i, 0, this);
                $("#initialization-buffer-length").text(PlanetChunck.initializationBuffer.length + "");
                return;
            }
            /*
            if (iDistance < lastIDistance) {
              let tmp: PlanetChunck = PlanetChunck.initializationBuffer[i];
              PlanetChunck.initializationBuffer[i] = PlanetChunck.initializationBuffer[i - 1];
              PlanetChunck.initializationBuffer[i - 1] = tmp;
            }*/
            lastIDistance = iDistance;
        }
        PlanetChunck.initializationBuffer.push(this);
        $("#initialization-buffer-length").text(PlanetChunck.initializationBuffer.length + "");
    }
    AsyncInitialize() {
        this.PushToBuffer();
    }
    Initialize() {
        let dataUrl = "./chunck" +
            "/" + this.GetPlanetName() +
            "/" + Side[this.GetSide()] +
            "/" + this.iPos +
            "/" + this.jPos +
            "/" + this.kPos +
            "/data.txt";
        $.get(dataUrl, (data) => {
            this.data = PlanetTools.DataFromHexString(data);
            this.SetMesh();
        });
    }
    SetMesh() {
        let vertexData = PlanetChunckMeshBuilder
            .BuildVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, this.data);
        vertexData.applyToMesh(this);
        this.material = SharedMaterials.MainMaterial();
        if (this.kPos === this.planetSide.GetKPosMax()) {
            vertexData = PlanetChunckMeshBuilder
                .BuildWaterVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, this.GetRadiusWater());
            vertexData.applyToMesh(this.water);
            this.water.material = SharedMaterials.WaterMaterial();
        }
        if (this.kPos === 0) {
            vertexData = PlanetChunckMeshBuilder
                .BuildBedrockVertexData(this.GetSize(), this.iPos, this.jPos, this.kPos, 8, this.data);
            vertexData.applyToMesh(this.bedrock);
            this.bedrock.material = SharedMaterials.BedrockMaterial();
        }
        this.computeWorldMatrix();
        this.refreshBoundingInfo();
        PlanetChunck.initializedBuffer.push(this);
        $("#chuncks-set-count").text(PlanetChunck.initializedBuffer.length + "");
    }
    Dispose() {
        PlanetTools.EmptyVertexData().applyToMesh(this);
        PlanetTools.EmptyVertexData().applyToMesh(this.water);
        PlanetTools.EmptyVertexData().applyToMesh(this.bedrock);
    }
    static InitializeLoop() {
        let chunck = PlanetChunck.initializationBuffer.pop();
        $("#initialization-buffer-length").text(PlanetChunck.initializationBuffer.length + "");
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
                $("#chuncks-set-count").text(PlanetChunck.initializedBuffer.length + "");
                /*
                let alpha: number = MeshTools.Angle(initializedChunck.GetNormal(), Player.Position());
                if (alpha > PlanetTools.ALPHALIMIT * 1.2) {
                  initializedChunck.Dispose();
                  PlanetChunck.delayBuffer.push(initializedChunck);
                } else {
                  PlanetChunck.initializedBuffer.push(initializedChunck);
                }
                */
                let sqrDist = Player.Position().subtract(initializedChunck.barycenter).lengthSquared();
                if (sqrDist > 4 * PlanetTools.DISTANCELIMITSQUARED) {
                    initializedChunck.Dispose();
                    PlanetChunck.delayBuffer.push(initializedChunck);
                }
                else {
                    PlanetChunck.initializedBuffer.push(initializedChunck);
                    $("#chuncks-set-count").text(PlanetChunck.initializedBuffer.length + "");
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
            PlanetChunckMeshBuilder.cachedVertices = new Array();
        }
        if (!PlanetChunckMeshBuilder.cachedVertices[size]) {
            PlanetChunckMeshBuilder.cachedVertices[size] = new Array();
        }
        if (!PlanetChunckMeshBuilder.cachedVertices[size][i]) {
            PlanetChunckMeshBuilder.cachedVertices[size][i] = new Array();
        }
        if (!PlanetChunckMeshBuilder.cachedVertices[size][i][j]) {
            PlanetChunckMeshBuilder.cachedVertices[size][i][j] = PlanetTools.EvaluateVertex(size, i, j);
        }
        out.copyFrom(PlanetChunckMeshBuilder.cachedVertices[size][i][j]);
        return out;
    }
    static BuildVertexData(size, iPos, jPos, kPos, data) {
        let vertexData = new BABYLON.VertexData();
        let vertices = new Array();
        for (let i = 0; i < 8; i++) {
            vertices[i] = BABYLON.Vector3.Zero();
        }
        let height = BABYLON.Vector3.Zero();
        let positions = new Array();
        let indices = new Array();
        let uvs = new Array();
        let colors = new Array();
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (let k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    if (data[i][j][k] !== 0) {
                        let y = i + iPos * PlanetTools.CHUNCKSIZE;
                        let z = j + jPos * PlanetTools.CHUNCKSIZE;
                        PlanetChunckMeshBuilder.GetVertexToRef(size, y, z, vertices[0]);
                        PlanetChunckMeshBuilder.GetVertexToRef(size, y, z + 1, vertices[1]);
                        PlanetChunckMeshBuilder.GetVertexToRef(size, y + 1, z, vertices[2]);
                        PlanetChunckMeshBuilder.GetVertexToRef(size, y + 1, z + 1, vertices[3]);
                        let h = k + kPos * PlanetTools.CHUNCKSIZE + 1;
                        height.copyFromFloats(h, h, h);
                        vertices[0].multiplyToRef(height, vertices[4]);
                        vertices[1].multiplyToRef(height, vertices[5]);
                        vertices[2].multiplyToRef(height, vertices[6]);
                        vertices[3].multiplyToRef(height, vertices[7]);
                        height.subtractFromFloatsToRef(1, 1, 1, height);
                        vertices[0].multiplyInPlace(height);
                        vertices[1].multiplyInPlace(height);
                        vertices[2].multiplyInPlace(height);
                        vertices[3].multiplyInPlace(height);
                        let lum = h / 96;
                        if (i - 1 < 0 || data[i - 1][j][k] === 0) {
                            MeshTools.PushQuad(vertices, 1, 5, 4, 0, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
                        }
                        if (j - 1 < 0 || data[i][j - 1][k] === 0) {
                            MeshTools.PushQuad(vertices, 0, 4, 6, 2, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
                        }
                        if (k - 1 < 0 || data[i][j][k - 1] === 0) {
                            MeshTools.PushQuad(vertices, 0, 2, 3, 1, positions, indices);
                            MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
                        }
                        if (i + 1 >= PlanetTools.CHUNCKSIZE || data[i + 1][j][k] === 0) {
                            MeshTools.PushQuad(vertices, 2, 6, 7, 3, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
                        }
                        if (j + 1 >= PlanetTools.CHUNCKSIZE || data[i][j + 1][k] === 0) {
                            MeshTools.PushQuad(vertices, 3, 7, 5, 1, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                            MeshTools.PushQuadColor(lum, lum, lum, 1, colors);
                        }
                        if (k + 1 >= PlanetTools.CHUNCKSIZE || data[i][j][k + 1] === 0) {
                            MeshTools.PushQuad(vertices, 4, 5, 7, 6, positions, indices);
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
        let vertices = new Array();
        let positions = new Array();
        let indices = new Array();
        let uvs = new Array();
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                let y = i + iPos * PlanetTools.CHUNCKSIZE;
                let z = j + jPos * PlanetTools.CHUNCKSIZE;
                // following vertices should be lazy-computed
                vertices[0] = PlanetChunckMeshBuilder.GetVertex(size, y, z);
                vertices[1] = PlanetChunckMeshBuilder.GetVertex(size, y, z + 1);
                vertices[2] = PlanetChunckMeshBuilder.GetVertex(size, y + 1, z);
                vertices[3] = PlanetChunckMeshBuilder.GetVertex(size, y + 1, z + 1);
                vertices[1].multiplyInPlace(MeshTools.FloatVector(rWater));
                vertices[2].multiplyInPlace(MeshTools.FloatVector(rWater));
                vertices[3].multiplyInPlace(MeshTools.FloatVector(rWater));
                vertices[0].multiplyInPlace(MeshTools.FloatVector(rWater));
                MeshTools.PushQuad(vertices, 0, 1, 3, 2, positions, indices);
                MeshTools.PushWaterUvs(uvs);
                MeshTools.PushQuad(vertices, 0, 2, 3, 1, positions, indices);
                MeshTools.PushWaterUvs(uvs);
            }
        }
        let normals = new Array();
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;
        return vertexData;
    }
    static BuildBedrockVertexData(size, iPos, jPos, kPos, r, data) {
        let vertexData = new BABYLON.VertexData();
        let vertices = new Array();
        let positions = new Array();
        let indices = new Array();
        let uvs = new Array();
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
                    vertices[1].multiplyInPlace(MeshTools.FloatVector(r));
                    vertices[2].multiplyInPlace(MeshTools.FloatVector(r));
                    vertices[3].multiplyInPlace(MeshTools.FloatVector(r));
                    vertices[0].multiplyInPlace(MeshTools.FloatVector(r));
                    MeshTools.PushQuad(vertices, 0, 1, 3, 2, positions, indices);
                    MeshTools.PushWaterUvs(uvs);
                }
            }
        }
        let normals = new Array();
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
                return pickInfo.pickedPoint.add(pickInfo.getNormal(true, false).multiply(MeshTools.FloatVector(offset)));
            }
        }
        return undefined;
    }
    static OnClick(planet) {
        let removeMode = PlanetEditor.data === 0;
        let worldPos = PlanetEditor.GetHitWorldPos(removeMode);
        console.log("WorldPos : " + worldPos);
        if (worldPos) {
            if (PlanetEditor.data === 0 || worldPos.subtract(Player.Instance.PositionHead()).lengthSquared() > 1) {
                if (PlanetEditor.data === 0 || worldPos.subtract(Player.Instance.PositionLeg()).lengthSquared() > 1) {
                    let planetSide = PlanetTools.WorldPositionToPlanetSide(planet, worldPos);
                    console.log("PlanetSide : " + Side[planetSide.GetSide()]);
                    if (planetSide) {
                        let global = PlanetTools.WorldPositionToGlobalIJK(planetSide, worldPos);
                        console.log("Globals : " + JSON.stringify(global));
                        let local = PlanetTools.GlobalIJKToLocalIJK(planetSide, global);
                        console.log("Chunck : " + JSON.stringify(local.planetChunck.Position()));
                        console.log("Block : I=" + local.i + " , J=" + local.j + " , K=" + local.k);
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
            if ((event.sourceEvent.keyCode === 48) || (event.sourceEvent.keyCode === 88)) {
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
        $(".inventory-item").attr("disabled", true);
        if (PlanetEditor.data === 0) {
            $("#remove").attr("disabled", false);
        }
        if (PlanetEditor.data === 129) {
            $("#grass").attr("disabled", false);
        }
        if (PlanetEditor.data === 130) {
            $("#dirt").attr("disabled", false);
        }
        if (PlanetEditor.data === 131) {
            $("#sand").attr("disabled", false);
        }
        if (PlanetEditor.data === 132) {
            $("#rock").attr("disabled", false);
        }
        if (PlanetEditor.data === 133) {
            $("#trunc").attr("disabled", false);
        }
        if (PlanetEditor.data === 134) {
            $("#leaf").attr("disabled", false);
        }
        if (PlanetEditor.data === 135) {
            $("#snow").attr("disabled", false);
        }
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
        this.side = side;
        this.rotationQuaternion = PlanetTools.QuaternionForSide(this.side);
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
    GetSide() {
        return this.side;
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
            return BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), 3 * Math.PI / 2.0);
        }
        else if (side === Side.Back) {
            return BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), Math.PI / 2.0);
        }
        else if (side === Side.Top) {
            return BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), Math.PI / 2.0);
        }
        else if (side === Side.Bottom) {
            return BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), 3 * Math.PI / 2.0);
        }
    }
    static EvaluateVertex(size, i, j) {
        let xRad = 45.0;
        let yRad = -45.0 + 90.0 * (j / size);
        let zRad = -45.0 + 90.0 * (i / size);
        xRad = xRad / 180.0 * Math.PI;
        yRad = yRad / 180.0 * Math.PI;
        zRad = zRad / 180.0 * Math.PI;
        return new BABYLON.Vector3(Math.sin(xRad) / Math.cos(xRad), Math.sin(yRad) / Math.cos(yRad), Math.sin(zRad) / Math.cos(zRad)).normalize();
    }
    static RandomData() {
        let data = new Array();
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = new Array();
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = new Array();
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
            console.log("Invalid HexString. Length is =" + hexString.length +
                ". Expected length is = " + (PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * 2) + ".");
            return null;
        }
        let data = new Array();
        for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = new Array();
            for (let j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = new Array();
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
        let angles = new Array();
        angles[Side.Back] = MeshTools.Angle(BABYLON.Axis.Z.multiply(MeshTools.FloatVector(-1)), worldPos);
        angles[Side.Right] = MeshTools.Angle(BABYLON.Axis.X, worldPos);
        angles[Side.Left] = MeshTools.Angle(BABYLON.Axis.X.multiply(MeshTools.FloatVector(-1)), worldPos);
        angles[Side.Top] = MeshTools.Angle(BABYLON.Axis.Y, worldPos);
        angles[Side.Bottom] = MeshTools.Angle(BABYLON.Axis.Y.multiply(MeshTools.FloatVector(-1)), worldPos);
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
            localPos = localPos.divide(MeshTools.FloatVector(localPos.x));
        }
        if (Math.abs(localPos.y) > 1) {
            localPos = localPos.divide(MeshTools.FloatVector(localPos.y));
        }
        if (Math.abs(localPos.z) > 1) {
            localPos = localPos.divide(MeshTools.FloatVector(localPos.z));
        }
        let yDeg = Math.atan(localPos.y) / Math.PI * 180;
        let zDeg = Math.atan(localPos.z) / Math.PI * 180;
        console.log("YDeg : " + yDeg);
        console.log("ZDeg : " + zDeg);
        let k = Math.floor(r);
        let i = Math.floor((zDeg + 45) / 90 * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));
        let j = Math.floor((yDeg + 45) / 90 * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));
        return { i: i, j: j, k: k };
    }
    static GlobalIJKToLocalIJK(planetSide, global) {
        return {
            planetChunck: planetSide.GetChunck(Math.floor(global.i / PlanetTools.CHUNCKSIZE), Math.floor(global.j / PlanetTools.CHUNCKSIZE), Math.floor(global.k / PlanetTools.CHUNCKSIZE)),
            i: global.i % PlanetTools.CHUNCKSIZE,
            j: global.j % PlanetTools.CHUNCKSIZE,
            k: global.k % PlanetTools.CHUNCKSIZE
        };
    }
    static KGlobalToDegree(k) {
        return PlanetTools.KPosToDegree(Math.floor(k / PlanetTools.CHUNCKSIZE));
    }
    static KPosToDegree(kPos) {
        return PlanetTools.KPosToDegree32(kPos);
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
PlanetTools.CHUNCKSIZE = 32;
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
        this.speed = 5;
        this.underWater = false;
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
    }
    static Position() {
        return Player.Instance.position;
    }
    PositionLeg() {
        let posLeg = this.position.add(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix()).multiply(MeshTools.FloatVector(-1)));
        return posLeg;
    }
    PositionHead() {
        return this.position;
    }
    RegisterControl() {
        let scene = Game.Scene;
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (event) => {
            if ((event.sourceEvent.key === "z") || (event.sourceEvent.key === "w")) {
                this.pForward = true;
            }
            if (event.sourceEvent.key === "s") {
                this.back = true;
            }
            if ((event.sourceEvent.key === "q") || (event.sourceEvent.key === "a")) {
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
            if ((event.sourceEvent.key === "z") || (event.sourceEvent.key === "w")) {
                this.pForward = false;
            }
            if (event.sourceEvent.key === "s") {
                this.back = false;
            }
            if ((event.sourceEvent.key === "q") || (event.sourceEvent.key === "a")) {
                this.left = false;
            }
            if (event.sourceEvent.key === "d") {
                this.pRight = false;
            }
            if (event.sourceEvent.keyCode === 32) {
                this.fly = false;
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
    static WaterFilter() {
        if (Player.Instance) {
            if (Player.Instance.position.lengthSquared() < Player.Instance.planet.GetTotalRadiusWaterSquared()) {
                Game.Light.diffuse = new BABYLON.Color3(0.5, 0.5, 1);
                Player.Instance.underWater = true;
            }
            else {
                Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
                Player.Instance.underWater = false;
            }
        }
    }
    static GetMovin() {
        let deltaTime = Game.Engine.getDeltaTime();
        $("#delta-time").text(deltaTime.toPrecision(2) + "");
        if (!Player.Instance) {
            return;
        }
        if (Player.Instance.pForward) {
            if (Player.CanGoSide(BABYLON.Axis.Z)) {
                let localZ = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Z, Player.Instance.getWorldMatrix());
                Player.Instance.position.addInPlace(localZ.multiply(MeshTools.FloatVector(deltaTime / 1000 * Player.Instance.speed)));
            }
        }
        if (Player.Instance.back) {
            if (Player.CanGoSide(BABYLON.Axis.Z.multiply(MeshTools.FloatVector(-1)))) {
                let localZ = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Z, Player.Instance.getWorldMatrix());
                Player.Instance.position.addInPlace(localZ.multiply(MeshTools.FloatVector(-deltaTime / 1000 * Player.Instance.speed)));
            }
        }
        if (Player.Instance.pRight) {
            if (Player.CanGoSide(BABYLON.Axis.X)) {
                let localX = BABYLON.Vector3.TransformNormal(BABYLON.Axis.X, Player.Instance.getWorldMatrix());
                Player.Instance.position.addInPlace(localX.multiply(MeshTools.FloatVector(deltaTime / 1000 * Player.Instance.speed)));
            }
        }
        if (Player.Instance.left) {
            if (Player.CanGoSide(BABYLON.Axis.X.multiply(MeshTools.FloatVector(-1)))) {
                let localX = BABYLON.Vector3.TransformNormal(BABYLON.Axis.X, Player.Instance.getWorldMatrix());
                Player.Instance.position.addInPlace(localX.multiply(MeshTools.FloatVector(-deltaTime / 1000 * Player.Instance.speed)));
            }
        }
    }
    static StillStanding() {
        if (!Player.Instance) {
            return;
        }
        let currentUp = BABYLON.Vector3.Normalize(BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, Player.Instance.getWorldMatrix()));
        let targetUp = BABYLON.Vector3.Normalize(Player.Instance.position);
        let correctionAxis = BABYLON.Vector3.Cross(currentUp, targetUp);
        let correctionAngle = Math.abs(Math.asin(correctionAxis.length()));
        if (Player.Instance.fly) {
            if (Player.CanGoUp()) {
                Player.Instance.position.addInPlace(targetUp.multiply(MeshTools.FloatVector(0.05)));
            }
        }
        else {
            let gravity = Player.DownRayCast();
            if (gravity !== 0) {
                let gravityFactor = 0.1;
                if (Player.Instance.underWater) {
                    gravityFactor = 0.02;
                }
                Player.Instance.position.addInPlace(targetUp.multiply(MeshTools.FloatVector(gravity * gravityFactor)));
            }
        }
        if (correctionAngle > 0.001) {
            let rotation = BABYLON.Quaternion.RotationAxis(correctionAxis, correctionAngle / 5);
            Player.Instance.rotationQuaternion = rotation.multiply(Player.Instance.rotationQuaternion);
        }
    }
    static DownRayCast() {
        let pos = Player.Instance.position;
        let dir = BABYLON.Vector3.Normalize(BABYLON.Vector3.Zero().subtract(Player.Instance.position));
        let ray = new BABYLON.Ray(pos, dir, 1.6);
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
