class ConfigurationChunckPart {

    public dir: string = "datas/meshes";
    public filename: string = "chunck-parts";
    public lodMin: number = 0;
    public lodMax: number = 2;
    public useXZAxisRotation: boolean = true;
}

class Configuration {

    public chunckPartConfiguration: ConfigurationChunckPart = new ConfigurationChunckPart();
}

var Config: Configuration = new Configuration();