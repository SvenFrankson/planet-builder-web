var ACTIVE_DEBUG_PLAYER_ACTION = true;

var ADD_BRICK_ANIMATION_DURATION = 1000;

class PlayerActionTemplate {

    public static async CreateBlockAction(player: Player, blockType: BlockType): Promise<PlayerAction> {
        let action = new PlayerAction("cube-", player);
        let previewMesh: BABYLON.Mesh;
        action.iconUrl = "/datas/images/block-icon-" + BlockTypeNames[blockType] + "-miniature.png";

        let vData: BABYLON.VertexData = (await player.main.vertexDataLoader.get("chunck-part"))[0];
        let lastSize: number;
        let lastI: number;
        let lastJ: number;
        let lastK: number;

        action.onUpdate = () => {
            let hit = player.inputManager.getPickInfo(player.meshes);
            if (hit && hit.pickedPoint) {
                let n =  hit.getNormal(true).scaleInPlace(0.2);
                let localIJK = PlanetTools.WorldPositionToLocalIJK(player.planet, hit.pickedPoint.add(n));
                if (localIJK) {
                    // Redraw block preview
                    if (!previewMesh) {
                        previewMesh = new BABYLON.Mesh("preview-mesh");
                        if (player.planet) {
                            previewMesh.material = player.planet.chunckMaterial;
                        }
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
                        PlanetTools.SkewVertexData(vData, localIJK.planetChunck.size, globalIJK.i, globalIJK.j, globalIJK.k, localIJK.planetChunck.side, blockType).applyToMesh(previewMesh);
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
            let hit = player.inputManager.getPickInfo(player.meshes);
            if (hit && hit.pickedPoint) {
                let n =  hit.getNormal(true).scaleInPlace(0.2);
                let localIJK = PlanetTools.WorldPositionToLocalIJK(player.planet, hit.pickedPoint.add(n));
                if (localIJK) {
                    localIJK.planetChunck.SetData(localIJK.i, localIJK.j, localIJK.k, blockType);
                    localIJK.planetChunck.planetSide.planet.chunckManager.requestDraw(localIJK.planetChunck, localIJK.planetChunck.lod, "PlayerAction.onClick");
                }
            }
        }

        action.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
                lastSize = undefined;
                lastI = undefined;
                lastJ = undefined;
                lastK = undefined;
            }
        }
        
        return action;
    }
}