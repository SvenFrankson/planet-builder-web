/// <reference path="../lib/babylon.2.4.d.ts"/>
class Game {

  public static Instance: Game;
  private _canvas: HTMLCanvasElement;
  getCanvas(): HTMLCanvasElement {
    return this._canvas;
  }
  private _engine: BABYLON.Engine;
  private _scene: BABYLON.Scene;
  getScene(): BABYLON.Scene {
    return this._scene;
  }
  private _cameraTarget: BABYLON.Vector3 = BABYLON.Vector3.Zero();
  public CameraTargetAdd(vector: BABYLON.Vector3): void {
    this._cameraTarget = this._cameraTarget.add(vector);
    this._camera.setTarget(this._cameraTarget);
  }
  private _camera: BABYLON.ArcRotateCamera;
  getCamera(): BABYLON.ArcRotateCamera {
    return this._camera;
  }
  private _light: BABYLON.Light;

  constructor(canvasElement: string) {
    Game.Instance = this;
    this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
    this._engine = new BABYLON.Engine(this._canvas, true);
  }

  createScene(): void {
    this._scene = new BABYLON.Scene(this._engine);

    this._camera = new BABYLON.ArcRotateCamera("camera", 1, 0.8, 10, new BABYLON.Vector3(0, 0, 0), this._scene);
    this._camera.setTarget(Game.Instance._cameraTarget);
    this._camera.attachControl(this._canvas, false);
    this._camera.wheelPrecision = 10;

    this._light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this._scene);
    this._light.diffuse = new BABYLON.Color3(1, 1, 1);
    this._light.specular = new BABYLON.Color3(1, 1, 1);
  }

  animate(): void {
    this._engine.runRenderLoop(() => {
      this._scene.render();
    });

    window.addEventListener("resize", () => {
      this._engine.resize();
    });
  }
}

window.addEventListener("DOMContentLoaded", () => {
  let game : Game = new Game("renderCanvas");
  game.createScene();
  game.animate();
});
