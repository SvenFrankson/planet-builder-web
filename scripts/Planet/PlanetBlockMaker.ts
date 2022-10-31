class PlanetBlockMaker {

    public static AddSphere(planet: Planet, world: BABYLON.Vector3, radius: number, block: BlockType): PlanetChunck[] {
        let impactedChunck: PlanetChunck[] = [];
        for (let x = - radius; x < radius + 0.6; x += 0.6) {
            for (let y = - radius; y < radius + 0.6; y += 0.6) {
                for (let z = - radius; z < radius + 0.6; z += 0.6) {
                    x = Math.min(x, radius);
                    y = Math.min(y, radius);
                    z = Math.min(z, radius);
                    if (x * x + y * y + z * z < radius * radius) {
                        let p = new BABYLON.Vector3(world.x + x, world.y + y, world.z + z);
                        let planetSide = PlanetTools.WorldPositionToPlanetSide(planet, p);
                        let globalIJK = PlanetTools.WorldPositionToGlobalIJK(planetSide, p);
                        let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
                        let chunck = localIJK.planetChunck;
                        if (chunck) {
                            chunck.SetData(localIJK.i, localIJK.j, localIJK.k, block, true);
                            if (impactedChunck.indexOf(chunck) === - 1) {
                                impactedChunck.push(chunck);
                            }
                        }
                    }
                }
            }
        }
        return impactedChunck;
    }

    public static AddLine(planet: Planet, from: BABYLON.Vector3, to: BABYLON.Vector3, block: number): PlanetChunck[] {
        let impactedChunck: PlanetChunck[] = [];
        let o = from.clone();
        let l = BABYLON.Vector3.Distance(from, to);
        let count = Math.round(l / 0.7);
        for (let i = 0; i <= count; i++) {
            let x = from.x + (to.x - from.x) * i / count;
            let y = from.y + (to.y - from.y) * i / count;
            let z = from.z + (to.z - from.z) * i / count;
            
            let p = new BABYLON.Vector3(x, y, z);
            let planetSide = PlanetTools.WorldPositionToPlanetSide(planet, p);
            let globalIJK = PlanetTools.WorldPositionToGlobalIJK(planetSide, p);
            let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
            let chunck = localIJK.planetChunck;
            if (chunck) {
                chunck.SetData(localIJK.i, localIJK.j, localIJK.k, block, true);
                if (impactedChunck.indexOf(chunck) === - 1) {
                    impactedChunck.push(chunck);
                }
            }
        } 
        
        return impactedChunck;
    }
}