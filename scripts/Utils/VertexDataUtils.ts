class VertexDataUtils {

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