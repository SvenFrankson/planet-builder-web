var MeshTools = (function () {
    function MeshTools() {
    }
    MeshTools.FloatVector = function (size) {
        return new BABYLON.Vector3(size, size, size);
    };
    MeshTools.PushTriangle = function (vertices, a, b, c, positions, indices) {
        var index = positions.length / 3;
        for (var n in vertices[a]) {
            if (vertices[a] != null) {
                positions.push(vertices[a][n]);
            }
        }
        for (var n in vertices[b]) {
            if (vertices[b] != null) {
                positions.push(vertices[b][n]);
            }
        }
        for (var n in vertices[c]) {
            if (vertices[c] != null) {
                positions.push(vertices[c][n]);
            }
        }
        indices.push(index);
        indices.push(index + 1);
        indices.push(index + 2);
    };
    MeshTools.PushQuad = function (vertices, a, b, c, d, positions, indices) {
        var index = positions.length / 3;
        positions.push(vertices[a].x);
        positions.push(vertices[a].y);
        positions.push(vertices[a].z);
        positions.push(vertices[b].x);
        positions.push(vertices[b].y);
        positions.push(vertices[b].z);
        positions.push(vertices[c].x);
        positions.push(vertices[c].y);
        positions.push(vertices[c].z);
        positions.push(vertices[d].x);
        positions.push(vertices[d].y);
        positions.push(vertices[d].z);
        indices.push(index);
        indices.push(index + 2);
        indices.push(index + 1);
        indices.push(index + 3);
        indices.push(index + 2);
        indices.push(index);
    };
    MeshTools.PushTopQuadUvs = function (block, uvs) {
        uvs.push(0 + (block - 1) * 0.25);
        uvs.push(0.75);
        uvs.push(0 + (block - 1) * 0.25);
        uvs.push(1);
        uvs.push(0.25 + (block - 1) * 0.25);
        uvs.push(1);
        uvs.push(0.25 + (block - 1) * 0.25);
        uvs.push(0.75);
    };
    MeshTools.PushSideQuadUvs = function (block, uvs) {
        uvs.push(0 + (block - 1) * 0.25);
        uvs.push(0.25);
        uvs.push(0 + (block - 1) * 0.25);
        uvs.push(0.5);
        uvs.push(0.25 + (block - 1) * 0.25);
        uvs.push(0.5);
        uvs.push(0.25 + (block - 1) * 0.25);
        uvs.push(0.25);
    };
    MeshTools.VertexDataFromJSON = function (jsonData) {
        var tmp = JSON.parse(jsonData);
        var vertexData = new BABYLON.VertexData();
        vertexData.positions = tmp.positions;
        vertexData.normals = tmp.normals;
        vertexData.matricesIndices = tmp.matricesIndices;
        vertexData.matricesWeights = tmp.matricesWeights;
        vertexData.indices = tmp.indices;
        return vertexData;
    };
    return MeshTools;
}());
