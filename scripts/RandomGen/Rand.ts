class RandSeed {

    public values: number[] = [1000, 1000, 1000, 1000, 1000, 1000, 1000];

    constructor(public stringInput: string) {
        stringInput = stringInput.padEnd(10, "x");
        for (let i = 0; i < 7; i++) {
            let mixedStringInput = stringInput.substring(i) + stringInput.substring(0, i);
            this.values[i] = RandSeed.EasyHash(mixedStringInput);
        }
    }

    public static EasyHash(stringInput: string) {
        let h = 0;
        for (let i = 0; i < stringInput.length; i++) {
            let v = stringInput.charCodeAt(i);
            h = (h * h + v) % 10000;
        }
        return h;
    }
}

class Rand {

    public L: number;
    public values: number[] = [];

    constructor() {
        let N = PIString.length;
        let i = 0;
        while (i + 7 < N) {
            let n = parseInt(PIString.substring(i, i + 7));
            this.values.push(n / 9999999);
            i++;
        }
        this.L = this.values.length;
    }
    
    public getValue1D(seed: RandSeed, i: number): number {
        let n1 = seed.values[0] * (i + 1);
        n1 = n1 % this.L;

        let n2 = seed.values[1] * (n1 * i + 1);
        n2 = n2 % this.L;

        let n3 = seed.values[2] * (n2 * i + 1);
        n3 = n3 % this.L;
        
        let n4 = seed.values[3] * (n3 * i + 1);
        n4 = n4 % this.L;
        
        let index = Math.floor(Math.abs(n1 + n2 + n3 + n4)) % this.L;
        let v = this.values[index];
        return v;
    }
    
    public getValue4D(seed: RandSeed, i: number, j: number, k: number, d: number): number {
        let n1 = seed.values[0] * (i + 1);
        n1 = n1 % this.L;

        let n2 = seed.values[1] * (n1 * j + 1);
        n2 = n2 % this.L;

        let n3 = seed.values[2] * (n2 * k + 1);
        n3 = n3 % this.L;
        
        let n4 = seed.values[3] * (n3 * d + 1);
        n4 = n4 % this.L;

        let n5 = seed.values[4] * (n4 * i + 1);
        n5 = n5 % this.L;

        let n6 = seed.values[5] * (n5 * j + 1);
        n6 = n6 % this.L;

        let n7 = seed.values[6] * (n6 * k + 1);
        n7 = n7 % this.L;
        
        let n8 = seed.values[0] * (n7 * d + 1);
        n8 = n8 % this.L;
        
        let index = Math.floor(Math.abs(n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8)) % this.L;
        let v = this.values[index];
        //console.log(v);
        return v;
    }
}