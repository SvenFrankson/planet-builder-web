interface IModelizedMeshData {

    cubeSize: number;
    degree: number;
    colors: string[];
    octrees: string[];
}

class ModelizedMeshData {

    public cubeSize: number = 0.05;
    public degree: number = 6;
    public octrees: Map<string, OctreeNode<number>> = new Map<string, OctreeNode<number>>();

    public vertexData: BABYLON.VertexData;

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

    public static Deserialize(input: string): ModelizedMeshData {
        let modelizedMeshData = new ModelizedMeshData();

        let data: IModelizedMeshData = JSON.parse(input);
        modelizedMeshData.cubeSize = data.cubeSize;
        modelizedMeshData.degree = data.degree;
        modelizedMeshData.octrees = new Map<string, OctreeNode<number>>();
        for (let i = 0; i < data.colors.length && i < data.octrees.length; i++) {
            let color = data.colors[i];
            let octree = OctreeNode.DeserializeFromString(data.octrees[i]);
            modelizedMeshData.octrees.set(color, octree);
        }

        return modelizedMeshData;
    }
}