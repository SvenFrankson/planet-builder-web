var ACTIVE_DEBUG_PLAYER_ACTION = true;

var ADD_BRICK_ANIMATION_DURATION = 1000;

class PlayerActionTemplate {

    public static CreateBlockAction(player: Player, blockType: BlockType): PlayerAction {
        let action = new PlayerAction("cube-", player);
        let previewMesh: BABYLON.Mesh;
        action.iconUrl = "/datas/images/block-icon-" + BlockTypeNames[blockType] + "-miniature.png";

        action.onUpdate = () => {
            let ray: BABYLON.Ray = new BABYLON.Ray(player.camPos.absolutePosition, player.camPos.forward);
            let hit: BABYLON.PickingInfo[] = ray.intersectsMeshes(player.meshes);
            hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
            if (hit[0] && hit[0].pickedPoint) {
                let n =  hit[0].getNormal(true).scaleInPlace(0.2);
                let localIJK = PlanetTools.WorldPositionToLocalIJK(player.planet, hit[0].pickedPoint.add(n));
                if (localIJK) {
                    if (!previewMesh) {
                        previewMesh = BABYLON.MeshBuilder.CreateSphere("preview-mesh", { diameter: 1 });
                        let material = new BABYLON.StandardMaterial("material");
                        material.alpha = 0.5;
                        previewMesh.material = material;
                    }
                    let worldPos = PlanetTools.LocalIJKToWorldPosition(localIJK, true);
                    previewMesh.position.copyFrom(worldPos);

                    return;
                }
            }
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
        }

        action.onClick = () => {
            let ray: BABYLON.Ray = new BABYLON.Ray(player.camPos.absolutePosition, player.camPos.forward);
            let hit: BABYLON.PickingInfo[] = ray.intersectsMeshes(player.meshes);
            hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
            if (hit[0] && hit[0].pickedPoint) {
                let n =  hit[0].getNormal(true).scaleInPlace(0.2);
                let localIJK = PlanetTools.WorldPositionToLocalIJK(player.planet, hit[0].pickedPoint.add(n));
                if (localIJK) {
                    localIJK.planetChunck.SetData(localIJK.i, localIJK.j, localIJK.k, blockType);
                    Game.Instance.chunckManager.requestDraw(localIJK.planetChunck, localIJK.planetChunck.lod);
                }
            }
        }

        action.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
        }
        
        return action;
    }
}