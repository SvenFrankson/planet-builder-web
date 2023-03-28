class VPickInfo {

    public hit: boolean = false;
    public localPoint: BABYLON.Vector3;
    public worldPoint: BABYLON.Vector3;
    public worldNormal: BABYLON.Vector3;
    public distance: number;
}

class VCollision {

    public static closestPointOnMesh(worldPoint: BABYLON.Vector3, mesh: BABYLON.Mesh): VPickInfo {
        let pickInfo = new VPickInfo();

        let localPoint = BABYLON.Vector3.TransformCoordinates(worldPoint, mesh.getWorldMatrix().clone().invert());
        let minIndex = -1;
        let minSqrDist = Infinity;
        let positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        for (let i = 0; i < positions.length / 3; i++) {
            let dx = localPoint.x - positions[3 * i];
            let dy = localPoint.y - positions[3 * i + 1];
            let dz = localPoint.z - positions[3 * i + 2];

            let sqrDist = dx * dx + dy * dy + dz * dz;
            if (sqrDist < minSqrDist) {
                minIndex = i;
                minSqrDist = sqrDist;
            }
        }

        let triangles: number[] = [];
        let indices = mesh.getIndices();
        for (let i = 0; i < indices.length / 3; i++) {
            let i1 = indices[3 * i];
            let i2 = indices[3 * i + 1];
            let i3 = indices[3 * i + 2];

            if (i1 === minIndex || i2 === minIndex || i3 === minIndex) {
                triangles.push(i1, i2, i3);
            }
        }

        let minDist = Infinity;

        for (let i = 0; i < triangles.length / 3; i++) {
            let i1 = triangles[3 * i];
            let i2 = triangles[3 * i + 1];
            let i3 = triangles[3 * i + 2];
            
            let p1 = new BABYLON.Vector3(positions[3 * i1], positions[3 * i1 + 1], positions[3 * i1 + 2]);
            let p2 = new BABYLON.Vector3(positions[3 * i2], positions[3 * i2 + 1], positions[3 * i2 + 2]);
            let p3 = new BABYLON.Vector3(positions[3 * i3], positions[3 * i3 + 1], positions[3 * i3 + 2]);

            let v12 = p2.subtract(p1);
            let v23 = p3.subtract(p2);
            let v31 = p1.subtract(p3);

            let n = BABYLON.Vector3.Cross(p1.subtract(p2), p3.subtract(p2)).normalize();
            let p1p = localPoint.subtract(p1);
            let dot = BABYLON.Vector3.Dot(p1p, n);

            let projectedPoint = localPoint.subtract(n.scale(dot));

            // check
            let v1 = projectedPoint.subtract(p1);
            let sign = Math.sign(BABYLON.Vector3.Dot(n, BABYLON.Vector3.Cross(v1, v12)));
            if (sign < 0) {
                let dir = v12.clone().normalize();
                let dist = BABYLON.Vector3.Dot(v1, dir);
                projectedPoint.copyFrom(dir).scaleInPlace(dist).addInPlace(p1);
            }
            
            let v2 = projectedPoint.subtract(p2);
            sign = Math.sign(BABYLON.Vector3.Dot(n, BABYLON.Vector3.Cross(v2, v23)));
            if (sign < 0) {
                let dir = v23.clone().normalize();
                let dist = BABYLON.Vector3.Dot(v2, dir);
                projectedPoint.copyFrom(dir).scaleInPlace(dist).addInPlace(p2);
            }
            
            let v3 = projectedPoint.subtract(p3);
            sign = Math.sign(BABYLON.Vector3.Dot(n, BABYLON.Vector3.Cross(v3, v31)));
            if (sign < 0) {
                let dir = v31.clone().normalize();
                let dist = BABYLON.Vector3.Dot(v3, dir);
                projectedPoint.copyFrom(dir).scaleInPlace(dist).addInPlace(p3);
            }

            let dist = BABYLON.Vector3.Distance(projectedPoint, localPoint);
            if (dist < minDist) {
                minDist = dist;
                let worldProjected = BABYLON.Vector3.TransformCoordinates(projectedPoint, mesh.getWorldMatrix());
                let worldN = BABYLON.Vector3.TransformNormal(n, mesh.getWorldMatrix());
                pickInfo.worldPoint = worldProjected;
                pickInfo.worldNormal = worldN;
                pickInfo.distance = dist;
                pickInfo.hit = true;
            }
        }

        return pickInfo;
    }
}