class MeshUtils {
    
    public static CreateLineBox(
        name: string,
        scene?: BABYLON.Scene,
        w: number = 1,
        h: number = 1,
        d: number = 1,
        x0?: number,
        y0?: number,
        z0?: number,
    ): BABYLON.Mesh {
        if (!isFinite(x0)) {
            x0 = - w * 0.5;
        }
        if (!isFinite(y0)) {
            y0 = - h * 0.5;
        }
        if (!isFinite(z0)) {
            z0 = - d * 0.5;
        }

        if (!scene) {
            scene = BABYLON.Engine.Instances[0].scenes[0];
        }

        let pts = [new BABYLON.Vector3(x0, y0, z0)];
        pts.push(pts[0].clone().addInPlaceFromFloats(w, 0, 0));
        pts.push(pts[0].clone().addInPlaceFromFloats(w, 0, d));
        pts.push(pts[0].clone().addInPlaceFromFloats(0, 0, d));
        pts.push(pts[0].clone().addInPlaceFromFloats(0, h, 0));
        pts.push(pts[0].clone().addInPlaceFromFloats(w, h, 0));
        pts.push(pts[0].clone().addInPlaceFromFloats(w, h, d));
        pts.push(pts[0].clone().addInPlaceFromFloats(0, h, d));

        return BABYLON.MeshBuilder.CreateLineSystem(
            name,
            {
                lines: [
                    [pts[0], pts[1], pts[2], pts[3], pts[0]],
                    [pts[0], pts[4]],
                    [pts[1], pts[5]],
                    [pts[2], pts[6]],
                    [pts[3], pts[7]],
                    [pts[4], pts[5], pts[6], pts[7], pts[4]],
                ]
            },
            scene
        );
    }
}