var MeshTools = (function () {
    function MeshTools() {
    }
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
        for (var n in vertices[d]) {
            if (vertices[d] != null) {
                positions.push(vertices[d][n]);
            }
        }
        indices.push(index);
        indices.push(index + 2);
        indices.push(index + 1);
        indices.push(index + 3);
        indices.push(index + 2);
        indices.push(index);
    };
    return MeshTools;
}());
