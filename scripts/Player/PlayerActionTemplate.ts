var ACTIVE_DEBUG_PLAYER_ACTION = true;

var ADD_BRICK_ANIMATION_DURATION = 1000;

class PlayerActionTemplate {

    public static async CreateBlockAction(player: Player, blockType: BlockType): Promise<PlayerAction> {
        let action = new PlayerAction("cube-", player);
        let previewMesh: BABYLON.Mesh;
        action.iconUrl = "/datas/images/block-icon-" + BlockTypeNames[blockType] + "-miniature.png";

        let vData: BABYLON.VertexData = (await player.game.vertexDataLoader.get("chunck-part"))[0];
        let lastSize: number;
        let lastI: number;
        let lastJ: number;
        let lastK: number;

        action.onUpdate = () => {
            let ray: BABYLON.Ray = new BABYLON.Ray(player.camPos.absolutePosition, player.camPos.forward);
            let hit: BABYLON.PickingInfo[] = ray.intersectsMeshes(player.meshes);
            hit = hit.sort((h1, h2) => { return h1.distance - h2.distance; });
            if (hit[0] && hit[0].pickedPoint) {
                let n =  hit[0].getNormal(true).scaleInPlace(0.2);
                let localIJK = PlanetTools.WorldPositionToLocalIJK(player.planet, hit[0].pickedPoint.add(n));
                if (localIJK) {
                    // Redraw block preview
                    if (!previewMesh) {
                        previewMesh = BABYLON.MeshBuilder.CreateSphere("preview-mesh", { diameter: 1 });
                        let material = new BABYLON.StandardMaterial("material");
                        material.alpha = 0.25;
                        previewMesh.material = material;
                    }
                    let globalIJK = PlanetTools.LocalIJKToGlobalIJK(localIJK);
                    let needRedrawMesh: boolean = false;
                    if (lastSize != localIJK.planetChunck.size) {
                        lastSize = localIJK.planetChunck.size;
                        needRedrawMesh = true;
                    }
                    if (lastI != localIJK.i) {
                        lastI = localIJK.i;
                        needRedrawMesh = true;
                    }
                    if (lastJ != localIJK.j) {
                        lastJ = localIJK.j;
                        needRedrawMesh = true;
                    }
                    if (lastK != localIJK.k) {
                        lastK = localIJK.k;
                        needRedrawMesh = true;
                    }
                    if (needRedrawMesh) {
                        PlanetTools.SkewVertexData(vData, localIJK.planetChunck.size, globalIJK.i, globalIJK.j, globalIJK.k).applyToMesh(previewMesh);
                        previewMesh.parent = localIJK.planetChunck.planetSide;
                    }

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
                    Game.Instance.chunckManager.requestDraw(localIJK.planetChunck, localIJK.planetChunck.lod, "PlayerAction.onClick");
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