var PlanetChunckMeshBuilder = (function () {
    function PlanetChunckMeshBuilder() {
    }
    PlanetChunckMeshBuilder.BuildVertexData = function (size, iPos, jPos, kPos, r, data) {
        var vertexData = new BABYLON.VertexData();
        var vertices = new Array();
        var positions = new Array();
        var indices = new Array();
        var uvs = new Array();
        for (var i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (var j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (var k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    if (data[i][j][k] !== 0) {
                        var y = i + iPos * PlanetTools.CHUNCKSIZE;
                        var z = j + jPos * PlanetTools.CHUNCKSIZE;
                        vertices[0] = PlanetTools.EvaluateVertex(size, y, z);
                        vertices[1] = PlanetTools.EvaluateVertex(size, y, z + 1);
                        vertices[2] = PlanetTools.EvaluateVertex(size, y + 1, z);
                        vertices[3] = PlanetTools.EvaluateVertex(size, y + 1, z + 1);
                        vertices[4] = vertices[0].multiply(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE + 1));
                        vertices[5] = vertices[1].multiply(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE + 1));
                        vertices[6] = vertices[2].multiply(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE + 1));
                        vertices[7] = vertices[3].multiply(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE + 1));
                        vertices[0].multiplyInPlace(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE));
                        vertices[1].multiplyInPlace(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE));
                        vertices[2].multiplyInPlace(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE));
                        vertices[3].multiplyInPlace(MeshTools.FloatVector(r + k + kPos * PlanetTools.CHUNCKSIZE));
                        if (i - 1 < 0 || data[i - 1][j][k] === 0) {
                            MeshTools.PushQuad(vertices, 1, 5, 4, 0, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                        }
                        if (j - 1 < 0 || data[i][j - 1][k] === 0) {
                            MeshTools.PushQuad(vertices, 0, 4, 6, 2, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                        }
                        if (k - 1 < 0 || data[i][j][k - 1] === 0) {
                            MeshTools.PushQuad(vertices, 0, 2, 3, 1, positions, indices);
                            MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
                        }
                        if (i + 1 >= PlanetTools.CHUNCKSIZE || data[i + 1][j][k] === 0) {
                            MeshTools.PushQuad(vertices, 2, 6, 7, 3, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                        }
                        if (j + 1 >= PlanetTools.CHUNCKSIZE || data[i][j + 1][k] === 0) {
                            MeshTools.PushQuad(vertices, 3, 7, 5, 1, positions, indices);
                            MeshTools.PushSideQuadUvs(data[i][j][k], uvs);
                        }
                        if (k + 1 >= PlanetTools.CHUNCKSIZE || data[i][j][k + 1] === 0) {
                            MeshTools.PushQuad(vertices, 4, 5, 7, 6, positions, indices);
                            MeshTools.PushTopQuadUvs(data[i][j][k], uvs);
                        }
                    }
                }
            }
        }
        var normals = new Array();
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;
        return vertexData;
    };
    PlanetChunckMeshBuilder.BuildWaterVertexData = function (size, iPos, jPos, kPos, rWater) {
        var vertexData = new BABYLON.VertexData();
        var vertices = new Array();
        var positions = new Array();
        var indices = new Array();
        var uvs = new Array();
        for (var i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (var j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                var y = i + iPos * PlanetTools.CHUNCKSIZE;
                var z = j + jPos * PlanetTools.CHUNCKSIZE;
                vertices[0] = PlanetTools.EvaluateVertex(size, y, z);
                vertices[1] = PlanetTools.EvaluateVertex(size, y, z + 1);
                vertices[2] = PlanetTools.EvaluateVertex(size, y + 1, z);
                vertices[3] = PlanetTools.EvaluateVertex(size, y + 1, z + 1);
                vertices[1].multiplyInPlace(MeshTools.FloatVector(rWater));
                vertices[2].multiplyInPlace(MeshTools.FloatVector(rWater));
                vertices[3].multiplyInPlace(MeshTools.FloatVector(rWater));
                vertices[0].multiplyInPlace(MeshTools.FloatVector(rWater));
                MeshTools.PushQuad(vertices, 0, 1, 3, 2, positions, indices);
                MeshTools.PushWaterUvs(uvs);
                MeshTools.PushQuad(vertices, 0, 2, 3, 1, positions, indices);
                MeshTools.PushWaterUvs(uvs);
            }
        }
        var normals = new Array();
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;
        return vertexData;
    };
    PlanetChunckMeshBuilder.BuildBedrockVertexData = function (size, iPos, jPos, kPos, r, data) {
        var vertexData = new BABYLON.VertexData();
        var vertices = new Array();
        var positions = new Array();
        var indices = new Array();
        var uvs = new Array();
        if (kPos === 0) {
            for (var i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
                for (var j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                    if (data[i][j][0] === 0) {
                        var y = i + iPos * PlanetTools.CHUNCKSIZE;
                        var z = j + jPos * PlanetTools.CHUNCKSIZE;
                        vertices[0] = PlanetTools.EvaluateVertex(size, y, z);
                        vertices[1] = PlanetTools.EvaluateVertex(size, y, z + 1);
                        vertices[2] = PlanetTools.EvaluateVertex(size, y + 1, z);
                        vertices[3] = PlanetTools.EvaluateVertex(size, y + 1, z + 1);
                        vertices[1].multiplyInPlace(MeshTools.FloatVector(r));
                        vertices[2].multiplyInPlace(MeshTools.FloatVector(r));
                        vertices[3].multiplyInPlace(MeshTools.FloatVector(r));
                        vertices[0].multiplyInPlace(MeshTools.FloatVector(r));
                        MeshTools.PushQuad(vertices, 0, 1, 3, 2, positions, indices);
                        MeshTools.PushWaterUvs(uvs);
                    }
                }
            }
        }
        var normals = new Array();
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;
        return vertexData;
    };
    return PlanetChunckMeshBuilder;
}());
