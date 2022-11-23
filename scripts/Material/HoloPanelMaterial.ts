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
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "alpha"],
                needAlphaBlending: true
            }
        );
        
        this.setFloat("alpha", this._alpha);
        this.setFloat("offset", this._offset);
    }

    public get offset(): number {
        return this._offset;
    }

    public set offset(v: number) {
        this._offset = v;
        this.setFloat("offset", this._offset);
    }

    public get alpha(): number {
        return this._alpha;
    }

    public set alpha(v: number) {
        this._alpha = v;
        this.setFloat("alpha", this._alpha);
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