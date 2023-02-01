interface ISceneObject {
    scene: BABYLON.Scene
}

class AnimationFactory {

    public static EmptyVoidCallback: (duration: number) => Promise<void> = async (duration: number) => {};
    public static EmptyNumberCallback: (target: number, duration: number) => Promise<void> = async (target: number, duration: number) => {};

    public static CreateWait(
        owner: ISceneObject,
        onUpdateCallback?: () => void
    ): (duration: number) => Promise<void> {
        return (duration: number) => {
            return new Promise<void>(resolve => {
                let t = 0;
                let animationCB = () => {
                    t += 1 / 60;
                    let f = t / duration;
                    if (f < 1) {
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                    }
                    else {
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                        owner.scene.onBeforeRenderObservable.removeCallback(animationCB);
                        resolve();
                    }
                }
                owner.scene.onBeforeRenderObservable.add(animationCB);
            })
        }
    }

    public static CreateNumber(
        owner: ISceneObject,
        obj: any,
        property: string,
        onUpdateCallback?: () => void
    ): (target: number, duration: number) => Promise<void> {
        return (target: number, duration: number) => {
            return new Promise<void>(resolve => {
                let origin: number = obj[property];
                let t = 0;
                if (owner[property + "_animation"]) {
                    owner.scene.onBeforeRenderObservable.removeCallback(owner[property + "_animation"]);
                }
                let animationCB = () => {
                    t += 1 / 60;
                    let f = t / duration;
                    if (f < 1) {
                        obj[property] = origin * (1 - f) + target * f;
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                    }
                    else {
                        obj[property] = target;
                        if (onUpdateCallback) {
                            onUpdateCallback();
                        }
                        owner.scene.onBeforeRenderObservable.removeCallback(animationCB);
                        owner[property + "_animation"] = undefined;
                        resolve();
                    }
                }
                owner.scene.onBeforeRenderObservable.add(animationCB);
                owner[property + "_animation"] = animationCB;
            })
        }
    }
}