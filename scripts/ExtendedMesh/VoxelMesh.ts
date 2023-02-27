interface ICubeMeshProperties {
	baseColor?: BABYLON.Color4;
	highlightX?: number;
	highlightY?: number;
	highlightZ?: number;
	highlightColor?: BABYLON.Color4;
}

interface IGridDesc {
	minX: number;
	maxX: number;
	minY: number;
	maxY: number;
	blocks: number[][];
}

class VoxelMesh {

	public cubeSize: number = 0.1;
    public root: OctreeNode<number>;
    private _size: number;
	public get size(): number {
		return this._size;
	}
	private _halfSize: number;
	public get halfSize(): number {
		return this._halfSize;
	}

	public exMesh: ExtendedMesh;

	private _blocks: number[][][] = [];
	private _vertices: number[][][] = [];

    constructor(public degree: number) {
        this.root = new OctreeNode<number>(degree);
        this._size = Math.pow(2, degree);
		this._halfSize = this._size * 0.5;
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
						let I = Math.floor(center.x + i - n + this._halfSize);
						let J = Math.floor(center.y + j - n + this._halfSize);
						let K = Math.floor(center.z + k - n + this._halfSize);
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

    private _syncOctreeAndGridAsCube(): void {
        this._blocks = [];

        this.root.forEach((v, i, j, k) => {
            if (v > 0) {
                this._setBlock(1, i, j, k);
            }
        });
    }

	public buildCubeMesh(prop?: ICubeMeshProperties, gridDesc?: IGridDesc): BABYLON.VertexData {
		this._syncOctreeAndGridAsCube();

		this._vertices = [];

		let vertexData = new BABYLON.VertexData();
		let positions: number[] = [];
		let normals: number[] = [];
		let colors: number[] = [];
		let indices: number[] = [];

		let baseColorAsArray = [1, 1, 1, 1];
		if (prop && prop.baseColor) {
			baseColorAsArray = prop.baseColor.asArray();
		}
		let highlightColorAsArray = [1, 1, 1, 1];
		if (prop && prop.highlightColor) {
			highlightColorAsArray = prop.highlightColor.asArray();
		}

		for (let i = 0; i < this._blocks.length; i++) {
			let x0 = (i - this._size * 0.5) * this.cubeSize;
			let x1 = (i + 1 - this._size * 0.5) * this.cubeSize;
			let iLine = this._blocks[i];
			if (iLine) {
				for (let j = 0; j < iLine.length; j++) {
					let y0 = (j - this._size * 0.5) * this.cubeSize;
					let y1 = (j + 1 - this._size * 0.5) * this.cubeSize;
					let jLine = iLine[j];
					if (jLine) {
						for (let k = 0; k < jLine.length; k++) {
							let z0 = (k - this._size * 0.5) * this.cubeSize;
							let z1 = (k + 1 - this._size * 0.5) * this.cubeSize;
							let value = jLine[k];
							if (value > 0) {
								let color = baseColorAsArray;
								if (prop && Math.floor(i - this._size * 0.5) === prop.highlightX) {
									color = highlightColorAsArray;
								}
								if (prop && isFinite(prop.highlightY)) {
									if (gridDesc) {
										gridDesc.minX = Math.min(gridDesc.minX, i);
										gridDesc.maxX = Math.max(gridDesc.maxX, i);
										gridDesc.minY = Math.min(gridDesc.minY, k);
										gridDesc.maxY = Math.max(gridDesc.maxY, k);
									}
									if (Math.floor(j - this._size * 0.5) === prop.highlightY) {
										color = highlightColorAsArray;
										if (gridDesc) {
											if (!gridDesc.blocks[i]) {
												gridDesc.blocks[i] = [];
											}
											gridDesc.blocks[i][k] = 1;
										}
									}
								}
								if (prop && Math.floor(j - this._size * 0.5) === prop.highlightZ) {
									color = highlightColorAsArray;
								}

								if (this._getBlock(i + 1, j, k) != 1) {
									let l = positions.length / 3;

									positions.push(x1, y0, z0);
									positions.push(x1, y0, z1);
									positions.push(x1, y1, z1);
									positions.push(x1, y1, z0);

									normals.push(1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0);
									colors.push(...color, ...color, ...color, ...color);

									indices.push(l, l + 1, l + 2, l, l + 2, l + 3);
								}
								if (this._getBlock(i - 1, j, k) != 1) {
									let l = positions.length / 3;

									positions.push(x0, y0, z1);
									positions.push(x0, y0, z0);
									positions.push(x0, y1, z0);
									positions.push(x0, y1, z1);

									normals.push(- 1, 0, 0, - 1, 0, 0, - 1, 0, 0, - 1, 0, 0);
									colors.push(...color, ...color, ...color, ...color);

									indices.push(l, l + 1, l + 2, l, l + 2, l + 3);
								}
								if (this._getBlock(i, j + 1, k) != 1) {
									let l = positions.length / 3;

									positions.push(x0, y1, z0);
									positions.push(x1, y1, z0);
									positions.push(x1, y1, z1);
									positions.push(x0, y1, z1);

									normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0);
									colors.push(...color, ...color, ...color, ...color);

									indices.push(l, l + 1, l + 2, l, l + 2, l + 3);
								}
								if (this._getBlock(i, j - 1, k) != 1) {
									let l = positions.length / 3;

									positions.push(x1, y0, z0);
									positions.push(x0, y0, z0);
									positions.push(x0, y0, z1);
									positions.push(x1, y0, z1);

									normals.push(0, - 1, 0, 0, - 1, 0, 0, - 1, 0, 0, - 1, 0);
									colors.push(...color, ...color, ...color, ...color);

									indices.push(l, l + 1, l + 2, l, l + 2, l + 3);
								}
								if (this._getBlock(i, j, k + 1) != 1) {
									let l = positions.length / 3;

									positions.push(x1, y0, z1);
									positions.push(x0, y0, z1);
									positions.push(x0, y1, z1);
									positions.push(x1, y1, z1);

									normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1);
									colors.push(...color, ...color, ...color, ...color);

									indices.push(l, l + 1, l + 2, l, l + 2, l + 3);
								}
								if (this._getBlock(i, j, k - 1) != 1) {
									let l = positions.length / 3;

									positions.push(x0, y0, z0);
									positions.push(x1, y0, z0);
									positions.push(x1, y1, z0);
									positions.push(x0, y1, z0);

									normals.push(0, 0, - 1, 0, 0, - 1, 0, 0, - 1, 0, 0, - 1);
									colors.push(...color, ...color, ...color, ...color);

									indices.push(l, l + 1, l + 2, l, l + 2, l + 3);
								}
							}
						}
					}
				}
			}
		}

