class PlanetTools {

    public static readonly CHUNCKSIZE = 32;
    public static readonly ALPHALIMIT = Math.PI / 4;
    public static readonly DISTANCELIMITSQUARED = 128 * 128;
    private static emptyVertexData: BABYLON.VertexData;

    public static EmptyVertexData(): BABYLON.VertexData {
        if (!PlanetTools.emptyVertexData) {
            let emptyMesh: BABYLON.Mesh = new BABYLON.Mesh("Empty", Game.Scene);
            PlanetTools.emptyVertexData = BABYLON.VertexData.ExtractFromMesh(emptyMesh);
            emptyMesh.dispose();
        }
        return PlanetTools.emptyVertexData;
    }

    public static QuaternionForSide(side: Side): BABYLON.Quaternion {
        if (side === Side.Right) {
            return BABYLON.Quaternion.Identity();
        }
        else if (side === Side.Left) {
            return BABYLON.Quaternion.RotationAxis(
                BABYLON.Vector3.Up(),
                Math.PI
            );
        }
        else if (side === Side.Front) {
            return BABYLON.Quaternion.RotationAxis(
                BABYLON.Vector3.Up(),
                (3 * Math.PI) / 2.0
            );
        }
        else if (side === Side.Back) {
            return BABYLON.Quaternion.RotationAxis(
                BABYLON.Vector3.Up(),
                Math.PI / 2.0
            );
        }
        else if (side === Side.Top) {
            return BABYLON.Quaternion.RotationAxis(
                new BABYLON.Vector3(0, 0, 1),
                Math.PI / 2.0
            );
        }
        else if (side === Side.Bottom) {
            return BABYLON.Quaternion.RotationAxis(
                new BABYLON.Vector3(0, 0, 1),
                (3 * Math.PI) / 2.0
            );
        }
    }

    public static EvaluateVertex(
        size: number,
        i: number,
        j: number
    ): BABYLON.Vector3 {
        let xRad: number = 45.0;
        let yRad: number = -45.0 + 90.0 * (j / size);
        let zRad: number = -45.0 + 90.0 * (i / size);

        xRad = (xRad / 180.0) * Math.PI;
        yRad = (yRad / 180.0) * Math.PI;
        zRad = (zRad / 180.0) * Math.PI;

        return new BABYLON.Vector3(Math.sin(xRad) / Math.cos(xRad), Math.sin(yRad) / Math.cos(yRad), Math.sin(zRad) / Math.cos(zRad)).normalize();
    }

