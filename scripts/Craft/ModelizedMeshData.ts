interface IModelizedMeshData {

    cubeSize: number;
    degree: number;
    colors: string[];
    octrees: string[];
}

class ModelizedMeshData {

    public static datas: Map<string, ModelizedMeshData> = new Map<string, ModelizedMeshData>();
    public vertexData: BABYLON.VertexData;

    constructor(
        public name: string,
        public cubeSize: number = 0.05,
        public degree: number = 6,
        public octrees: Map<string, OctreeNode<number>> = new Map<string, OctreeNode<number>>()
    ){
        this.buildVertexData();
        ModelizedMeshData.datas.set(name, this);
    }

    public static Get(name: string): ModelizedMeshData {
        if (ModelizedMeshData.datas.get(name)) {
            return ModelizedMeshData.datas.get(name);
        }

        let storedMMD = window.localStorage.getItem(name);
        if (storedMMD) {
            let mmd = ModelizedMeshData.Deserialize(name, storedMMD);
            ModelizedMeshData.datas.set(name, mmd);
            return mmd;
        }
    }

    public buildVertexData(): void {
        let vertexDatas: BABYLON.VertexData[] = [];
        
        this.octrees.forEach((octree, color) => {
            let voxelMesh = new VoxelMesh(this.degree);
            voxelMesh.cubeSize = this.cubeSize;
            voxelMesh.root = octree;
            let vertexData = voxelMesh.buildMesh(1, BABYLON.Color3.FromHexString(color));
            vertexDatas.push(vertexData);
        });

        this.vertexData = VertexDataUtils.Merge(...vertexDatas);
    }

    public serialize(): string {
        let data: IModelizedMeshData = {
            cubeSize: this.cubeSize,
            degree: this.degree,
            colors: [],
            octrees: []
        }
        this.octrees.forEach((octree, color) => {
            data.colors.push(color);
            data.octrees.push(octree.serializeToString());
        });
        return JSON.stringify(data);
    }

    public static Deserialize(name: string, input: string): ModelizedMeshData {
        let data: IModelizedMeshData = JSON.parse(input);
        let cubeSize = data.cubeSize;
        let degree = data.degree;
        let octrees = new Map<string, OctreeNode<number>>();
        for (let i = 0; i < data.colors.length && i < data.octrees.length; i++) {
            let color = data.colors[i];
            let octree = OctreeNode.DeserializeFromString(data.octrees[i]);
            octrees.set(color, octree);
        }

        return new ModelizedMeshData(name, cubeSize, degree, octrees);
    }
}