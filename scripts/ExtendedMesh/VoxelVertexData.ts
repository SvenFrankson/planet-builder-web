class VoxelVertexData {

    private static _VertexDatas: Map<number, ExtendedVertexData> = new Map<number, ExtendedVertexData>();

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
        return VoxelVertexData.ReOrder(ref, 3, 2, 6, 7, 0, 1, 5, 4);
    }

    public static RotateYChunckPartRef(ref: number): number {
        return VoxelVertexData.ReOrder(ref, 1, 2, 3, 0, 5, 6, 7, 4);
    }

    public static RotateZChunckPartRef(ref: number): number {
        return VoxelVertexData.ReOrder(ref, 4, 0, 3, 7, 5, 1, 2, 6);
    }

    public static FlipChunckPartRef(ref: number): number {
        return ref ^ 0b11111111;
    }

    public static AddChunckPartRef(ref1: number, ref2: number): number {
        return ref1 | ref2;    
    }

    public static MirrorXChunckPartRef(ref: number): number {
        return VoxelVertexData.ReOrder(ref, 1, 0, 3, 2, 5, 4, 7, 6);
    }

    public static MirrorYChunckPartRef(ref: number): number {
        return VoxelVertexData.ReOrder(ref, 4, 5, 6, 7, 0, 1, 2, 3);
    }

    public static MirrorZChunckPartRef(ref: number): number {
        return VoxelVertexData.ReOrder(ref, 3, 2, 1, 0, 7, 6, 5, 4);
    }

    private static _TryAddMirrorXChunckPart(ref: number, data: BABYLON.VertexData): boolean {
        let mirrorXRef = VoxelVertexData.MirrorXChunckPartRef(ref);
        if (!VoxelVertexData._VertexDatas.has(mirrorXRef)) {
            let mirrorXData = VoxelVertexData.MirrorX(data);
            VoxelVertexData._VertexDatas.set(mirrorXRef, new ExtendedVertexData(mirrorXRef, mirrorXData));
            VoxelVertexData._TryAddMirrorYChunckPart(mirrorXRef, mirrorXData);
            VoxelVertexData._TryAddMirrorZChunckPart(mirrorXRef, mirrorXData);
            return true;
        }
        return false;
    }

    private static _TryAddMirrorYChunckPart(ref: number, data: BABYLON.VertexData): boolean {
        let mirrorYRef = VoxelVertexData.MirrorYChunckPartRef(ref);
        if (!VoxelVertexData._VertexDatas.has(mirrorYRef)) {
            let mirrorYData = VoxelVertexData.MirrorY(data);
            VoxelVertexData._VertexDatas.set(mirrorYRef, new ExtendedVertexData(mirrorYRef, mirrorYData));
            VoxelVertexData._TryAddMirrorZChunckPart(mirrorYRef, mirrorYData);
            return true;
        }
        return false;
    }

    private static _TryAddMirrorZChunckPart(ref: number, data: BABYLON.VertexData): boolean {
        let mirrorZRef = VoxelVertexData.MirrorZChunckPartRef(ref);
        if (!VoxelVertexData._VertexDatas.has(mirrorZRef)) {
            let mirrorZData = VoxelVertexData.MirrorZ(data);
            VoxelVertexData._VertexDatas.set(mirrorZRef, new ExtendedVertexData(mirrorZRef, mirrorZData));
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

    private static _TryAddVariations(ref: number, data: BABYLON.VertexData): boolean {
        let useful = false;
        useful = VoxelVertexData._TryAddMirrorXChunckPart(ref, data) || useful;
        useful = VoxelVertexData._TryAddMirrorYChunckPart(ref, data) || useful;
        useful = VoxelVertexData._TryAddMirrorZChunckPart(ref, data) || useful;

        let rotatedXRef = ref;
        let rotatedXData = data;
        for (let j = 0; j < 3; j++) {
            rotatedXRef = VoxelVertexData.RotateXChunckPartRef(rotatedXRef);
            rotatedXData = VoxelVertexData.RotateX(rotatedXData);
            if (!VoxelVertexData._VertexDatas.has(rotatedXRef)) {
                VoxelVertexData._VertexDatas.set(rotatedXRef, new ExtendedVertexData(rotatedXRef, rotatedXData));
                useful = true;
            }
            useful = VoxelVertexData._TryAddMirrorXChunckPart(rotatedXRef, rotatedXData) || useful;
            useful = VoxelVertexData._TryAddMirrorYChunckPart(rotatedXRef, rotatedXData) || useful;
            useful = VoxelVertexData._TryAddMirrorZChunckPart(rotatedXRef, rotatedXData) || useful;
        }

        let rotatedYRef = ref;
        let rotatedYData = data;
        for (let j = 0; j < 3; j++) {
            rotatedYRef = VoxelVertexData.RotateYChunckPartRef(rotatedYRef);
            rotatedYData = VoxelVertexData.RotateY(rotatedYData);
            if (!VoxelVertexData._VertexDatas.has(rotatedYRef)) {
                VoxelVertexData._VertexDatas.set(rotatedYRef, new ExtendedVertexData(rotatedYRef, rotatedYData));
                useful = true;
            }
            useful = VoxelVertexData._TryAddMirrorXChunckPart(rotatedYRef, rotatedYData) || useful;
            useful = VoxelVertexData._TryAddMirrorYChunckPart(rotatedYRef, rotatedYData) || useful;
            useful = VoxelVertexData._TryAddMirrorZChunckPart(rotatedYRef, rotatedYData) || useful;
        }

        let rotatedZRef = ref;
        let rotatedZData = data;
        for (let j = 0; j < 3; j++) {
            rotatedZRef = VoxelVertexData.RotateZChunckPartRef(rotatedZRef);
            rotatedZData = VoxelVertexData.RotateZ(rotatedZData);
            if (!VoxelVertexData._VertexDatas.has(rotatedZRef)) {
                VoxelVertexData._VertexDatas.set(rotatedZRef, new ExtendedVertexData(rotatedZRef, rotatedZData));
                useful = true;
            }
            useful = VoxelVertexData._TryAddMirrorXChunckPart(rotatedZRef, rotatedZData) || useful;
            useful = VoxelVertexData._TryAddMirrorYChunckPart(rotatedZRef, rotatedZData) || useful;
            useful = VoxelVertexData._TryAddMirrorZChunckPart(rotatedZRef, rotatedZData) || useful;
        }

        return useful;
    }

    private static _AddChunckPartMesh(mesh: BABYLON.Mesh): boolean {
        let useful = false;
        let name = mesh.name;
        let ref = VoxelVertexData.NameToRef(name);
        if (ref === 0) {
            return false;
        }
        let data = BABYLON.VertexData.ExtractFromMesh(mesh);
        
        data.positions = data.positions.map((p: number) => {
            p += 0.5;
            return p;
        });
        
        if (!data.colors || data.colors.length / 4 != data.positions.length / 3) {
            let colors = [];
            for (let j = 0; j < data.positions.length / 3; j++) {
                colors.push(1, 1, 1, 1);
            }
            data.colors = colors;
        }
        mesh.dispose();
        if (!VoxelVertexData._VertexDatas.has(ref)) {
            VoxelVertexData._VertexDatas.set(ref, new ExtendedVertexData(ref, data));
            useful = true;
        }

        useful = VoxelVertexData._TryAddVariations(ref, data) || useful;

        if (!useful) {
            console.warn("Chunck-Part " + name + " is redundant.");
        }

        return useful;
    }

    private static async _LoadChunckVertexDatasFromFile(): Promise<void> {
        let filename = Config.chunckPartConfiguration.dir + "/" + Config.chunckPartConfiguration.filename;
        return new Promise<void>(
            resolve => {
                BABYLON.SceneLoader.ImportMesh(
                    "",
                    filename + "-lod-2.babylon",
                    "",
                    Game.Scene,
                    (meshes) => {
                        for (let i = 0; i < meshes.length; i++) {
                            let mesh = meshes[i];
                            if (mesh instanceof BABYLON.Mesh && mesh.name != "zero") {
                                VoxelVertexData._AddChunckPartMesh(mesh);
                            }
                        }
                        resolve();
                    }
                );
            }
        );
    }

    private static _LoadComposedChunckVertexDatas(): void {
        let ref13 = 0b10000010;
        let baseData13A = VoxelVertexData.Get(0b10000000);
        let baseData13B = VoxelVertexData.Get(0b00000010);
        let data13 = VoxelVertexData.Add(baseData13A.vertexData, baseData13B.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref13)) {
            VoxelVertexData._VertexDatas.set(ref13, new ExtendedVertexData(ref13, data13));
        }
        VoxelVertexData._TryAddVariations(ref13, data13);
        
        let ref0 = 0b01111111;
        let baseData0 = VoxelVertexData.Get(0b10000000);
        let data0 = VoxelVertexData.Flip(baseData0.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref0)) {
            VoxelVertexData._VertexDatas.set(ref0, new ExtendedVertexData(ref0, data0));
        }
        VoxelVertexData._TryAddVariations(ref0, data0);

        let ref10 = 0b00111111;
        let baseData10 = VoxelVertexData.Get(0b11000000);
        let data10 = VoxelVertexData.Flip(baseData10.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref10)) {
            VoxelVertexData._VertexDatas.set(ref10, new ExtendedVertexData(ref10, data10));
        }
        VoxelVertexData._TryAddVariations(ref10, data10);

        let ref11 = 0b01110111;
        let baseData11 = VoxelVertexData.Get(0b10001000);
        let data11 = VoxelVertexData.Flip(baseData11.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref11)) {
            VoxelVertexData._VertexDatas.set(ref11, new ExtendedVertexData(ref11, data11));
        }
        VoxelVertexData._TryAddVariations(ref11, data11);

        let ref1 = 0b00011111;
        let baseData1 = VoxelVertexData.Get(0b11100000);
        let data1 = VoxelVertexData.Flip(baseData1.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref1)) {
            VoxelVertexData._VertexDatas.set(ref1, new ExtendedVertexData(ref1, data1));
        }
        VoxelVertexData._TryAddVariations(ref1, data1);

        let ref12 = 0b00110111;
        let baseData12 = VoxelVertexData.Get(0b11001000);
        let data12 = VoxelVertexData.Flip(baseData12.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref12)) {
            VoxelVertexData._VertexDatas.set(ref12, new ExtendedVertexData(ref12, data12));
        }
        VoxelVertexData._TryAddVariations(ref12, data12);

        let ref2 = 0b11110101;
        let baseData2A = VoxelVertexData.Get(0b11110111);
        let baseData2B = VoxelVertexData.Get(0b11111101);
        let data2 = VoxelVertexData.Add(baseData2A.vertexData, baseData2B.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref2)) {
            VoxelVertexData._VertexDatas.set(ref2, new ExtendedVertexData(ref2, data2));
        }
        VoxelVertexData._TryAddVariations(ref2, data2);

        let ref3 = 0b01011010;
        let baseData3A = VoxelVertexData.Get(0b01011111);
        let baseData3B = VoxelVertexData.Get(0b11111010);
        let data3 = VoxelVertexData.Add(baseData3A.vertexData, baseData3B.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref3)) {
            VoxelVertexData._VertexDatas.set(ref3, new ExtendedVertexData(ref3, data3));
        }
        VoxelVertexData._TryAddVariations(ref3, data3);

        let ref4 = 0b10100100;
        let baseData4A = VoxelVertexData.Get(0b11100100);
        let baseData4B = VoxelVertexData.Get(0b10111111);
        let data4 = VoxelVertexData.Add(baseData4A.vertexData, baseData4B.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref4)) {
            VoxelVertexData._VertexDatas.set(ref4, new ExtendedVertexData(ref4, data4));
        }
        VoxelVertexData._TryAddVariations(ref4, data4);

        let ref5 = 0b11000011;
        let baseData5A = VoxelVertexData.Get(0b11001111);
        let baseData5B = VoxelVertexData.Get(0b11110011);
        let data5 = VoxelVertexData.Add(baseData5A.vertexData, baseData5B.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref5)) {
            VoxelVertexData._VertexDatas.set(ref5, new ExtendedVertexData(ref5, data5));
        }
        VoxelVertexData._TryAddVariations(ref5, data5);

        let ref6 = 0b01110101;
        let baseData6A = VoxelVertexData.Get(0b01110111);
        let baseData6B = VoxelVertexData.Get(0b11111101);
        let data6 = VoxelVertexData.Add(baseData6A.vertexData, baseData6B.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref6)) {
            VoxelVertexData._VertexDatas.set(ref6, new ExtendedVertexData(ref6, data6));
        }
        VoxelVertexData._TryAddVariations(ref6, data6);

        let ref7 = 0b01111101;
        let baseData7A = VoxelVertexData.Get(0b01111111);
        let baseData7B = VoxelVertexData.Get(0b11111101);
        let data7 = VoxelVertexData.Add(baseData7A.vertexData, baseData7B.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref7)) {
            VoxelVertexData._VertexDatas.set(ref7, new ExtendedVertexData(ref7, data7));
        }
        VoxelVertexData._TryAddVariations(ref7, data7);

        let ref8 = 0b11100101;
        let baseData8A = VoxelVertexData.Get(0b11101111);
        let baseData8B = VoxelVertexData.Get(0b11110101);
        let data8 = VoxelVertexData.Add(baseData8A.vertexData, baseData8B.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref8)) {
            VoxelVertexData._VertexDatas.set(ref8, new ExtendedVertexData(ref8, data8));
        }
        VoxelVertexData._TryAddVariations(ref8, data8);

        let ref9 = 0b11100001;
        let baseData9A = VoxelVertexData.Get(0b11101111);
        let baseData9B = VoxelVertexData.Get(0b11110001);
        let data9 = VoxelVertexData.Add(baseData9A.vertexData, baseData9B.vertexData);
        if (!VoxelVertexData._VertexDatas.has(ref9)) {
            VoxelVertexData._VertexDatas.set(ref9, new ExtendedVertexData(ref9, data9));
        }
        VoxelVertexData._TryAddVariations(ref9, data9);
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
            await VoxelVertexData._LoadChunckVertexDatasFromFile();
            VoxelVertexData._LoadComposedChunckVertexDatas();
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

    public static Get(ref: number): ExtendedVertexData {
        return VoxelVertexData._VertexDatas.get(ref);
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