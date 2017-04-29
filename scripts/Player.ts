/// <reference path="../lib/babylon.2.4.d.ts"/>
class Player extends BABYLON.Mesh {
  private static instance: Player;
  public static Position(): BABYLON.Vector3 {
    return new BABYLON.Vector3(0, 100, 0);
  }

  constructor() {
    super("Player", Game.Instance.getScene());
    Player.instance = this;
  }
}
