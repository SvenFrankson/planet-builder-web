enum PlanetGeneratorType {
    Moon,
    Earth,
    Mars,
    Cold,
    Minimal
}

class PlanetGeneratorFactory {

    public static Counter: number = 0;

    public static Create(galaxy: Galaxy, position: BABYLON.Vector3, type: PlanetGeneratorType, kPosMax: number, main: Main): Planet {
        let name = "paulita-planet";
        //let name = "paulita-" + Math.floor(Math.random() * 1000).toString(16) + "-" + PlanetGeneratorFactory.Counter.toFixed(0);
        PlanetGeneratorFactory.Counter++;
        let seaLevelRatio = 0.6;
        if (type === PlanetGeneratorType.Minimal) {
            seaLevelRatio = 0;
        }
        let planet = new Planet(
            galaxy,
            name,
            position,
            kPosMax,
            seaLevelRatio,
            main, 
            (p) => {
                if (type === PlanetGeneratorType.Moon) {
                    return new PlanetGeneratorMoon(p);
                }
                else if (type === PlanetGeneratorType.Earth) {
                    return new PlanetGeneratorEarth(p, 0.15);
                }
                else if (type === PlanetGeneratorType.Mars) {
                    return new PlanetGeneratorMars(p, 0.1);
                }
                else if (type === PlanetGeneratorType.Cold) {
                    return new PlanetGeneratorCold(p, 0.1);
                }
                else if (type === PlanetGeneratorType.Minimal) {
                    return new PlanetGeneratorMinimal(p);
                }
                else {
                    debugger;
                }
            }
        )
        return planet;
    }
}

abstract class PlanetGenerator {

    public type: string = "Unknown";
    public heightMaps: PlanetHeightMap[];
    public altitudeMap: PlanetHeightMap;

    public elements: GeneratorElement[] = [];

    constructor(
        public planet: Planet
    ) {

    }

    public getIntersectingElements(chunck: PlanetChunck): GeneratorElement[] {
        let intersectingElements: GeneratorElement[] = [];
        for (let i = 0; i < this.elements.length; i++) {
            let e = this.elements[i];
            if (chunck.aabbMax.x < e.aabbMin.x) {
                continue;
            }
            if (chunck.aabbMax.y < e.aabbMin.y) {
                continue;
            }
            if (chunck.aabbMax.z < e.aabbMin.z) {
                continue;
            }
            if (chunck.aabbMin.x > e.aabbMax.x) {
                continue;
            }
            if (chunck.aabbMin.y > e.aabbMax.y) {
                continue;
            }
            if (chunck.aabbMin.z > e.aabbMax.z) {
                continue;
            }
            intersectingElements.push(e);
        }
        return intersectingElements;
    }

    public abstract makeData(chunck: PlanetChunck, refData: number[][][], refProcedural: ProceduralTree[]): void;
    
    public abstract getTexture(side: Side, size: number): BABYLON.Texture;

    public showDebug(): void {
        for (let i = 0; i < this.heightMaps.length; i++) {
            let x = - 3.5 + Math.floor(i / 3) * 7;
            if (i === 1) {
                x -= 1;
            }
            if (i === 4) {
                x += 1;
            }
		    Utils.showDebugPlanetHeightMap(this.heightMaps[i], x, 1.5 - 1.5 * (i % 3));
        }
    }
}