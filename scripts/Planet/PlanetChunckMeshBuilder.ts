class PlanetChunckMeshBuilder {

    private static cachedVertices: BABYLON.Vector3[][][];
    private static tmpVertices: BABYLON.Vector3[];
    private static tmpQuaternions: BABYLON.Quaternion[];

    private static _BlockColor: Map<number, BABYLON.Color3>;
    public static get BlockColor(): Map<number, BABYLON.Color3> {
        if (!PCMB._BlockColor) {
            PCMB._BlockColor = new Map<number, BABYLON.Color3>();
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

    private static Corners: BABYLON.Vector3[] = [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(1, 0, 0),
        new BABYLON.Vector3(1, 0, 1),
        new BABYLON.Vector3(0, 0, 1),
        new BABYLON.Vector3(0, 1, 0),
        new BABYLON.Vector3(1, 1, 0),
        new BABYLON.Vector3(1, 1, 1),
        new BABYLON.Vector3(0, 1, 1),
    ];

    private static GetVertex(
        size: number,
        i: number,
        j: number
    ): BABYLON.Vector3 {
        let out: BABYLON.Vector3 = BABYLON.Vector3.Zero();
        return PCMB.GetVertexToRef(size, i, j, out);
    }

    private static GetVertexToRef(
        size: number,
        i: number,
        j: number,
        out: BABYLON.Vector3
    ): BABYLON.Vector3 {
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

        if (!PCMB.tmpVertices) {
            PCMB.tmpVertices = [];
            for (let i: number = 0; i < 8; i++) {
                PCMB.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        else {
            for (let i: number = 0; i < 8; i++) {
                PCMB.tmpVertices[i].copyFromFloats(0, 0, 0);
            }
        }

        let positions: number[] = [];
        let indices: number[] = [];
        let uvs: number[] = [];
        let colors: number[] = [];

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

        let normals: number[] = [];
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.uvs = uvs;
        vertexData.colors = colors;
        
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;

        return vertexData;
    }

    private static ManhattanLength(x: number, y: number, z: number): number {
        return x + y + z;
    }

    private static SquaredLength(x: number, y: number, z: number): number {
        return x * x + y * y + z * z;
    }
    
    private static Length(x: number, y: number, z: number): number {
        return Math.sqrt(PCMB.SquaredLength(x, y, z));
    }
    
    private static DistanceSquared(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): number {
        let x = x1 - x0;
        let y = y1 - y0;
        let z = z1 - z0;
        return x * x + y * y + z * z;
    }

    private static Distance(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): number {
        return Math.sqrt(PCMB.DistanceSquared(x0, y0, z0, x1, y1, z1));
    }

    public static BuildVertexData(
        chunck: PlanetChunck,
        iPos: number,
        jPos: number,
        kPos: number
    ): BABYLON.VertexData[] {
        let lod = chunck.lod;
        lod = 1;
        let size = chunck.size;
        let vertexData: BABYLON.VertexData = new BABYLON.VertexData();

        if (!PCMB.tmpVertices || PCMB.tmpVertices.length < 15) {
            PCMB.tmpVertices = [];
            for (let i: number = 0; i < 30; i++) {
                PCMB.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        if (!PCMB.tmpQuaternions || PCMB.tmpQuaternions.length < 1) {
            PCMB.tmpQuaternions = [];
            for (let i: number = 0; i < 30; i++) {
                PCMB.tmpQuaternions[i] = BABYLON.Quaternion.Identity();
            }
        }
        
        let positions: number[] = [];
        let indices: number[] = [];
        let uvs: number[] = [];
        let normals: number[] = [];
        let colors: number[] = [];
        
        let waterPositions: number[] = [];
        let waterIndices: number[] = [];
        let waterUvs: number[] = [];
        let waterNormals: number[] = [];
        let waterColors: number[] = [];

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

        for (let i: number = chunck.firstI; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j: number = chunck.firstJ; j < chunck.lastJ; j++) {
                for (let k: number = chunck.firstK; k < PlanetTools.CHUNCKSIZE; k++) {
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
                        if (d > BlockType.Water) {
                            if (chunck.GetData(i, j, k + 1) === BlockType.None) {
                                let iGlobal: number = i + iPos * PlanetTools.CHUNCKSIZE;
                                let jGlobal: number = j + jPos * PlanetTools.CHUNCKSIZE;
                                PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[0]);
                                PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[1]);
                                PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[2]);
                                PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[3]);
            
                                let hGlobal = (k + kPos * PlanetTools.CHUNCKSIZE);
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
                        if (d0 > BlockType.Water) {
                            ref |= 0b1 << 0;
                        }
                        let d4 = chunck.GetData(i, j, k + 1);
                        if (d4 > BlockType.Water) {
                            ref |= 0b1 << 4;
                        }
                        // Solid case
                        let d1 = chunck.GetData(i + 1, j, k);
                        if (d1 > BlockType.Water) {
                            ref |= 0b1 << 1;
                        }
                        let d2 = chunck.GetData(i + 1, j + 1, k);
                        if (d2 > BlockType.Water) {
                            ref |= 0b1 << 2;
                        }
                        let d3 = chunck.GetData(i, j + 1, k);
                        if (d3 > BlockType.Water) {
                            ref |= 0b1 << 3;
                        }
                        let d5 = chunck.GetData(i + 1, j, k + 1);
                        if (d5 > BlockType.Water) {
                            ref |= 0b1 << 5;
                        }
                        let d6 = chunck.GetData(i + 1, j + 1, k + 1);
                        if (d6 > BlockType.Water) {
                            ref |= 0b1 << 6;
                        }
                        let d7 = chunck.GetData(i, j + 1, k + 1);
                        if (d7 > BlockType.Water) {
                            ref |= 0b1 << 7;
                        }

                        // Water case
                        if (d0 === BlockType.Water && d4 === BlockType.None || d1 === BlockType.Water && d5 === BlockType.None || d2 === BlockType.Water && d6 === BlockType.None || d3 === BlockType.Water && d7 === BlockType.None) {
                            let iGlobal: number = i + iPos * PlanetTools.CHUNCKSIZE;
                            let jGlobal: number = j + jPos * PlanetTools.CHUNCKSIZE;
                            let hGlobal = (k + kPos * PlanetTools.CHUNCKSIZE);
                            let altitude = PlanetTools.KGlobalToAltitude(hGlobal) * 0.5 + PlanetTools.KGlobalToAltitude(hGlobal + 1) * 0.5;

                            PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[0]);
                            PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[1]);
                            PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[2]);
                            PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[3]);

                            PCMB.tmpVertices[0].scaleInPlace(altitude);
                            PCMB.tmpVertices[1].scaleInPlace(altitude);
                            PCMB.tmpVertices[2].scaleInPlace(altitude);
                            PCMB.tmpVertices[3].scaleInPlace(altitude);

                            let vertices = [PCMB.tmpVertices[0], PCMB.tmpVertices[1], PCMB.tmpVertices[2], PCMB.tmpVertices[3]]

                            MeshTools.PushQuad(vertices, 0, 1, 3, 2, waterPositions, waterIndices);
                            MeshTools.PushWaterUvs(waterUvs);

                            MeshTools.PushQuad(vertices, 0, 2, 3, 1, waterPositions, waterIndices);
                            MeshTools.PushWaterUvs(waterUvs);
                        }

                        let blocks = [d0, d1, d2, d3, d4, d5, d6, d7];
    
                        if (ref === 0b0 || ref === 0b11111111) {
                            continue;
                        }
                        //if (d4 > BlockType.Water && d5 > BlockType.Water && d6 > BlockType.Water && d7 > BlockType.Water) {
                        //    continue;
                        //}
                        
                        let extendedpartVertexData = PlanetChunckVertexData.Get(lod, ref);
                        let partVertexData = extendedpartVertexData.vertexData;
    
                        let iGlobal: number = i + iPos * PlanetTools.CHUNCKSIZE;
                        let jGlobal: number = j + jPos * PlanetTools.CHUNCKSIZE;
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

        let waterVertexData: BABYLON.VertexData;
        if (waterPositions.length > 0) {
            waterVertexData = new BABYLON.VertexData();
            waterVertexData.positions = waterPositions;
            waterVertexData.indices = waterIndices;
            waterVertexData.uvs = waterUvs;
            BABYLON.VertexData.ComputeNormals(waterPositions, waterIndices, waterNormals);
            waterVertexData.normals = waterNormals;
        }

        return [vertexData, waterVertexData];
    }

    public static BuildSeaLevelVertexData(
        chunck: AbstractPlanetChunck
    ): BABYLON.VertexData {
        let vertexData = new BABYLON.VertexData();
        let positions: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];
        let uvs: number[] = [];

        let levelCoef = 1;
        if (chunck instanceof PlanetChunckGroup) {
            levelCoef = Math.pow(2, chunck.level);
        }

        let vertexCount: number = 16;
        let f = Math.pow(2, chunck.planet.degree - chunck.degree);
        for (let i = 0; i <= vertexCount; i++) {
            for (let j = 0; j <= vertexCount; j++) {
                let l = positions.length / 3;
                let i0 = PlanetTools.CHUNCKSIZE * (chunck.iPos + i / vertexCount) * levelCoef;
                let j0 = PlanetTools.CHUNCKSIZE * (chunck.jPos + j / vertexCount) * levelCoef;
                
                let h00 = Math.floor(chunck.planet.generator.altitudeMap.getForSide(chunck.side, i0 * f, j0 * f) * chunck.kPosMax * PlanetTools.CHUNCKSIZE);
                let p00 = PlanetTools.EvaluateVertex(chunck.size, i0, j0).scaleInPlace(PlanetTools.KGlobalToAltitude(h00));
                positions.push(p00.x, p00.y, p00.z);
                p00.normalize();
                normals.push(p00.x, p00.y, p00.z);
                uvs.push(i0 / chunck.size);
                uvs.push(j0 / chunck.size);

                if (i < vertexCount && j < vertexCount) {
                    indices.push(l, l + 1 + (vertexCount + 1), l + 1);
                    indices.push(l, l + (vertexCount + 1), l + 1 + (vertexCount + 1));
                }
            }
        }

        //MeshTools.PushQuad([p00, p01, p11, p10], 3, 2, 1, 0, positions, indices);

        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;

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

        let normals: number[] = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;

        return vertexData;
    }
    

    public static BuildVertexData_Cubic(
        size: number,
        iPos: number,
        jPos: number,
        kPos: number,
        data: number[][][]
    ): BABYLON.VertexData {
        let vertexData: BABYLON.VertexData = new BABYLON.VertexData();

        if (!PCMB.tmpVertices) {
            PCMB.tmpVertices = [];
            for (let i: number = 0; i < 8; i++) {
                PCMB.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        else {
            for (let i: number = 0; i < 8; i++) {
                PCMB.tmpVertices[i].copyFromFloats(0, 0, 0);
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

        let normals: number[] = [];
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.uvs = uvs;
        vertexData.colors = colors;
        
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.normals = normals;

        return vertexData;
    }
}

var PCMB = PlanetChunckMeshBuilder;