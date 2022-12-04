class ToonMaterial extends BABYLON.ShaderMaterial {

    constructor(name: string, scene: BABYLON.Scene) {
        super(
            name,
            scene,
            {
                vertex: "toon",
                fragment: "toon",
            },
            {
                attributes: ["position", "normal", "uv", "color"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection", "lightInvDirW"]
            }
        );

        this.setVector3("lightInvDirW", (new BABYLON.Vector3(0.5, 2.5, 1.5)).normalize());
    }
}