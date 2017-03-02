var PlanetTools = (function () {
    function PlanetTools() {
    }
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
PlanetTools.CHUNCKSIZE = 32;
