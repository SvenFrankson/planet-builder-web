class PlanetChunckMeshBuilder {

    private static cachedVertices: BABYLON.Vector3[][][];
    private static tmpVertices: BABYLON.Vector3[];

    private static _BlockColor: Map<number, BABYLON.Color3>;
    public static get BlockColor(): Map<number, BABYLON.Color3> {
        if (!PlanetChunckMeshBuilder._BlockColor) {
            PlanetChunckMeshBuilder._BlockColor = new Map<number, BABYLON.Color3>();
            PlanetChunckMeshBuilder._BlockColor.set(BlockType.Grass, BABYLON.Color3.FromHexString("#50723C"));
            PlanetChunckMeshBuilder._BlockColor.set(BlockType.Dirt, BABYLON.Color3.FromHexString("#462521"));
            PlanetChunckMeshBuilder._BlockColor.set(BlockType.Sand, BABYLON.Color3.FromHexString("#F5B700"));
            PlanetChunckMeshBuilder._BlockColor.set(BlockType.Rock, BABYLON.Color3.FromHexString("#9DB5B2"));
            PlanetChunckMeshBuilder._BlockColor.set(BlockType.Wood, BABYLON.Color3.FromHexString("#965106"));
            PlanetChunckMeshBuilder._BlockColor.set(BlockType.Leaf, BABYLON.Color3.FromHexString("#27a800"));
        }
        return PlanetChunckMeshBuilder._BlockColor;
    }

    private static GetVertex(
        size: number,
        i: number,
        j: number
    ): BABYLON.Vector3 {
        let out: BABYLON.Vector3 = BABYLON.Vector3.Zero();
        return PlanetChunckMeshBuilder.GetVertexToRef(size, i, j, out);
    }

    private static GetVertexToRef(
        size: number,
        i: number,
        j: number,
        out: BABYLON.Vector3
    ): BABYLON.Vector3 {
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

    private static _tmpBlockCenter: BABYLON.Vector3 = BABYLON.Vector3.Zero();
    public static BuildBlockVertexData(
        size: number,
        iGlobal: number,
        jGlobal: number,
        hGlobal: number,
        data: number,
        scale: number = 1
    ): BABYLON.VertexData {
        let vertexData: BABYLON.VertexData = new BABYLON.VertexData();

        if (!PlanetChunckMeshBuilder.tmpVertices) {
            PlanetChunckMeshBuilder.tmpVertices = [];
            for (let i: number = 0; i < 8; i++) {
                PlanetChunckMeshBuilder.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        else {
            for (let i: number = 0; i < 8; i++) {
                PlanetChunckMeshBuilder.tmpVertices[i].copyFromFloats(0, 0, 0);
            }
        }

        let positions: number[] = [];
        let indices: number[] = [];
        let uvs: number[] = [];
        let colors: number[] = [];

        PlanetChunckMeshBuilder.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal) + 1, PlanetChunckMeshBuilder.tmpVertices[0]);
        PlanetChunckMeshBuilder.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal + 1) + 1, PlanetChunckMeshBuilder.tmpVertices[1]);
        PlanetChunckMeshBuilder.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal) + 1, PlanetChunckMeshBuilder.tmpVertices[2]);
        PlanetChunckMeshBuilder.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal + 1) + 1, PlanetChunckMeshBuilder.tmpVertices[3]);

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

        let normals: number[] = [];
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.uvs = uvs;
        vertexData.colors = colors;
        
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;

        return vertexData;
    }

    public static BuildVertexData(
        size: number,
        iPos: number,
        jPos: number,
        kPos: number,
        data: number[][][]
    ): BABYLON.VertexData {
        let vertexData: BABYLON.VertexData = new BABYLON.VertexData();

        if (!PlanetChunckMeshBuilder.tmpVertices) {
            PlanetChunckMeshBuilder.tmpVertices = [];
            for (let i: number = 0; i < 8; i++) {
                PlanetChunckMeshBuilder.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        else {
            for (let i: number = 0; i < 8; i++) {
                PlanetChunckMeshBuilder.tmpVertices[i].copyFromFloats(0, 0, 0);
            }
        }

        let positions: number[] = [];
        let indices: number[] = [];
        let uvs: number[] = [];
        let colors: number[] = [];

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    if (data[i][j][k] !== 0) {
                        let y: number = i + iPos * PlanetTools.CHUNCKSIZE;
                        let z: number = j + jPos * PlanetTools.CHUNCKSIZE;
                        PlanetChunckMeshBuilder.GetVertexToRef(size, y, z, PlanetChunckMeshBuilder.tmpVertices[0]);
                        PlanetChunckMeshBuilder.GetVertexToRef(size, y, z + 1, PlanetChunckMeshBuilder.tmpVertices[1]);
                        PlanetChunckMeshBuilder.GetVertexToRef(size, y + 1, z, PlanetChunckMeshBuilder.tmpVertices[2]);
                        PlanetChunckMeshBuilder.GetVertexToRef(size, y + 1, z + 1, PlanetChunckMeshBuilder.tmpVertices[3]);

                        let hGlobal = (k + kPos * PlanetTools.CHUNCKSIZE + 1);
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

        let normals: number[] = [];
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.uvs = uvs;
        vertexData.colors = colors;
        
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;

        return vertexData;
    }

    
    public static BuildVertexData_V2(
        chunck: PlanetChunck,
        iPos: number,
        jPos: number,
        kPos: number
    ): BABYLON.VertexData {
        let size = chunck.GetSize();
        let vertexData: BABYLON.VertexData = new BABYLON.VertexData();

        if (!PlanetChunckMeshBuilder.tmpVertices) {
            PlanetChunckMeshBuilder.tmpVertices = [];
            for (let i: number = 0; i < 8; i++) {
                PlanetChunckMeshBuilder.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        else {
            for (let i: number = 0; i < 8; i++) {
                PlanetChunckMeshBuilder.tmpVertices[i].copyFromFloats(0, 0, 0);
            }
        }
        
        let positions: number[] = [];
        let indices: number[] = [];
        let uvs: number[] = [];
        let normals: number[] = [];
        let colors: number[] = [];

        let colors3 = [BABYLON.Color3.Red(), BABYLON.Color3.Green(), BABYLON.Color3.Blue(), BABYLON.Color3.Magenta(), BABYLON.Color3.Yellow(), BABYLON.Color3.White()];

        let v0 = PlanetChunckMeshBuilder.tmpVertices[0];
        let v1 = PlanetChunckMeshBuilder.tmpVertices[1];
        let v2 = PlanetChunckMeshBuilder.tmpVertices[2];
        let v3 = PlanetChunckMeshBuilder.tmpVertices[3];
        let v4 = PlanetChunckMeshBuilder.tmpVertices[4];
        let v5 = PlanetChunckMeshBuilder.tmpVertices[5];
        let v6 = PlanetChunckMeshBuilder.tmpVertices[6];
        let v7 = PlanetChunckMeshBuilder.tmpVertices[7];

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    
                    let c0 = chunck.GetData(i, j, k);
                    let c1 = chunck.GetData(i + 1, j, k);
                    let c2 = chunck.GetData(i + 1, j + 1, k);
                    let c3 = chunck.GetData(i, j + 1, k);
                    let c4 = chunck.GetData(i, j, k + 1);
                    let c5 = chunck.GetData(i + 1, j, k + 1);
                    let c6 = chunck.GetData(i + 1, j + 1, k + 1);
                    let c7 = chunck.GetData(i, j + 1, k + 1);
                    let ref = (c0 ? "1" : "0") + (c1 ? "1" : "0") + (c2 ? "1" : "0") + (c3 ? "1" : "0") + (c4 ? "1" : "0") + (c5 ? "1" : "0") + (c6 ? "1" : "0") + (c7 ? "1" : "0");

                    if (ref === "00000000" || ref === "11111111") {
                        continue;
                    }
                    
                    let vertexData = PlanetChunckVertexData.Get(ref);

                    let iGlobal: number = i + iPos * PlanetTools.CHUNCKSIZE;
                    let jGlobal: number = j + jPos * PlanetTools.CHUNCKSIZE;
                    PlanetChunckMeshBuilder.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal) + 1, PlanetChunckMeshBuilder.tmpVertices[0]);
                    PlanetChunckMeshBuilder.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal + 1) + 1, PlanetChunckMeshBuilder.tmpVertices[1]);
                    PlanetChunckMeshBuilder.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal) + 1, PlanetChunckMeshBuilder.tmpVertices[2]);
                    PlanetChunckMeshBuilder.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal + 1) + 1, PlanetChunckMeshBuilder.tmpVertices[3]);

                    let hGlobal = (k + kPos * PlanetTools.CHUNCKSIZE + 1);
                    let hLow = PlanetTools.KGlobalToAltitude(hGlobal) * 0.5 + PlanetTools.KGlobalToAltitude(hGlobal + 1) * 0.5;
                    let hHigh = PlanetTools.KGlobalToAltitude(hGlobal + 1) * 0.5 + PlanetTools.KGlobalToAltitude(hGlobal + 2) * 0.5;

                    PlanetChunckMeshBuilder.tmpVertices[0].scaleToRef(hHigh, PlanetChunckMeshBuilder.tmpVertices[4]);
                    PlanetChunckMeshBuilder.tmpVertices[1].scaleToRef(hHigh, PlanetChunckMeshBuilder.tmpVertices[5]);
                    PlanetChunckMeshBuilder.tmpVertices[2].scaleToRef(hHigh, PlanetChunckMeshBuilder.tmpVertices[6]);
                    PlanetChunckMeshBuilder.tmpVertices[3].scaleToRef(hHigh, PlanetChunckMeshBuilder.tmpVertices[7]);

                    PlanetChunckMeshBuilder.tmpVertices[0].scaleInPlace(hLow);
                    PlanetChunckMeshBuilder.tmpVertices[1].scaleInPlace(hLow);
                    PlanetChunckMeshBuilder.tmpVertices[2].scaleInPlace(hLow);
                    PlanetChunckMeshBuilder.tmpVertices[3].scaleInPlace(hLow);
                    
                    let c = PlanetChunckMeshBuilder.BlockColor.get(chunck.GetData(i, j, k));
                    if (!c) {
                        c = PlanetChunckMeshBuilder.BlockColor.get(136);
                    }

                    let l = positions.length / 3;
                    for (let n = 0; n < vertexData.positions.length / 3; n++) {
                        let x = vertexData.positions[3 * n];
                        let y = vertexData.positions[3 * n + 1];
                        let z = vertexData.positions[3 * n + 2];
                        
                        let v02 = v2.subtract(v0).scaleInPlace(x).addInPlace(v0);
                        let v13 = v3.subtract(v1).scaleInPlace(x).addInPlace(v1);
                        let v46 = v6.subtract(v4).scaleInPlace(x).addInPlace(v4);
                        let v57 = v7.subtract(v5).scaleInPlace(x).addInPlace(v5);

                        let v0213 = v13.subtract(v02).scaleInPlace(z).addInPlace(v02);
                        let v4657 = v57.subtract(v46).scaleInPlace(z).addInPlace(v46);

                        let v = v4657.subtract(v0213).scaleInPlace(y).addInPlace(v0213);
                        
                        positions.push(v.x);
                        positions.push(v.y);
                        positions.push(v.z);
                        
                        colors.push(...colors3[chunck.side].asArray(), 1);
                    }
                    normals.push(...vertexData.normals);
                    for (let n = 0; n < vertexData.indices.length; n++) {
                        indices.push(vertexData.indices[n] + l);
                    }
                }
            }
        }

        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.uvs = uvs;
        vertexData.colors = colors;
        vertexData.normals = normals;

        return vertexData;
    }

    public static BuildWaterVertexData(
        size: number,
        iPos: number,
        jPos: number,
        kPos: number,
        rWater: number
    ): BABYLON.VertexData {
        let vertexData: BABYLON.VertexData = new BABYLON.VertexData();
        let vertices: BABYLON.Vector3[] = [];
        let positions: number[] = [];
        let indices: number[] = [];
        let uvs: number[] = [];

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                let y: number = i + iPos * PlanetTools.CHUNCKSIZE;
                let z: number = j + jPos * PlanetTools.CHUNCKSIZE;
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

        let normals: number[] = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;

        return vertexData;
    }

    public static BuildBedrockVertexData(
        size: number,
        iPos: number,
        jPos: number,
        kPos: number,
        r: number,
        data: number[][][]
    ): BABYLON.VertexData {
        let vertexData: BABYLON.VertexData = new BABYLON.VertexData();
        let vertices: BABYLON.Vector3[] = [];
        let positions: number[] = [];
        let indices: number[] = [];
        let uvs: number[] = [];

        if (kPos === 0) {
            for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
                for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                    let y: number = i + iPos * PlanetTools.CHUNCKSIZE;
                    let z: number = j + jPos * PlanetTools.CHUNCKSIZE;
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

        let normals: number[] = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;

        return vertexData;
    }
}
