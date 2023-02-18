class OctreeNode<T> {

    public static NToIJK = [
        { i: 0, j: 0, k: 0},
        { i: 0, j: 0, k: 1},
        { i: 0, j: 1, k: 0},
        { i: 0, j: 1, k: 1},
        { i: 1, j: 0, k: 0},
        { i: 1, j: 0, k: 1},
        { i: 1, j: 1, k: 0},
        { i: 1, j: 1, k: 1}
    ]
    public size: number;
    public degree: number = 3;
    public parent: OctreeNode<T>;
    public children: any[];

    public i: number = 0;
    public j: number = 0;
    public k: number = 0;

    constructor(parent: OctreeNode<T>);
    constructor(degree?: number);
    constructor(arg1?: OctreeNode<T> | number) {
        if (arg1 instanceof OctreeNode) {
            this.parent = arg1;
            this.degree = arg1.degree - 1;
        }
        else if (isFinite(arg1)) {
            this.degree = arg1;
        }
        this.size = Math.pow(2, this.degree);
    }

    public forEach(callback: (v: T, i: number, j: number, k: number) => void) {
        this.forEachNode((node) => {
            for (let n = 0; n < 8; n++) {
                let child = node.children[n];
                if (child != undefined) {
                    if (!(child instanceof OctreeNode)) {
                        let ijk = OctreeNode.NToIJK[n];
                        let I = 2 * node.i + ijk.i;
                        let J = 2 * node.j + ijk.j;
                        let K = 2 * node.k + ijk.k;
                        let S = node.size * 0.5;
                        for (let ii = 0; ii < S; ii++) {
                            for (let jj = 0; jj < S; jj++) {
                                for (let kk = 0; kk < S; kk++) {
                                    callback(child, S * I + ii, S * J + jj, S * K + kk);
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    public forEachNode(callback: (node: OctreeNode<T>) => void) {
        callback(this);
        for (let n = 0; n < 8; n++) {
            let child = this.children[n];
            if (child instanceof OctreeNode) {
                child.forEachNode(callback);
            }
        }
    }

    public collapse(): void {
        if (this.children != undefined) {
            let first = this.children[0];
            for (let i = 1; i < 8; i++) {
                if (this.children[i] != first) {
                    return;
                }
            }
            let index = this.parent.children.indexOf(this);
            this.parent.children[index] = first;
            this.parent.collapse();
        }
    }

    private _getChild(ii: number, jj: number, kk: number): any {
        if (this.children) {
            return this.children[4 * ii + 2 * jj + kk];
        }
    }
    
    private _setChild(child: any, ii: number, jj: number, kk: number): void {
        if (this.children === undefined) {
            this.children = [];
        }
        if (child instanceof OctreeNode) {
            child.i = 2 * this.i + ii;
            child.j = 2 * this.j + jj;
            child.k = 2 * this.k + kk;
        }
        this.children[4 * ii + 2 * jj + kk] = child;
    }
    
    private _setNthChild(child: any, n: number): void {
        if (this.children === undefined) {
            this.children = [];
        }
        if (child instanceof OctreeNode) {
            let k = n % 2;
            let j = ((n - k) / 2) % 2;
            let i = ((n - 2 * j - k) / 4);
            child.i = 2 * this.i + i;
            child.j = 2 * this.j + j;
            child.k = 2 * this.k + k;
        }
        this.children[n] = child;
    }

    public get(i: number, j: number, k: number): T {
        if (!this.children) {
            return undefined;
        }
        let ii = Math.floor((i - this.size * this.i) / (this.size / 2));
        let jj = Math.floor((j - this.size * this.j) / (this.size / 2));
        let kk = Math.floor((k - this.size * this.k) / (this.size / 2));

        let child = this._getChild(ii, jj, kk);
        if (!child) {
            return undefined;
        }
        else if (child instanceof OctreeNode) {
            return child.get(i, j, k);
        }
        else {
            return child as T; 
        }
    }

    public set(v: T, i: number, j: number, k: number): void {
        let ii = Math.floor((i - this.size * this.i) / (this.size / 2));
        let jj = Math.floor((j - this.size * this.j) / (this.size / 2));
        let kk = Math.floor((k - this.size * this.k) / (this.size / 2));

        if (this.degree === 1) {
            this._setChild(v, ii, jj, kk);
            this.collapse();
        }
        else {
            let childOctree = this._getChild(ii, jj, kk);
            if (!childOctree) {
                childOctree = new OctreeNode<T>(this);
                this._setChild(childOctree, ii, jj, kk);
            }
            else if (!(childOctree instanceof OctreeNode)) {
                let oldV = childOctree as T;
                childOctree = new OctreeNode<T>(this);
                childOctree.children = [oldV, oldV, oldV, oldV, oldV, oldV, oldV, oldV];
                this._setChild(childOctree, ii, jj, kk);
            }
            childOctree.set(v, i, j, k);
        }
    }

    public serializeToString(): string {
        let output = this.serialize();
        let compressedOutput = output[0] + "#" + output[3] + "#" + output[2] + "#" + output[1];

        let l1 = compressedOutput.length;

        compressedOutput = compressedOutput.replaceAll("________", "H");
        compressedOutput = compressedOutput.replaceAll("_______", "G");
        compressedOutput = compressedOutput.replaceAll("______", "F");
        compressedOutput = compressedOutput.replaceAll("_____", "E");
        compressedOutput = compressedOutput.replaceAll("____", "D");
        compressedOutput = compressedOutput.replaceAll("___", "C");
        compressedOutput = compressedOutput.replaceAll("__", "B");
        //compressedOutput = compressedOutput.replaceAll("_", "A");
        
        compressedOutput = compressedOutput.replaceAll("........", "P");
        compressedOutput = compressedOutput.replaceAll(".......", "O");
        compressedOutput = compressedOutput.replaceAll("......", "N");
        compressedOutput = compressedOutput.replaceAll(".....", "M");
        compressedOutput = compressedOutput.replaceAll("....", "L");
        compressedOutput = compressedOutput.replaceAll("...", "K");
        compressedOutput = compressedOutput.replaceAll("..", "J");
        //compressedOutput = compressedOutput.replaceAll(".", "I");

        let l2 = compressedOutput.length;

        console.log("Compression rate " + ((l2 / l1) * 100).toFixed(0) + "%");

        return compressedOutput;
    }

    public serialize(output?: string[]): string[] {
        if (!output) {
            output = [];
            output[0] = this.degree.toFixed(0);
        }
        if (!output[this.degree]) {
            output[this.degree] = "";
        }

        for (let n = 0; n < 8; n++) {
            let child = this.children[n];
            if (child === undefined) {
                output[this.degree] += "_";
            }
            else if (child instanceof OctreeNode) {
                output[this.degree] += ".";
                child.serialize(output);
            }
            else {
                output[this.degree] += (child as number).toString().padStart(3, "0");
            }
        }

        return output;
    }

    public static DeserializeFromString(strInput: string): OctreeNode<number> {
        let deCompressedInput = strInput;

        deCompressedInput = deCompressedInput.replaceAll("H", "________");
        deCompressedInput = deCompressedInput.replaceAll("G", "_______");
        deCompressedInput = deCompressedInput.replaceAll("F", "______");
        deCompressedInput = deCompressedInput.replaceAll("E", "_____");
        deCompressedInput = deCompressedInput.replaceAll("D", "____");
        deCompressedInput = deCompressedInput.replaceAll("C", "___");
        deCompressedInput = deCompressedInput.replaceAll("B", "__");
        //deCompressedInput = deCompressedInput.replaceAll("A", "_");
        
        deCompressedInput = deCompressedInput.replaceAll("P", "........");
        deCompressedInput = deCompressedInput.replaceAll("O", ".......");
        deCompressedInput = deCompressedInput.replaceAll("N", "......");
        deCompressedInput = deCompressedInput.replaceAll("M", ".....");
        deCompressedInput = deCompressedInput.replaceAll("L", "....");
        deCompressedInput = deCompressedInput.replaceAll("K", "...");
        deCompressedInput = deCompressedInput.replaceAll("J", "..");
        //deCompressedInput = deCompressedInput.replaceAll("I", ".");

        let split = deCompressedInput.split("#");
        let input = [split[0]];
        for (let n = split.length - 1; n > 0; n--) {
            input.push(split[n]);
        }
        return OctreeNode.Deserialize(input);
    }

    public static Deserialize(input: string[]): OctreeNode<number> {
        let node = new OctreeNode<number>(parseInt(input[0]));
        
        // degree 3
        let inputDeg3 = input[3];
        let degree2Nodes: OctreeNode<number>[] = [];
        let degree1Nodes: OctreeNode<number>[] = [];
        let cursor = 0;
        for (let n = 0; n < inputDeg3.length; n++) {
            let c = inputDeg3[cursor];
            if (c === ".") {
                let newNode = new OctreeNode<number>(node);
                degree2Nodes.push(newNode);
                node._setNthChild(newNode, n);
            }
            else if (c === "_") {

            }
            else {
                let v = parseInt(c);
                if (isNaN(v)) {
                    return undefined;
                }
                node._setNthChild(v, n);
            }
            cursor++;
        }

        // degree 2
        cursor = 0;
        while (degree2Nodes.length > 0) {
            let nodeDeg2 = degree2Nodes.splice(0, 1)[0];

            let n = 0;
            while (n < 8) {
                let c = input[2][cursor];
                if (c === "_") {
                    cursor++;
                }
                else if (c === ".") {
                    let newNode = new OctreeNode<number>(nodeDeg2);
                    degree1Nodes.push(newNode);
                    nodeDeg2._setNthChild(newNode, n);
                    cursor++;
                }
                else {
                    let v = parseInt(input[2].substring(cursor, cursor + 3));
                    if (isNaN(v)) {
                        return undefined;
                    }
                    cursor += 3;
                    nodeDeg2._setNthChild(v, n);
                }
                n++
            }
        }

        // degree 1
        cursor = 0;
        while (degree1Nodes.length > 0) {
            let nodeDeg1 = degree1Nodes.splice(0, 1)[0];

            let n = 0;
            while (n < 8) {
                let c = input[1][cursor];
                if (c === "_") {
                    cursor++;
                }
                else {
                    let v = parseInt(input[1].substring(cursor, cursor + 3));
                    if (isNaN(v)) {
                        return undefined;
                    }
                    cursor += 3;
                    nodeDeg1._setNthChild(v, n);
                }
                n++
            }
        }

        return node;
    }
}