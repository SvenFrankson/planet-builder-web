/// <reference path="../lib/babylon.2.4.d.ts"/>
class Player extends BABYLON.Mesh {
  public static Instance: Player;
  public static Position(): BABYLON.Vector3 {
    return Player.Instance.position;
  }

  private planet: Planet;
  private underWater: boolean = false;
  public camPos: BABYLON.AbstractMesh;
  public forward: boolean;
  public back: boolean;
  public right: boolean;
  public left: boolean;
  public fly: boolean;
  public PositionLeg(): BABYLON.Vector3 {
    let posLeg: BABYLON.Vector3 = this.position.add(
      BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, this.getWorldMatrix()).multiply(MeshTools.FloatVector(-1))
    );
    return posLeg;
  }
  public PositionHead(): BABYLON.Vector3 {
    return this.position;
  }

  constructor(position: BABYLON.Vector3, planet: Planet) {
    super("Player", Game.Scene);
    console.log("Create Player");
    this.planet = planet;
    this.position = position;
    this.rotationQuaternion = BABYLON.Quaternion.Identity();
    this.camPos = new BABYLON.Mesh("Dummy", Game.Scene);
    this.camPos.parent = this;
    this.camPos.position = new BABYLON.Vector3(0, 0, 0);
    Game.Camera.parent = this.camPos;
    this.RegisterControl();
    Player.Instance = this;
  }

  public RegisterControl(): void {
    let scene: BABYLON.Scene = Game.Scene;
    scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyDownTrigger,
        (event: BABYLON.ActionEvent) => {
          if ((event.sourceEvent.key === "z") || (event.sourceEvent.key === "w")) {
            this.forward = true;
          }
          if (event.sourceEvent.key === "s") {
            this.back = true;
          }
          if ((event.sourceEvent.key === "q") || (event.sourceEvent.key === "a")) {
            this.left = true;
          }
          if (event.sourceEvent.key === "d") {
            this.right = true;
          }
          if (event.sourceEvent.keyCode === 32) {
            this.fly = true;
          }
        }
      )
    );
    scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnKeyUpTrigger,
        (event: BABYLON.ActionEvent) => {
          if ((event.sourceEvent.key === "z") || (event.sourceEvent.key === "w")) {
            this.forward = false;
          }
          if (event.sourceEvent.key === "s") {
            this.back = false;
          }
          if ((event.sourceEvent.key === "q") || (event.sourceEvent.key === "a")) {
            this.left = false;
          }
          if (event.sourceEvent.key === "d") {
            this.right = false;
          }
          if (event.sourceEvent.keyCode === 32) {
            this.fly = false;
          }
        }
      )
    );
    Game.Canvas.addEventListener("mousemove", (event: MouseEvent) => {
      if (Game.LockedMouse) {
        let movementX: number = event.movementX;
        let movementY: number = event.movementY;
        if (movementX > 20) {
          movementX = 20;
        }
        if (movementX < -20) {
          movementX = -20;
        }
        if (movementY > 20) {
          movementY = 20;
        }
        if (movementY < -20) {
          movementY = -20;
        }
        let rotationPower: number = movementX / 500;
        let localY: BABYLON.Vector3 = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, Player.Instance.getWorldMatrix());
        let rotation: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(localY, rotationPower);
        Player.Instance.rotationQuaternion = rotation.multiply(Player.Instance.rotationQuaternion);
        let rotationCamPower: number = movementY / 500;
        Player.Instance.camPos.rotation.x += rotationCamPower;
        Player.Instance.camPos.rotation.x = Math.max(Player.Instance.camPos.rotation.x, - Math.PI / 2);
        Player.Instance.camPos.rotation.x = Math.min(Player.Instance.camPos.rotation.x, Math.PI / 2);
      }
    });
  }

  public static WaterFilter(): void {
    if (Player.Instance) {
      if (Player.Instance.position.lengthSquared() < Player.Instance.planet.GetTotalRadiusWaterSquared()) {
        Game.Light.diffuse = new BABYLON.Color3(0.5, 0.5, 1);
        Player.Instance.underWater = true;
      } else {
        Game.Light.diffuse = new BABYLON.Color3(1, 1, 1);
        Player.Instance.underWater = false;
      }
    }
  }

  public static GetMovin(): void {
    if (!Player.Instance) {
      return;
    }
    if (Player.Instance.forward) {
      if (Player.CanGoSide(BABYLON.Axis.Z)) {
        let localZ: BABYLON.Vector3 = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Z, Player.Instance.getWorldMatrix());
        Player.Instance.position.addInPlace(localZ.multiply(MeshTools.FloatVector(0.2)));
      }
    }
    if (Player.Instance.back) {
      if (Player.CanGoSide(BABYLON.Axis.Z.multiply(MeshTools.FloatVector(-1)))) {
        let localZ: BABYLON.Vector3 = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Z, Player.Instance.getWorldMatrix());
        Player.Instance.position.addInPlace(localZ.multiply(MeshTools.FloatVector(-0.2)));
      }
    }
    if (Player.Instance.right) {
      if (Player.CanGoSide(BABYLON.Axis.X)) {
        let localX: BABYLON.Vector3 = BABYLON.Vector3.TransformNormal(BABYLON.Axis.X, Player.Instance.getWorldMatrix());
        Player.Instance.position.addInPlace(localX.multiply(MeshTools.FloatVector(0.2)));
      }
    }
    if (Player.Instance.left) {
      if (Player.CanGoSide(BABYLON.Axis.X.multiply(MeshTools.FloatVector(-1)))) {
        let localX: BABYLON.Vector3 = BABYLON.Vector3.TransformNormal(BABYLON.Axis.X, Player.Instance.getWorldMatrix());
        Player.Instance.position.addInPlace(localX.multiply(MeshTools.FloatVector(-0.2)));
      }
    }
  }

  public static StillStanding(): void {
    if (!Player.Instance) {
      return;
    }
    let currentUp: BABYLON.Vector3 = BABYLON.Vector3.Normalize(
      BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, Player.Instance.getWorldMatrix())
    );
    let targetUp: BABYLON.Vector3 = BABYLON.Vector3.Normalize(Player.Instance.position);
    let correctionAxis: BABYLON.Vector3 = BABYLON.Vector3.Cross(currentUp, targetUp);
    let correctionAngle: number = Math.abs(Math.asin(correctionAxis.length()));
    if (Player.Instance.fly) {
      if (Player.CanGoUp()) {
        Player.Instance.position.addInPlace(targetUp.multiply(MeshTools.FloatVector(0.05)));
      }
    } else {
      let gravity: number = Player.DownRayCast();
      if (gravity !== 0) {
        let gravityFactor: number = 0.1;
        if (Player.Instance.underWater) {
          gravityFactor = 0.02;
        }
        Player.Instance.position.addInPlace(targetUp.multiply(MeshTools.FloatVector(gravity * gravityFactor)));
      }
    }
    if (correctionAngle > 0.001) {
      let rotation: BABYLON.Quaternion = BABYLON.Quaternion.RotationAxis(correctionAxis, correctionAngle / 5);
      Player.Instance.rotationQuaternion = rotation.multiply(Player.Instance.rotationQuaternion);
    }
  }

  public static DownRayCast(): number {
    let pos: BABYLON.Vector3 = Player.Instance.position;
    let dir: BABYLON.Vector3 = BABYLON.Vector3.Normalize(BABYLON.Vector3.Zero().subtract(Player.Instance.position));
    let ray: BABYLON.Ray = new BABYLON.Ray(pos, dir, 1.6);
    let hit: BABYLON.PickingInfo = Game.Scene.pickWithRay(
      ray,
      (mesh: BABYLON.Mesh) => {
        return !(mesh instanceof Water);
      }
    );
    if (!hit.pickedPoint) {
      return -1;
    }
    let d: number = hit.pickedPoint.subtract(pos).length();
    if (d < 1.5) {
      return 1;
    }
    return 0;
  }

  public static CanGoSide(axis: BABYLON.Vector3): boolean {
    let localAxis: BABYLON.Vector3 = BABYLON.Vector3.TransformNormal(axis, Player.Instance.getWorldMatrix());
    let ray: BABYLON.Ray = new BABYLON.Ray(Player.Instance.PositionLeg(), localAxis, 0.6);
    let hit: BABYLON.PickingInfo = Game.Scene.pickWithRay(
      ray,
      (mesh: BABYLON.Mesh) => {
        return !(mesh instanceof Water);
      }
    );
    if (hit.pickedPoint) {
      return false;
    }
    ray = new BABYLON.Ray(Player.Instance.PositionHead(), localAxis, 0.6);
    hit = Game.Scene.pickWithRay(
      ray,
      (mesh: BABYLON.Mesh) => {
        return !(mesh instanceof Water);
      }
    );
    if (hit.pickedPoint) {
      return false;
    }
    return true;
  }

  public static CanGoUp(): boolean {
    let localAxis: BABYLON.Vector3 = BABYLON.Vector3.TransformNormal(BABYLON.Axis.Y, Player.Instance.getWorldMatrix());
    let ray: BABYLON.Ray = new BABYLON.Ray(Player.Instance.PositionHead(), localAxis, 0.6);
    let hit: BABYLON.PickingInfo = Game.Scene.pickWithRay(
      ray,
      (mesh: BABYLON.Mesh) => {
        return !(mesh instanceof Water);
      }
    );
    if (hit.pickedPoint) {
      return false;
    }
    return true;
  }
}
