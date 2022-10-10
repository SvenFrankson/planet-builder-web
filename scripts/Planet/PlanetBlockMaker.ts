class PlanetBlockMaker {

    public static AddSphere(planet: Planet, world: BABYLON.Vector3, radius: number, block: BlockType): PlanetChunck[] {
        let impactedChunck: PlanetChunck[] = [];
        for (let x = - radius + 0.35; x < radius; x += 0.7) {
            for (let y = - radius + 0.35; y < radius; y += 0.7) {
                for (let z = - radius + 0.35; z < radius; z += 0.7) {

                    if (x * x + y * y + z * z < radius * radius) {
                        let p = new BABYLON.Vector3(world.x + x, world.y + y, world.z + z);
                        let planetSide = PlanetTools.WorldPositionToPlanetSide(planet, p);
                        let globalIJK = PlanetTools.WorldPositionToGlobalIJK(planetSide, p);
                        let localIJK = PlanetTools.GlobalIJKToLocalIJK(planetSide, globalIJK);
                        let chunck = localIJK.planetChunck;
                        if (chunck) {
                            console.log(localIJK);
                            chunck.SetData(localIJK.i, localIJK.j, localIJK.k, block);
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
}