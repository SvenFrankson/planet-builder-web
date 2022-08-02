class PlanetChunckMeshBuilderNew {
    
    public static BuildVertexData(
        size: number,
        iPos: number,
        jPos: number,
        kPos: number,
        chunck: PlanetChunck
    ): BABYLON.VertexData {
        let vertexData = new BABYLON.VertexData();

        let r = 1;

        for (let i = - r; i < PlanetTools.CHUNCKSIZE + r; i++) {
            for (let j = - r; j < PlanetTools.CHUNCKSIZE + r; j++) {
                for (let k = - r; k < PlanetTools.CHUNCKSIZE + r; k++) {
                    let iGlobal = i + chunck.iPos * PlanetTools.CHUNCKSIZE;
                    let jGlobal = j + chunck.jPos * PlanetTools.CHUNCKSIZE;
                    let kGlobal = k + chunck.kPos * PlanetTools.CHUNCKSIZE;
                    let data = chunck.planetSide.GetData(iGlobal, jGlobal, kGlobal);
                }
            }
        }


        return vertexData;
    }
}