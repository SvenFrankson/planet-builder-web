class PlanetChunckVertexData {

    private static _VertexDatas: Map<number, ExtendedVertexData>[] = [
        new Map<number, ExtendedVertexData>(),
        new Map<number, ExtendedVertexData>(),
        new Map<number, ExtendedVertexData>()
    ];

    private static NameToRef(name: string): number {
        let v: number = 0b0;
        for (let i = 0; i < name.length; i++) {
            if (name[i] === "1") {
                v |= (0b1 << i);
            }
        }
        return v;
    }

    private static ReOrder = (ref: number, ...order: number[]) => {
        let v: number[] = [];
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
    }

    public static RotateXChunckPartRef(ref: number): number {
        return PlanetChunckVertexData.ReOrder(ref, 3, 2, 6, 7, 0, 1, 5, 4);
    }

    public static RotateYChunckPartRef(ref: number): number {
        return PlanetChunckVertexData.ReOrder(ref, 1, 2, 3, 0, 5, 6, 7, 4);
    }

    public static RotateZChunckPartRef(ref: number): number {
        return PlanetChunckVertexData.ReOrder(ref, 4, 0, 3, 7, 5, 1, 2, 6);
    }

    public static FlipChunckPartRef(ref: number): number {
        return ref ^ 0b11111111;
    }

    public static AddChunckPartRef(ref1: number, ref2: number): number {
        return ref1 | ref2;    
    }

    public static MirrorXChunckPartRef(ref: number): number {
        return PlanetChunckVertexData.ReOrder(ref, 1, 0, 3, 2, 5, 4, 7, 6);
    }

    public static MirrorYChunckPartRef(ref: number): number {
        return PlanetChunckVertexData.ReOrder(ref, 4, 5, 6, 7, 0, 1, 2, 3);
    }

    public static MirrorZChunckPartRef(ref: number): number {
        return PlanetChunckVertexData.ReOrder(ref, 3, 2, 1, 0, 7, 6, 5, 4);
    }

    private static _TryAddFlippedChunckPart(lod: number, ref: number, data: BABYLON.VertexData): boolean {
        let flippedRef = PlanetChunckVertexData.FlipChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(flippedRef)) {
            let flippedData = PlanetChunckVertexData.Flip(data);
            PlanetChunckVertexData._VertexDatas[lod].set(flippedRef, new ExtendedVertexData(flippedRef, flippedData));
            PlanetChunckVertexData._TryAddVariations(lod, flippedRef, flippedData, false);
            return true;
        }
        return false;
    }

    private static _TryAddMirrorXChunckPart(lod: number, ref: number, data: BABYLON.VertexData): boolean {
        let mirrorXRef = PlanetChunckVertexData.MirrorXChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(mirrorXRef)) {
            let mirrorXData = PlanetChunckVertexData.MirrorX(data);
            PlanetChunckVertexData._VertexDatas[lod].set(mirrorXRef, new ExtendedVertexData(mirrorXRef, mirrorXData));
            PlanetChunckVertexData._TryAddMirrorYChunckPart(lod, mirrorXRef, mirrorXData);
            PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, mirrorXRef, mirrorXData);
            return true;
        }
        return false;
    }

    private static _TryAddMirrorYChunckPart(lod: number, ref: number, data: BABYLON.VertexData): boolean {
        let mirrorYRef = PlanetChunckVertexData.MirrorYChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(mirrorYRef)) {
            let mirrorYData = PlanetChunckVertexData.MirrorY(data);
            PlanetChunckVertexData._VertexDatas[lod].set(mirrorYRef, new ExtendedVertexData(mirrorYRef, mirrorYData));
            PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, mirrorYRef, mirrorYData);
            return true;
        }
        return false;
    }

    private static _TryAddMirrorZChunckPart(lod: number, ref: number, data: BABYLON.VertexData): boolean {
        let mirrorZRef = PlanetChunckVertexData.MirrorZChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(mirrorZRef)) {
            let mirrorZData = PlanetChunckVertexData.MirrorZ(data);
            PlanetChunckVertexData._VertexDatas[lod].set(mirrorZRef, new ExtendedVertexData(mirrorZRef, mirrorZData));
            return true;
        }
        return false;
    }

    public static SplitVertexDataTriangles(data: BABYLON.VertexData): BABYLON.VertexData {
        let splitData = new BABYLON.VertexData();
        let positions: number[] = [];
        let indices: number[] = [];
        let normals: number[] = [];
        let uvs: number[] = [];
        let colors: number[] = [];

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

            let u0: number;
            let v0: number;
            let u1: number;
            let v1: number;
            let u2: number;
            let v2: number;
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

            let r0: number;
            let g0: number;
            let b0: number;
            let a0: number;
            let r1: number;
            let g1: number;
            let b1: number;
            let a1: number;
            let r2: number;
            let g2: number;
            let b2: number;
            let a2: number;
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

    private static _TryAddVariations(lod: number, ref: number, data: BABYLON.VertexData, useXZAxisRotation: boolean): boolean {
        let useful = false;
        useful = PlanetChunckVertexData._TryAddMirrorXChunckPart(lod, ref, data) || useful;
        useful = PlanetChunckVertexData._TryAddMirrorYChunckPart(lod, ref, data) || useful;
        useful = PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, ref, data) || useful;

        if (useXZAxisRotation) {
            let rotatedXRef = ref;
            let rotatedXData = data;
            for (let j = 0; j < 3; j++) {
                rotatedXRef = PlanetChunckVertexData.RotateXChunckPartRef(rotatedXRef);
                rotatedXData = PlanetChunckVertexData.RotateX(rotatedXData);
                if (!PlanetChunckVertexData._VertexDatas[lod].has(rotatedXRef)) {
                    PlanetChunckVertexData._VertexDatas[lod].set(rotatedXRef, new ExtendedVertexData(rotatedXRef, rotatedXData));
                    useful = true;
                }
                useful = PlanetChunckVertexData._TryAddMirrorXChunckPart(lod, rotatedXRef, rotatedXData) || useful;
                useful = PlanetChunckVertexData._TryAddMirrorYChunckPart(lod, rotatedXRef, rotatedXData) || useful;
                useful = PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, rotatedXRef, rotatedXData) || useful;
            }
        }

        let rotatedYRef = ref;
        let rotatedYData = data;
        for (let j = 0; j < 3; j++) {
            rotatedYRef = PlanetChunckVertexData.RotateYChunckPartRef(rotatedYRef);
            rotatedYData = PlanetChunckVertexData.RotateY(rotatedYData);
            if (!PlanetChunckVertexData._VertexDatas[lod].has(rotatedYRef)) {
                PlanetChunckVertexData._VertexDatas[lod].set(rotatedYRef, new ExtendedVertexData(rotatedYRef, rotatedYData));
                useful = true;
            }
            useful = PlanetChunckVertexData._TryAddMirrorXChunckPart(lod, rotatedYRef, rotatedYData) || useful;
            useful = PlanetChunckVertexData._TryAddMirrorYChunckPart(lod, rotatedYRef, rotatedYData) || useful;
            useful = PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, rotatedYRef, rotatedYData) || useful;
        }

        if (useXZAxisRotation) {
            let rotatedZRef = ref;
            let rotatedZData = data;
            for (let j = 0; j < 3; j++) {
                rotatedZRef = PlanetChunckVertexData.RotateZChunckPartRef(rotatedZRef);
                rotatedZData = PlanetChunckVertexData.RotateZ(rotatedZData);
                if (!PlanetChunckVertexData._VertexDatas[lod].has(rotatedZRef)) {
                    PlanetChunckVertexData._VertexDatas[lod].set(rotatedZRef, new ExtendedVertexData(rotatedZRef, rotatedZData));
                    useful = true;
                }
                useful = PlanetChunckVertexData._TryAddMirrorXChunckPart(lod, rotatedZRef, rotatedZData) || useful;
                useful = PlanetChunckVertexData._TryAddMirrorYChunckPart(lod, rotatedZRef, rotatedZData) || useful;
                useful = PlanetChunckVertexData._TryAddMirrorZChunckPart(lod, rotatedZRef, rotatedZData) || useful;
            }
        }

        return useful;
    }

    private static _AddChunckPartMesh(mesh: BABYLON.Mesh, lod: number, useXZAxisRotation: boolean): boolean {
        let useful = false;
        let name = mesh.name;
        let ref = PlanetChunckVertexData.NameToRef(name);
        if (ref === 0) {
            return false;
        }
        let data = BABYLON.VertexData.ExtractFromMesh(mesh);
        
        /*
        let normals = []
        for (let j = 0; j < data.positions.length / 3; j++) {
            let x = data.positions[3 * j];
            let y = data.positions[3 * j + 1];
            let z = data.positions[3 * j + 2];

            let nx = data.normals[3 * j];
            let ny = data.normals[3 * j + 1];
            let nz = data.normals[3 * j + 2];

            if (Math.abs(x) > 0.49 && Math.abs(y) > 0.49 || Math.abs(x) > 0.49 && Math.abs(z) > 0.49 || Math.abs(y) > 0.49 && Math.abs(z) > 0.49) {
                if (Math.abs(nx) > Math.abs(ny) && Math.abs(nx) > Math.abs(nz)) {
                    ny = 0;
                    nz = 0;
                }
                else if (Math.abs(ny) > Math.abs(nx) && Math.abs(ny) > Math.abs(nz)) {
                    nx = 0;
                    nz = 0;
                }
                else if (Math.abs(nz) > Math.abs(nx) && Math.abs(nz) > Math.abs(ny)) {
                    nx = 0;
                    ny = 0;
                }
            }
            if (Math.abs(x) > 0.49) {
                nx = 0;
            }
            if (Math.abs(y) > 0.49) {
                ny = 0;
            }
            if (Math.abs(z) > 0.49) {
                nz = 0;
            }
            if (Math.abs(x) > 0.49 || Math.abs(y) > 0.49 || Math.abs(z) > 0.49) {
                if (Math.abs(Math.abs(x) - 0.144) < 0.02 || Math.abs(Math.abs(y) - 0.144) < 0.02 || Math.abs(Math.abs(z) - 0.144) < 0.02) {
                    if (Math.abs(nx) > Math.abs(ny) && Math.abs(nx) > Math.abs(nz)) {
                        nx = Math.sign(nx) * 0.818
                        if (Math.abs(ny) > Math.abs(nz)) {
                            ny = Math.sign(ny) * 0.582;
                            nz = 0;
                        }
                        else {
                            ny = 0;
                            nz = Math.sign(nz) * 0.582;
                        }
                    }
                    if (Math.abs(ny) > Math.abs(nx) && Math.abs(ny) > Math.abs(nz)) {
                        ny = Math.sign(ny) * 0.818
                        if (Math.abs(nx) > Math.abs(nz)) {
                            nx = Math.sign(nx) * 0.582;
                            nz = 0;
                        }
                        else {
                            nx = 0;
                            nz = Math.sign(nz) * 0.582;
                        }
                    }
                    if (Math.abs(nz) > Math.abs(nx) && Math.abs(nz) > Math.abs(ny)) {
                        nz = Math.sign(nz) * 0.818
                        if (Math.abs(nx) > Math.abs(ny)) {
                            nx = Math.sign(nx) * 0.582;
                            ny = 0;
                        }
                        else {
                            nx = 0;
                            ny = Math.sign(ny) * 0.582;
                        }
                    }
                }
            }

            let l = Math.sqrt(nx * nx + ny * ny + nz * nz);
            normals[3 * j] = nx / l;
            normals[3 * j + 1] = ny / l;
            normals[3 * j + 2] = nz / l;
        }
        data.normals = normals;
        */

        data.positions = data.positions.map((p: number) => {
            p += 0.5;
            return p;
        });
        //data = PlanetChunckVertexData.SplitVertexDataTriangles(data);
        
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
            PlanetChunckVertexData._VertexDatas[lod].set(ref, new ExtendedVertexData(ref, data));
            useful = true;
        }

        useful = PlanetChunckVertexData._TryAddVariations(lod, ref, data, useXZAxisRotation) || useful;

        if (!useful) {
            console.warn("Chunck-Part " + name + " is redundant.");
        }

        return useful;
    }

    private static async _LoadChunckVertexDatasFromFile(lod: number, useXZAxisRotation: boolean): Promise<void> {
        let filename = Config.chunckPartConfiguration.dir + "/" + Config.chunckPartConfiguration.filename;
        return new Promise<void>(
            resolve => {
                BABYLON.SceneLoader.ImportMesh(
                    "",
                    filename + "-lod-" + lod.toFixed(0) + ".babylon",
                    "",
                    Game.Scene,
                    (meshes) => {
                        for (let i = 0; i < meshes.length; i++) {
                            let mesh = meshes[i];
                            if (mesh instanceof BABYLON.Mesh && mesh.name != "zero") {
                                PlanetChunckVertexData._AddChunckPartMesh(mesh, lod, useXZAxisRotation);
                            }
                        }
                        resolve();
                    }
                );
            }
        );
    }

    private static _LoadComposedChunckVertexDatas(lod: number, useXZAxisRotation: boolean): void {
        let ref13 = 0b10000010;
        let baseData13A = PlanetChunckVertexData.Get(lod, 0b10000000);
        let baseData13B = PlanetChunckVertexData.Get(lod, 0b00000010);
        let data13 = PlanetChunckVertexData.Add(baseData13A.vertexData, baseData13B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref13)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref13, new ExtendedVertexData(ref13, data13));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref13, data13, useXZAxisRotation);
        
        let ref0 = 0b01111111;
        let baseData0 = PlanetChunckVertexData.Get(lod, 0b10000000);
        let data0 = PlanetChunckVertexData.Flip(baseData0.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref0)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref0, new ExtendedVertexData(ref0, data0));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref0, data0, useXZAxisRotation);

        let ref10 = 0b00111111;
        let baseData10 = PlanetChunckVertexData.Get(lod, 0b11000000);
        let data10 = PlanetChunckVertexData.Flip(baseData10.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref10)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref10, new ExtendedVertexData(ref10, data10));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref10, data10, useXZAxisRotation);

        let ref11 = 0b01110111;
        let baseData11 = PlanetChunckVertexData.Get(lod, 0b10001000);
        let data11 = PlanetChunckVertexData.Flip(baseData11.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref11)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref11, new ExtendedVertexData(ref11, data11));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref11, data11, useXZAxisRotation);

        let ref1 = 0b00011111;
        let baseData1 = PlanetChunckVertexData.Get(lod, 0b11100000);
        let data1 = PlanetChunckVertexData.Flip(baseData1.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref1)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref1, new ExtendedVertexData(ref1, data1));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref1, data1, useXZAxisRotation);

        let ref12 = 0b00110111;
        let baseData12 = PlanetChunckVertexData.Get(lod, 0b11001000);
        let data12 = PlanetChunckVertexData.Flip(baseData12.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref12)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref12, new ExtendedVertexData(ref12, data12));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref12, data12, useXZAxisRotation);

        let ref2 = 0b11110101;
        let baseData2A = PlanetChunckVertexData.Get(lod, 0b11110111);
        let baseData2B = PlanetChunckVertexData.Get(lod, 0b11111101);
        let data2 = PlanetChunckVertexData.Add(baseData2A.vertexData, baseData2B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref2)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref2, new ExtendedVertexData(ref2, data2));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref2, data2, useXZAxisRotation);

        let ref3 = 0b01011010;
        let baseData3A = PlanetChunckVertexData.Get(lod, 0b01011111);
        let baseData3B = PlanetChunckVertexData.Get(lod, 0b11111010);
        let data3 = PlanetChunckVertexData.Add(baseData3A.vertexData, baseData3B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref3)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref3, new ExtendedVertexData(ref3, data3));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref3, data3, useXZAxisRotation);

        let ref4 = 0b10100100;
        let baseData4A = PlanetChunckVertexData.Get(lod, 0b11100100);
        let baseData4B = PlanetChunckVertexData.Get(lod, 0b10111111);
        let data4 = PlanetChunckVertexData.Add(baseData4A.vertexData, baseData4B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref4)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref4, new ExtendedVertexData(ref4, data4));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref4, data4, useXZAxisRotation);

        let ref5 = 0b11000011;
        let baseData5A = PlanetChunckVertexData.Get(lod, 0b11001111);
        let baseData5B = PlanetChunckVertexData.Get(lod, 0b11110011);
        let data5 = PlanetChunckVertexData.Add(baseData5A.vertexData, baseData5B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref5)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref5, new ExtendedVertexData(ref5, data5));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref5, data5, useXZAxisRotation);

        let ref6 = 0b01110101;
        let baseData6A = PlanetChunckVertexData.Get(lod, 0b01110111);
        let baseData6B = PlanetChunckVertexData.Get(lod, 0b11111101);
        let data6 = PlanetChunckVertexData.Add(baseData6A.vertexData, baseData6B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref6)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref6, new ExtendedVertexData(ref6, data6));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref6, data6, useXZAxisRotation);

        let ref7 = 0b01111101;
        let baseData7A = PlanetChunckVertexData.Get(lod, 0b01111111);
        let baseData7B = PlanetChunckVertexData.Get(lod, 0b11111101);
        let data7 = PlanetChunckVertexData.Add(baseData7A.vertexData, baseData7B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref7)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref7, new ExtendedVertexData(ref7, data7));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref7, data7, useXZAxisRotation);

        let ref8 = 0b11100101;
        let baseData8A = PlanetChunckVertexData.Get(lod, 0b11101111);
        let baseData8B = PlanetChunckVertexData.Get(lod, 0b11110101);
        let data8 = PlanetChunckVertexData.Add(baseData8A.vertexData, baseData8B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref8)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref8, new ExtendedVertexData(ref8, data8));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref8, data8, useXZAxisRotation);

        let ref9 = 0b11100001;
        let baseData9A = PlanetChunckVertexData.Get(lod, 0b11101111);
        let baseData9B = PlanetChunckVertexData.Get(lod, 0b11110001);
        let data9 = PlanetChunckVertexData.Add(baseData9A.vertexData, baseData9B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref9)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref9, new ExtendedVertexData(ref9, data9));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref9, data9, useXZAxisRotation);
    }

    
    private static _LoadComposedChunckVertexDatasNoXZAxisRotation(lod: number, useXZAxisRotation: boolean): void {
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b10000000, PlanetChunckVertexData.Get(lod, 0b10000000).vertexData);
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b11000000, PlanetChunckVertexData.Get(lod, 0b11000000).vertexData);
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b10001000, PlanetChunckVertexData.Get(lod, 0b10001000).vertexData);
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b11111000, PlanetChunckVertexData.Get(lod, 0b11111000).vertexData);
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b11001000, PlanetChunckVertexData.Get(lod, 0b11001000).vertexData);
        
        let ref1 = 0b11110101;
        let baseData1A = PlanetChunckVertexData.Get(lod, 0b11110111);
        let baseData1B = PlanetChunckVertexData.Get(lod, 0b11111101);
        let data1 = PlanetChunckVertexData.Add(baseData1A.vertexData, baseData1B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref1)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref1, new ExtendedVertexData(ref1, data1));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref1, data1, useXZAxisRotation);

        let ref2 = 0b10000010;
        let baseData2A = PlanetChunckVertexData.Get(lod, 0b10000000);
        let baseData2B = PlanetChunckVertexData.Get(lod, 0b00000010);
        let data2 = PlanetChunckVertexData.Add(baseData2A.vertexData, baseData2B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref2)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref2, new ExtendedVertexData(ref2, data2));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref2, data2, useXZAxisRotation);
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b10000010, PlanetChunckVertexData.Get(lod, 0b10000010).vertexData);

        let ref21 = 0b00111100;
        let baseData21A = PlanetChunckVertexData.Get(lod, 0b00111111);
        let baseData21B = PlanetChunckVertexData.Get(lod, 0b11111100);
        let data21 = PlanetChunckVertexData.Add(baseData21A.vertexData, baseData21B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref21)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref21, new ExtendedVertexData(ref21, data21));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref2, data2, useXZAxisRotation);
        PlanetChunckVertexData._TryAddFlippedChunckPart(lod, 0b00111100, PlanetChunckVertexData.Get(lod, 0b00111100).vertexData);

        let ref3 = 0b01010101;
        let baseData3A = PlanetChunckVertexData.Get(lod, 0b01110111);
        let baseData3B = PlanetChunckVertexData.Get(lod, 0b11011101);
        let data3 = PlanetChunckVertexData.Add(baseData3A.vertexData, baseData3B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref3)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref3, new ExtendedVertexData(ref3, data3));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref3, data3, useXZAxisRotation);

        let ref4 = 0b11010101;
        let baseData4A = PlanetChunckVertexData.Get(lod, 0b11011101);
        let baseData4B = PlanetChunckVertexData.Get(lod, 0b11110111);
        let data4 = PlanetChunckVertexData.Add(baseData4A.vertexData, baseData4B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref4)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref4, new ExtendedVertexData(ref4, data4));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref4, data4, useXZAxisRotation);

        let ref5 = 0b10100001;
        let baseData5A = PlanetChunckVertexData.Get(lod, 0b10110001);
        let baseData5B = PlanetChunckVertexData.Get(lod, 0b11101111);
        let data5 = PlanetChunckVertexData.Add(baseData5A.vertexData, baseData5B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref5)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref5, new ExtendedVertexData(ref5, data5));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref5, data5, useXZAxisRotation);

        let ref6 = 0b11100001;
        let baseData6A = PlanetChunckVertexData.Get(lod, 0b11110001);
        let baseData6B = PlanetChunckVertexData.Get(lod, 0b11101111);
        let data6 = PlanetChunckVertexData.Add(baseData6A.vertexData, baseData6B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref6)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref6, new ExtendedVertexData(ref6, data6));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref6, data6, useXZAxisRotation);

        let ref7 = 0b11101001;
        let baseData7A = PlanetChunckVertexData.Get(lod, 0b11111001);
        let baseData7B = PlanetChunckVertexData.Get(lod, 0b11101111);
        let data7 = PlanetChunckVertexData.Add(baseData7A.vertexData, baseData7B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref7)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref7, new ExtendedVertexData(ref7, data7));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref7, data7, useXZAxisRotation);

        let ref8 = 0b01011100;
        let baseData8A = PlanetChunckVertexData.Get(lod, 0b11011100);
        let baseData8B = PlanetChunckVertexData.Get(lod, 0b01111111);
        let data8 = PlanetChunckVertexData.Add(baseData8A.vertexData, baseData8B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref8)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref8, new ExtendedVertexData(ref8, data8));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref8, data8, useXZAxisRotation);

        let ref9 = 0b11100101;
        let baseData9A = PlanetChunckVertexData.Get(lod, 0b11101111);
        let baseData9B = PlanetChunckVertexData.Get(lod, 0b11110101);
        let data9 = PlanetChunckVertexData.Add(baseData9A.vertexData, baseData9B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref9)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref9, new ExtendedVertexData(ref9, data9));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref9, data9, useXZAxisRotation);

        let ref10 = 0b10100101;
        let baseData10A = PlanetChunckVertexData.Get(lod, 0b10101111);
        let baseData10B = PlanetChunckVertexData.Get(lod, 0b11110101);
        let data10 = PlanetChunckVertexData.Add(baseData10A.vertexData, baseData10B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref10)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref10, new ExtendedVertexData(ref10, data10));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref10, data10, useXZAxisRotation);

        let ref11 = 0b10110111;
        let baseData11A = PlanetChunckVertexData.Get(lod, 0b10111111);
        let baseData11B = PlanetChunckVertexData.Get(lod, 0b11110111);
        let data11 = PlanetChunckVertexData.Add(baseData11A.vertexData, baseData11B.vertexData);
        if (!PlanetChunckVertexData._VertexDatas[lod].has(ref11)) {
            PlanetChunckVertexData._VertexDatas[lod].set(ref11, new ExtendedVertexData(ref11, data11));
        }
        PlanetChunckVertexData._TryAddVariations(lod, ref11, data11, useXZAxisRotation);
    }

    public static async InitializeData(): Promise<boolean> {
        
        let timers: number[];
        let logOutput: string;
        let useLog = DebugDefine.LOG_CHUNCK_VERTEXDATA_INIT_PERFORMANCE;
        if (useLog) {
            timers = [];
            timers.push(performance.now());
            logOutput = "initialize chunck vertex data " + this.name;
        }
        for (let lod = Config.chunckPartConfiguration.lodMin; lod <= Config.chunckPartConfiguration.lodMax; lod++) {
            await PlanetChunckVertexData._LoadChunckVertexDatasFromFile(lod, Config.chunckPartConfiguration.useXZAxisRotation);
            if (Config.chunckPartConfiguration.useXZAxisRotation) {
                PlanetChunckVertexData._LoadComposedChunckVertexDatas(lod, true);
            }
            else {
                PlanetChunckVertexData._LoadComposedChunckVertexDatasNoXZAxisRotation(lod, Config.chunckPartConfiguration.useXZAxisRotation);
            }
            if (useLog) {
                timers.push(performance.now());
                logOutput += "\n  lod " + lod + " loaded in " + (timers[timers.length - 1] - timers[timers.length - 2]).toFixed(0) + " ms";
            }
        }
        if (useLog) {
            timers.push(performance.now());
            logOutput += "\nchunck vertex data initialized in " + (timers[timers.length - 1] - timers[0]).toFixed(0) + " ms";
            console.log(logOutput);
        }

        return true;
    }

    public static Clone(data: BABYLON.VertexData): BABYLON.VertexData {
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

    public static Get(lod: number, ref: number): ExtendedVertexData {
        return PlanetChunckVertexData._VertexDatas[lod].get(ref);
    }

    public static RotateX(baseData: BABYLON.VertexData): BABYLON.VertexData {
        let data = new BABYLON.VertexData();
        let positions = [...baseData.positions];
        let normals: number[];
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            normals = [...baseData.normals];
        }
        data.indices = [...baseData.indices];

        for (let i = 0; i < positions.length / 3; i++) {
            let y = positions[3 * i + 1] - 0.5;
            let z = positions[3 * i + 2] - 0.5;
            positions[3 * i + 1] = - z + 0.5;
            positions[3 * i + 2] =  y + 0.5;
            if (normals) {
                let yn = normals[3 * i + 1];
                let zn = normals[3 * i + 2];
                normals[3 * i + 1] = - zn;
                normals[3 * i + 2] =  yn;
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

    public static RotateY(baseData: BABYLON.VertexData): BABYLON.VertexData {
        let data = new BABYLON.VertexData();
        let positions = [...baseData.positions];
        let normals: number[];
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            normals = [...baseData.normals];
        }
        data.indices = [...baseData.indices];

        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i] - 0.5;
            let z = positions[3 * i + 2] - 0.5;
            positions[3 * i] = z + 0.5;
            positions[3 * i + 2] =  - x + 0.5;
            if (normals) {
                let xn = normals[3 * i];
                let zn = normals[3 * i + 2];
                normals[3 * i] = zn;
                normals[3 * i + 2] = - xn;
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

    public static RotateZ(baseData: BABYLON.VertexData): BABYLON.VertexData {
        let data = new BABYLON.VertexData();
        let positions = [...baseData.positions];
        let normals: number[];
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            normals = [...baseData.normals];
        }
        data.indices = [...baseData.indices];

        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i] - 0.5;
            let y = positions[3 * i + 1] - 0.5;
            positions[3 * i] = - y + 0.5;
            positions[3 * i + 1] = x + 0.5;
            if (normals) {
                let xn = normals[3 * i];
                let yn = normals[3 * i + 1];
                normals[3 * i] = - yn;
                normals[3 * i + 1] = xn;
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

    public static Flip(baseData: BABYLON.VertexData): BABYLON.VertexData {
        let data = new BABYLON.VertexData();
        data.positions = [...baseData.positions];
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals: number[] = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(- baseData.normals[3 * i], - baseData.normals[3 * i + 1], - baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }
        let indices: number[] = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;

        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        
        return data;
    }

    public static Add(baseData1: BABYLON.VertexData, baseData2: BABYLON.VertexData): BABYLON.VertexData {
        let l = baseData1.positions.length / 3;
        let data = new BABYLON.VertexData();
        data.positions = [...baseData1.positions, ...baseData2.positions];
        data.normals = [...baseData1.normals, ...baseData2.normals];
        data.indices =  [...baseData1.indices, ...baseData2.indices.map((i: number) => { return i + l; })];
        if (baseData1.colors && baseData2.colors) {
            data.colors = [...baseData1.colors, ...baseData2.colors];
        }
        
        return data;
    }

    public static MirrorX(baseData: BABYLON.VertexData): BABYLON.VertexData {
        let data = new BABYLON.VertexData();

        let positions: number[] = [];
        for (let i = 0; i < baseData.positions.length / 3; i++) {
            positions.push(1 - baseData.positions[3 * i], baseData.positions[3 * i + 1], baseData.positions[3 * i + 2]);
        }
        data.positions = positions;

        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals: number[] = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(- baseData.normals[3 * i], baseData.normals[3 * i + 1], baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }

        let indices: number[] = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        
        return data;
    }

    public static MirrorY(baseData: BABYLON.VertexData): BABYLON.VertexData {
        let data = new BABYLON.VertexData();

        let positions: number[] = [];
        for (let i = 0; i < baseData.positions.length / 3; i++) {
            positions.push(baseData.positions[3 * i], 1 - baseData.positions[3 * i + 1], baseData.positions[3 * i + 2]);
        }
        data.positions = positions;

        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals: number[] = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(baseData.normals[3 * i], - baseData.normals[3 * i + 1], baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }

        let indices: number[] = [];
        for (let i = 0; i < baseData.indices.length / 3; i++) {
            indices.push(baseData.indices[3 * i], baseData.indices[3 * i + 2], baseData.indices[3 * i + 1]);
        }
        data.indices = indices;
        
        if (baseData.colors) {
            data.colors = [...baseData.colors];
        }
        
        return data;
    }

    public static MirrorZ(baseData: BABYLON.VertexData): BABYLON.VertexData {
        let data = new BABYLON.VertexData();

        let positions: number[] = [];
        for (let i = 0; i < baseData.positions.length / 3; i++) {
            positions.push(baseData.positions[3 * i], baseData.positions[3 * i + 1], 1 - baseData.positions[3 * i + 2]);
        }
        data.positions = positions;

        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            let normals: number[] = [];
            for (let i = 0; i < baseData.normals.length / 3; i++) {
                normals.push(baseData.normals[3 * i], baseData.normals[3 * i + 1], - baseData.normals[3 * i + 2]);
            }
            data.normals = normals;
        }

        let indices: number[] = [];
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