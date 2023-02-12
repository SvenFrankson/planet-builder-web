var ACTIVE_DEBUG_PLAYER_ACTION = true;

var ADD_BRICK_ANIMATION_DURATION = 1000;

class PlayerActionTemplate {

    public static async CreateBlockAction(player: Player, blockType: BlockType): Promise<PlayerAction> {
        let action = new PlayerAction("cube-", player);
        let previewMesh: BABYLON.Mesh;
        let previewBox: BABYLON.Mesh;
        action.iconUrl = "/datas/images/block-icon-" + BlockTypeNames[blockType] + "-miniature.png";

        let previewMeshData: BABYLON.VertexData = (await player.main.vertexDataLoader.get("chunck-part"))[0];
        let previewBoxData: BABYLON.VertexData = (await player.main.vertexDataLoader.get("chunck-part"))[1];
        let lastSize: number;
        let lastI: number;
        let lastJ: number;
        let lastK: number;

        action.onUpdate = () => {
            if (!player.inputManager.inventoryOpened) {
                let hit = player.inputManager.getPickInfo(player.meshes);
                if (hit && hit.pickedPoint) {
                    let n =  hit.getNormal(true).scaleInPlace(blockType === BlockType.None ? - 0.2 : 0.2);
                    let localIJK = PlanetTools.WorldPositionToLocalIJK(player.planet, hit.pickedPoint.add(n));
                    if (localIJK) {
                        // Redraw block preview
                        if (!previewMesh && blockType != BlockType.None) {
                            previewMesh = new BABYLON.Mesh("preview-mesh");
                            if (player.planet) {
                                previewMesh.material = player.planet.chunckMaterial;
                            }
                        }
                        if (!previewBox) {
                            previewBox = new BABYLON.Mesh("preview-box");
                            if (blockType === BlockType.None) {
                                previewBox.material = SharedMaterials.RedEmissiveMaterial();
                            }
                            else {
                                previewBox.material = SharedMaterials.WhiteEmissiveMaterial();
                            }
                            previewBox.layerMask = 0x1;
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
                            if (previewMesh) {
                                PlanetTools.SkewVertexData(previewMeshData, localIJK.planetChunck.size, globalIJK.i, globalIJK.j, globalIJK.k, localIJK.planetChunck.side, blockType).applyToMesh(previewMesh);
                                previewMesh.parent = localIJK.planetChunck.planetSide;
                            }
                            PlanetTools.SkewVertexData(previewBoxData, localIJK.planetChunck.size, globalIJK.i, globalIJK.j, globalIJK.k, localIJK.planetChunck.side).applyToMesh(previewBox);
                            previewBox.parent = localIJK.planetChunck.planetSide;
                        }

                        return;
                    }
                }
            }
            
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
            if (previewBox) {
                previewBox.dispose();
                previewBox = undefined;
            }
        }

        action.onClick = () => {
            if (!player.inputManager.inventoryOpened) {
                let hit = player.inputManager.getPickInfo(player.meshes);
                if (hit && hit.pickedPoint) {
                    let n =  hit.getNormal(true).scaleInPlace(blockType === BlockType.None ? - 0.2 : 0.2);
                    let localIJK = PlanetTools.WorldPositionToLocalIJK(player.planet, hit.pickedPoint.add(n));
                    if (localIJK) {
                        localIJK.planetChunck.SetData(localIJK.i, localIJK.j, localIJK.k, blockType);
                        localIJK.planetChunck.planetSide.planet.chunckManager.requestDraw(localIJK.planetChunck, localIJK.planetChunck.lod, "PlayerAction.onClick");
                    }
                }
            }
        }

        action.onUnequip = () => {
            if (previewMesh) {
                previewMesh.dispose();
                previewMesh = undefined;
            }
            if (previewBox) {
                previewBox.dispose();
                previewBox = undefined;
            }
            lastSize = undefined;
            lastI = undefined;
            lastJ = undefined;
            lastK = undefined;
        }
        
        return action;
    }
}