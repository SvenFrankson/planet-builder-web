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
        var yRad = -45.0 + 90.0 * (i / size);
        var zRad = -45.0 + 90.0 * (j / size);
        xRad = xRad / 180.0 * Math.PI;
        yRad = yRad / 180.0 * Math.PI;
        zRad = zRad / 180.0 * Math.PI;
        return new BABYLON.Vector3(Math.sin(xRad) / Math.cos(xRad), Math.sin(yRad) / Math.cos(yRad), Math.sin(zRad) / Math.cos(zRad)).normalize();
    };
    return PlanetTools;
}());
PlanetTools.CHUNCKSIZE = 8;
