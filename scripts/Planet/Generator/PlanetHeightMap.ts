interface IPlanetHeightMapOptions {
    firstNoiseDegree?: number;
    lastNoiseDegree?: number;
    postComputation?: (v: number) => number;
}

class PlanetHeightMap {

    public i0s: number[][] = [];
    public iNs: number[][] = [];
    public j0s: number[][] = [];
    public jNs: number[][] = [];
    public k0s: number[][] = [];
    public kNs: number[][] = [];

    public values: number[][][] = [this.i0s, this.iNs, this.j0s, this.jNs, this.k0s, this.kNs];

    public size: number;

    constructor(
        public degree: number
    ) {
        this.size = Math.pow(2, this.degree);

        for (let n = 0; n < 6; n++) {
            let face = this.values[n];
            for (let i = 0; i <= this.size; i++) {
                face[i] = [];
            }
        }
    }

    public static CreateConstantMap(degree: number, value: number): PlanetHeightMap {
        let constantMap = new PlanetHeightMap(degree);
        constantMap.enumerate((i, j, k) => {
            constantMap.setValue(value, i, j, k);
        });
        return constantMap;
    }

    public static CreateMap(degree: number, options?: IPlanetHeightMapOptions): PlanetHeightMap {
        let map = new PlanetHeightMap(0);

        let firstNoiseDegree: number = 1;
        if (options && isFinite(options.firstNoiseDegree)) {
            firstNoiseDegree = options.firstNoiseDegree;
        }
        let lastNoiseDegree: number = degree;
        if (options && isFinite(options.lastNoiseDegree)) {
            lastNoiseDegree = options.lastNoiseDegree;
        }

        map.enumerate((i, j, k) => {
            map.setValue(0, i, j, k);
        });
        
        let noise = 1;
        while (map.degree < degree) {
            map = map.scale2();
            if (map.degree >= firstNoiseDegree && map.degree < lastNoiseDegree) {
                noise = noise * 0.5;
                map.noise(noise);
            }
        }

        
        if (options && options.postComputation) {
            map.enumerate((i, j, k) => {
                let v = map.getValue(i, j, k);
                map.setValue(options.postComputation(v), i, j, k);
            });
        }

        return map;
    }

    public noise(range: number): void {
        this.enumerate((i, j, k) => {
            let v = this.getValue(i, j, k);
            v += (Math.random() * 2 - 1) * range;
            this.setValue(v, i, j, k);
        });
    }

    public setRandomDisc(v: number, rMin: number, rMax: number, shadow: number = 0): void {
        let i = Math.random();
        let j = Math.random();
        let k = Math.random();
        if (i >= j && i >= k) {
            i = 1;
        }
        else if (j >= i && j >= k) {
            j = 1;
        }
        else if (k >= i && k >= j) {
            k = 1;
        }

        if (Math.random() > 0.5) {
            i = - i;
        }
        if (Math.random() > 0.5) {
            j = - j;
        }
        if (Math.random() > 0.5) {
            k = - k;
        }

        i = 0.5 - 0.5 * i;
        j = 0.5 - 0.5 * j;
        k = 0.5 - 0.5 * k;

        i = Math.round(i * this.size);
        j = Math.round(j * this.size);
        k = Math.round(k * this.size);

        let r = (rMax - rMin) * Math.random() + rMin;
        for (let n = shadow; n > 0; n--) {
            let vv = v * (1 - n / (shadow + 1))
            this.fillDisc(vv, i, j, k, r + n);
        }
        this.fillDisc(v, i, j, k, r);
    }

    public smooth(): void {
        let copy = this.clone();
        for (let i = 0; i <= this.size; i++) {
            for (let j = 0; j <= this.size; j++) {
                for (let k = 0; k <= this.size; k++) {
                    if (this.isValid(i, j, k)) {
                        let value = 0;
                        let count = 0;
                        for (let ii = -1; ii <= 1; ii++) {
                            for (let jj = -1; jj <= 1; jj++) {
                                for (let kk = -1; kk <= 1; kk++) {
                                    let I = i + ii;
                                    let J = j + jj;
                                    let K = k + kk;
                                    if (this.isValid(I, J, K)) {
                                        value += copy.getValue(I, J, K);
                                        count++;
                                    }
                                }
                            }
                        }
                        this.setValue(value / count, i, j, k);
                    }
                }
            }
        }
    }

    public clone(): PlanetHeightMap {
        let newMap = new PlanetHeightMap(this.degree);
        this.enumerate((i, j, k) => {
            newMap.setValue(this.getValue(i, j, k), i, j, k);
        });
        return newMap;
    }

    public addInPlace(other: PlanetHeightMap): PlanetHeightMap {
        if (other.degree = this.degree) {
            this.enumerate((i, j, k) => {
                let v = this.getValue(i, j, k);
                v += other.getValue(i, j, k);
                this.setValue(v, i, j, k);
            });
        }
        return this;
    }

    public substractInPlace(other: PlanetHeightMap): PlanetHeightMap {
        if (other.degree = this.degree) {
            this.enumerate((i, j, k) => {
                let v = this.getValue(i, j, k);
                v -= other.getValue(i, j, k);
                this.setValue(v, i, j, k);
            });
        }
        return this;
    }

