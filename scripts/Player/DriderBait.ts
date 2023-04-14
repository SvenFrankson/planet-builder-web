class DriderBait extends PlanetObject {
    
    private static _Instances: UniqueList<DriderBait>;
    public static get Instances(): UniqueList<DriderBait> {
        if (!DriderBait._Instances) {
            DriderBait._Instances = new UniqueList<DriderBait>();
        }
        return DriderBait._Instances;
    }

    public activated: boolean = false;

    constructor(main: Main) {
        super("drider-bait", main);
    }

    public async instantiate(): Promise<void> {
        DriderBait.Instances.push(this);
        BABYLON.CreateBoxVertexData({ size: 0.5 }).applyToMesh(this);
        this.material = new ToonMaterial(this.name + "-material", this.main.scene);
        console.log("hoy");
    }

    public dispose(doNotRecurse?: boolean, disposeMaterialAndTextures?: boolean): void {
        DriderBait.Instances.remove(this);
        super.dispose(doNotRecurse, disposeMaterialAndTextures);
    }
}