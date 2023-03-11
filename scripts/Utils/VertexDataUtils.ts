class VertexDataUtils {

    public static Merge(...datas: BABYLON.VertexData[]): BABYLON.VertexData {
        let mergedData = new BABYLON.VertexData();
        
        let positions = [];
        let indices = [];
        let normals = [];
        let uvs = [];
        let colors = [];

        for (let i = 0; i < datas.length; i++) {
            let offset = positions.length / 3;
            positions.push(...datas[i].positions);
            indices.push(...datas[i].indices.map(index => { return index + offset; }));
            normals.push(...datas[i].normals);
            if (datas[i].uvs) {
                uvs.push(...datas[i].uvs);
            }
            if (datas[i].colors) {
                colors.push(...datas[i].colors);
            }
        }

        mergedData.positions = positions;
        mergedData.indices = indices;
        mergedData.normals = normals;
        if (uvs.length > 0) {
            mergedData.uvs = uvs;
        }
        if (colors.length > 0) {
            mergedData.colors = colors;
        }

        return mergedData;
    }

    public static GetPlanePositions(
        f: number = 1,
        w: number = 1,
        h: number = 1,
        x0?: number,
        y0?: number,
    ): number[] {
        if (!isFinite(x0)) {
            x0 = - w * 0.5;
        }
        if (!isFinite(y0)) {
            y0 = - h * 0.5;
        }
        
        let x1 = x0 + w;
        let y1 = y0 + h * f;

        let positions = [
            x0, y0, 0,
            x1, y0, 0,
            x1, y1, 0,
            x0, y1, 0
        ];

        return positions;
    }
    
    public static GetPlaneUVs(
        f: number = 1,
        u0: number = 0,
        v0: number = 0,
        u1: number = 1,
        v1: number = 1
    ): number[] {
        let uvs = [
            u0, v0 * f + v1 * (1 - f),
            u1, v0 * f + v1 * (1 - f),
            u1, v1,
            u0, v1
        ];

        return uvs;
    }

    public static CreatePlane(
        w: number = 1,
        h: number = 1,
        x0?: number,
        y0?: number,
        u0: number = 0,
        v0: number = 0,
        u1: number = 1,
        v1: number = 1
    ) {
        if (!isFinite(x0)) {
            x0 = - w * 0.5;
        }
        if (!isFinite(y0)) {
            y0 = - h * 0.5;
        }

        let x1 = x0 + w;
        let y1 = y0 + h;

        let data = new BABYLON.VertexData();

        let positions = [
            x0, y0, 0,
            x1, y0, 0,
            x1, y1, 0,
            x0, y1, 0
        ];
        let indices = [
            0, 1, 2,
            0, 2, 3
        ];
        let normals = [
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1
        ];
        let uvs = [
            u0, v0,
            u1, v0,
            u1, v1,
            u0, v1
        ];

        data.positions = positions;
        data.indices = indices;
        data.normals = normals;
        data.uvs = uvs;

        return data;
    }

    public static MirrorX(data: BABYLON.VertexData): BABYLON.VertexData {
        let scaledData = new BABYLON.VertexData();

        let positions: number[] = [];
        for (let i = 0; i < data.positions.length / 3; i++) {
            positions[3 * i] = - data.positions[3 * i];
            positions[3 * i + 1] = data.positions[3 * i + 1];
            positions[3 * i + 2] = data.positions[3 * i + 2];
        }
        scaledData.positions = positions;

        let indices: number[] = [];
        for (let i = 0; i < data.indices.length / 3; i++) {
            indices[3 * i] = data.indices[3 * i];
            indices[3 * i + 1] = data.indices[3 * i + 2];
            indices[3 * i + 2] = data.indices[3 * i + 1];
        }
        scaledData.indices = indices;

        let normals: number[] = [];
        for (let i = 0; i < data.normals.length / 3; i++) {
            normals[3 * i] = - data.normals[3 * i];
            normals[3 * i + 1] = data.normals[3 * i + 1];
            normals[3 * i + 2] = data.normals[3 * i + 2];
        }
        scaledData.normals = normals;

        if (data.colors) {
            scaledData.colors = [...data.colors];
        }

        if (data.uvs) {
            scaledData.uvs = [...data.uvs];
        }

        return scaledData;
    }

    public static Scale(data: BABYLON.VertexData, s: number): BABYLON.VertexData {
        let scaledData = new BABYLON.VertexData();
        scaledData.positions = data.positions.map((n: number) => { return n * s; });
        scaledData.indices = [...data.indices];
        scaledData.normals = [...data.normals];
        if (data.colors) {
            scaledData.colors = [...data.colors];
        }
        if (data.uvs) {
            scaledData.uvs = [...data.uvs];
        }

        return scaledData;
    }
}