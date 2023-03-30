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
            let projClone = projectedPoint.clone();
            let projected = false;

            // check
            // edge 12
            let n12 = BABYLON.Vector3.Cross(v12, n);
            let v1 = projectedPoint.subtract(p1);
            if (!projected && BABYLON.Vector3.Dot(v1, n12) <= 0) {
                let l = BABYLON.Vector3.Distance(p1, p2);
                v12.scaleInPlace(1 / l);
                let d = BABYLON.Vector3.Dot(v1, v12);
                projectedPoint.copyFrom(v12).scaleInPlace(d).addInPlace(p1);
                v1.copyFrom(projectedPoint).subtractInPlace(p1);
                d = BABYLON.Vector3.Dot(v1, v12);
                if (d < 0) {
                    projectedPoint.copyFrom(p1);
                }
                else if (d > l) {
                    projectedPoint.copyFrom(p2);
                }
                projected = true;
            }

            let n23 = BABYLON.Vector3.Cross(v23, n);
            let v2 = projectedPoint.subtract(p2);
            if (!projected && BABYLON.Vector3.Dot(v2, n23) <= 0) {
                let l = BABYLON.Vector3.Distance(p2, p3);
                v23.scaleInPlace(1 / l);
                let d = BABYLON.Vector3.Dot(v2, v23);
                projectedPoint.copyFrom(v23).scaleInPlace(d).addInPlace(p2);
                v2.copyFrom(projectedPoint).subtractInPlace(p2);
                d = BABYLON.Vector3.Dot(v2, v23);
                if (d < 0) {
                    projectedPoint.copyFrom(p2);
                }
                else if (d > l) {
                    projectedPoint.copyFrom(p3);
                }
                projected = true;
            }
            
            let n31 = BABYLON.Vector3.Cross(v31, n);
            let v3 = projectedPoint.subtract(p3);
            if (!projected && BABYLON.Vector3.Dot(v3, n31) <= 0) {
                let l = BABYLON.Vector3.Distance(p3, p1);
                v31.scaleInPlace(1 / l);
                let d = BABYLON.Vector3.Dot(v3, v31);
                projectedPoint.copyFrom(v31).scaleInPlace(d).addInPlace(p3);
                v3.copyFrom(projectedPoint).subtractInPlace(p3);
                d = BABYLON.Vector3.Dot(v3, v31);
                if (d < 0) {
                    projectedPoint.copyFrom(p3);
                }
                else if (d > l) {
                    projectedPoint.copyFrom(p1);
                }
                projected = true;
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

    public static closestPointOnMeshNoOptim(worldPoint: BABYLON.Vector3, mesh: BABYLON.Mesh): VPickInfo {
        let pickInfo = new VPickInfo();

        let opt = "0";

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

        let p1Display = BABYLON.MeshBuilder.CreateIcoSphere("projection", { radius: 0.05, subdivisions: 2, flat: false });
        p1Display.material = SharedMaterials.RedMaterial();
        let p2Display = BABYLON.MeshBuilder.CreateIcoSphere("projection", { radius: 0.05, subdivisions: 2, flat: false });
        p2Display.material = SharedMaterials.GreenMaterial();
        let p3Display = BABYLON.MeshBuilder.CreateIcoSphere("projection", { radius: 0.05, subdivisions: 2, flat: false });
        p3Display.material = SharedMaterials.BlueMaterial();
        let p4Display = BABYLON.MeshBuilder.CreateIcoSphere("projection", { radius: 0.05, subdivisions: 2, flat: false });
        p4Display.material = SharedMaterials.CyanMaterial();
        let p5Display = BABYLON.MeshBuilder.CreateIcoSphere("projection", { radius: 0.05, subdivisions: 2, flat: false });
        p5Display.material = SharedMaterials.YellowMaterial();

        let n12Display: BABYLON.LinesMesh;
        let n23Display: BABYLON.LinesMesh;
        let n31Display: BABYLON.LinesMesh;

        let v12Display: BABYLON.LinesMesh;
        let v23Display: BABYLON.LinesMesh;
        let v31Display: BABYLON.LinesMesh;

        requestAnimationFrame(() => {
            p1Display.dispose();
            p2Display.dispose();
            p3Display.dispose();
            p4Display.dispose();
            p5Display.dispose();
            if (n12Display) {
                n12Display.dispose();
            }
            if (n23Display) {
                n23Display.dispose();
            }
            if (n31Display) {
                n31Display.dispose();
            }
            if (v12Display) {
                v12Display.dispose();
            }
            if (v23Display) {
                v23Display.dispose();
            }
            if (v31Display) {
                v31Display.dispose();
            }
        })

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
            let projClone = projectedPoint.clone();
            let projected = false;

            // check

            let tmpOpt = "";
            let tmpProj: BABYLON.Vector3 = projectedPoint.clone();
            // edge 12
            let n12 = BABYLON.Vector3.Cross(v12, n);
            let v1 = projectedPoint.subtract(p1);
            if (!projected && BABYLON.Vector3.Dot(v1, n12) <= 0) {
                tmpOpt += "12 ";
                let l = BABYLON.Vector3.Distance(p1, p2);
                v12.scaleInPlace(1/l);
                let d = BABYLON.Vector3.Dot(v1, v12);
                projectedPoint.copyFrom(v12).scaleInPlace(d).addInPlace(p1);
                tmpProj = projectedPoint.clone();
                v1.copyFrom(projectedPoint).subtractInPlace(p1);
                d = BABYLON.Vector3.Dot(v1, v12);
                if (d < 0) {
                    projectedPoint.copyFrom(p1);
                    tmpOpt += "alpha " + d + " ";
                }
                else if (d > l) {
                    projectedPoint.copyFrom(p2);
                    tmpOpt += "bravo ";
                }
                projected = true;
            }

            let n23 = BABYLON.Vector3.Cross(v23, n);
            let v2 = projectedPoint.subtract(p2);
            if (!projected && BABYLON.Vector3.Dot(v2, n23) <= 0) {
                tmpOpt += "23 ";
                v23.normalize();
                let d = BABYLON.Vector3.Dot(v2, v23);
                projectedPoint.copyFrom(v23).scaleInPlace(d).addInPlace(p2);
                tmpProj = projectedPoint.clone();
                v2.copyFrom(projectedPoint).subtractInPlace(p2);
                d = BABYLON.Vector3.Dot(v2, v23);
                let sqrL = BABYLON.Vector3.DistanceSquared(p2, p3);
                if (d < 0) {
                    projectedPoint.copyFrom(p2);
                    tmpOpt += "charly ";
                }
                else if (d * d > sqrL) {
                    projectedPoint.copyFrom(p3);
                    tmpOpt += "delta ";
                }
                projected = true;
            }
            
            let n31 = BABYLON.Vector3.Cross(v31, n);
            let v3 = projectedPoint.subtract(p3);
            if (!projected && BABYLON.Vector3.Dot(v3, n31) <= 0) {
                tmpOpt += "31 ";
                v31.normalize();
                let d = BABYLON.Vector3.Dot(v3, v31);
                projectedPoint.copyFrom(v31).scaleInPlace(d).addInPlace(p3);
                tmpProj = projectedPoint.clone();
                v3.copyFrom(projectedPoint).subtractInPlace(p3);
                d = BABYLON.Vector3.Dot(v3, v31);
                let sqrL = BABYLON.Vector3.DistanceSquared(p3, p1);
                if (d < 0) {
                    projectedPoint.copyFrom(p3);
                    tmpOpt += "echo ";
                }
                else if (d * d > sqrL) {
                    projectedPoint.copyFrom(p1);
                    tmpOpt += "foxtrot ";
                }
                projected = true;
            }

            /*
            let sign = Math.sign(BABYLON.Vector3.Dot(n, BABYLON.Vector3.Cross(v1, v12)));
            let out12 = sign < 0;
            
            let v2 = projectedPoint.subtract(p2);
            sign = Math.sign(BABYLON.Vector3.Dot(n, BABYLON.Vector3.Cross(v2, v23)));
            let out23 = sign < 0;
            
            let v3 = projectedPoint.subtract(p3);
            sign = Math.sign(BABYLON.Vector3.Dot(n, BABYLON.Vector3.Cross(v3, v31)));
            let out31 = sign < 0;

            if (out12 && out23) {
                projectedPoint.copyFrom(p2);
            }
            else if (out23 && out31) {
                projectedPoint.copyFrom(p3);
            }
            else if (out31 && out12) {
                projectedPoint.copyFrom(p1);
            }
            else if (out12) {
                let dir = v12.clone().normalize();
                let dist = BABYLON.Vector3.Dot(v1, dir);
                projectedPoint.copyFrom(dir).scaleInPlace(dist).addInPlace(p1);
            }
            else if (out23) {
                let dir = v23.clone().normalize();
                let dist = BABYLON.Vector3.Dot(v2, dir);
                projectedPoint.copyFrom(dir).scaleInPlace(dist).addInPlace(p2);
            }
            else if (out31) {
                let dir = v31.clone().normalize();
                let dist = BABYLON.Vector3.Dot(v3, dir);
                projectedPoint.copyFrom(dir).scaleInPlace(dist).addInPlace(p3);
            }
            */

            /*
            let bCoords = VMath.Barycentric(projectedPoint, p1, p2, p3);
            //bCoords.x = Math.max(Math.min(1, bCoords.x), 0);
            //bCoords.y = Math.max(Math.min(1, bCoords.y), 0);
            //bCoords.z = Math.max(Math.min(1, bCoords.z), 0);
            
            projectedPoint = p1.scale(bCoords.x).add(p2.scale(bCoords.y)).add(p3.scale(bCoords.z));
            */

            let dist = BABYLON.Vector3.Distance(projectedPoint, localPoint);
            if (dist < minDist) {
                minDist = dist;
                let worldProjected = BABYLON.Vector3.TransformCoordinates(projectedPoint, mesh.getWorldMatrix());
                let worldN = BABYLON.Vector3.TransformNormal(n, mesh.getWorldMatrix());
                pickInfo.worldPoint = worldProjected;
                pickInfo.worldNormal = worldN;
                pickInfo.distance = dist;
                pickInfo.hit = true;

                p1Display.position.copyFrom(p1);
                p2Display.position.copyFrom(p2);
                p3Display.position.copyFrom(p3);
                p4Display.position.copyFrom(projClone);
                p5Display.position.copyFrom(tmpProj).addInPlace(n.scale(0.2));

                let s1 = i1 === minIndex ? 2 : 1;
                let s2 = i2 === minIndex ? 2 : 1;
                let s3 = i3 === minIndex ? 2 : 1;
                p1Display.scaling.copyFromFloats(s1, s1, s1);
                p2Display.scaling.copyFromFloats(s2, s2, s2);
                p3Display.scaling.copyFromFloats(s3, s3, s3);

                
                if (n12Display) {
                    n12Display.dispose();
                }
                n12Display = BABYLON.MeshBuilder.CreateLines("n12display",{
                    points: [p1, p1.add(n12)],
                    colors: [new BABYLON.Color4(0, 0, 0, 1), new BABYLON.Color4(0, 0, 0, 1)]
                })
                if (n23Display) {
                    n23Display.dispose();
                }
                n23Display = BABYLON.MeshBuilder.CreateLines("n23display",{
                    points: [p2, p2.add(n23)],
                    colors: [new BABYLON.Color4(0, 0, 0, 1), new BABYLON.Color4(0, 0, 0, 1)]
                })
                if (n31Display) {
                    n31Display.dispose();
                }
                n31Display = BABYLON.MeshBuilder.CreateLines("n31display",{
                    points: [p3, p3.add(n31)],
                    colors: [new BABYLON.Color4(0, 0, 0, 1), new BABYLON.Color4(0, 0, 0, 1)]
                })

                let dn = n.scale(0.1);
                if (v12Display) {
                    v12Display.dispose();
                }
                v12Display = BABYLON.MeshBuilder.CreateLines("n12display",{
                    points: [p1, p1.add(v12)],
                    colors: [new BABYLON.Color4(0, 0, 0, 1), new BABYLON.Color4(0, 0, 0, 1)]
                })
                v12Display.position.copyFrom(dn);

                if (v23Display) {
                    v23Display.dispose();
                }
                v23Display = BABYLON.MeshBuilder.CreateLines("n23display",{
                    points: [p2, p2.add(v23)],
                    colors: [new BABYLON.Color4(0, 0, 0, 1), new BABYLON.Color4(0, 0, 0, 1)]
                })
                v23Display.position.copyFrom(dn);

                if (v31Display) {
                    v31Display.dispose();
                }
                v31Display = BABYLON.MeshBuilder.CreateLines("n31display",{
                    points: [p3, p3.add(v31)],
                    colors: [new BABYLON.Color4(0, 0, 0, 1), new BABYLON.Color4(0, 0, 0, 1)]
                })
                v31Display.position.copyFrom(dn);

                opt = tmpOpt;
            }
        }

        console.log(opt);

        return pickInfo;
    }
}