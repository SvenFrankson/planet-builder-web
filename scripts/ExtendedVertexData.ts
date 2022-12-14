class Edge {

    constructor(
        public v1: number,
        public v2: number
    ) {

    }

    public Is(v1: number, v2: number): boolean {
        if (this.v1 === v1 && this.v2 === v2) {
            return true;
        }
        if (this.v1 === v2 && this.v2 === v1) {
            return true;
        }
        return false;
    }
}

class ExtendedVertexData {

    public blocks: number[][] = [];
    public edges: Edge[] = [];

    private static SquaredLength(x: number, y: number, z: number): number {
        return x * x + y * y + z * z;
    }
    
    private static DistanceSquared(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): number {
        let x = x1 - x0;
        let y = y1 - y0;
        let z = z1 - z0;
        return x * x + y * y + z * z;
    }
    
    private static Distance(x0: number, y0: number, z0: number, x1: number, y1: number, z1: number): number {
        return Math.sqrt(ExtendedVertexData.DistanceSquared(x0, y0, z0, x1, y1, z1));
    }

    private static Corners: BABYLON.Vector3[] = [
        new BABYLON.Vector3(0, 0, 0),
        new BABYLON.Vector3(1, 0, 0),
        new BABYLON.Vector3(1, 0, 1),
        new BABYLON.Vector3(0, 0, 1),
        new BABYLON.Vector3(0, 1, 0),
        new BABYLON.Vector3(1, 1, 0),
        new BABYLON.Vector3(1, 1, 1),
        new BABYLON.Vector3(0, 1, 1),
    ];

    constructor(
        ref: number,
        public vertexData: BABYLON.VertexData
    ) {
        let colors: number[] = [];
        let uvs: number[] = [];

        let d0 = ref & (0b1 << 0);
        let d1 = ref & (0b1 << 1);
        let d2 = ref & (0b1 << 2);
        let d3 = ref & (0b1 << 3);
        let d4 = ref & (0b1 << 4);
        let d5 = ref & (0b1 << 5);
        let d6 = ref & (0b1 << 6);
        let d7 = ref & (0b1 << 7);

        for (let n = 0; n < this.vertexData.indices.length / 3; n++) {
            let n1 = this.vertexData.indices[3 * n];
            let n2 = this.vertexData.indices[3 * n + 1];
            let n3 = this.vertexData.indices[3 * n + 2];

            let x0 = this.vertexData.positions[3 * n1];
            let y0 = this.vertexData.positions[3 * n1 + 1];
            let z0 = this.vertexData.positions[3 * n1 + 2];

            let x1 = this.vertexData.positions[3 * n2];
            let y1 = this.vertexData.positions[3 * n2 + 1];
            let z1 = this.vertexData.positions[3 * n2 + 2];

            let x2 = this.vertexData.positions[3 * n3];
            let y2 = this.vertexData.positions[3 * n3 + 1];
            let z2 = this.vertexData.positions[3 * n3 + 2];

            let xs = [x0, x1, x2];
            let ys = [y0, y1, y2];
            let zs = [z0, z1, z2];

            this.blocks[n] = [];
            for (let vIndex = 0; vIndex < 3; vIndex++) {
                let minDistance = Infinity;
                if (d0) {
                    let distance = ExtendedVertexData.SquaredLength(xs[vIndex], ys[vIndex], zs[vIndex]);
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 0;
                        minDistance = distance;
                    }
                }
                if (d1) {
                    let distance = ExtendedVertexData.SquaredLength((1 - xs[vIndex]), ys[vIndex], zs[vIndex]);
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 1;
                        minDistance = distance;
                    }
                }
                if (d2) {
                    let distance = ExtendedVertexData.SquaredLength((1 - xs[vIndex]), ys[vIndex], (1 - zs[vIndex]));
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 2;
                        minDistance = distance;
                    }
                }
                if (d3) {
                    let distance = ExtendedVertexData.SquaredLength(xs[vIndex], ys[vIndex], (1 - zs[vIndex]));
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 3;
                        minDistance = distance;
                    }
                }
                if (d4) {
                    let distance = ExtendedVertexData.SquaredLength(xs[vIndex], (1 - ys[vIndex]), zs[vIndex]);
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 4;
                        minDistance = distance;
                    }
                }
                if (d5) {
                    let distance = ExtendedVertexData.SquaredLength((1 - xs[vIndex]), (1 - ys[vIndex]), zs[vIndex]);
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 5;
                        minDistance = distance;
                    }
                }
                if (d6) {
                    let distance = ExtendedVertexData.SquaredLength((1 - xs[vIndex]), (1 - ys[vIndex]), (1 - zs[vIndex]));
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 6;
                        minDistance = distance;
                    }
                }
                if (d7) {
                    let distance = ExtendedVertexData.SquaredLength(xs[vIndex], (1 - ys[vIndex]), (1 - zs[vIndex]));
                    if (distance < minDistance) {
                        this.blocks[n][vIndex] = 7;
                        minDistance = distance;
                    }
                }
            }
            
            let corner0 = ExtendedVertexData.Corners[this.blocks[n][0]];
            let corner1 = ExtendedVertexData.Corners[this.blocks[n][1]];
            let corner2 = ExtendedVertexData.Corners[this.blocks[n][2]];

            colors[4 * n1] = 1 - ExtendedVertexData.Distance(x0, y0, z0, corner0.x, corner0.y, corner0.z);
            colors[4 * n1 + 1] = 1 - ExtendedVertexData.Distance(x0, y0, z0, corner1.x, corner1.y, corner1.z);
            colors[4 * n1 + 2] = 1 - ExtendedVertexData.Distance(x0, y0, z0, corner2.x, corner2.y, corner2.z);
            colors[4 * n1 + 3] = 1;

            colors[4 * n2] = 1 - ExtendedVertexData.Distance(x1, y1, z1, corner0.x, corner0.y, corner0.z);
            colors[4 * n2 + 1] = 1 - ExtendedVertexData.Distance(x1, y1, z1, corner1.x, corner1.y, corner1.z);
            colors[4 * n2 + 2] = 1 - ExtendedVertexData.Distance(x1, y1, z1, corner2.x, corner2.y, corner2.z);
            colors[4 * n2 + 3] = 1;

            colors[4 * n3] = 1 - ExtendedVertexData.Distance(x2, y2, z2, corner0.x, corner0.y, corner0.z);
            colors[4 * n3 + 1] = 1 - ExtendedVertexData.Distance(x2, y2, z2, corner1.x, corner1.y, corner1.z);
            colors[4 * n3 + 2] = 1 - ExtendedVertexData.Distance(x2, y2, z2, corner2.x, corner2.y, corner2.z);
            colors[4 * n3 + 3] = 1;

            uvs[2 * n1] = 1;
            uvs[2 * n1 + 1] = 1;
            uvs[2 * n2] = 1;
            uvs[2 * n2 + 1] = 1;
            uvs[2 * n3] = 1;
            uvs[2 * n3 + 1] = 1;
        }

        this.vertexData.colors = colors;
        this.vertexData.uvs = uvs;
    }

    private _tryAddEdge(v1: number, v2: number): void {

    }
}