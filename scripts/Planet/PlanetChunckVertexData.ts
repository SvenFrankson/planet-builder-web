class PlanetChunckVertexData {

    private static _VertexDatas: Map<number, BABYLON.VertexData> = new Map<number, BABYLON.VertexData>();

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

    public static RotateYChunckPartRef(ref: number): number {
        return PlanetChunckVertexData.ReOrder(ref, 1, 2, 3, 0, 5, 6, 7, 4);
    }

    public static FlipChunckPartRef(ref: number): number {
        return ref ^ 0b11111111;
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

    private static _TryAddMirrorXChunckPart(ref: number, data: BABYLON.VertexData): boolean {
        let mirrorXRef = PlanetChunckVertexData.MirrorXChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas.has(mirrorXRef)) {
            let mirrorXData = PlanetChunckVertexData.MirrorX(data);
            PlanetChunckVertexData._VertexDatas.set(mirrorXRef, mirrorXData);
            PlanetChunckVertexData._TryAddMirrorZChunckPart(mirrorXRef, mirrorXData);
            return true;
        }
        return false;
    }

    private static _TryAddMirrorYChunckPart(ref: number, data: BABYLON.VertexData): boolean {
        let mirrorYRef = PlanetChunckVertexData.MirrorYChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas.has(mirrorYRef)) {
            let mirrorYData = PlanetChunckVertexData.MirrorY(data);
            PlanetChunckVertexData._VertexDatas.set(mirrorYRef, mirrorYData);
            PlanetChunckVertexData._TryAddMirrorZChunckPart(mirrorYRef, mirrorYData);
            return true;
        }
        return false;
    }

    private static _TryAddMirrorZChunckPart(ref: number, data: BABYLON.VertexData): boolean {
        let mirrorZRef = PlanetChunckVertexData.MirrorZChunckPartRef(ref);
        if (!PlanetChunckVertexData._VertexDatas.has(mirrorZRef)) {
            let mirrorZData = PlanetChunckVertexData.MirrorZ(data);
            PlanetChunckVertexData._VertexDatas.set(mirrorZRef, mirrorZData);
            return true;
        }
        return false;
    }

    private static async _LoadChunckVertexDatas(): Promise<void> {
        return new Promise<void>(
            resolve => {
                BABYLON.SceneLoader.ImportMesh(
                    "",
                    "./datas/meshes/chunck-parts.babylon",
                    "",
                    Game.Scene,
                    (meshes) => {
                        for (let i = 0; i < meshes.length; i++) {
                            let mesh = meshes[i];
                            if (mesh instanceof BABYLON.Mesh && mesh.name != "zero") {
                                let useful = false;
                                let name = mesh.name;
                                let ref = PlanetChunckVertexData.NameToRef(name);
                                let data = BABYLON.VertexData.ExtractFromMesh(mesh);
                                //data.positions = data.positions.map((n: number) => { return n * 0.98 + 0.01; });
                                if (!data.colors || data.colors.length / 4 != data.positions.length / 3) {
                                    let colors = [];
                                    for (let j = 0; j < data.positions.length / 3; j++) {
                                        colors.push(1, 1, 1, 1);
                                    }
                                    data.colors = colors;
                                }
                                mesh.dispose();
                                if (!PlanetChunckVertexData._VertexDatas.has(ref)) {
                                    PlanetChunckVertexData._VertexDatas.set(ref, data);
                                    useful = true;
                                }

                                useful = PlanetChunckVertexData._TryAddMirrorXChunckPart(ref, data) || useful;
                                useful = PlanetChunckVertexData._TryAddMirrorYChunckPart(ref, data) || useful;
                                useful = PlanetChunckVertexData._TryAddMirrorZChunckPart(ref, data) || useful;

                                let rotatedRef = ref;
                                for (let j = 0; j < 3; j++) {
                                    rotatedRef = PlanetChunckVertexData.RotateYChunckPartRef(rotatedRef);
                                    data = PlanetChunckVertexData.RotateY(data, - Math.PI / 2);
                                    if (!PlanetChunckVertexData._VertexDatas.has(rotatedRef)) {
                                        PlanetChunckVertexData._VertexDatas.set(rotatedRef, data);
                                        useful = true;
                                    }
                                    useful = PlanetChunckVertexData._TryAddMirrorXChunckPart(rotatedRef, data) || useful;
                                    useful = PlanetChunckVertexData._TryAddMirrorYChunckPart(rotatedRef, data) || useful;
                                    useful = PlanetChunckVertexData._TryAddMirrorZChunckPart(rotatedRef, data) || useful;
                                }

                                if (!useful) {
                                    console.warn("Chunck-Part " + name + " is redundant.");
                                }
                            }
                        }
                        resolve();
                    }
                );
            }
        );
    }

    public static async InitializeData(): Promise<boolean> {
        await PlanetChunckVertexData._LoadChunckVertexDatas();
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

    public static Get(ref: number): BABYLON.VertexData {
        return PlanetChunckVertexData._VertexDatas.get(ref);
    }

    public static RotateY(baseData: BABYLON.VertexData, angle: number): BABYLON.VertexData {
        let data = new BABYLON.VertexData();
        let positions = [...baseData.positions];
        let normals: number[];
        if (baseData.normals && baseData.normals.length === baseData.positions.length) {
            normals = [...baseData.normals];
        }
        data.indices = [...baseData.indices];

        let cosa = Math.cos(angle);
        let sina = Math.sin(angle);
        for (let i = 0; i < positions.length / 3; i++) {
            let x = positions[3 * i] - 0.5;
            let z = positions[3 * i + 2] - 0.5;
            positions[3 * i] = x * cosa - z * sina + 0.5;
            positions[3 * i + 2] =  x * sina + z * cosa + 0.5;
            if (normals) {
                let xn = normals[3 * i];
                let zn = normals[3 * i + 2];
                normals[3 * i] = xn * cosa - zn * sina;
                normals[3 * i + 2] =  xn * sina + zn * cosa;
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