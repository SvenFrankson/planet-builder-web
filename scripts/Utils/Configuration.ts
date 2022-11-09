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
}

class Configuration {

    public chunckPartConfiguration: ConfigurationChunckPart = new ConfigurationChunckPart();
    public performanceConfiguration: ConfigurationPerformance = new ConfigurationPerformance();
}

var Config: Configuration = new Configuration();