    public multiplyInPlace(value: number): PlanetHeightMap {
        this.enumerate((i, j, k) => {
            let v = this.getValue(i, j, k);
            v *= value;
            this.setValue(v, i, j, k);
        });
        return this;
    }

    public minInPlace(other: PlanetHeightMap): PlanetHeightMap {
        if (other.degree = this.degree) {
            this.enumerate((i, j, k) => {
                let v = Math.min(this.getValue(i, j, k), other.getValue(i, j, k));
                this.setValue(v, i, j, k);
            });
        }
        return this;
    }

    public maxInPlace(other: PlanetHeightMap): PlanetHeightMap {
        if (other.degree = this.degree) {
            this.enumerate((i, j, k) => {
                let v = Math.max(this.getValue(i, j, k), other.getValue(i, j, k));
                this.setValue(v, i, j, k);
            });
        }
        return this;
    }

    public scale2(): PlanetHeightMap {
        let scaledMap = new PlanetHeightMap(this.degree + 1);

        this.enumerate((i, j, k) => {
            if (this.isValid(i, j, k)) {
                let v = this.getValue(i, j, k);
                scaledMap.setValue(v, 2 * i, 2 * j, 2 * k);
            }
        });

        this.enumerate((i, j, k) => {
            if (scaledMap.isValid(2 * i + 1, 2 * j, 2 * k)) {
                let v1 = scaledMap.getValue(2 * i, 2 * j, 2 * k);
                let v2 = scaledMap.getValue(2 * i + 2, 2 * j, 2 * k);
                if (isFinite(v1) && isFinite(v2)) {
                    scaledMap.setValue((v1 + v2) * 0.5, 2 * i + 1, 2 * j, 2 * k);
                }
            }
            if (scaledMap.isValid(2 * i, 2 * j + 1, 2 * k)) {
                let v1 = scaledMap.getValue(2 * i, 2 * j, 2 * k);
                let v2 = scaledMap.getValue(2 * i, 2 * j + 2, 2 * k);
                if (isFinite(v1) && isFinite(v2)) {
                    scaledMap.setValue((v1 + v2) * 0.5, 2 * i, 2 * j + 1, 2 * k);
                }
            }
            if (scaledMap.isValid(2 * i, 2 * j, 2 * k + 1)) {
                let v1 = scaledMap.getValue(2 * i, 2 * j, 2 * k);
                let v2 = scaledMap.getValue(2 * i, 2 * j, 2 * k + 2);
                if (isFinite(v1) && isFinite(v2)) {
                    scaledMap.setValue((v1 + v2) * 0.5, 2 * i, 2 * j, 2 * k + 1);
                }
            }
        });
        
        this.enumerate((i, j, k) => {
            if (scaledMap.isValid(2 * i + 1, 2 * j + 1, 2 * k)) {
                let v1 = scaledMap.getValue(2 * i, 2 * j + 1, 2 * k);
                let v2 = scaledMap.getValue(2 * i + 2, 2 * j + 1, 2 * k);
                let v3 = scaledMap.getValue(2 * i + 1, 2 * j + 2, 2 * k);
                let v4 = scaledMap.getValue(2 * i + 1, 2 * j, 2 * k);

                let c = 0;
                let v = 0;
                if (isFinite(v1)) {
                    c++;
                    v += v1;
                }
                if (isFinite(v2)) {
                    c++;
                    v += v2;
                }
                if (isFinite(v3)) {
                    c++;
                    v += v3;
                }
                if (isFinite(v4)) {
                    c++;
                    v += v4;
                }
                v /= c;

                if (isNaN(v)) {
                    debugger;
                }

                scaledMap.setValue(v, 2 * i + 1, 2 * j + 1, 2 * k);
            }
            if (scaledMap.isValid(2 * i + 1, 2 * j, 2 * k + 1)) {
                let v1 = scaledMap.getValue(2 * i,       2 * j,      2 * k + 1);
                let v2 = scaledMap.getValue(2 * i + 2,   2 * j,      2 * k + 1);
                let v3 = scaledMap.getValue(2 * i + 1,   2 * j,      2 * k);
                let v4 = scaledMap.getValue(2 * i + 1,   2 * j,      2 * k + 2);

                let c = 0;
                let v = 0;
                if (isFinite(v1)) {
                    c++;
                    v += v1;
                }
                if (isFinite(v2)) {
                    c++;
                    v += v2;
                }
                if (isFinite(v3)) {
                    c++;
                    v += v3;
                }
                if (isFinite(v4)) {
                    c++;
                    v += v4;
                }
                v /= c;

                if (isNaN(v)) {
                    debugger;
                }
                
                scaledMap.setValue(v, 2 * i + 1, 2 * j, 2 * k + 1);                        
            }
            if (scaledMap.isValid(2 * i, 2 * j + 1, 2 * k + 1)) {
                let v1 = scaledMap.getValue(2 * i,      2 * j,          2 * k + 1);
                let v2 = scaledMap.getValue(2 * i,      2 * j + 2,      2 * k + 1);
                let v3 = scaledMap.getValue(2 * i,      2 * j + 1,      2 * k);
                let v4 = scaledMap.getValue(2 * i,      2 * j + 1,      2 * k + 2);

                let c = 0;
                let v = 0;
                if (isFinite(v1)) {
                    c++;
                    v += v1;
                }
                if (isFinite(v2)) {
                    c++;
                    v += v2;
                }
                if (isFinite(v3)) {
                    c++;
                    v += v3;
                }
                if (isFinite(v4)) {
                    c++;
                    v += v4;
                }
                v /= c;

                if (isNaN(v)) {
                    debugger;
                }

                scaledMap.setValue(v, 2 * i, 2 * j + 1, 2 * k + 1);                        
            }
        });

        if (!scaledMap.sanityCheck()) {
            debugger;
        }

        return scaledMap;
    }

