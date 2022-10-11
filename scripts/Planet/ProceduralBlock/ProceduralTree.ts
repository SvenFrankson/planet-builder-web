class ProceduralTree {

    public chunck: PlanetChunck;
    public i: number;
    public j: number;
    public k: number;

    public generateData(): void {
        let w = PlanetTools.LocalIJKToWorldPosition(this.chunck, this.i, this.j, this.k);
        let n = this.chunck.GetBaryCenter().normalize();
        let chuncks = PlanetBlockMaker.AddLine(this.chunck.planetSide.planet, w, w.add(n.scale(5)), BlockType.Wood);
        for (let i = 0; i < chuncks.length; i++) {
            Game.Instance.chunckManager.requestDraw(chuncks[i]);
        }
        chuncks = PlanetBlockMaker.AddSphere(this.chunck.planetSide.planet, w.add(n.scale(5)), 3, BlockType.Leaf);
        for (let i = 0; i < chuncks.length; i++) {
            Game.Instance.chunckManager.requestDraw(chuncks[i]);
        }
    }
}