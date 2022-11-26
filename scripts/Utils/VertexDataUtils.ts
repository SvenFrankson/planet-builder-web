class VertexDataUtils {

    public static Scale(data: BABYLON.VertexData, s: number): BABYLON.VertexData {
        let scaledData = new BABYLON.VertexData();
        scaledData.positions = data.positions.map(n => { return n * s; });
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