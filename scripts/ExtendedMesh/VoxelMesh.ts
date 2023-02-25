class VoxelMeshMaker {

    public root: OctreeNode<number>;
    public size: number;
	public halfSize: number;

	public exMesh: ExtendedMesh;

	private _blocks: number[][][] = [];
	private _vertices: number[][][] = [];

    constructor(public degree: number) {
        this.root = new OctreeNode<number>(degree);
        this.size = Math.pow(2, degree);
		this.halfSize = this.size * 0.5;
    }

	private _getBlock(i: number, j: number, k: number): number {
		if (this._blocks[i]) {
			if (this._blocks[i][j]) {
				return this._blocks[i][j][k];
			}
		}
	}

	private _addBlock(v: number, i: number, j: number, k: number): void {
		if (!this._blocks[i]) {
			this._blocks[i] = [];
		}
		if (!this._blocks[i][j]) {
			this._blocks[i][j] = [];
		}
		if (isNaN(this._blocks[i][j][k])) {
			this._blocks[i][j][k] = 0;
		}
		this._blocks[i][j][k] |= v;
	}

	private _setBlock(v: number, i: number, j: number, k: number): void {
		if (!this._blocks[i]) {
			this._blocks[i] = [];
		}
		if (!this._blocks[i][j]) {
			this._blocks[i][j] = [];
		}
		this._blocks[i][j][k] = v;
	}

	private _getVertex(i: number, j: number, k: number): number {
		if (this._vertices[i]) {
			if (this._vertices[i][j]) {
				return this._vertices[i][j][k];
			}
		}
	}

	private _setVertex(v: number, i: number, j: number, k: number): void {
		if (!this._vertices[i]) {
			this._vertices[i] = [];
		}
		if (!this._vertices[i][j]) {
			this._vertices[i][j] = [];
		}
		this._vertices[i][j][k] = v;
	}
	

	public addCube(value: number, center: BABYLON.Vector3, size: number, rand: number = 1): void {
		let n = Math.floor(size * 0.5);

		for (let i = 0; i < size; i++) {
			for (let j = 0; j < size; j++) {
				for (let k = 0; k < size; k++) {
					if (Math.random() < rand) {
						let I = Math.floor(center.x + i - n + this.halfSize);
						let J = Math.floor(center.y + j - n + this.halfSize);
						let K = Math.floor(center.z + k - n + this.halfSize);
						if (I >= 0 && J >= 0 && K >= 0) {
							if (I < this.root.size && J < this.root.size && K < this.root.size) {
								this.root.set(value, I, J, K);
							}
						}
					}
				}
			}
		}
	}

    private _syncOctreeAndGrid(): void {
        this._blocks = [];

        this.root.forEach((v, i, j, k) => {
            if (v > 0) {
                let cube = BABYLON.MeshBuilder.CreateBox("cube", { size: 0.99 });
                cube.visibility = 0.2;
                cube.position.x = i - this.size * 0.5 + 0.5;
                cube.position.y = j - this.size * 0.5 + 0.5;
                cube.position.z = k - this.size * 0.5 + 0.5;

                this._addBlock(0b1 << 6, i - 1, j - 1, k - 1);
                this._addBlock(0b1 << 7, i, j - 1, k - 1);
                this._addBlock(0b1 << 4, i, j - 1, k);
                this._addBlock(0b1 << 5, i - 1, j - 1, k);
                this._addBlock(0b1 << 2, i - 1, j, k - 1);
                this._addBlock(0b1 << 3, i, j, k - 1);
                this._addBlock(0b1 << 0, i, j, k);
                this._addBlock(0b1 << 1, i - 1, j, k);
            }
        });
    }

	public buildMesh(smoothCount: number, maxTriangles: number = Infinity, minCost: number = 0): BABYLON.VertexData {
        this._syncOctreeAndGrid();

		console.log(this._blocks);

		this._vertices = [];

		let vertexData = new BABYLON.VertexData();
		let positions: number[] = [];
		let indices: number[] = [];

		for (let i = 0; i < this._blocks.length; i++) {
			let iLine = this._blocks[i];
			if (iLine) {
				for (let j = 0; j < iLine.length; j++) {
					let jLine = iLine[j];
					if (jLine) {
						for (let k = 0; k < jLine.length; k++) {
							let value = jLine[k];
							if (isFinite(value) && value != 0 && value != 0b11111111) {
								//console.log(value.toString(2));
								let extendedpartVertexData = VoxelVertexData.Get(value);
								if (extendedpartVertexData) {
									let vData = extendedpartVertexData.vertexData;
									let partIndexes = [];
									for (let p = 0; p < vData.positions.length / 3; p++) {
										let x = vData.positions[3 * p] + i + 0.5 - this.size * 0.5;
										let y = vData.positions[3 * p + 1] + j + 0.5 - this.size * 0.5;
										let z = vData.positions[3 * p + 2] + k + 0.5 - this.size * 0.5;

										let existingIndex = this._getVertex(Math.round(10 * x), Math.round(10 * y), Math.round(10 * z));
										if (isFinite(existingIndex)) {
											partIndexes[p] = existingIndex;
										}
										else {
											let l = positions.length / 3;
											partIndexes[p] = l;
											positions.push(x, y, z);
											this._setVertex(l, Math.round(10 * x), Math.round(10 * y), Math.round(10 * z))
										}
	
									}
									//console.log(partIndexes);
									indices.push(...vData.indices.map(index => { return partIndexes[index]; }));
								}
							}
						}
					}
				}
			}
		}

		console.log(positions);

		this.exMesh = new ExtendedMesh(positions, indices);

		for (let n = 0; n < smoothCount; n++) {
			//this.exMesh.smooth(1);
		}


		vertexData.positions = this.exMesh.getPositions();
		vertexData.indices = this.exMesh.getIndices();
		vertexData.normals = this.exMesh.getNormals();

		return vertexData;
	}
}