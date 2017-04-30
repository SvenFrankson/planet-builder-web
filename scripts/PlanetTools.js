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
    PlanetTools.WorldPositionToPlanetSide = function (planet, worldPos) {
        var angles = new Array();
        angles[Side.Back] = MeshTools.Angle(BABYLON.Axis.Z.multiply(MeshTools.FloatVector(-1)), worldPos);
        angles[Side.Right] = MeshTools.Angle(BABYLON.Axis.X, worldPos);
        angles[Side.Left] = MeshTools.Angle(BABYLON.Axis.X.multiply(MeshTools.FloatVector(-1)), worldPos);
        angles[Side.Top] = MeshTools.Angle(BABYLON.Axis.Y, worldPos);
        angles[Side.Bottom] = MeshTools.Angle(BABYLON.Axis.Y.multiply(MeshTools.FloatVector(-1)), worldPos);
        angles[Side.Front] = MeshTools.Angle(BABYLON.Axis.Z, worldPos);
        var min = Math.min.apply(Math, angles);
        var sideIndex = angles.indexOf(min);
        return planet.GetSide(sideIndex);
    };
    PlanetTools.WorldPositionToGlobalIJK = function (planetSide, worldPos) {
        var invert = new BABYLON.Matrix();
        planetSide.getWorldMatrix().invertToRef(invert);
        var localPos = BABYLON.Vector3.TransformCoordinates(worldPos, invert);
        var r = localPos.length();
        if (Math.abs(localPos.x) > 1) {
            localPos = localPos.divide(MeshTools.FloatVector(localPos.x));
        }
        if (Math.abs(localPos.y) > 1) {
            localPos = localPos.divide(MeshTools.FloatVector(localPos.y));
        }
        if (Math.abs(localPos.z) > 1) {
            localPos = localPos.divide(MeshTools.FloatVector(localPos.z));
        }
        var yDeg = Math.atan(localPos.y) / Math.PI * 180;
        var zDeg = Math.atan(localPos.z) / Math.PI * 180;
        console.log("YDeg : " + yDeg);
        console.log("ZDeg : " + zDeg);
        var i = Math.floor((zDeg + 45) / 90 * planetSide.GetSize());
        var j = Math.floor((yDeg + 45) / 90 * planetSide.GetSize());
        var k = Math.floor(r - planetSide.GetRadiusZero());
        console.log("R : " + r);
        console.log("RadiusZero : " + planetSide.GetRadiusZero());
        return { i: i, j: j, k: k };
    };
    PlanetTools.GlobalIJKToLocalIJK = function (planetSide, global) {
        return {
            planetChunck: planetSide.GetChunck(Math.floor(global.i / PlanetTools.CHUNCKSIZE), Math.floor(global.j / PlanetTools.CHUNCKSIZE), Math.floor(global.k / PlanetTools.CHUNCKSIZE)),
            i: global.i % PlanetTools.CHUNCKSIZE,
            j: global.j % PlanetTools.CHUNCKSIZE,
            k: global.k % PlanetTools.CHUNCKSIZE
        };
    };
    return PlanetTools;
}());
PlanetTools.CHUNCKSIZE = 16;
