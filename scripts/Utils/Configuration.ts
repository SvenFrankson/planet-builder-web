/// <reference path="./UniqueList.ts"/>

class ConfigurationChunckPart {

    public dir: string = "datas/meshes";
    private _filename: string = "chunck-parts";
    public get filename(): string {
        return this._filename;
    }
    public setFilename(v: string, ignoreCallback?: boolean): void {
        this._filename = v;
        if (!ignoreCallback) {
            this.onChunckPartConfigChangedCallbacks.forEach(c => {
                c();
            });
        }
    }


    private _lodMin: number = 0;
    public get lodMin(): number {
        return this._lodMin;
    }
    public setLodMin(v: number, ignoreCallback?: boolean): void {
        this._lodMin = v;
        if (!ignoreCallback) {
            this.onChunckPartConfigChangedCallbacks.forEach(c => {
                c();
            });
        }
    }

    private _lodMax: number = 2;
    public get lodMax(): number {
        return this._lodMax;
    }
    public setLodMax(v: number, ignoreCallback?: boolean): void {
        this._lodMax = v;
        if (!ignoreCallback) {
            this.onChunckPartConfigChangedCallbacks.forEach(c => {
                c();
            });
        }
    }

    public useXZAxisRotation: boolean = true;

    public onChunckPartConfigChangedCallbacks: UniqueList<() => void> = new UniqueList<() => void>();
}

class ConfigurationPerformance {

    public lodRanges: number[] = [20, 100, 150, 200, 250, 300, 350, 400];

    private _lodMin: number = 0;
    public get lodMin(): number {
        return this._lodMin;
    }
    public setLodMin(v: number, ignoreCallback?: boolean): void {
        this._lodMin = v;
        if (!ignoreCallback) {
            this.onLodConfigChangedCallbacks.forEach(c => {
                c();
            });
        }
    }

    private _lodCount: number = 2;
    public get lodCount(): number {
        return this._lodCount;
    }
    public setLodCount(v: number, ignoreCallback?: boolean): void {
        this._lodCount = v;
        if (!ignoreCallback) {
            this.onLodConfigChangedCallbacks.forEach(c => {
                c();
            });
        }
    }
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


    public onLodConfigChangedCallbacks: UniqueList<() => void> = new UniqueList<() => void>();
    public onHoloScreenFactorChangedCallbacks: UniqueList<() => void> = new UniqueList<() => void>();
}

class ConfigurationControl {

    public canLockPointer: boolean = false;
}

class Configuration {

    public chunckPartConfiguration: ConfigurationChunckPart = new ConfigurationChunckPart();
    public performanceConfiguration: ConfigurationPerformance = new ConfigurationPerformance();
    public controlConfiguration: ConfigurationControl = new ConfigurationControl();

    public setConfHighPreset(): void {
        this.performanceConfiguration.setLodCount(3);
        this.performanceConfiguration.setLodMin(0);
        this.performanceConfiguration.setHoloScreenFactor(1);
        
    }
    
    public setConfMediumPreset(): void {
        this.performanceConfiguration.setLodCount(2);
        this.performanceConfiguration.setLodMin(1);
        this.performanceConfiguration.setHoloScreenFactor(0.75);
    }
    
    public setConfLowPreset(): void {
        this.performanceConfiguration.setLodCount(1);
        this.performanceConfiguration.setLodMin(2);
        this.performanceConfiguration.setHoloScreenFactor(0.5);
    }
}

var Config: Configuration = new Configuration();