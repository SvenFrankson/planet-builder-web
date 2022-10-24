class ProceduralTree {

    public chunck: PlanetChunck;
    public i: number;
    public j: number;
    public k: number;

    constructor(public chunckManager: PlanetChunckManager) {

    }

    public generateData(): void {
        let w = PlanetTools.LocalIJKToWorldPosition(this.chunck, this.i, this.j, this.k);
        let n = this.chunck.GetBaryCenter().clone().normalize();
        let chuncks = PlanetBlockMaker.AddLine(this.chunck.planetSide.planet, w, w.add(n.scale(5)), BlockType.Wood);
        chuncks.push(...PlanetBlockMaker.AddSphere(this.chunck.planetSide.planet, w.add(n.scale(5)), 3, BlockType.Leaf));
        for (let i = 0; i < chuncks.length; i++) {
            chuncks[i].doDataSafety();
            if (chuncks[i].lod <= 1) {
                this.chunckManager.requestDraw(chuncks[i], chuncks[i].lod);
            }
        }
    }
}