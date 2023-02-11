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

    public lodRanges: number[] = [40, 80, 160, 320, 640, 1280];
    public setLodRanges(v: number[], ignoreCallback?: boolean): void {
        this.lodRanges = v;
        if (!ignoreCallback) {
            this.onLodConfigChangedCallbacks.forEach(c => {
                c();
            });
        }
    }

    private _lodMin: number = 1;
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

    private _lodCount: number = 1;
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

    public shellMeshVertexCount: number = 16;
    public shellMeshTextureSize: number = 64;

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

class ConfigurationUI {

    public holoScreenBaseColor: string = "#35b4d4";
    public wristWatchScreenBaseColor: string = "#35b4d4";
    public showBlockBoxWhileEditing: boolean = true;
}

enum ConfigurationPreset {
    None = "none",
    Low = "low",
    Medium = "medium",
    High = "high",
    Custom = "custom"
}

class Configuration {

    public confPreset: ConfigurationPreset = ConfigurationPreset.None;

    public chunckPartConfiguration: ConfigurationChunckPart = new ConfigurationChunckPart();
    public performanceConfiguration: ConfigurationPerformance = new ConfigurationPerformance();
    public controlConfiguration: ConfigurationControl = new ConfigurationControl();
    public uiConfiguration: ConfigurationUI = new ConfigurationUI();

    public setConfHighPreset(): void {
        this.performanceConfiguration.setLodRanges([80, 160, 320, 640, 1280, 2560]);
        this.performanceConfiguration.setHoloScreenFactor(1);
        this.confPreset = ConfigurationPreset.High;
        window.localStorage.setItem("graphic-setting-preset", this.confPreset);
    }
    
    public setConfMediumPreset(): void {
        this.performanceConfiguration.setLodRanges([60, 120, 240, 480, 960, 1920]);
        this.performanceConfiguration.setHoloScreenFactor(0.75);
        this.confPreset = ConfigurationPreset.Medium;
        window.localStorage.setItem("graphic-setting-preset", this.confPreset);
    }
    
    public setConfLowPreset(): void {
        this.performanceConfiguration.setLodRanges([40, 80, 160, 320, 640, 1280]);
        this.performanceConfiguration.setHoloScreenFactor(0.5);
        this.confPreset = ConfigurationPreset.Low;
        window.localStorage.setItem("graphic-setting-preset", this.confPreset);
    }
}

var Config: Configuration = new Configuration();