    public isValid(i: number, j: number, k: number): boolean {
        return (i === 0 || j === 0 || k === 0 || i === this.size || j === this.size || k === this.size) && (i >= 0 && j >= 0 && k >= 0 && i <= this.size && j <= this.size && k <= this.size);
    }

    public sanityCheck(): boolean {
        for (let i = 0; i <= this.size; i++) {
            for (let j = 0; j <= this.size; j++) {
                for (let k = 0; k <= this.size; k++) {
                    if (this.isValid(i, j, k)) {
                        if (isNaN(this.getValue(i, j, k))) {
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    public getForSide(side: Side, i: number, j: number): number {
        if (side === Side.Top) {
            return this.getValue(this.size - j, this.size, i);
        }
        else if (side === Side.Right) {
            return this.getValue(this.size, j, i);
        }
        else if (side === Side.Front) {
            return this.getValue(this.size - i, j, this.size);
        }
        else if (side === Side.Left) {
            return this.getValue(0, j, this.size - i);
        }
        else if (side === Side.Back) {
            return this.getValue(i, j, 0);
        }
        if (side === Side.Bottom) {
            return this.getValue(j, 0, i);
        }
        else {
            return 0;
        }
    }

    public enumerate(callback: (i: number, j: number, k: number) => void): void {
        for (let jj = 0; jj <= this.size; jj++) {
            for (let kk = 0; kk <= this.size; kk++) {
                callback(0, jj, kk);
                callback(this.size, jj, kk);
            }
        }

        for (let ii = 1; ii <= this.size - 1; ii++) {
            for (let kk = 0; kk <= this.size; kk++) {
                callback(ii, 0, kk);
                callback(ii, this.size, kk);
            }
        }

        for (let ii = 1; ii <= this.size - 1; ii++) {
            for (let jj = 1; jj <= this.size - 1; jj++) {
                callback(ii, jj, 0);
                callback(ii, jj, this.size);
            }
        }
    }

    public getValue(i: number, j: number, k: number): number {
        if (i === 0) {
            return this.i0s[j][k];
        }
        else if (i === this.size) {
            return this.iNs[j][k];
        }
        else if (j === 0) {
            return this.j0s[i][k];
        }
        else if (j === this.size) {
            return this.jNs[i][k];
        }
        else if (k === 0) {
            return this.k0s[i][j];
        }
        else if (k === this.size) {
            return this.kNs[i][j];
        }
    }

    public setValue(v: number, i: number, j: number, k: number): void {
        if (i === 0) {
            this.i0s[j][k] = v;
        }
        else if (i === this.size) {
            this.iNs[j][k] = v;
        }
        else if (j === 0) {
            this.j0s[i][k] = v;
        }
        else if (j === this.size) {
            this.jNs[i][k] = v;
        }
        else if (k === 0) {
            this.k0s[i][j] = v;
        }
        else if (k === this.size) {
            this.kNs[i][j] = v;
        }
    }

    public fillDisc(v: number, i: number, j: number, k: number, r: number): void {
        let rr = r;
        let rN = Math.floor(r);
        for (let ii = - rN; ii <= rN; ii++) {
            for (let jj = - rN; jj <= rN; jj++) {
                for (let kk = - rN; kk <= rN; kk++) {
                    if (ii * ii + jj * jj + kk * kk < rr) {
                        if (this.isValid(i + ii, j + jj, k + kk)) {
                            this.setValue(v, i + ii, j + jj, k + kk);
                        }
                    }
                }
            }
        }
    }

    public getTexture(side: Side, maxValue?: number): BABYLON.Texture {
        let texture = new BABYLON.DynamicTexture("texture-" + side, this.size, Game.Scene, false);
        let context = texture.getContext();

        if (!isFinite(maxValue)) {
            maxValue = 1;
        }

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                let v = this.getForSide(side, i, j);
                let c = (v + 1) * 0.5 / maxValue * 256;
                if (Math.round(c) === 128) {
                    context.fillStyle = "rgb(255 0 0)"; 
                }
                else {
                    context.fillStyle = "rgb(" + c.toFixed(0) + ", " + c.toFixed(0) + ", " + c.toFixed(0) + ")";
                }
                context.fillRect(i, j, 1, 1);
            }
        }

        texture.update(false);

        return texture;
    }
}