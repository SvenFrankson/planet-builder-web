class HoloPanelMaterial extends BABYLON.ShaderMaterial {

    private _offset: number = 0;

    constructor(name: string, scene: BABYLON.Scene) {
        super(
            name,
            scene,
            {
                vertex: "holoPanel",
                fragment: "holoPanel",
            },
            {
                attributes: ["position", "normal", "uv", "color"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"],
                needAlphaBlending: true
            }
        );
        
        this.setFloat("offset", this._offset);
    }

    public getOffset(): number {
        return this._offset;
    }

    public setOffset(v: number): void {
        this._offset = v;
        this.setFloat("offset", this._offset);
    }

    private _holoTexture: BABYLON.Texture;
    public get holoTexture(): BABYLON.Texture {
        return this._holoTexture
    }

    public set holoTexture(t: BABYLON.Texture) {
        this._holoTexture = t;
        this.setTexture("holoTexture", this._holoTexture);
    }
}