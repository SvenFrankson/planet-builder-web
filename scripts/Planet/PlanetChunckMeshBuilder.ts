class PlanetChunckMeshBuilder {

    private static cachedVertices: BABYLON.Vector3[][][];
    private static tmpVertices: BABYLON.Vector3[];

    private static _BlockColor: Map<number, BABYLON.Color3>;
    public static get BlockColor(): Map<number, BABYLON.Color3> {
        if (!PlanetChunckMeshBuilder._BlockColor) {
            PlanetChunckMeshBuilder._BlockColor = new Map<number, BABYLON.Color3>();
            PlanetChunckMeshBuilder._BlockColor.set(BlockType.None, undefined);
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

        let center = PlanetChunckMeshBuilder.tmpVertices[0].add(PlanetChunckMeshBuilder.tmpVertices[1]).add(PlanetChunckMeshBuilder.tmpVertices[2]).add(PlanetChunckMeshBuilder.tmpVertices[3]);
        center.scaleInPlace(0.25);
        for (let i = 0; i < 4; i++) {
            PlanetChunckMeshBuilder.tmpVertices[i].scaleInPlace(0.8).addInPlace(center.scale(0.2));
        }

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
        chunck: PlanetChunck,
        iPos: number,
        jPos: number,
        kPos: number
    ): BABYLON.VertexData {
        let size = chunck.size;
        let vertexData: BABYLON.VertexData = new BABYLON.VertexData();

        if (!PlanetChunckMeshBuilder.tmpVertices || PlanetChunckMeshBuilder.tmpVertices.length < 15) {
            PlanetChunckMeshBuilder.tmpVertices = [];
            for (let i: number = 0; i < 15; i++) {
                PlanetChunckMeshBuilder.tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        else {
            for (let i: number = 0; i < 15; i++) {
                PlanetChunckMeshBuilder.tmpVertices[i].copyFromFloats(0, 0, 0);
            }
        }
        
        let positions: number[] = [];
        let indices: number[] = [];
        let uvs: number[] = [];
        let normals: number[] = [];
        let colors: number[] = [];

        /*
        let colors3 = [
            new BABYLON.Color3(1, 0.5, 0.5),
            new BABYLON.Color3(0.5, 1, 0.5),
            new BABYLON.Color3(0.5, 0.5, 1),
            new BABYLON.Color3(1, 1, 0.5),
            new BABYLON.Color3(0.5, 1, 1),
            new BABYLON.Color3(1, 0.5, 1)
        ];
        */

        let v0 = PlanetChunckMeshBuilder.tmpVertices[0];
        let v1 = PlanetChunckMeshBuilder.tmpVertices[1];
        let v2 = PlanetChunckMeshBuilder.tmpVertices[2];
        let v3 = PlanetChunckMeshBuilder.tmpVertices[3];
        let v4 = PlanetChunckMeshBuilder.tmpVertices[4];
        let v5 = PlanetChunckMeshBuilder.tmpVertices[5];
        let v6 = PlanetChunckMeshBuilder.tmpVertices[6];
        let v7 = PlanetChunckMeshBuilder.tmpVertices[7];
        let v02 = PlanetChunckMeshBuilder.tmpVertices[8];
        let v13 = PlanetChunckMeshBuilder.tmpVertices[9]
        let v46 = PlanetChunckMeshBuilder.tmpVertices[10]
        let v57 = PlanetChunckMeshBuilder.tmpVertices[11]
        let v0213 = PlanetChunckMeshBuilder.tmpVertices[12]
        let v4657 = PlanetChunckMeshBuilder.tmpVertices[13]
        let v = PlanetChunckMeshBuilder.tmpVertices[14]

        let chunckCornerCase = false;

        let firstI = 0;
        let firstJ = 0;
        let lastJ = PlanetTools.CHUNCKSIZE;
        let firstK = 0;
        if (chunck.side === Side.Top || chunck.side === Side.Bottom) {
            if (chunck.iPos === 0) {
                firstI = - 1;
            }
            if (chunck.jPos === 0) {
                firstJ = - 1;
            }
            chunckCornerCase = chunck.isCorner;
        }
        if (chunck.side <= Side.Left) {
            if (chunck.jPos === chunck.chunckCount - 1) {
                lastJ = PlanetTools.CHUNCKSIZE - 1;
            }
        }
        if (chunck.isDegreeLayerBottom) {
            firstK = - 1;
        }

        for (let i: number = firstI; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j: number = firstJ; j < lastJ; j++) {
                for (let k: number = firstK; k < PlanetTools.CHUNCKSIZE; k++) {
                    let cornerCase = false;
                    if (chunckCornerCase) {
                        if (chunck.iPos === 0) {
                            if (chunck.jPos === 0) {
                                if (i === firstI) {
                                    if (j === firstJ) {
                                        cornerCase = true;
                                    }
                                }
                            }
                            if (chunck.jPos === chunck.chunckCount - 1) {
                                if (i === firstI) {
                                    if (j === lastJ - 1) {
                                        cornerCase = true;
                                    }
                                }
                            }
                        }
                        if (chunck.iPos === chunck.chunckCount - 1) {
                            if (chunck.jPos === 0) {
                                if (i === PlanetTools.CHUNCKSIZE - 1) {
                                    if (j === firstJ) {
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
                        let d = chunck.GetData(i, j, k);
                        if (d != BlockType.None) {
                            if (chunck.GetData(i, j, k + 1) === BlockType.None) {
                                let iGlobal: number = i + iPos * PlanetTools.CHUNCKSIZE;
                                let jGlobal: number = j + jPos * PlanetTools.CHUNCKSIZE;
                                PlanetChunckMeshBuilder.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal) + 1, PlanetChunckMeshBuilder.tmpVertices[0]);
                                PlanetChunckMeshBuilder.GetVertexToRef(2 * size, 2 * (iGlobal) + 1, 2 * (jGlobal + 1) + 1, PlanetChunckMeshBuilder.tmpVertices[1]);
                                PlanetChunckMeshBuilder.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal) + 1, PlanetChunckMeshBuilder.tmpVertices[2]);
                                PlanetChunckMeshBuilder.GetVertexToRef(2 * size, 2 * (iGlobal + 1) + 1, 2 * (jGlobal + 1) + 1, PlanetChunckMeshBuilder.tmpVertices[3]);
            
                                let hGlobal = (k + kPos * PlanetTools.CHUNCKSIZE + 1);
                                let hLow = PlanetTools.KGlobalToAltitude(hGlobal) * 0.5 + PlanetTools.KGlobalToAltitude(hGlobal + 1) * 0.5;
                                let hHigh = PlanetTools.KGlobalToAltitude(hGlobal + 1) * 0.5 + PlanetTools.KGlobalToAltitude(hGlobal + 2) * 0.5;
                                let h = hLow * 0.5 + hHigh * 0.5;
            
                                PlanetChunckMeshBuilder.tmpVertices[0].scaleInPlace(h);
                                PlanetChunckMeshBuilder.tmpVertices[1].scaleInPlace(h);
                                PlanetChunckMeshBuilder.tmpVertices[2].scaleInPlace(h);
                                PlanetChunckMeshBuilder.tmpVertices[3].scaleInPlace(h);

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
                                
                                let c = PlanetChunckMeshBuilder.BlockColor.get(chunck.GetData(i, j, k));
                                if (!c) {
                                    c = PlanetChunckMeshBuilder.BlockColor.get(136);
                                }
            
                                let l = positions.length / 3;
                                positions.push(v0.x, v0.y, v0.z, v1.x, v1.y, v1.z, v2.x, v2.y, v2.z)
                                let color = PlanetChunckMeshBuilder.BlockColor.get(d);
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
    
                        if (ref === 0b0 || ref === 0b11111111) {
                            continue;
                        }
                        
                        let partVertexData = PlanetChunckVertexData.Get(ref);
    
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

                            let xs = [x0, x1, x2];
                            let ys = [y0, y1, y2];
                            let zs = [z0, z1, z2];
                            let ds = [];

                            for (let vIndex = 0; vIndex < 3; vIndex++) {
                                let d = BlockType.None;
                                let minManDist = Infinity;
                                if (d0) {
                                    let manDistance = xs[vIndex] + ys[vIndex] + zs[vIndex];
                                    if (manDistance < minManDist) {
                                        d = d0;
                                        minManDist = manDistance;
                                    }
                                }
                                if (d1) {
                                    let manDistance = (1 - xs[vIndex]) + ys[vIndex] + zs[vIndex];
                                    if (manDistance < minManDist) {
                                        d = d1;
                                        minManDist = manDistance;
                                    }
                                }
                                if (d2) {
                                    let manDistance = (1 - xs[vIndex]) + ys[vIndex] + (1 - zs[vIndex]);
                                    if (manDistance < minManDist) {
                                        d = d2;
                                        minManDist = manDistance;
                                    }
                                }
                                if (d3) {
                                    let manDistance = xs[vIndex] + ys[vIndex] + (1 - zs[vIndex]);
                                    if (manDistance < minManDist) {
                                        d = d3;
                                        minManDist = manDistance;
                                    }
                                }
                                if (d4) {
                                    let manDistance = xs[vIndex] + (1 - ys[vIndex]) + zs[vIndex];
                                    if (manDistance < minManDist) {
                                        d = d4;
                                        minManDist = manDistance;
                                    }
                                }
                                if (d5) {
                                    let manDistance = (1 - xs[vIndex]) + (1 - ys[vIndex]) + zs[vIndex];
                                    if (manDistance < minManDist) {
                                        d = d5;
                                        minManDist = manDistance;
                                    }
                                }
                                if (d6) {
                                    let manDistance = (1 - xs[vIndex]) + (1 - ys[vIndex]) + (1 - zs[vIndex]);
                                    if (manDistance < minManDist) {
                                        d = d6;
                                        minManDist = manDistance;
                                    }
                                }
                                if (d7) {
                                    let manDistance = xs[vIndex] + (1 - ys[vIndex]) + (1 - zs[vIndex]);
                                    if (manDistance < minManDist) {
                                        d = d7;
                                        minManDist = manDistance;
                                    }
                                }
                                ds[vIndex] = d;
                            }
                            
                            let alpha = ds[0] / 8;
                            let u = ds[1] / 8;
                            let v = ds[2] / 8;
                            
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
                            
                            v02.copyFrom(v2).subtractInPlace(v0).scaleInPlace(x).addInPlace(v0);
                            v13.copyFrom(v3).subtractInPlace(v1).scaleInPlace(x).addInPlace(v1);
                            v46.copyFrom(v6).subtractInPlace(v4).scaleInPlace(x).addInPlace(v4);
                            v57.copyFrom(v7).subtractInPlace(v5).scaleInPlace(x).addInPlace(v5);
    
                            v0213.copyFrom(v13).subtractInPlace(v02).scaleInPlace(z).addInPlace(v02);
                            v4657.copyFrom(v57).subtractInPlace(v46).scaleInPlace(z).addInPlace(v46);
    
                            v.copyFrom(v4657).subtractInPlace(v0213).scaleInPlace(y).addInPlace(v0213);
                            
                            positions.push(v.x);
                            positions.push(v.y);
                            positions.push(v.z);
                        }
                        normals.push(...partVertexData.normals);
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
    

    public static BuildVertexData_Cubic(
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
}
