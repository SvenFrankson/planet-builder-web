class ModelingWorkbenchButton extends PickableObject {

    constructor(
        name: string,
        bodyMaterial: BABYLON.Material,
        iconMaterial: BABYLON.Material,
        iconCoordinates: BABYLON.Vector2,
        main: Main
    ) {
        super(name, main);
        
        BABYLON.CreateBoxVertexData({ width: 0.08, height: 0.02, depth: 0.08 }).applyToMesh(this);
        this.material = bodyMaterial;
        this.layerMask = 0x10000000;
        
        let iconMesh = new BABYLON.Mesh(name + "-icon");
        VertexDataUtils.CreatePlane(0.08, 0.08, undefined, undefined, iconCoordinates.x/8, 1-(iconCoordinates.y + 1)/8, (iconCoordinates.x+1)/8, 1-(iconCoordinates.y)/8).applyToMesh(iconMesh);
        iconMesh.material = iconMaterial;
        iconMesh.parent = this;
        iconMesh.rotation.x = Math.PI * 0.5;
        iconMesh.layerMask = 0x10000000;
    }
}