		vertexData.positions = positions;
		vertexData.colors = colors;
		vertexData.indices = indices;
		vertexData.normals = normals;

		return vertexData;
	}

	public buildMesh(smoothCount: number, maxTriangles: number = Infinity, minCost: number = 0): BABYLON.VertexData {
        this._syncOctreeAndGrid();

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
										let x = vData.positions[3 * p] + i + 0.5 - this._size * 0.5;
										let y = vData.positions[3 * p + 1] + j + 0.5 - this._size * 0.5;
										let z = vData.positions[3 * p + 2] + k + 0.5 - this._size * 0.5;

										let existingIndex = this._getVertex(Math.round(10 * x), Math.round(10 * y), Math.round(10 * z));
										if (isFinite(existingIndex)) {
											partIndexes[p] = existingIndex;
										}
										else {
											let l = positions.length / 3;
											partIndexes[p] = l;
											positions.push(x * this.cubeSize, y * this.cubeSize, z * this.cubeSize);
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
			this.exMesh.smooth(1);
		}


		vertexData.positions = this.exMesh.getPositions();
		vertexData.colors = this.exMesh.getColors(BABYLON.Color3.White());
		vertexData.indices = this.exMesh.getIndices();
		vertexData.normals = this.exMesh.getNormals();

		return vertexData;
	}
}