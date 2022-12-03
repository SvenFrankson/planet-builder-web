/// <reference path="./UniqueList.ts"/>

class ConfigurationChunckPart {

    public dir: string = "datas/meshes";
    public filename: string = "chunck-parts";
    public lodMin: number = 0;
    public lodMax: number = 2;
    public useXZAxisRotation: boolean = true;
}

class ConfigurationPerformance {

    public lodRanges: number[] = [20, 100, 150, 200, 250, 300, 350, 400];
    public lodCount: number = 2;
    public seaLevelMeshVertexCount: number = 16;
    private _holoScreenFactor: number = 0.4;
    public get holoScreenFactor(): number {
        return this._holoScreenFactor;
    }
    public setHoloScreenFactor(v: number, ignoreCallback?: boolean): void {
        this._holoScreenFactor = v;
        if (!ignoreCallback) {
            this.onHoloScreenFactorChangedCallbacks.forEach(c => {
                c();
            });
        }
    }

    public onHoloScreenFactorChangedCallbacks: UniqueList<() => void> = new UniqueList<() => void>();
}

class ConfigurationControl {

    public canLockPointer: boolean = false;
}

class Configuration {

    public chunckPartConfiguration: ConfigurationChunckPart = new ConfigurationChunckPart();
    public performanceConfiguration: ConfigurationPerformance = new ConfigurationPerformance();
    public controlConfiguration: ConfigurationControl = new ConfigurationControl();
}

var Config: Configuration = new Configuration();