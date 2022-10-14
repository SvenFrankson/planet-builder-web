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
        if (side === Side.Top) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z, BABYLON.Axis.Y, BABYLON.Axis.X.scale(-1));
        }
        else if (side === Side.Left) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z.scale(-1), BABYLON.Axis.X.scale(-1), BABYLON.Axis.Y);
        }
        else if (side === Side.Front) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.X.scale(-1), BABYLON.Axis.Z, BABYLON.Axis.Y);
        }
        else if (side === Side.Back) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.X, BABYLON.Axis.Z.scale(-1), BABYLON.Axis.Y);
        }
        else if (side === Side.Right) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z, BABYLON.Axis.X, BABYLON.Axis.Y);
        }
        else if (side === Side.Bottom) {
            return BABYLON.Quaternion.RotationQuaternionFromAxis(BABYLON.Axis.Z, BABYLON.Axis.Y.scale(-1), BABYLON.Axis.X);
        }
    }

    public static EvaluateVertex(
        size: number,
        i: number,
        j: number
    ): BABYLON.Vector3 {
        if (i < 0) {
            let v = PlanetTools.EvaluateVertex(size, i + size, j);
            return new BABYLON.Vector3(- v.y, v.x, v.z);
        }
        if (i > size) {
            let v = PlanetTools.EvaluateVertex(size, i - size, j);
            return new BABYLON.Vector3(v.y, - v.x, v.z);
        }
        if (j < 0) {
            let v = PlanetTools.EvaluateVertex(size, i, j + size);
            return new BABYLON.Vector3(v.x, v.z, - v.y);
        }
        if (j > size) {
            let v = PlanetTools.EvaluateVertex(size, i, j - size);
            return new BABYLON.Vector3(v.x, - v.z, v.y);
        }
        let xRad: number = - PI4 + PI2 * (i / size);
        let zRad: number = - PI4 + PI2 * (j / size);

        return new BABYLON.Vector3(Math.tan(xRad), 1, Math.tan(zRad)).normalize();
    }

    public static Data(refData: number[][][], callback: (i: number, j: number, k: number) => number): void {
        for (let i: number = 0; i < PlanetTools.CHUNCKSIZE; i++) {
            refData[i] = [];
            for (let j: number = 0; j < PlanetTools.CHUNCKSIZE; j++) {
                refData[i][j] = [];
                for (let k: number = 0; k < PlanetTools.CHUNCKSIZE; k++) {
                    refData[i][j][k] = callback(i, j, k);
                }
            }
        }
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
        let ax = Math.abs(worldPos.x);
        let ay = Math.abs(worldPos.y);
        let az = Math.abs(worldPos.z);
        if (ax >= ay && ax >= az) {
            if (worldPos.x >= 0) {
                return planet.GetSide(Side.Right);
            }
            return planet.GetSide(Side.Left);
        }
        if (ay >= ax && ay >= az) {
            if (worldPos.y >= 0) {
                return planet.GetSide(Side.Top);
            }
            return planet.GetSide(Side.Bottom);
        }
        if (az >= ax && az >= ay) {
            if (worldPos.z >= 0) {
                return planet.GetSide(Side.Front);
            }
            return planet.GetSide(Side.Back);
        }
    }

    public static WorldPositionToGlobalIJK(
        planetSide: PlanetSide,
        worldPos: BABYLON.Vector3
    ): { i: number; j: number; k: number } {
        let invert: BABYLON.Matrix = new BABYLON.Matrix();
        planetSide.computeWorldMatrix(true).invertToRef(invert);
        let localPos: BABYLON.Vector3 = BABYLON.Vector3.TransformCoordinates(worldPos, invert);
        let r: number = localPos.length();

        if (Math.abs(localPos.x) > 1) {
            localPos.scaleInPlace(Math.abs(1 / localPos.x));
        }
        if (Math.abs(localPos.y) > 1) {
            localPos.scaleInPlace(Math.abs(1 / localPos.y));
        }
        if (Math.abs(localPos.z) > 1) {
            localPos.scaleInPlace(Math.abs(1 / localPos.z));
        }

        let xDeg: number = (Math.atan(localPos.x) / Math.PI) * 180;
        let zDeg: number = (Math.atan(localPos.z) / Math.PI) * 180;

        let k: number = PlanetTools.AltitudeToKGlobal(r);
        let i: number = Math.floor(((xDeg + 45) / 90) * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));
        let j: number = Math.floor(((zDeg + 45) / 90) * PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(k)));

        return { i: i, j: j, k: k };
    }

    public static GlobalIJKToWorldPosition(planetSide: PlanetSide, globalIJK: { i: number; j: number; k: number }): BABYLON.Vector3 {
        let size = PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(globalIJK.k));
        let p = PlanetTools.EvaluateVertex(size, globalIJK.i + 0.5, globalIJK.j + 0.5);
        p.scaleInPlace(PlanetTools.KGlobalToAltitude(globalIJK.k));
        p = BABYLON.Vector3.TransformCoordinates(p, planetSide.computeWorldMatrix(true));
        return p;
    }

    public static GlobalIJKToLocalIJK(
        planetSide: PlanetSide,
        global: { i: number; j: number; k: number }
    ): { planetChunck: PlanetChunck; i: number; j: number; k: number } {
        let kPos = Math.floor(global.k / PlanetTools.CHUNCKSIZE);
        let degree = PlanetTools.KPosToDegree(kPos);
        return {
            planetChunck: planetSide.getChunck(Math.floor(global.i / PlanetTools.CHUNCKSIZE), Math.floor(global.j / PlanetTools.CHUNCKSIZE), kPos, degree) as PlanetChunck,
            i: global.i % PlanetTools.CHUNCKSIZE,
            j: global.j % PlanetTools.CHUNCKSIZE,
            k: global.k % PlanetTools.CHUNCKSIZE,
        };
    }

    public static LocalIJKToGlobalIJK(planetChunck: PlanetChunck, localI: number, localJ: number, localK: number): { i: number; j: number; k: number } {
        return {
            i: planetChunck.iPos * PlanetTools.CHUNCKSIZE + localI,
            j: planetChunck.jPos * PlanetTools.CHUNCKSIZE + localJ,
            k: planetChunck.kPos * PlanetTools.CHUNCKSIZE + localK
        }
    }

    public static LocalIJKToWorldPosition(planetChunck: PlanetChunck, localI: number, localJ: number, localK: number): BABYLON.Vector3 {
        let globalIJK = PlanetTools.LocalIJKToGlobalIJK(planetChunck, localI, localJ, localK);
        return PlanetTools.GlobalIJKToWorldPosition(planetChunck.planetSide, globalIJK);
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

    private static _KPosToDegree: Map<number, number> = new Map<number, number>();
    public static KPosToDegree8(kPos: number): number {
        let v = PlanetTools._KPosToDegree.get(kPos);
        if (isFinite(v)) {
            return v;
        }
        let degree = 4;
        let tmpKpos = kPos;
        while (degree < PlanetTools.BSizes.length) {
            let size = PlanetTools.BSizes[degree].length / PlanetTools.CHUNCKSIZE;
            if (tmpKpos < size) {
                PlanetTools._KPosToDegree.set(kPos, degree);
                return degree;
            }
            else {
                tmpKpos -= size;
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
