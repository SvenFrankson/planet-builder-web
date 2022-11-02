interface IPlanetHeightMapOptions {
    firstNoiseDegree?: number;
    lastNoiseDegree?: number;
    postComputation?: (v: number) => number;
}

class PlanetHeightMap {

    public map: number[][][] = [];
    public size: number;

    constructor(
        public degree: number
    ) {
        this.size = Math.pow(2, this.degree);
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

        for (let i = 0; i <= map.size; i++) {
            for (let j = 0; j <= map.size; j++) {
                for (let k = 0; k <= map.size; k++) {
                    if (map.isValid(i, j, k)) {
                        map.setValue(0, i, j, k);
                    }
                }
            }
        }
        let noise = 1;
        while (map.degree < degree) {
            map = map.scale2();
            if (map.degree >= firstNoiseDegree && map.degree < lastNoiseDegree) {
                noise = noise * 0.5;
                map.noise(noise);
            }
        }

        
        if (options && options.postComputation) {
            for (let i = 0; i <= map.size; i++) {
                for (let j = 0; j <= map.size; j++) {
                    for (let k = 0; k <= map.size; k++) {
                        if (map.isValid(i, j, k)) {
                            let v = map.getValue(i, j, k);
                            map.setValue(options.postComputation(v), i, j, k);
                        }
                    }
                }
            }
        }

        return map;
    }

    public noise(range: number): void {
        for (let i = 0; i <= this.size; i++) {
            for (let j = 0; j <= this.size; j++) {
                for (let k = 0; k <= this.size; k++) {
                    if (this.isValid(i, j, k)) {
                        let v = this.getValue(i, j, k);
                        v += (Math.random() * 2 - 1) * range;
                        this.setValue(v, i, j, k);
                    }
                }
            }
        }
    }

    public smooth(): void {
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
                                        value += this.getValue(I, J, K);
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

    public addInPlace(other: PlanetHeightMap): void {
        if (other.degree = this.degree) {
            for (let i = 0; i <= this.size; i++) {
                for (let j = 0; j <= this.size; j++) {
                    for (let k = 0; k <= this.size; k++) {
                        if (this.isValid(i, j, k)) {
                            let v = this.getValue(i, j, k);
                            v += other.getValue(i, j, k);
                            this.setValue(v, i, j, k);
                        }
                    }
                }
            }
        }
    }

    public substractInPlace(other: PlanetHeightMap): void {
        if (other.degree = this.degree) {
            for (let i = 0; i <= this.size; i++) {
                for (let j = 0; j <= this.size; j++) {
                    for (let k = 0; k <= this.size; k++) {
                        if (this.isValid(i, j, k)) {
                            let v = this.getValue(i, j, k);
                            v -= other.getValue(i, j, k);
                            this.setValue(v, i, j, k);
                        }
                    }
                }
            }
        }
    }

    public scale2(): PlanetHeightMap {
        let scaledMap = new PlanetHeightMap(this.degree + 1);

        for (let I = 0; I <= this.size; I++) {
            for (let J = 0; J <= this.size; J++) {
                for (let K = 0; K <= this.size; K++) {
                    if (this.isValid(I, J, K)) {
                        let v = this.getValue(I, J, K);
                        scaledMap.setValue(v, 2 * I, 2 * J, 2 * K);
                    }
                }
            }
        }

        for (let i = 0; i <= this.size; i++) {
            for (let j = 0; j <= this.size; j++) {
                for (let k = 0; k <= this.size; k++) {
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
                }
            }
        }

        for (let i = 0; i <= this.size; i++) {
            for (let j = 0; j <= this.size; j++) {
                for (let k = 0; k <= this.size; k++) {
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
                }
            }
        }

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

    public getValue(i: number, j: number, k: number): number {
        if (this.map[i]) {
            if (this.map[i][j]) {
                return this.map[i][j][k];
            }
        }
        debugger;
    }

    public setValue(v: number, i: number, j: number, k: number): void {
        if (!this.map[i]) {
            this.map[i] = [];
        }
        if (!this.map[i][j]) {
            this.map[i][j] = [];
        }
        this.map[i][j][k] = v;
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