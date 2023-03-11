class ModelingWorkbenchButton extends Pickable {

    public get size(): number {
        return this.scaling.x;
    }

    public set size(v: number) {
        this.scaling.copyFromFloats(v, v, v);
    }

    public animateSize = AnimationFactory.CreateNumber(this, this, "size");

    private _iconMesh: BABYLON.Mesh;

    constructor(
        name: string,
        bodyMaterial: BABYLON.Material,
        iconMaterial: BABYLON.Material,
        private _iconCoordinates: BABYLON.Vector2[],
        main: Main,
        public index: number = 0
    ) {
        super(name, main);
        
        BABYLON.CreateBoxVertexData({ width: 0.08, height: 0.02, depth: 0.08 }).applyToMesh(this);
        this.material = bodyMaterial;
        this.layerMask = 0x10000000;
        
        this._iconMesh = new BABYLON.Mesh(name + "-icon");
        VertexDataUtils.CreatePlane(
            0.08, 0.08, undefined, undefined,
            this._iconCoordinates[this.index].x/8,
            1-(this._iconCoordinates[this.index].y + 1)/8,
            (this._iconCoordinates[this.index].x+1)/8,
            1-(this._iconCoordinates[this.index].y)/8
        ).applyToMesh(this._iconMesh);
        this._iconMesh.material = iconMaterial;
        this._iconMesh.parent = this;
        this._iconMesh.rotation.x = Math.PI * 0.5;
        this._iconMesh.layerMask = 0x10000000;
    }

    public async click(): Promise<void> {
        await this.animateSize(1.2, 0.15);
        await this.animateSize(1, 0.15);
    }

    public onClick = (n?: number) => {};

    public onPointerUp(): void {
        this.click();
        this.index = (this.index + 1) % this._iconCoordinates.length;
        if (this._iconCoordinates.length > 1) {
            VertexDataUtils.CreatePlane(
                0.08, 0.08, undefined, undefined,
                this._iconCoordinates[this.index].x/8,
                1-(this._iconCoordinates[this.index].y + 1)/8,
                (this._iconCoordinates[this.index].x+1)/8,
                1-(this._iconCoordinates[this.index].y)/8
            ).applyToMesh(this._iconMesh);
        }
        this.onClick(this.index);
    }
}