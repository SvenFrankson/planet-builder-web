class PlanetChunckMeshBuilder {

    private static cachedVertices: BABYLON.Vector3[][][];
    private static tmpVertices: BABYLON.Vector3[];
    private static tmpQuaternions: BABYLON.Quaternion[];
    private static unstretchedPositionNull = { x: NaN, y: NaN, z: NaN, index: - 1 };

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
        
        let unstretchedPositionsX: { x: number, y: number, z: number, index: number }[] = [];
        let unstretchedPositionsY: { x: number, y: number, z: number, index: number }[] = [];
        let unstretchedPositionsZ: { x: number, y: number, z: number, index: number }[] = [];
        let positions: number[] = [];
        let indices: number[] = [];
        let trianglesData: number[] = [];
        let uvs: number[] = [];
        let uvs2: number[] = [];
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
        let vertex = PCMB.tmpVertices[14];
        
        let chunckDir = PCMB.tmpVertices[15];
        PCMB.GetVertexToRef(size, iPos * PlanetTools.CHUNCKSIZE, jPos * PlanetTools.CHUNCKSIZE, PCMB.tmpVertices[0]);
        PCMB.GetVertexToRef(size, (iPos + 1) * PlanetTools.CHUNCKSIZE, (jPos + 1) * PlanetTools.CHUNCKSIZE, PCMB.tmpVertices[1]);
        chunckDir.copyFrom(PCMB.tmpVertices[1]).subtractInPlace(PCMB.tmpVertices[0]).normalize();
        BABYLON.Vector3.TransformNormalToRef(chunckDir, chunck.planetSide.getWorldMatrix(), chunckDir);

        let uL = 1 / (PlanetTools.CHUNCKSIZE - chunck.firstI);
        let vL = 1 / (PlanetTools.CHUNCKSIZE - chunck.firstJ);
        let wL = 1 / (PlanetTools.CHUNCKSIZE - chunck.firstK);

        for (let i: number = chunck.firstI; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j: number = chunck.firstJ; j < chunck.lastJ; j++) {
                for (let k: number = chunck.firstK; k < PlanetTools.CHUNCKSIZE; k++) {
                    let u = (i - chunck.firstI) / (PlanetTools.CHUNCKSIZE - chunck.firstI);
                    let v = (j - chunck.firstJ) / (PlanetTools.CHUNCKSIZE - chunck.firstJ);
                    let w = (k - chunck.firstK) / (PlanetTools.CHUNCKSIZE - chunck.firstK);
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
                            if (chunck.GetData(i, j, k + 1) <= BlockType.Water) {
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
                                uvs2.push(0, 0, 0, 0, 0, 0);
                                
                                trianglesData.push(d);
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

                        let iGlobal: number = i + iPos * PlanetTools.CHUNCKSIZE;
                        let jGlobal: number = j + jPos * PlanetTools.CHUNCKSIZE;
                        let kGlobal = (k + kPos * PlanetTools.CHUNCKSIZE);

                        // Water case
                        if (d0 === BlockType.Water && d4 === BlockType.None || d1 === BlockType.Water && d5 === BlockType.None || d2 === BlockType.Water && d6 === BlockType.None || d3 === BlockType.Water && d7 === BlockType.None) {
                            let altitude = PlanetTools.KGlobalToAltitude(kGlobal) * 0.5 + PlanetTools.KGlobalToAltitude(kGlobal + 1) * 0.5;

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
    
                        if (ref === 0b0 || ref === 0b11111111) {
                            continue;
                        }
                        //if (d4 > BlockType.Water && d5 > BlockType.Water && d6 > BlockType.Water && d7 > BlockType.Water) {
                        //    continue;
                        //}
                        let dAsArray = [d0, d1, d2, d3, d4 ,d5, d6, d7];
                        
                        let extendedpartVertexData = PlanetChunckVertexData.Get(lod + Config.performanceConfiguration.lodMin, ref);
                        if (!extendedpartVertexData) {
                            console.log("fail " + lod + " " + Config.performanceConfiguration.lodMin);
                            continue;
                        }
                        let partVertexData = extendedpartVertexData.vertexData;
    
                        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[0]);
                        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal) + 1, PCMB.tmpVertices[1]);
                        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[2]);
                        PCMB.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal + 1) + 1, PCMB.tmpVertices[3]);

                        /*
                        for (let i = 0; i < 4; i++) {
                            blockCenter.copyFrom(PCMB.tmpVertices[i]).addInPlace(PCMB.tmpVertices[2]).scaleInPlace(0.5);
                            let angle = VMath.Angle(BABYLON.Axis.Y, blockCenter);
                            BABYLON.Vector3.CrossToRef(BABYLON.Axis.Y, blockCenter, blockAxis);
                            BABYLON.Quaternion.RotationAxisToRef(blockAxis, angle, blockQuaternions[i]);
                        }
                        */
    
                        let altLow = PlanetTools.KGlobalToAltitude(kGlobal) * 0.5 + PlanetTools.KGlobalToAltitude(kGlobal + 1) * 0.5;
                        let altHigh = PlanetTools.KGlobalToAltitude(kGlobal + 1) * 0.5 + PlanetTools.KGlobalToAltitude(kGlobal + 2) * 0.5;
    
                        PCMB.tmpVertices[0].scaleToRef(altHigh/* + Math.sin(iGlobal * 10000 + jGlobal * 5000 + (hGlobal + 1) * 20000) * 0.15*/, PCMB.tmpVertices[4]);
                        PCMB.tmpVertices[1].scaleToRef(altHigh/* + Math.sin((iGlobal + 1) * 10000 + jGlobal * 5000 + (hGlobal + 1) * 20000) * 0.15*/, PCMB.tmpVertices[5]);
                        PCMB.tmpVertices[2].scaleToRef(altHigh/* + Math.sin((iGlobal + 1) * 10000 + (jGlobal + 1) * 5000 + (hGlobal + 1) * 20000) * 0.15*/, PCMB.tmpVertices[6]);
                        PCMB.tmpVertices[3].scaleToRef(altHigh/* + Math.sin(iGlobal * 10000 + (jGlobal + 1) * 5000 + (hGlobal + 1) * 20000) * 0.15*/, PCMB.tmpVertices[7]);
    
                        PCMB.tmpVertices[0].scaleInPlace(altLow/* + Math.sin(iGlobal * 10000 + jGlobal * 5000 + hGlobal * 20000) * 0.15*/);
                        PCMB.tmpVertices[1].scaleInPlace(altLow/* + Math.sin((iGlobal + 1) * 10000 + jGlobal * 5000 + hGlobal * 20000) * 0.15*/);
                        PCMB.tmpVertices[2].scaleInPlace(altLow/* + Math.sin((iGlobal + 1) * 10000 + (jGlobal + 1) * 5000 + hGlobal * 20000) * 0.15*/);
                        PCMB.tmpVertices[3].scaleInPlace(altLow/* + Math.sin(iGlobal * 10000 + (jGlobal + 1) * 5000 + hGlobal * 20000) * 0.15*/);

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
                        let partColors = [...partVertexData.colors];
                        let partUvs = [...partVertexData.uvs];
    
                        let partIndexes = [...partVertexData.indices];
                        let pIndex = l;
                        for (let n = 0; n < partVertexData.positions.length / 3; n++) {
                            let x = partVertexData.positions[3 * n];
                            let y = partVertexData.positions[3 * n + 1];
                            let z = partVertexData.positions[3 * n + 2];

                            let edgeCase: boolean = Math.abs(x - 0.5) <= 0.01 || Math.abs(y - 0.5) <= 0.01 || Math.abs(z - 0.5) <= 0.01;
                            if (edgeCase) {
                                let unstretchedPosition = { x: x + i, y: y + k, z: z + j, index: pIndex };
                                let existingIndex = - 1;
                                let edge = 0;
                                if (Math.abs(x - 0.5) <= 0.01) {
                                    edge = 1;
                                    let existing = unstretchedPositionsX.find(
                                        uP => {
                                            return Math.abs(uP.x - unstretchedPosition.x) < 0.01 && 
                                            Math.abs(uP.y - unstretchedPosition.y) < 0.01 &&
                                            Math.abs(uP.z - unstretchedPosition.z) < 0.01;
                                        }
                                    );
                                    if (existing) {
                                        existingIndex = existing.index;
                                    }
                                }
                                else if (Math.abs(y - 0.5) <= 0.01) {
                                    edge = 2;
                                    let existing = unstretchedPositionsY.find(
                                        uP => {
                                            return Math.abs(uP.x - unstretchedPosition.x) < 0.01 && 
                                            Math.abs(uP.y - unstretchedPosition.y) < 0.01 &&
                                            Math.abs(uP.z - unstretchedPosition.z) < 0.01;
                                        }
                                    );
                                    if (existing) {
                                        existingIndex = existing.index;
                                    }
                                }
                                else if (Math.abs(z - 0.5) <= 0.01) {
                                    edge = 3;
                                    let existing = unstretchedPositionsZ.find(
                                        uP => {
                                            return Math.abs(uP.x - unstretchedPosition.x) < 0.01 && 
                                            Math.abs(uP.y - unstretchedPosition.y) < 0.01 &&
                                            Math.abs(uP.z - unstretchedPosition.z) < 0.01;
                                        }
                                    );
                                    if (existing) {
                                        existingIndex = existing.index;
                                    }
                                }
                                
                                if (existingIndex === - 1) {
                                    v01.copyFrom(v1).subtractInPlace(v0).scaleInPlace(x).addInPlace(v0);
                                    v32.copyFrom(v2).subtractInPlace(v3).scaleInPlace(x).addInPlace(v3);
                                    v45.copyFrom(v5).subtractInPlace(v4).scaleInPlace(x).addInPlace(v4);
                                    v76.copyFrom(v6).subtractInPlace(v7).scaleInPlace(x).addInPlace(v7);
            
                                    v0132.copyFrom(v32).subtractInPlace(v01).scaleInPlace(z).addInPlace(v01);
                                    v4576.copyFrom(v76).subtractInPlace(v45).scaleInPlace(z).addInPlace(v45);
            
                                    vertex.copyFrom(v4576).subtractInPlace(v0132).scaleInPlace(y).addInPlace(v0132);
                                    
                                    positions.push(vertex.x);
                                    positions.push(vertex.y);
                                    positions.push(vertex.z);

                                    colors.push(partColors[4 * n + 0]);
                                    colors.push(partColors[4 * n + 1]);
                                    colors.push(partColors[4 * n + 2]);
                                    colors.push(partColors[4 * n + 3]);

                                    uvs.push(u + vertex.x * uL);
                                    uvs.push(v + vertex.z * vL);
                                    uvs2.push(w + vertex.y * wL);
                                    uvs2.push(1);

                                    if (edge === 1) {
                                        unstretchedPositionsX.push(unstretchedPosition);
                                    }
                                    else if (edge === 2) {
                                        unstretchedPositionsY.push(unstretchedPosition);
                                    }
                                    else if (edge === 3) {
                                        unstretchedPositionsZ.push(unstretchedPosition);
                                    }

                                    for (let a = 0; a < partVertexData.indices.length; a++) {
                                        if (partVertexData.indices[a] === n) {
                                            partIndexes[a] = pIndex;
                                        }
                                    }
                                    pIndex++
                                }
                                else {
                                    for (let a = 0; a < partVertexData.indices.length; a++) {
                                        if (partVertexData.indices[a] === n) {
                                            partIndexes[a] = existingIndex;
                                        }
                                    }
                                }
                            }
                            else {
                                v01.copyFrom(v1).subtractInPlace(v0).scaleInPlace(x).addInPlace(v0);
                                v32.copyFrom(v2).subtractInPlace(v3).scaleInPlace(x).addInPlace(v3);
                                v45.copyFrom(v5).subtractInPlace(v4).scaleInPlace(x).addInPlace(v4);
                                v76.copyFrom(v6).subtractInPlace(v7).scaleInPlace(x).addInPlace(v7);
        
                                v0132.copyFrom(v32).subtractInPlace(v01).scaleInPlace(z).addInPlace(v01);
                                v4576.copyFrom(v76).subtractInPlace(v45).scaleInPlace(z).addInPlace(v45);
        
                                vertex.copyFrom(v4576).subtractInPlace(v0132).scaleInPlace(y).addInPlace(v0132);
                                
                                positions.push(vertex.x);
                                positions.push(vertex.y);
                                positions.push(vertex.z);

                                colors.push(partColors[4 * n + 0]);
                                colors.push(partColors[4 * n + 1]);
                                colors.push(partColors[4 * n + 2]);
                                colors.push(partColors[4 * n + 3]);

                                uvs.push(u + vertex.x * uL);
                                uvs.push(v + vertex.z * vL);
                                uvs2.push(w + vertex.y * wL);
                                uvs2.push(1);
                                
                                for (let a = 0; a < partVertexData.indices.length; a++) {
                                    if (partVertexData.indices[a] === n) {
                                        partIndexes[a] = pIndex;
                                    }
                                }
                                pIndex++
                            }
                        }

                        indices.push(...partIndexes);
                        trianglesData.push(...extendedpartVertexData.trianglesData.map(tData => { return dAsArray[tData]; }));
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

        BABYLON.VertexData.ComputeNormals(positions, indices, normals);

        // Split by data
        let splitPositions: number[] = [];
        let splitIndices: number[] = [];
        let splitNormals: number[] = [];
        let splitUvs: number[] = [];
        let splitUvs2: number[] = [];
        let splitColors: number[] = [];
        while (trianglesData.length > 0) {
            let data = trianglesData[0];
            let pToSplitP: Map<number, number> = new Map<number, number>();

            let tdi = 0;
            while (tdi < trianglesData.length) {
                if (trianglesData[tdi] === data) {
                    trianglesData.splice(tdi, 1);
                    for (let i = 0; i < 3; i++) {
                        let index = indices.splice(3 * tdi, 1)[0];
                        let splitIndex = pToSplitP.get(index);
                        if (splitIndex === undefined) {
                            splitIndex = splitPositions.length / 3;
                            splitPositions.push(positions[3 * index]);
                            splitPositions.push(positions[3 * index + 1]);
                            splitPositions.push(positions[3 * index + 2]);
        
                            splitNormals.push(normals[3 * index]);
                            splitNormals.push(normals[3 * index + 1]);
                            splitNormals.push(normals[3 * index + 2]);

                            splitColors.push(chunckDir.x, chunckDir.y, chunckDir.z, data / 128);
                            splitUvs.push(uvs[2 * index], uvs[2 * index + 1]);
                            splitUvs2.push(uvs2[2 * index], uvs2[2 * index + 1]);
        
                            pToSplitP.set(index, splitIndex);
                        }
                        splitIndices.push(splitIndex);
                    }
                }
                else {
                    tdi++;
                }
            }

            
        }

        vertexData.positions = splitPositions;
        vertexData.indices = splitIndices;
        vertexData.uvs = splitUvs;
        vertexData.uvs2 = splitUvs2;
        vertexData.colors = splitColors;
        vertexData.normals = splitNormals;

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

    public static BuildShellLevelVertexData(
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

        let vertexCount: number = Config.performanceConfiguration.shellMeshVertexCount;
        let f = Math.pow(2, chunck.planet.degree - chunck.degree);
        for (let i = - 1; i <= vertexCount + 1; i++) {
            for (let j = - 1; j <= vertexCount + 1; j++) {
                let l = positions.length / 3;
                let i0 = PlanetTools.CHUNCKSIZE * (chunck.iPos + i / vertexCount) * levelCoef;
                let j0 = PlanetTools.CHUNCKSIZE * (chunck.jPos + j / vertexCount) * levelCoef;
                let p00 = PlanetTools.EvaluateVertex(chunck.size, i0, j0);
                
                let altOffset = 0;
                if (i < 0) {
                    i0 = PlanetTools.CHUNCKSIZE * chunck.iPos * levelCoef;
                    altOffset = - 0.2 * levelCoef;
                }
                if (j < 0) {
                    j0 = PlanetTools.CHUNCKSIZE * chunck.jPos * levelCoef;
                    altOffset = - 0.2 * levelCoef;
                }
                if (i > vertexCount) {
                    i0 = PlanetTools.CHUNCKSIZE * (chunck.iPos + 1) * levelCoef;
                    altOffset = - 0.2 * levelCoef;
                }
                if (j > vertexCount) {
                    j0 = PlanetTools.CHUNCKSIZE * (chunck.jPos + 1) * levelCoef;
                    altOffset = - 0.2 * levelCoef;
                }
                let h00 = Math.floor(chunck.planet.generator.altitudeMap.getForSide(chunck.side, i0 * f, j0 * f) * chunck.kPosMax * PlanetTools.CHUNCKSIZE);
                p00.scaleInPlace(PlanetTools.KGlobalToAltitude(h00) + altOffset);
                positions.push(p00.x, p00.y, p00.z);

                uvs.push(i0 / chunck.size);
                uvs.push(j0 / chunck.size);

                if (i < vertexCount + 1 && j < vertexCount + 1) {
                    indices.push(l, l + 1 + (vertexCount + 3), l + 1);
                    indices.push(l, l + (vertexCount + 3), l + 1 + (vertexCount + 3));
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

                        let hGlobal = (k + kPos * PlanetTools.CHUNCKSIZE);
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