    public static FilledData(): number[][][] {
        let data: number[][][] = [];

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = [];
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    data[i][j][k] = 129;
                }
            }
        }
        return data;
    }

    public static RandomData(): number[][][] {
        let data: number[][][] = [];
        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = [];
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    if (Math.random() < 0.5) {
                        data[i][j][k] = 0;
                    } else {
                        data[i][j][k] = Math.floor(Math.random() * 7 + 129);
                    }
                }
            }
        }
        return data;
    }

    public static DataFromHexString(
        hexString: string
    ): number[][][] {
        if (hexString.length !== PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE * 2) {
            console.log(
                "Invalid HexString. Length is =" +
                    hexString.length +
                    ". Expected length is = " +
                    PlanetTools.CHUNCKSIZE *
                        PlanetTools.CHUNCKSIZE *
                        PlanetTools.CHUNCKSIZE *
                        2 +
                    "."
            );
            return;
        }
        let data: number[][][] = [];
        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = [];
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    let index: number = 2 * (i * PlanetTools.CHUNCKSIZE * PlanetTools.CHUNCKSIZE + j * PlanetTools.CHUNCKSIZE + k);
                    data[i][j][k] = parseInt( hexString.slice(index, index + 2), 16);
                }
            }
        }
        return data;
    }

    public static HexStringFromData(data: number[][][]): string {
        let hexString: string = "";
        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    hexString += data[i][j][k].toString(16);
                }
            }
        }
        return hexString;
    }

    public static WorldPositionToPlanetSide(
        planet: Planet,
        worldPos: BABYLON.Vector3
    ): PlanetSide {
        let angles: number[] = [];
        angles[Side.Back] = MeshTools.Angle(BABYLON.Axis.Z.scale(-1), worldPos);
        angles[Side.Right] = MeshTools.Angle(BABYLON.Axis.X, worldPos);
        angles[Side.Left] = MeshTools.Angle( BABYLON.Axis.X.scale(-1), worldPos);
        angles[Side.Top] = MeshTools.Angle(BABYLON.Axis.Y, worldPos);
        angles[Side.Bottom] = MeshTools.Angle( BABYLON.Axis.Y.scale(-1), worldPos);
        angles[Side.Front] = MeshTools.Angle(BABYLON.Axis.Z, worldPos);

        let min: number = Math.min(...angles);
        let sideIndex: Side = angles.indexOf(min);
        return planet.GetSide(sideIndex);
    }

    public static WorldPositionToGlobalIJK(
        planetSide: PlanetSide,
        worldPos: BABYLON.Vector3
    ): { i: number; j: number; k: number } {
        let invert: BABYLON.Matrix = new BABYLON.Matrix();
        planetSide.getWorldMatrix().invertToRef(invert);
        let localPos: BABYLON.Vector3 = BABYLON.Vector3.TransformCoordinates(worldPos, invert);
        let r: number = localPos.length();

        if (Math.abs(localPos.x) > 1) {
            localPos = localPos.scale(1 / localPos.x);
        }
        if (Math.abs(localPos.y) > 1) {
            localPos = localPos.scale(1 / localPos.y);
        }
        if (Math.abs(localPos.z) > 1) {
            localPos = localPos.scale(1 / localPos.z);
        }

        let yDeg: number = (Math.atan(localPos.y) / Math.PI) * 180;
        let zDeg: number = (Math.atan(localPos.z) / Math.PI) * 180;
        console.log("YDeg : " + yDeg);
        console.log("ZDeg : " + zDeg);

        let k: number = Math.floor(r);
        let i: number = Math.floor(((zDeg + 45) / 90) * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));
        let j: number = Math.floor(((yDeg + 45) / 90) * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));

        return { i: i, j: j, k: k };
    }

    public static GlobalIJKToLocalIJK(
        planetSide: PlanetSide,
        global: { i: number; j: number; k: number }
    ): { planetChunck: PlanetChunck; i: number; j: number; k: number } {
        return {
            planetChunck: planetSide.GetChunck(Math.floor(global.i / PlanetTools.CHUNCKSIZE), Math.floor(global.j / PlanetTools.CHUNCKSIZE), Math.floor(global.k / PlanetTools.CHUNCKSIZE)),
            i: global.i % PlanetTools.CHUNCKSIZE,
            j: global.j % PlanetTools.CHUNCKSIZE,
            k: global.k % PlanetTools.CHUNCKSIZE,
        };
    }

    public static KGlobalToDegree(k: number): number {
        return PlanetTools.KPosToDegree(Math.floor(k / PlanetTools.CHUNCKSIZE));
    }

    public static KPosToDegree(kPos: number): number {
        return PlanetTools.KPosToDegree32(kPos);
    }

    public static KPosToDegree16(kPos: number): number {
        if (kPos < 1) {
            return 4;
        }
        else if (kPos < 2) {
            return 5;
        }
        else if (kPos < 4) {
            return 6;
        }
        else if (kPos < 7) {
            return 7;
        }
        else if (kPos < 13) {
            return 8;
        }
        return 9;
    }

    public static KPosToDegree32(kPos: number): number {
        if (kPos < 1) {
            return 5;
        }
        else if (kPos < 2) {
            return 6;
        }
        else if (kPos < 4) {
            return 7;
        }
        else if (kPos < 7) {
            return 8;
        }
        return 9;
    }

    public static DegreeToSize(degree: number): number {
        return Math.pow(2, degree);
    }

    public static DegreeToChuncksCount(degree: number): number {
        return PlanetTools.DegreeToSize(degree) / PlanetTools.CHUNCKSIZE;
    }

    public static StringColorRGBInterpolation(c1: string, c2: string, dt: number): string {
        let offset1 = 0;
        if (c1[0] === "#") {
            offset1 = 1;
        }
        let r1 = parseInt(c1.substr(0 + offset1, 2), 16);
        let g1 = parseInt(c1.substr(2 + offset1, 2), 16);
        let b1 = parseInt(c1.substr(4 + offset1, 2), 16);
        let offset2 = 0;
        if (c2[0] === "#") {
            offset2 = 1;
        }
        let r2 = parseInt(c2.substr(0 + offset1, 2), 16);
        let g2 = parseInt(c2.substr(2 + offset1, 2), 16);
        let b2 = parseInt(c2.substr(4 + offset1, 2), 16);

        let r = Math.round(r1 * (1 - dt) + r2 * dt);
        let g = Math.round(g1 * (1 - dt) + g2 * dt);
        let b = Math.round(b1 * (1 - dt) + b2 * dt);
        let rs = "00" + r.toString(16);
        rs = rs.substr(-2, 2);
        let gs = "00" + g.toString(16);
        gs = gs.substr(-2, 2);
        let bs = "00" + b.toString(16);
        bs = bs.substr(-2, 2);

        return "#" + rs + gs + bs;
    }
}
