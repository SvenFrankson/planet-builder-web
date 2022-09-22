var PI4 = Math.PI / 4;
var PI2 = Math.PI / 2;
var PI = Math.PI;

class PlanetTools {

    public static readonly CHUNCKSIZE = 8;
    public static readonly ALPHALIMIT = Math.PI / 4;
    public static readonly DISTANCELIMITSQUARED = 128 * 128;

    private static _emptyVertexData: BABYLON.VertexData;
    public static EmptyVertexData(): BABYLON.VertexData {
        if (!PlanetTools._emptyVertexData) {
            let emptyMesh: BABYLON.Mesh = new BABYLON.Mesh("Empty", Game.Scene);
            PlanetTools._emptyVertexData = BABYLON.VertexData.ExtractFromMesh(emptyMesh);
            emptyMesh.dispose();
        }
        return PlanetTools._emptyVertexData;
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
        let xRad: number = PI4;
        let yRad: number = - PI4 + PI2 * (j / size);
        let zRad: number = - PI4 + PI2 * (i / size);

        return new BABYLON.Vector3(Math.tan(xRad), Math.tan(yRad), Math.tan(zRad)).normalize();
    }

    public static Data(callback: (i: number, j: number, k: number) => number): number[][][] {
        let data: number[][][] = [];

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = [];
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    data[i][j][k] = callback(i, j, k);
                }
            }
        }
        
        return data;
    }

    public static FilledData(): number[][][] {
        let data: number[][][] = [];

        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            data[i] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                data[i][j] = [];
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    //data[i][j][k] = 128 + 9 + Math.floor(4 * Math.random());
                    data[i][j][k] = 3;
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
                    }
                    else {
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

        let k: number = PlanetTools.AltitudeToKGlobal(r);
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
        return PlanetTools.KPosToDegree8(kPos);
    }

    private static _BSizes: number[][];
    public static get BSizes(): number[][] {
        if (!PlanetTools._BSizes) {
            PlanetTools._ComputeBSizes();
        }
        return PlanetTools._BSizes;
    }
    private static _Altitudes: number[][];
    public static get Altitudes(): number[][] {
        if (!PlanetTools._Altitudes) {
            PlanetTools._ComputeBSizes();
        }
        return PlanetTools._Altitudes;
    }
    private static _SummedBSizesLength: number[];
    public static get SummedBSizesLength(): number[] {
        if (!PlanetTools._SummedBSizesLength) {
            PlanetTools._ComputeBSizes();
        }
        return PlanetTools._SummedBSizesLength;
    }
    
    private static _ComputeBSizes(): void {
        PlanetTools._BSizes = [];
        PlanetTools._Altitudes = [];
        PlanetTools._SummedBSizesLength = [];
        let coreRadius = 7.6;
        let radius = coreRadius;
        let degree = 4;
        let bSizes = [];
        let altitudes = [];
        let summedBSizesLength = 0;
        while (radius < 1000) {
            let size = PlanetTools.DegreeToSize(degree);
            for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
                let a = Math.PI / 2 / size;
                let s = a * radius;
                bSizes.push(s);
                altitudes.push(radius);
                radius = radius + s;
            }
            let a = Math.PI / 2 / size;
            let s = a * radius;
            if (s > 1.3) {
                PlanetTools._SummedBSizesLength[degree] = summedBSizesLength;
                summedBSizesLength += bSizes.length;
                PlanetTools._BSizes[degree] = [...bSizes];
                bSizes = [];
                PlanetTools._Altitudes[degree] = [...altitudes];
                altitudes = [];
                degree++;
            }
        }
    }

    public static KPosToDegree8(kPos: number): number {
        let degree = 4;
        while (degree < PlanetTools.BSizes.length) {
            let size = PlanetTools.BSizes[degree].length / PlanetTools.CHUNCKSIZE;
            if (kPos < size) {
                return degree;
            }
            else {
                kPos -= size;
                degree++;
            }
        }
    }

    public static RecursiveFind(data: number[], value: number, nMin: number, nMax: number): number {
        let n = Math.floor(nMin * 0.5 + nMax * 0.5);
        if (nMax - nMin === 1) {
          return n; 
        }
        let vn = data[n];
        if (nMax - nMin === 2) {
          if (vn > value) {
            return n - 1; 
          }
          else {
            return n; 
          }
        }
        if (vn > value) {
          return PlanetTools.RecursiveFind(data, value, nMin, n);
        }
        else {
          return PlanetTools.RecursiveFind(data, value, n, nMax);
        }
      }

    public static AltitudeToKGlobal(altitude: number): number {
        let degree = 4;
        while (degree < PlanetTools.Altitudes.length - 1) {
            let highest = PlanetTools.Altitudes[degree + 1][0];
            if (altitude < highest) {
                break;
            }
            else {
                altitude -= highest;
                degree++;
            }
        }
        let altitudes = PlanetTools.Altitudes[degree];
        let summedLength = PlanetTools.SummedBSizesLength[degree];
        return summedLength + PlanetTools.RecursiveFind(altitudes, altitude, 0, altitudes.length);
    }

    public static KGlobalToAltitude(kGlobal: number): number {
        let degree = PlanetTools.KGlobalToDegree(kGlobal);
        let altitudes = PlanetTools.Altitudes[degree];
        let summedLength = PlanetTools.SummedBSizesLength[degree];
        return altitudes[kGlobal - summedLength];
    }

    /*
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
    */

    public static DegreeToSize(degree: number): number {
        return Math.pow(2, degree);
    }

    public static DegreeToChuncksCount(degree: number): number {
        return PlanetTools.DegreeToSize(degree) / PlanetTools.CHUNCKSIZE;
    }
}
