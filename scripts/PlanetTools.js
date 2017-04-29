var PlanetTools = (function () {
    function PlanetTools() {
    }
    PlanetTools.QuaternionForSide = function (side) {
        if (side === Side.Right) {
            return BABYLON.Quaternion.Identity();
        }
        else if (side === Side.Left) {
            return BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), Math.PI);
        }
        else if (side === Side.Front) {
            return BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), 3 * Math.PI / 2.0);
        }
        else if (side === Side.Back) {
            return BABYLON.Quaternion.RotationAxis(BABYLON.Vector3.Up(), Math.PI / 2.0);
        }
        else if (side === Side.Top) {
            return BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), Math.PI / 2.0);
        }
        else if (side === Side.Bottom) {
            return BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 0, 1), 3 * Math.PI / 2.0);
        }
    };
    PlanetTools.EvaluateVertex = function (size, i, j) {
        var xRad = 45.0;
        var yRad = -45.0 + 90.0 * (j / size);
        var zRad = -45.0 + 90.0 * (i / size);
        xRad = xRad / 180.0 * Math.PI;
        yRad = yRad / 180.0 * Math.PI;
        zRad = zRad / 180.0 * Math.PI;
        return new BABYLON.Vector3(Math.sin(xRad) / Math.cos(xRad), Math.sin(yRad) / Math.cos(yRad), Math.sin(zRad) / Math.cos(zRad)).normalize();
    };
    PlanetTools.DataFromHexString = function (hexString) {
        if (hexString.length !== PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * 2) {
            console.log("Invalid HexString. Length is =" + hexString.length +
                ". Expected length is = " + (PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * 2) + ".");
            return null;
        }
        var data = new Array();
        for (var i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = new Array();
            for (var j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = new Array();
                for (var k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    var index = 2 * (i * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE + j * PlanetTools.CHUNCKSIZE + k);
                    data[i][j][k] = parseInt(hexString.slice(index, index + 2), 16);
                }
            }
        }
        return data;
    };
    PlanetTools.HexStringFromData = function (data) {
        var hexString = "";
        for (var i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (var j = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (var k = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    hexString += data[i][j][k].toString(16);
                }
            }
        }
        return hexString;
    };
    return PlanetTools;
}());
PlanetTools.CHUNCKSIZE = 16;
