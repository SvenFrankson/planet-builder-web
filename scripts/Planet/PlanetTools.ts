var PI4 = Math.PI / 4;
var PI2 = Math.PI / 2;
var PI = Math.PI;

class PlanetTools {

    public static readonly DEGREEMIN = 5;
    public static readonly CHUNCKSIZE = 16;
    public static readonly ALPHALIMIT = Math.PI / 4;
    public static readonly DISTANCELIMITSQUARED = 128 * 128;

    private static _tmpVertices: BABYLON.Vector3[];
    public static get tmpVertices(): BABYLON.Vector3[] {
        if (!PlanetTools._tmpVertices || PlanetTools._tmpVertices.length < 15) {
            PlanetTools._tmpVertices = [];
            for (let i: number = 0; i < 15; i++) {
                PlanetTools._tmpVertices[i] = BABYLON.Vector3.Zero();
            }
        }
        return PlanetTools._tmpVertices;
    }

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
        let v = new BABYLON.Vector3();
        return PlanetTools.EvaluateVertexToRef(size, i, j, v);
    }

    public static EvaluateVertexToRef(
        size: number,
        i: number,
        j: number,
        ref: BABYLON.Vector3
    ): BABYLON.Vector3 {
        if (i < 0) {
            let v = PlanetTools.EvaluateVertex(size, i + size, j);
            ref.copyFromFloats(- v.y, v.x, v.z);
            return ref;
        }
        if (i > size) {
            let v = PlanetTools.EvaluateVertex(size, i - size, j);
            ref.copyFromFloats(v.y, - v.x, v.z);
            return ref;
        }
        if (j < 0) {
            let v = PlanetTools.EvaluateVertex(size, i, j + size);
            ref.copyFromFloats(v.x, v.z, - v.y);
            return ref;
        }
        if (j > size) {
            let v = PlanetTools.EvaluateVertex(size, i, j - size);
            ref.copyFromFloats(v.x, - v.z, v.y);
            return ref;
        }
        let xRad: number = - PI4 + PI2 * (i / size);
        let zRad: number = - PI4 + PI2 * (j / size);

        ref.copyFromFloats(Math.tan(xRad), 1, Math.tan(zRad)).normalize();
        return ref;
    }

    public static SkewVertexData(
        vertexData: BABYLON.VertexData,
        size: number,
        i: number,
        j: number,
        k: number
    ): BABYLON.VertexData {
        let h0 = PlanetTools.KGlobalToAltitude(k);
        let h1 = PlanetTools.KGlobalToAltitude(k + 1);

        let v0 = PlanetTools.tmpVertices[0];
        let v1 = PlanetTools.tmpVertices[1];
        let v2 = PlanetTools.tmpVertices[2];
        let v3 = PlanetTools.tmpVertices[3];
        let v4 = PlanetTools.tmpVertices[4];
        let v5 = PlanetTools.tmpVertices[5];
        let v6 = PlanetTools.tmpVertices[6];
        let v7 = PlanetTools.tmpVertices[7];
        let v01 = PlanetTools.tmpVertices[8];
        let v32 = PlanetTools.tmpVertices[9];
        let v45 = PlanetTools.tmpVertices[10];
        let v76 = PlanetTools.tmpVertices[11];
        let v0132 = PlanetTools.tmpVertices[12];
        let v4576 = PlanetTools.tmpVertices[13];
        let v = PlanetTools.tmpVertices[14];
        
        PlanetTools.EvaluateVertexToRef(size, i, j, v0);
        PlanetTools.EvaluateVertexToRef(size, i + 1, j, v1);
        PlanetTools.EvaluateVertexToRef(size, i + 1, j + 1, v2);
        PlanetTools.EvaluateVertexToRef(size, i, j + 1, v3);
        v4.copyFrom(v0).scaleInPlace(h1);
        v5.copyFrom(v1).scaleInPlace(h1);
        v6.copyFrom(v2).scaleInPlace(h1);
        v7.copyFrom(v3).scaleInPlace(h1);

        v0.scaleInPlace(h0);
        v1.scaleInPlace(h0);
        v2.scaleInPlace(h0);
        v3.scaleInPlace(h0);
        
        let skewedVertexData = new BABYLON.VertexData();
        let positions: number[] = [];
        let normals: number[] = [...vertexData.normals];
        let indices: number[] = [...vertexData.indices];
        let uvs: number[] = [...vertexData.uvs];
        let colors: number[];
        if (vertexData.colors) {
            colors = [...vertexData.colors];
        }

        for (let n = 0; n < vertexData.positions.length / 3; n++) {
            let x = vertexData.positions[3 * n];
            let y = vertexData.positions[3 * n + 1];
            let z = vertexData.positions[3 * n + 2];
            
            v01.copyFrom(v1).subtractInPlace(v0).scaleInPlace(x).addInPlace(v0);
            v32.copyFrom(v2).subtractInPlace(v3).scaleInPlace(x).addInPlace(v3);
            v45.copyFrom(v5).subtractInPlace(v4).scaleInPlace(x).addInPlace(v4);
            v76.copyFrom(v6).subtractInPlace(v7).scaleInPlace(x).addInPlace(v7);

            v0132.copyFrom(v32).subtractInPlace(v01).scaleInPlace(z).addInPlace(v01);
            v4576.copyFrom(v76).subtractInPlace(v45).scaleInPlace(z).addInPlace(v45);

            v.copyFrom(v4576).subtractInPlace(v0132).scaleInPlace(y).addInPlace(v0132);
            
            positions.push(v.x);
            positions.push(v.y);
            positions.push(v.z);
        }

        skewedVertexData.positions = positions;
        skewedVertexData.normals = normals;
        skewedVertexData.indices = indices;
        skewedVertexData.colors = colors;
        skewedVertexData.uvs = uvs;

        return skewedVertexData;
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

    public static WorldPositionToLocalIJK(
        planet: Planet,
        worldPos: BABYLON.Vector3
    ): { planetChunck: PlanetChunck; i: number; j: number; k: number } {
        let planetSide = PlanetTools.WorldPositionToPlanetSide(planet, worldPos);
        let globalIJK = PlanetTools.WorldPositionToGlobalIJK(planetSide, worldPos);
        let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
        return localIJK;
    }

    public static WorldPositionToChunck(planet: Planet, worldPos: BABYLON.Vector3): PlanetChunck {
        let localIJK = PlanetTools.WorldPositionToLocalIJK(planet, worldPos);
        return localIJK ? localIJK.planetChunck : undefined;
    }

    public static GlobalIJKToWorldPosition(planetSide: PlanetSide, globalIJK: { i: number; j: number; k: number }, middleAltitude?: boolean): BABYLON.Vector3 {
        let size = PlanetTools.DegreeToSize(PlanetTools.KGlobalToDegree(globalIJK.k));
        let p = PlanetTools.EvaluateVertex(size, globalIJK.i + 0.5, globalIJK.j + 0.5);
        if (middleAltitude) {
            p.scaleInPlace(PlanetTools.KGlobalToAltitude(globalIJK.k) * 0.5 + PlanetTools.KGlobalToAltitude(globalIJK.k + 1) * 0.5);
        }
        else {
            p.scaleInPlace(PlanetTools.KGlobalToAltitude(globalIJK.k));
        }
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
    public static LocalIJKToGlobalIJK(planetChunck: PlanetChunck, localI: number, localJ: number, localK: number): { i: number; j: number; k: number };
    public static LocalIJKToGlobalIJK(localIJK: { planetChunck: PlanetChunck; i: number; j: number; k: number }): { i: number; j: number; k: number };
    public static LocalIJKToGlobalIJK(a: any, localI?: any, localJ?: number, localK?: number): { i: number; j: number; k: number } {
        let planetChunck: PlanetChunck;
        if (a instanceof PlanetChunck) {
            planetChunck = a;
        }
        else {
            planetChunck = a.planetChunck;
            localI = a.i;
            localJ = a.j;
            localK = a.k;
        }
        return {
            i: planetChunck.iPos * PlanetTools.CHUNCKSIZE + localI,
            j: planetChunck.jPos * PlanetTools.CHUNCKSIZE + localJ,
            k: planetChunck.kPos * PlanetTools.CHUNCKSIZE + localK
        }
    }

    public static LocalIJKToWorldPosition(planetChunck: PlanetChunck, localI: number, localJ: number, localK: number, middleAltitude?: boolean): BABYLON.Vector3;
    public static LocalIJKToWorldPosition(localIJK: { planetChunck: PlanetChunck; i: number; j: number; k: number }, middleAltitude?: boolean): BABYLON.Vector3;
    public static LocalIJKToWorldPosition(a: any, b: any, localJ?: number, localK?: number, middleAltitude?: boolean): BABYLON.Vector3 {
        let planetChunck: PlanetChunck;
        let localI: number;
        if (a instanceof PlanetChunck) {
            planetChunck = a;
            localI = b;
        }
        else {
            planetChunck = a.planetChunck;
            localI = a.i;
            localJ = a.j;
            localK = a.k;
            middleAltitude = b;
        }
        let globalIJK = PlanetTools.LocalIJKToGlobalIJK(planetChunck, localI, localJ, localK);
        return PlanetTools.GlobalIJKToWorldPosition(planetChunck.planetSide, globalIJK, middleAltitude);
    }

    public static KGlobalToDegree(k: number): number {
        return PlanetTools.KPosToDegree(Math.floor(k / PlanetTools.CHUNCKSIZE));
    }

    public static KPosToDegree(kPos: number): number {
        return PlanetTools.KPosToDegree16(kPos);
    }

    public static KPosToSize(kPos: number): number {
        return PlanetTools.DegreeToSize(PlanetTools.KPosToDegree(kPos));
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
        let coreRadius = 13.4;
        let radius = coreRadius;
        let degree = this.DEGREEMIN;
        let bSizes = [];
        let altitudes = [];
        let summedBSizesLength = 0;
        while (radius < 1000) {
            let size = PlanetTools.DegreeToSize(degree);
            for (let i = 0; i < PlanetTools.CHUNCKSIZE; i++) {
                let a = Math.PI / 2 / size;
                let s = a * radius * 0.8;
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
    private static KPosToDegree8(kPos: number): number {
        let v = PlanetTools._KPosToDegree.get(kPos);
        if (isFinite(v)) {
            return v;
        }
        let degree = this.DEGREEMIN;
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
    private static KPosToDegree16(kPos: number): number {
        let v = PlanetTools._KPosToDegree.get(kPos);
        if (isFinite(v)) {
            return v;
        }
        let degree = this.DEGREEMIN;
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
        let degree = this.DEGREEMIN;
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

    public static KLocalToAltitude(chunck: PlanetChunck, k: number): number {
        let degree = PlanetTools.KGlobalToDegree(chunck.kPos * PlanetTools.CHUNCKSIZE + k);
        let altitudes = PlanetTools.Altitudes[degree];
        let summedLength = PlanetTools.SummedBSizesLength[degree];
        return altitudes[chunck.kPos * PlanetTools.CHUNCKSIZE + k - summedLength];
    }

    public static DegreeToKOffset(degree: number): number {
        return PlanetTools._SummedBSizesLength[degree] / PlanetTools.CHUNCKSIZE;
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
